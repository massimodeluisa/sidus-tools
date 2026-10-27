/** Launch geometry helpers: mission design / range ops. SI + radians. */

/**
 * Inertial launch azimuth β from north (rad) to reach inclination i from latitude φ.
 * cos i = cos φ · sin β  ⇒  β = arcsin( cos i / cos φ )
 * Valid for |φ| < 90° (the pole has no unique azimuth), i in [0, π], and
 * |cos i / cos φ| ≤ 1 (equivalently |φ| ≤ i ≤ π − |φ|).
 * Returns both solutions as azimuths in [0, 2π).
 */
export function launchAzimuth(latRad: number, iRad: number): {
  azimuthRad: number
  azimuthDeg: number
  complementaryRad: number
  complementaryDeg: number
} | null {
  if (!Number.isFinite(latRad) || !Number.isFinite(iRad)) return null
  const halfPi = Math.PI / 2
  if (Math.abs(latRad) >= halfPi) return null
  if (iRad < 0 || iRad > Math.PI) return null
  const c = Math.cos(iRad) / Math.cos(latRad)
  if (!Number.isFinite(c) || Math.abs(c) > 1 + 1e-12) return null
  // Snap ulp-level boundary ratios so |φ| = i and i = π − |φ| coincide exactly.
  const snapped = Math.abs(c) >= 1 - 1e-12 ? Math.sign(c) : c
  const beta = Math.asin(snapped) // from north toward east for ascending
  // Two solutions: β and π − β (ascending vs other node-ish family)
  const a1 = beta
  const a2 = Math.PI - beta
  const wrap = (x: number) => {
    let y = x % (2 * Math.PI)
    if (y < 0) y += 2 * Math.PI
    return y
  }
  return {
    azimuthRad: wrap(a1),
    azimuthDeg: (wrap(a1) * 180) / Math.PI,
    complementaryRad: wrap(a2),
    complementaryDeg: (wrap(a2) * 180) / Math.PI,
  }
}

/**
 * Minimum inclination achievable from latitude φ (due-east launch): i_min = |φ|.
 */
export function minInclinationFromLat(latRad: number): number {
  return Math.abs(latRad)
}

/**
 * Eastward co-rotation speed at geocentric latitude and radius: v = ω · radiusM · cos φ.
 * Launch boost uses the launch-site radius (body radius + pad altitude), not an orbital radius.
 */
export const EARTH_OMEGA = 7.292115e-5 // rad/s

export function earthRotationBoost(
  latRad: number,
  radiusM: number,
  omega = EARTH_OMEGA,
): number {
  return omega * radiusM * Math.cos(latRad)
}
