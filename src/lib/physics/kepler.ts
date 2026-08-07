/**
 * Universal-variable two-body propagator (Vallado Alg. 8 style).
 * Independent reimplementation: SI units.
 */

import { vadd, vdot, vnorm, vscale, type Vec3 } from './vector'

export type KeplerState = {
  r: Vec3
  v: Vec3
}

/** Stumpff functions C(z), S(z). */
export function stumpffC(z: number): number {
  if (z > 1e-8) {
    const sqrtz = Math.sqrt(z)
    return (1 - Math.cos(sqrtz)) / z
  }
  if (z < -1e-8) {
    const sqrtz = Math.sqrt(-z)
    return (1 - Math.cosh(sqrtz)) / z
  }
  // series
  return 1 / 2 - z / 24 + (z * z) / 720
}

export function stumpffS(z: number): number {
  if (z > 1e-8) {
    const sqrtz = Math.sqrt(z)
    return (sqrtz - Math.sin(sqrtz)) / (sqrtz * sqrtz * sqrtz)
  }
  if (z < -1e-8) {
    const sqrtz = Math.sqrt(-z)
    return (Math.sinh(sqrtz) - sqrtz) / (sqrtz * sqrtz * sqrtz)
  }
  return 1 / 6 - z / 120 + (z * z) / 5040
}

/**
 * Propagate r0, v0 by Δt using universal anomaly.
 * Returns null on non-convergence or bad input.
 */
export function keplerPropagate(
  mu: number,
  state0: KeplerState,
  dt: number,
  opts?: { tol?: number; maxIter?: number },
): KeplerState | null {
  const tol = opts?.tol ?? 1e-10
  const maxIter = opts?.maxIter ?? 50
  if (!(mu > 0) || !Number.isFinite(dt)) return null

  const r0 = state0.r
  const v0 = state0.v
  const r0n = vnorm(r0)
  const v0n = vnorm(v0)
  if (!(r0n > 0)) return null

  const vr0 = vdot(r0, v0) / r0n
  const alpha = 2 / r0n - (v0n * v0n) / mu // 1/a

  // Initial χ guess (Vallado)
  let chi: number
  if (Math.abs(alpha) > 1e-12) {
    chi = Math.sqrt(mu) * Math.abs(alpha) * dt
  } else {
    // parabola
    const h = vnorm([
      r0[1] * v0[2] - r0[2] * v0[1],
      r0[2] * v0[0] - r0[0] * v0[2],
      r0[0] * v0[1] - r0[1] * v0[0],
    ])
    const p = (h * h) / mu
    const s = (1 / 2) * (Math.PI / 2 - Math.atan((3 * Math.sqrt(mu / (p * p * p)) * dt) / 2))
    const w = Math.atan(Math.tan(s) ** (1 / 3))
    chi = Math.sqrt(p) * 2 * (1 / Math.tan(2 * w))
  }

  // Hyperbolic better guess
  if (alpha < -1e-12) {
    const a = 1 / alpha
    chi =
      (Math.sign(dt) *
        Math.sqrt(-a) *
        Math.log(
          (-2 * mu * alpha * dt) /
            (vdot(r0, v0) + Math.sign(dt) * Math.sqrt(-mu * a) * (1 - r0n * alpha)),
        )) /
      Math.sqrt(mu)
    if (!Number.isFinite(chi)) chi = Math.sqrt(mu) * Math.abs(alpha) * dt
  }

  let converged = false
  for (let iter = 0; iter < maxIter; iter++) {
    const z = alpha * chi * chi
    const C = stumpffC(z)
    const S = stumpffS(z)
    const r =
      chi * chi * C +
      (vdot(r0, v0) / Math.sqrt(mu)) * chi * (1 - z * S) +
      r0n * (1 - z * C)

    const dchi =
      (Math.sqrt(mu) * dt -
        chi * chi * chi * S -
        (vdot(r0, v0) / Math.sqrt(mu)) * chi * chi * C -
        r0n * chi * (1 - z * S)) /
      r

    chi += dchi
    if (Math.abs(dchi) < tol) {
      converged = true
      break
    }
  }
  if (!converged || !Number.isFinite(chi)) return null

  const z = alpha * chi * chi
  const C = stumpffC(z)
  const S = stumpffS(z)

  const f = 1 - (chi * chi / r0n) * C
  const g = dt - (chi * chi * chi * S) / Math.sqrt(mu)
  const rvec = vadd(vscale(r0, f), vscale(v0, g))
  const rn = vnorm(rvec)
  if (!(rn > 0)) return null

  const gdot = 1 - (chi * chi / rn) * C
  const fdot = (Math.sqrt(mu) / (rn * r0n)) * chi * (z * S - 1)
  const vvec = vadd(vscale(r0, fdot), vscale(v0, gdot))

  // Sanity: f gdot − fdot g ≈ 1
  void vr0
  return {
    r: [rvec[0], rvec[1], rvec[2]],
    v: [vvec[0], vvec[1], vvec[2]],
  }
}

/** Sample trajectory positions from t=0 to dt (inclusive). */
export function keplerTrail(
  mu: number,
  state0: KeplerState,
  dt: number,
  steps = 64,
): Vec3[] {
  const out: Vec3[] = []
  if (steps < 2) steps = 2
  for (let i = 0; i <= steps; i++) {
    const t = (dt * i) / steps
    if (Math.abs(t) < 1e-15) {
      out.push([...state0.r])
      continue
    }
    const s = keplerPropagate(mu, state0, t)
    if (s) out.push([...s.r])
  }
  return out
}
