/**
 * Clohessy-Wiltshire (Hill) relative motion about a circular target orbit.
 * LVLH: x radial (out), y along-track, z cross-track. SI.
 */

export type CwState = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
}

/** Mean motion of circular target: n = √(μ/a³). */
export function cwMeanMotion(mu: number, a: number): number | null {
  if (!(a > 0) || !(mu > 0)) return null
  return Math.sqrt(mu / (a * a * a))
}

/**
 * Propagate CW state by Δt (closed-form).
 * Target orbit mean motion n [rad/s].
 */
export function cwPropagate(n: number, s0: CwState, dt: number): CwState | null {
  if (!(n > 0) || !Number.isFinite(dt)) return null
  const { x: x0, y: y0, z: z0, vx: vx0, vy: vy0, vz: vz0 } = s0
  const nt = n * dt
  const s = Math.sin(nt)
  const c = Math.cos(nt)

  // Vallado / Prussing CW
  const x =
    (4 - 3 * c) * x0 + (s / n) * vx0 + (2 * (1 - c) / n) * vy0
  const y =
    6 * (s - nt) * x0 +
    y0 -
    (2 * (1 - c) / n) * vx0 +
    ((4 * s) / n - 3 * dt) * vy0
  const z = z0 * c + (vz0 / n) * s

  const vx = 3 * n * s * x0 + c * vx0 + 2 * s * vy0
  const vy =
    6 * n * (c - 1) * x0 - 2 * s * vx0 + (4 * c - 3) * vy0
  const vz = -z0 * n * s + vz0 * c

  if (![x, y, z, vx, vy, vz].every(Number.isFinite)) return null
  return { x, y, z, vx, vy, vz }
}

/**
 * Two-impulse rendezvous to origin in time tf (CW targeting).
 * Returns Δv1 at t=0 and Δv2 at tf to null relative state (approx).
 * Simplified: solve for v0 such that position at tf is 0, then Δv2 cancels residual vel.
 */
export function cwTwoImpulseToOrigin(
  n: number,
  r0: { x: number; y: number; z: number },
  tf: number,
): { dv1: [number, number, number]; dv2: [number, number, number]; v0: [number, number, number] } | null {
  if (!(n > 0) || !(tf > 0)) return null
  const nt = n * tf
  const s = Math.sin(nt)
  const c = Math.cos(nt)
  // φ_rr, φ_rv blocks (planar xy + z decoupled)
  // [r(tf)] = Φrr r0 + Φrv v0  →  v0 = Φrv^{-1} (-Φrr r0)
  // z: z = z0 c + vz0/n s  → vz0 = -z0 n c / s  if s≠0
  const { x: x0, y: y0, z: z0 } = r0

  // 2×2 for (x,y) from known CW STM
  // x = (4-3c)x0 + (s/n)vx + 2(1-c)/n vy
  // y = 6(s-nt)x0 + y0 - 2(1-c)/n vx + (4s/n - 3 tf) vy
  // Want x=y=0:
  const a11 = s / n
  const a12 = (2 * (1 - c)) / n
  const a21 = (-2 * (1 - c)) / n
  const a22 = (4 * s) / n - 3 * tf
  const b1 = -(4 - 3 * c) * x0
  const b2 = -(6 * (s - nt) * x0 + y0)
  const det = a11 * a22 - a12 * a21
  if (Math.abs(det) < 1e-18) return null
  const vx0 = (b1 * a22 - a12 * b2) / det
  const vy0 = (a11 * b2 - b1 * a21) / det
  let vz0 = 0
  if (Math.abs(s) > 1e-12) {
    // 0 = z0 c + vz0/n s  → vz0 = -z0 n c / s
    vz0 = (-z0 * n * c) / s
  } else if (Math.abs(z0) > 1e-9) {
    return null
  }

  const s1 = cwPropagate(n, { x: x0, y: y0, z: z0, vx: vx0, vy: vy0, vz: vz0 }, tf)
  if (!s1) return null
  // dv1 = v0_desired - 0 (start from rest relative): here we report absolute CW velocities as Δv from co-orbiting
  const dv1: [number, number, number] = [vx0, vy0, vz0]
  const dv2: [number, number, number] = [-s1.vx, -s1.vy, -s1.vz]
  return { dv1, dv2, v0: [vx0, vy0, vz0] }
}
