/** Mission-design helpers: SOI, synodic, eclipse, light-time, solar pressure, drag. SI. */

import { EARTH_MU, EARTH_RADIUS, G } from './constants'
import { orbitalPeriod } from './orbital'

/** Sphere of influence (Laplace): r_SOI ≈ a (m/M)^{2/5}. */
export function sphereOfInfluence(aPlanet: number, mPlanet: number, mPrimary: number): number | null {
  if (!(aPlanet > 0) || !(mPlanet > 0) || !(mPrimary > 0)) return null
  return aPlanet * (mPlanet / mPrimary) ** 0.4
}

/** μ from mass: μ = G M. */
export function muFromMass(massKg: number): number | null {
  if (!(massKg > 0)) return null
  return G * massKg
}

/** Surface g = μ / R². */
export function surfaceGravity(mu: number, radius: number): number | null {
  if (!(mu > 0) || !(radius > 0)) return null
  return mu / (radius * radius)
}

/**
 * Synodic period of two circular coplanar orbits:
 * T_syn = 2π / |n2 − n1|.
 */
export function synodicPeriod(mu: number, r1: number, r2: number): number | null {
  if (!(mu > 0) || !(r1 > 0) || !(r2 > 0) || r1 === r2) return null
  const n1 = Math.sqrt(mu / (r1 * r1 * r1))
  const n2 = Math.sqrt(mu / (r2 * r2 * r2))
  const dn = Math.abs(n2 - n1)
  if (!(dn > 0)) return null
  return (2 * Math.PI) / dn
}

/**
 * Approximate cylindrical eclipse duration for circular Earth orbit (Vallado-class).
 * β ≈ arcsin(R_e / a) for cylindrical shadow; fraction f = β/π of orbit in shadow
 * when sun in orbit plane (worst-case long eclipse).
 * t_ecl = T · (β / π) with β = acos(√(1 − (R/a)²)) geometry variant:
 * Use: cos ρ = √(a² − R²)/a  ⇒  half-angle; t = (T/π) · acos(√(1−(R/a)²)).
 */
export function circularEclipseDuration(
  a: number,
  bodyR = EARTH_RADIUS,
  mu = EARTH_MU,
): { period: number; eclipseS: number; fraction: number; betaRad: number } | null {
  if (!(a > bodyR) || !(mu > 0)) return null
  const x = bodyR / a
  if (x >= 1) return null
  // Central angle of umbra cylinder intersection (simplified, Sun at infinity, coplanar)
  const beta = Math.acos(Math.sqrt(1 - x * x))
  const T = orbitalPeriod(mu, a)
  const fraction = beta / Math.PI
  return { period: T, eclipseS: T * fraction, fraction, betaRad: beta }
}

/** One-way light time [s] for range [m]. */
export function lightTime(rangeM: number, c = 299_792_458): number | null {
  if (!(rangeM >= 0) || !(c > 0)) return null
  return rangeM / c
}

/** Round-trip light time. */
export function lightTimeRoundTrip(rangeM: number, c = 299_792_458): number | null {
  const t = lightTime(rangeM, c)
  return t == null ? null : 2 * t
}

/**
 * Solar radiation pressure force on a flat plate:
 * F ≈ P₀ · A · C_r · (AU/r)²  with P₀ ≈ 4.56e-6 N/m² at 1 AU.
 * Acceleration a = F/m.
 */
export const SOLAR_PRESSURE_1AU = 4.56e-6 // N/m²

export function solarRadiationForce(
  areaM2: number,
  cr = 1.0,
  rAu = 1,
): number | null {
  if (!(areaM2 > 0) || !(cr > 0) || !(rAu > 0)) return null
  return (SOLAR_PRESSURE_1AU * areaM2 * cr) / (rAu * rAu)
}

export function solarRadiationAccel(
  massKg: number,
  areaM2: number,
  cr = 1.0,
  rAu = 1,
): number | null {
  if (!(massKg > 0)) return null
  const F = solarRadiationForce(areaM2, cr, rAu)
  return F == null ? null : F / massKg
}

/** Ballistic coefficient β = m / (C_d A) [kg/m²]. */
export function ballisticCoefficient(massKg: number, cd: number, areaM2: number): number | null {
  if (!(massKg > 0) || !(cd > 0) || !(areaM2 > 0)) return null
  return massKg / (cd * areaM2)
}

/**
 * Order-of-magnitude Δv per rev from drag (circular LEO, exponential atmosphere opt.):
 * Δv ≈ (π C_d A / m) ρ v²  · a  / v   = π ρ v a / β
 * Rough: Δa/a ≈ −2π ρ a / β  ⇒ Δv ≈ −π ρ a v / β (sign magnitude).
 */
export function dragDeltaVPerRev(
  rho: number,
  v: number,
  a: number,
  beta: number,
): number | null {
  if (!(rho > 0) || !(v > 0) || !(a > 0) || !(beta > 0)) return null
  return (Math.PI * rho * a * v) / beta
}

/**
 * Exponential atmosphere: ρ = ρ0 exp(−h/H).
 */
export function exponentialDensity(h: number, rho0: number, scaleH: number): number | null {
  if (!(scaleH > 0) || !(rho0 > 0) || !Number.isFinite(h)) return null
  return rho0 * Math.exp(-h / scaleH)
}
