/**
 * Spherical trigonometry & topocentric / pointing geometry: pure SI educational.
 * Not a full geodetic library (WGS84 flattening optional later).
 */

import { vcross, vdot, vnorm, vsub, vunit, type Vec3 } from './vector'

const DEG = Math.PI / 180

/** Spherical excess / great-circle central angle via spherical law of cosines [rad]. */
export function greatCircleAngle(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number | null {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null
  if (Math.abs(lat1) > Math.PI / 2 || Math.abs(lat2) > Math.PI / 2) return null
  const dLon = lon2 - lon1
  const cosC =
    Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLon)
  return Math.acos(Math.min(1, Math.max(-1, cosC)))
}

/** Surface arc length on sphere of radius R: s = R · Δσ [m]. */
export function greatCircleDistance(
  radiusM: number,
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number | null {
  if (!(radiusM > 0)) return null
  const c = greatCircleAngle(lat1, lon1, lat2, lon2)
  return c == null ? null : radiusM * c
}

/** Angle between two 3D direction vectors [rad]. */
export function angleBetween(a: Vec3, b: Vec3): number | null {
  const na = vnorm(a)
  const nb = vnorm(b)
  if (!(na > 0) || !(nb > 0)) return null
  const c = vdot(a, b) / (na * nb)
  return Math.acos(Math.min(1, Math.max(-1, c)))
}

/**
 * Elevation from flat-Earth (or small-range) geometry:
 * el = atan2(Δh, groundRange)  [rad].
 * For horizon-aware use, pass ground range along sphere separately.
 */
export function elevationFromRangeHeight(groundRangeM: number, deltaHM: number): number | null {
  if (!(groundRangeM >= 0) || !Number.isFinite(deltaHM)) return null
  if (groundRangeM === 0) {
    if (deltaHM > 0) return Math.PI / 2
    if (deltaHM < 0) return -Math.PI / 2
    return 0
  }
  return Math.atan2(deltaHM, groundRangeM)
}

/** Slant range from ground range and height difference [m]. */
export function slantRange(groundRangeM: number, deltaHM: number): number | null {
  if (!(groundRangeM >= 0) || !Number.isFinite(deltaHM)) return null
  return Math.hypot(groundRangeM, deltaHM)
}

/**
 * Geodetic (lat, lon, height) → ECEF on spherical body.
 * lat, lon [rad], height above sphere [m], radius equatorial [m].
 */
export function geodeticToEcef(
  lat: number,
  lon: number,
  heightM: number,
  bodyRadiusM: number,
): Vec3 | null {
  if (!(bodyRadiusM > 0) || !Number.isFinite(heightM)) return null
  if (Math.abs(lat) > Math.PI / 2) return null
  const r = bodyRadiusM + heightM
  const cl = Math.cos(lat)
  return [r * cl * Math.cos(lon), r * cl * Math.sin(lon), r * Math.sin(lat)]
}

/**
 * Topocentric elevation / azimuth (ENU, spherical Earth):
 * - azimuth: 0 = North, clockwise toward East [rad]
 * - elevation: 0 = horizon, + up [rad]
 * - range: slant range site → target [m]
 */
export function topocentricElAz(
  siteLat: number,
  siteLon: number,
  siteHM: number,
  tgtLat: number,
  tgtLon: number,
  tgtHM: number,
  bodyRadiusM: number,
): { el: number; az: number; range: number; east: number; north: number; up: number } | null {
  const rSite = geodeticToEcef(siteLat, siteLon, siteHM, bodyRadiusM)
  const rTgt = geodeticToEcef(tgtLat, tgtLon, tgtHM, bodyRadiusM)
  if (!rSite || !rTgt) return null
  const d = vsub(rTgt, rSite)
  const range = vnorm(d)
  if (!(range > 0)) return null

  // ENU basis at site
  const sinLat = Math.sin(siteLat)
  const cosLat = Math.cos(siteLat)
  const sinLon = Math.sin(siteLon)
  const cosLon = Math.cos(siteLon)
  const east: Vec3 = [-sinLon, cosLon, 0]
  const north: Vec3 = [-sinLat * cosLon, -sinLat * sinLon, cosLat]
  const up: Vec3 = [cosLat * cosLon, cosLat * sinLon, sinLat]

  const e = vdot(d, east)
  const n = vdot(d, north)
  const u = vdot(d, up)
  const el = Math.asin(Math.min(1, Math.max(-1, u / range)))
  let az = Math.atan2(e, n)
  if (az < 0) az += 2 * Math.PI
  return { el, az, range, east: e, north: n, up: u }
}

/**
 * Spherical triangle: angle C opposite side c (spherical law of cosines for sides).
 * Inputs: sides a,b,c in radians on unit sphere; returns angle C [rad].
 */
export function sphericalAngleFromSides(a: number, b: number, c: number): number | null {
  if (![a, b, c].every((x) => Number.isFinite(x) && x > 0 && x < Math.PI)) return null
  const cosC = (Math.cos(c) - Math.cos(a) * Math.cos(b)) / (Math.sin(a) * Math.sin(b))
  if (!Number.isFinite(cosC)) return null
  return Math.acos(Math.min(1, Math.max(-1, cosC)))
}

/**
 * Phase angle at target: angle Sun-Target-Observer (simple unit vectors).
 * Positions as heliocentric (or any common origin) vectors [m].
 */
export function phaseAngle(rSunToTarget: Vec3, rObsToTarget: Vec3): number | null {
  // From target: to Sun = −rSunToTarget, to Obs = rObs − rTarget = −rObsToTarget if rObsToTarget is target-from-obs
  // Define: r_t = position of target, r_o = observer, r_s = sun.
  // Phase = angle at target between vectors (r_s - r_t) and (r_o - r_t).
  // Pass v_sun_from_target and v_obs_from_target.
  return angleBetween(rSunToTarget, rObsToTarget)
}

/** Convert degrees ↔ radians helpers for tools (not exported as primary API). */
export function degToRad(d: number): number {
  return d * DEG
}

export function radToDeg(r: number): number {
  return r / DEG
}

/** Bearing (forward azimuth) on sphere from point 1 to 2 [rad, 0=N, CW]. */
export function initialBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number | null {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null
  const dLon = lon2 - lon1
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  let az = Math.atan2(y, x)
  if (az < 0) az += 2 * Math.PI
  return az
}

/** Unit LOS from site to target in ECEF (for 3D viz). */
export function losUnitEcef(
  siteLat: number,
  siteLon: number,
  siteHM: number,
  tgtLat: number,
  tgtLon: number,
  tgtHM: number,
  bodyRadiusM: number,
): Vec3 | null {
  const rSite = geodeticToEcef(siteLat, siteLon, siteHM, bodyRadiusM)
  const rTgt = geodeticToEcef(tgtLat, tgtLon, tgtHM, bodyRadiusM)
  if (!rSite || !rTgt) return null
  return vunit(vsub(rTgt, rSite))
}

/** Cross-track / plane normal utility: n ∝ r × v for orbit plane viz. */
export function orbitPlaneNormal(r: Vec3, v: Vec3): Vec3 | null {
  const n = vcross(r, v)
  if (!(vnorm(n) > 0)) return null
  return vunit(n)
}
