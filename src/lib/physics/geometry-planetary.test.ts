import { describe, expect, it } from 'vitest'
import {
  greatCircleDistance,
  greatCircleAngle,
  topocentricElAz,
  enuFromGeodetic,
  angleBetween,
  elevationFromRangeHeight,
  geodeticToEcef,
} from './geometry'
import {
  heliocentricHohmann,
  hohmannPhaseAngle,
  patchedConicDeparture,
  coplanarTransferWindow,
  surfaceAccess,
  HELIO_SMA_M,
} from './planetary'
import { EARTH_MU, EARTH_RADIUS, AU, SUN_MU } from './constants'
import { getBody } from './bodies'

describe('geometry: spherical + topocentric', () => {
  it('equator quarter-turn is R·π/2', () => {
    const R = EARTH_RADIUS
    const d = greatCircleDistance(R, 0, 0, 0, Math.PI / 2)
    expect(d).toBeCloseTo((R * Math.PI) / 2, 3)
  })

  it('same point distance is ~0', () => {
    const d = greatCircleDistance(EARTH_RADIUS, 0.5, 1, 0.5, 1)
    expect(d).toBeCloseTo(0, 6)
  })

  it('zenith target has el ≈ 90°', () => {
    const lat = 45 * (Math.PI / 180)
    const res = topocentricElAz(lat, 0, 0, lat, 0, 400_000, EARTH_RADIUS)
    expect(res).not.toBeNull()
    expect(res!.el).toBeGreaterThan(1.5) // ~90°
    expect(res!.range).toBeCloseTo(400_000, -2)
  })

  it('angle between orthogonal axes is π/2', () => {
    expect(angleBetween([1, 0, 0], [0, 1, 0])).toBeCloseTo(Math.PI / 2, 12)
  })

  it('elevation atan2 height/range', () => {
    const el = elevationFromRangeHeight(1000, 1000)
    expect(el).toBeCloseTo(Math.PI / 4, 12)
  })

  it('ECEF on equator x≈R', () => {
    const p = geodeticToEcef(0, 0, 0, EARTH_RADIUS)
    expect(p![0]).toBeCloseTo(EARTH_RADIUS, 3)
    expect(p![1]).toBeCloseTo(0, 6)
    expect(p![2]).toBeCloseTo(0, 6)
  })

  it('great-circle angle poles 90°', () => {
    const c = greatCircleAngle(Math.PI / 2, 0, 0, 0)
    expect(c).toBeCloseTo(Math.PI / 2, 10)
  })
})

describe('enuFromGeodetic: shares topocentricElAz code path', () => {
  const DEG = Math.PI / 180
  const cases = [
    {
      site: { lat: 45 * DEG, lon: 0, hM: 0 },
      target: { lat: 46 * DEG, lon: 2 * DEG, hM: 400_000 },
    },
    {
      site: { lat: 34 * DEG, lon: -118 * DEG, hM: 100 },
      target: { lat: 35 * DEG, lon: -117 * DEG, hM: 500_000 },
    },
    {
      site: { lat: 0, lon: 0, hM: 0 },
      target: { lat: 5 * DEG, lon: 10 * DEG, hM: 1_000_000 },
    },
  ]

  for (const [i, c] of cases.entries()) {
    it(`case ${i}: el/az reconstructed from ENU equal topocentricElAz`, () => {
      const full = topocentricElAz(
        c.site.lat,
        c.site.lon,
        c.site.hM,
        c.target.lat,
        c.target.lon,
        c.target.hM,
        EARTH_RADIUS,
      )
      const enu = enuFromGeodetic(c.site, c.target, EARTH_RADIUS)
      expect(full, `case ${i}: topocentricElAz`).not.toBeNull()
      expect(enu, `case ${i}: enuFromGeodetic`).not.toBeNull()
      if (!full || !enu) throw new Error('unreachable: narrowed by expect above')

      expect(enu.eastM).toBeCloseTo(full.east, 12)
      expect(enu.northM).toBeCloseTo(full.north, 12)
      expect(enu.upM).toBeCloseTo(full.up, 12)

      const range = Math.hypot(enu.eastM, enu.northM, enu.upM)
      const el = Math.asin(enu.upM / range)
      let az = Math.atan2(enu.eastM, enu.northM)
      if (az < 0) az += 2 * Math.PI

      const elRel = Math.abs(el - full.el) / Math.abs(full.el)
      const azRel = Math.abs(az - full.az) / Math.abs(full.az)
      expect(elRel, `case ${i}: el rel`).toBeLessThanOrEqual(1e-12)
      expect(azRel, `case ${i}: az rel`).toBeLessThanOrEqual(1e-12)
    })
  }
})

describe('planetary: heliocentric / patched conic', () => {
  it('Earth-Mars Hohmann TOF ~259 days class', () => {
    const rE = HELIO_SMA_M.earth
    const rM = HELIO_SMA_M.mars
    const h = heliocentricHohmann(rE, rM)!
    const days = h.tof / 86400
    // Ideal coplanar ~259 d (textbook band)
    expect(days).toBeGreaterThan(200)
    expect(days).toBeLessThan(320)
    expect(h.dvTotal).toBeGreaterThan(5000)
    expect(h.dvTotal).toBeLessThan(7000)
  })

  it('Earth-Mars phase angle positive outward', () => {
    const phi = hohmannPhaseAngle(HELIO_SMA_M.earth, HELIO_SMA_M.mars)!
    expect(phi).toBeGreaterThan(0)
    expect(phi).toBeLessThan(Math.PI)
  })

  it('patched conic Earth park → Mars: finite v∞ and park Δv', () => {
    const earth = getBody('earth')
    const res = patchedConicDeparture({
      rParkM: earth.radius + 200_000,
      muPlanet: earth.mu,
      rPlanetHelioM: HELIO_SMA_M.earth,
      rTargetHelioM: HELIO_SMA_M.mars,
    })
    expect(res).not.toBeNull()
    expect(res!.vInf).toBeGreaterThan(2000)
    expect(res!.vInf).toBeLessThan(4000)
    expect(res!.dvPark).toBeGreaterThan(3000)
    expect(res!.c3).toBeCloseTo(res!.vInf ** 2, 3)
    expect(res!.tSynS).not.toBeNull()
    // Synodic Earth-Mars ~780 d
    const synDays = res!.tSynS! / 86400
    expect(synDays).toBeGreaterThan(700)
    expect(synDays).toBeLessThan(850)
  })

  it('coplanar window package matches Hohmann TOF', () => {
    const w = coplanarTransferWindow(HELIO_SMA_M.earth, HELIO_SMA_M.mars, SUN_MU)!
    const h = heliocentricHohmann(HELIO_SMA_M.earth, HELIO_SMA_M.mars)!
    expect(w.tofS).toBeCloseTo(h.tof, 3)
  })

  it('Moon surface access: g ~1.62, low vesc', () => {
    const moon = getBody('moon')
    const a = surfaceAccess({ body: moon, parkAltitudeM: 100_000 })!
    expect(a.g).toBeGreaterThan(1.5)
    expect(a.g).toBeLessThan(1.7)
    expect(a.vEsc).toBeGreaterThan(2000)
    expect(a.vEsc).toBeLessThan(2800)
  })

  it('1 AU SMA is AU constant', () => {
    expect(HELIO_SMA_M.earth).toBeCloseTo(AU, 0)
  })

  it('Earth μ matches catalog', () => {
    expect(getBody('earth').mu).toBeCloseTo(EARTH_MU, -6)
  })
})
