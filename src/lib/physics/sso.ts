/** Sun-synchronous orbit inclination from J2 secular rate matching solar mean motion. */

import { EARTH_J2 } from './j2'
import { EARTH_MU, EARTH_RADIUS } from './constants'

/** Mean solar motion ≈ 2π / sidereal year [rad/s]. */
export const OMEGA_SUN = (2 * Math.PI) / (365.256363004 * 86400)

/**
 * Circular SSO inclination (rad) so that Ω̇_J2 = −ω_sun (retrograde LEO).
 * cos i = − (2/3) (a/R)² (ω_sun) / (n J2)
 * with n = √(μ/a³).
 */
export function ssoInclination(
  a: number,
  mu = EARTH_MU,
  R = EARTH_RADIUS,
  j2 = EARTH_J2,
  omegaSun = OMEGA_SUN,
): number | null {
  if (!(a > R) || !(mu > 0)) return null
  const n = Math.sqrt(mu / (a * a * a))
  const cosI = -((2 / 3) * (a / R) ** 2 * omegaSun) / (n * j2)
  if (!Number.isFinite(cosI) || Math.abs(cosI) > 1) return null
  return Math.acos(Math.min(1, Math.max(-1, cosI)))
}

/** Mean local solar time not computed here: inclination only. */
export function ssoPeriod(a: number, mu = EARTH_MU): number | null {
  if (!(a > 0) || !(mu > 0)) return null
  return 2 * Math.PI * Math.sqrt((a * a * a) / mu)
}
