/** J2 secular rates (Vallado): pure SI. */

import { EARTH_MU, EARTH_RADIUS } from './constants'

/** Earth J2 (WGS-84 / EGM96 order of magnitude). */
export const EARTH_J2 = 1.08262668e-3

/**
 * Nodal precession rate Ω̇ (rad/s) due to J2 for a near-circular mean orbit.
 * Ω̇ = −(3/2) n J2 (R/p)² cos i
 * with p = a(1−e²), n = √(μ/a³).
 */
export function j2RaanRate(
  mu: number,
  a: number,
  e: number,
  iRad: number,
  j2 = EARTH_J2,
  rEq = EARTH_RADIUS,
): number | null {
  if (!(a > 0) || e < 0 || e >= 1) return null
  if (!(mu > 0) || !(rEq > 0)) return null
  const p = a * (1 - e * e)
  if (!(p > 0)) return null
  const n = Math.sqrt(mu / (a * a * a))
  const factor = (rEq / p) * (rEq / p)
  return -1.5 * n * j2 * factor * Math.cos(iRad)
}

/**
 * Argument-of-perigee secular rate ω̇ (rad/s) due to J2.
 * ω̇ = (3/4) n J2 (R/p)² (5 cos² i − 1)
 */
export function j2ArgpRate(
  mu: number,
  a: number,
  e: number,
  iRad: number,
  j2 = EARTH_J2,
  rEq = EARTH_RADIUS,
): number | null {
  if (!(a > 0) || e < 0 || e >= 1) return null
  if (!(mu > 0) || !(rEq > 0)) return null
  const p = a * (1 - e * e)
  if (!(p > 0)) return null
  const n = Math.sqrt(mu / (a * a * a))
  const c = Math.cos(iRad)
  const factor = (rEq / p) * (rEq / p)
  return 0.75 * n * j2 * factor * (5 * c * c - 1)
}

/** Mean motion n (rad/s). */
export function meanMotion(mu: number, a: number): number | null {
  if (!(a > 0) || !(mu > 0)) return null
  return Math.sqrt(mu / (a * a * a))
}

/** Period of full RAAN revolution |2π / Ω̇| in seconds (null if rate ~ 0). */
export function raanPeriodS(raanRateRadS: number): number | null {
  if (!Number.isFinite(raanRateRadS) || Math.abs(raanRateRadS) < 1e-18) return null
  return (2 * Math.PI) / Math.abs(raanRateRadS)
}

export { EARTH_MU }
