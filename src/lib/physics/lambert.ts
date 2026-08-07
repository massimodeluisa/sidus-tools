/**
 * Universal-variable Lambert solver (two-body, single-rev).
 * Short / long way. Independent reimplementation (Vallado Ch. 7 style). SI.
 */

import { vcross, vdot, vnorm, vscale, type Vec3 } from './vector'
import { stumpffC, stumpffS } from './kepler'

export type LambertResult = {
  v1: Vec3
  v2: Vec3
  a: number
  e: number
  /** Transfer angle (rad) used */
  dnu: number
}

/**
 * Solve Lambert: μ, r1, r2, TOF → v1, v2 at the terminals.
 * @param shortWay true → transfer angle ≤ π
 */
export function lambertSolve(
  mu: number,
  r1: Vec3,
  r2: Vec3,
  tof: number,
  shortWay = true,
): LambertResult | null {
  if (!(mu > 0) || !(tof > 0)) return null
  const r1n = vnorm(r1)
  const r2n = vnorm(r2)
  if (!(r1n > 0) || !(r2n > 0)) return null

  const cosDnu = Math.min(1, Math.max(-1, vdot(r1, r2) / (r1n * r2n)))
  let dnu = Math.acos(cosDnu)
  const crossZ = vcross(r1, r2)[2]
  // Determine transfer angle quadrant
  if (shortWay) {
    if (crossZ < 0 && Math.abs(crossZ) > 1e-14) {
      // angle via short way may need 2π − dnu depending on frame
      // For standard: if short way, dnu ≤ π
      if (dnu > Math.PI) dnu = 2 * Math.PI - dnu
    }
    if (dnu > Math.PI) dnu = 2 * Math.PI - dnu
  } else {
    dnu = 2 * Math.PI - dnu
  }

  const A = Math.sin(dnu) * Math.sqrt((r1n * r2n) / (1 - cosDnu))
  if (!Number.isFinite(A) || Math.abs(A) < 1e-14) return null

  // Universal variable z iteration
  let z = 0
  const tol = 1e-10
  const maxIter = 60
  let y = 0
  let C = 0.5
  let S = 1 / 6

  for (let iter = 0; iter < maxIter; iter++) {
    C = stumpffC(z)
    S = stumpffS(z)
    y = r1n + r2n + (A * (z * S - 1)) / Math.sqrt(C)
    if (A > 0 && y < 0) {
      // adjust z upward for long/short issues
      z += 0.1
      continue
    }
    const chi = Math.sqrt(y / C)
    const dt =
      (chi * chi * chi * S + A * Math.sqrt(y)) / Math.sqrt(mu)

    // d(dt)/dz
    let dtdz: number
    if (Math.abs(z) > 1e-6) {
      dtdz =
        (chi * chi * chi * (0.5 / z) * (C - 3 * S / (2 * C)) +
          0.75 * (S / C) * A * Math.sqrt(y) / C +
          A * (0.5 / Math.sqrt(y))) /
        Math.sqrt(mu)
      // simpler finite difference if messy
      const dz = 1e-4
      const Cp = stumpffC(z + dz)
      const Sp = stumpffS(z + dz)
      const yp = r1n + r2n + (A * ((z + dz) * Sp - 1)) / Math.sqrt(Cp)
      if (yp > 0) {
        const chip = Math.sqrt(yp / Cp)
        const dtp = (chip * chip * chip * Sp + A * Math.sqrt(yp)) / Math.sqrt(mu)
        dtdz = (dtp - dt) / dz
      }
    } else {
      dtdz =
        (Math.sqrt(2) / 40) * y ** 1.5 +
        (A / 8) * (Math.sqrt(y) + A * Math.sqrt(1 / (2 * y)))
      dtdz /= Math.sqrt(mu)
    }

    if (!Number.isFinite(dtdz) || Math.abs(dtdz) < 1e-18) break
    const dz = (tof - dt) / dtdz
    z += dz
    if (Math.abs(dz) < tol) break
  }

  C = stumpffC(z)
  S = stumpffS(z)
  y = r1n + r2n + (A * (z * S - 1)) / Math.sqrt(C)
  if (!(y > 0)) return null

  const f = 1 - y / r1n
  const g = A * Math.sqrt(y / mu)
  const gdot = 1 - y / r2n

  const v1: Vec3 = [
    (r2[0] - f * r1[0]) / g,
    (r2[1] - f * r1[1]) / g,
    (r2[2] - f * r1[2]) / g,
  ]
  const v2: Vec3 = [
    (gdot * r2[0] - r1[0]) / g,
    (gdot * r2[1] - r1[1]) / g,
    (gdot * r2[2] - r1[2]) / g,
  ]

  // Transfer orbit a, e from energy / h at r1,v1
  const v1n = vnorm(v1)
  const energy = (v1n * v1n) / 2 - mu / r1n
  const a = Math.abs(energy) > 1e-16 ? -mu / (2 * energy) : Infinity
  const hvec = [
    r1[1] * v1[2] - r1[2] * v1[1],
    r1[2] * v1[0] - r1[0] * v1[2],
    r1[0] * v1[1] - r1[1] * v1[0],
  ] as Vec3
  const h = vnorm(hvec)
  const evec = vscale(
    [
      (v1n * v1n - mu / r1n) * r1[0] - vdot(r1, v1) * v1[0],
      (v1n * v1n - mu / r1n) * r1[1] - vdot(r1, v1) * v1[1],
      (v1n * v1n - mu / r1n) * r1[2] - vdot(r1, v1) * v1[2],
    ],
    1 / mu,
  )
  const e = vnorm(evec)
  void h

  return { v1, v2, a, e, dnu }
}

/** Coplanar geometry helper: place r1, r2 in XY plane. */
export function coplanarRadii(
  r1mag: number,
  r2mag: number,
  angleRad: number,
): { r1: Vec3; r2: Vec3 } {
  return {
    r1: [r1mag, 0, 0],
    r2: [r2mag * Math.cos(angleRad), r2mag * Math.sin(angleRad), 0],
  }
}
