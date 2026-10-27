import { describe, expect, it } from 'vitest'
import { EARTH_RADIUS } from './constants'
import { EARTH_OMEGA, earthRotationBoost, launchAzimuth } from './launch'

const rad = (deg: number) => (deg * Math.PI) / 180

const INVALID: [string, number, number][] = [
  ['lat 28.5° / i 160°', 28.5, 160],
  ['lat 100° / i 80°', 100, 80],
  ['lat 0° / i 200°', 0, 200],
  ['lat 90° / i 90° (pole)', 90, 90],
]

function inclinationForAzimuth(latRad: number, azimuthRad: number): number {
  const north = [-Math.sin(latRad), 0, Math.cos(latRad)]
  const east = [0, 1, 0]
  const r = [Math.cos(latRad), 0, Math.sin(latRad)]
  const v = [
    north[0]! * Math.cos(azimuthRad) + east[0]! * Math.sin(azimuthRad),
    north[1]! * Math.cos(azimuthRad) + east[1]! * Math.sin(azimuthRad),
    north[2]! * Math.cos(azimuthRad) + east[2]! * Math.sin(azimuthRad),
  ]
  const h = [
    r[1]! * v[2]! - r[2]! * v[1]!,
    r[2]! * v[0]! - r[0]! * v[2]!,
    r[0]! * v[1]! - r[1]! * v[0]!,
  ]
  const norm = Math.hypot(h[0]!, h[1]!, h[2]!)
  return Math.acos(h[2]! / norm)
}

describe('earthRotationBoost pad radius (#173)', () => {
  it('uses the KSC site radius, not a 200 km orbit', () => {
    const lat = rad(28.5721)
    const pad = EARTH_OMEGA * (EARTH_RADIUS + 3) * Math.cos(lat)
    const boost = earthRotationBoost(lat, EARTH_RADIUS + 3)
    const atOrbit = earthRotationBoost(lat, EARTH_RADIUS + 200_000)
    expect(boost).toBeCloseTo(pad, 12)
    expect(boost).toBeCloseTo(408.4594, 4)
    expect(atOrbit).toBeCloseTo(421.2673, 4)
    expect(atOrbit - boost).toBeCloseTo(12.8079, 4)
  })
})

describe('launchAzimuth domain (#172)', () => {
  it.each(INVALID)('returns null for %s', (_label, latDeg, iDeg) => {
    expect(launchAzimuth(rad(latDeg), rad(iDeg))).toBeNull()
  })

  it('keeps the -1.069 ratio from being clamped into asin(-1)', () => {
    const c = Math.cos(rad(160)) / Math.cos(rad(28.5))
    expect(c).toBeLessThan(-1)
    expect(launchAzimuth(rad(28.5), rad(160))).toBeNull()
  })

  it('rejects non-finite and out-of-range latitudes and inclinations', () => {
    expect(launchAzimuth(Number.NaN, rad(51.6))).toBeNull()
    expect(launchAzimuth(rad(28.5), Number.NaN)).toBeNull()
    expect(launchAzimuth(Number.POSITIVE_INFINITY, rad(51.6))).toBeNull()
    expect(launchAzimuth(rad(28.5), Number.POSITIVE_INFINITY)).toBeNull()
    expect(launchAzimuth(rad(-100), rad(80))).toBeNull()
    expect(launchAzimuth(rad(-90), rad(80))).toBeNull()
    expect(launchAzimuth(rad(28.5), rad(-1))).toBeNull()
    expect(launchAzimuth(rad(28.5), rad(181))).toBeNull()
  })

  it('returns coincident azimuths at both reachable boundaries', () => {
    for (const iDeg of [28.5, 151.5]) {
      const az = launchAzimuth(rad(28.5), rad(iDeg))
      expect(az, `i=${iDeg}`).not.toBeNull()
      expect(az!.azimuthRad).toBeCloseTo(az!.complementaryRad, 12)
    }
  })

  it('keeps the in-domain prograde case between 30° and 60°', () => {
    const az = launchAzimuth(rad(28.5), rad(51.6))
    expect(az).not.toBeNull()
    expect(az!.azimuthDeg).toBeGreaterThan(30)
    expect(az!.azimuthDeg).toBeLessThan(60)
  })

  it('returns two finite azimuths for the retrograde case', () => {
    const az = launchAzimuth(rad(28.5), rad(98))
    expect(az).not.toBeNull()
    expect(Number.isFinite(az!.azimuthDeg)).toBe(true)
    expect(Number.isFinite(az!.complementaryDeg)).toBe(true)
  })

  it.each([
    ['direct', 28.5, 51.6],
    ['retrograde', 28.5, 98],
  ])('vector geometry matches the requested inclination (%s)', (_label, latDeg, iDeg) => {
    const latRad = rad(latDeg)
    const iRad = rad(iDeg)
    const az = launchAzimuth(latRad, iRad)
    expect(az).not.toBeNull()
    for (const beta of [az!.azimuthRad, az!.complementaryRad]) {
      expect(inclinationForAzimuth(latRad, beta)).toBeCloseTo(iRad, 9)
    }
  })
})
