/** Launch geometry helpers: mission design / range ops. SI + radians. */

/**
 * Inertial launch azimuth β from north (rad) to reach inclination i from latitude φ.
 * cos i = cos φ · sin β  ⇒  β = arcsin( cos i / cos φ )
 * Valid when |φ| ≤ |i| (and |cos i / cos φ| ≤ 1).
 * Returns both prograde (+β from N toward E) solutions as azimuths in [0, 2π).
 */
export function launchAzimuth(latRad: number, iRad: number): {
  azimuthRad: number
  azimuthDeg: number
  complementaryRad: number
  complementaryDeg: number
} | null {
  const c = Math.cos(iRad) / Math.cos(latRad)
  if (!Number.isFinite(c) || Math.abs(c) > 1 + 1e-12) return null
  const cl = Math.min(1, Math.max(-1, c))
  const beta = Math.asin(cl) // from north toward east for ascending
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

/** Earth rotation boost along local east at latitude φ, altitude h: v = ω (R+h) cos φ */
export const EARTH_OMEGA = 7.292115e-5 // rad/s

export function earthRotationBoost(
  latRad: number,
  radiusM: number,
  omega = EARTH_OMEGA,
): number {
  return omega * radiusM * Math.cos(latRad)
}
