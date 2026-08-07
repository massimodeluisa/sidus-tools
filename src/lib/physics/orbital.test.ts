import { describe, expect, it } from 'vitest'
import {
  EARTH_MU,
  EARTH_RADIUS,
  circularOrbitVelocity,
  hohmannTransfer,
  j2RaanRate,
  multiStageDeltaV,
  orbitalPeriod,
  planeChangeDeltaV,
  visViva,
} from './index'

describe('circular / vis-viva', () => {
  it('LEO ~400 km speed is about 7.67 km/s', () => {
    const r = EARTH_RADIUS + 400_000
    const v = circularOrbitVelocity(EARTH_MU, r)
    expect(v / 1000).toBeGreaterThan(7.6)
    expect(v / 1000).toBeLessThan(7.8)
  })

  it('vis-viva matches circular when r = a', () => {
    const r = EARTH_RADIUS + 400_000
    expect(visViva(EARTH_MU, r, r)).toBeCloseTo(circularOrbitVelocity(EARTH_MU, r), 6)
  })

  it('period scales as a^1.5', () => {
    const r = EARTH_RADIUS + 400_000
    const T = orbitalPeriod(EARTH_MU, r)
    expect(T).toBeGreaterThan(5000)
    expect(T).toBeLessThan(6000)
  })
})

describe('hohmann', () => {
  it('LEO→GEO total Δv is roughly 3.9 km/s', () => {
    const r1 = EARTH_RADIUS + 200_000
    const r2 = EARTH_RADIUS + 35_786_000
    const h = hohmannTransfer(EARTH_MU, r1, r2)
    expect(h.dvTotal / 1000).toBeGreaterThan(3.8)
    expect(h.dvTotal / 1000).toBeLessThan(4.0)
    expect(h.tof).toBeGreaterThan(10_000)
  })
})

describe('plane change', () => {
  it('60° at 7.5 km/s ≈ 7.5 km/s', () => {
    const dv = planeChangeDeltaV(7500, (60 * Math.PI) / 180)
    expect(dv).toBeCloseTo(7500, 0)
  })
})

describe('J2', () => {
  it('ISS-like orbit has negative Ω̇ of a few deg/day', () => {
    const a = EARTH_RADIUS + 400_000
    const Om = j2RaanRate(EARTH_MU, a, 0.001, (51.6 * Math.PI) / 180)
    expect(Om).not.toBeNull()
    const degDay = ((Om as number) * 180) / Math.PI * 86400
    expect(degDay).toBeLessThan(-4)
    expect(degDay).toBeGreaterThan(-6)
  })
})

describe('multi-stage', () => {
  it('sums stage Δv', () => {
    const r = multiStageDeltaV([
      { ve: 3000, m0: 100, mf: 40 },
      { ve: 3500, m0: 30, mf: 12 },
    ])
    expect(r).not.toBeNull()
    expect(r!.dv.length).toBe(2)
    expect(r!.dvTotal).toBeCloseTo(r!.dv[0] + r!.dv[1], 10)
  })
})

describe('ECLSS', () => {
  it('LiOH duration and cabin partial pressures', async () => {
    const {
      liohDuration,
      cabinMassesFromComposition,
      cabinFromMasses,
      metabolicBudget,
      paToMmHg,
    } = await import('./index')
    const d = liohDuration(2, 1.04 / 86400)!
    expect(d.durationS).toBeGreaterThan(3600)
    const m = cabinMassesFromComposition(10, 295, 101325, 0.21, 0, 0)!
    const atm = cabinFromMasses(10, 295, m)!
    expect(paToMmHg(atm.ppO2Pa)).toBeGreaterThan(140)
    expect(paToMmHg(atm.ppO2Pa)).toBeLessThan(180)
    const b = metabolicBudget('nominal', 86400, 1)!
    expect(b.o2Kg).toBeGreaterThan(0.5)
    expect(b.o2Kg).toBeLessThan(1.2)
  })
})

describe('ISA / launch / SSO', () => {
  it('sea-level density ≈ 1.225', async () => {
    const { isaAtmosphere, dynamicPressure, launchAzimuth, ssoInclination } = await import(
      './index'
    )
    const isa = isaAtmosphere(0)!
    expect(isa.rho).toBeCloseTo(1.225, 2)
    expect(dynamicPressure(isa.rho, 100)).toBeCloseTo(0.5 * 1.225 * 10_000, 0)
    const az = launchAzimuth((28.5 * Math.PI) / 180, (51.6 * Math.PI) / 180)
    expect(az).not.toBeNull()
    expect(az!.azimuthDeg).toBeGreaterThan(30)
    expect(az!.azimuthDeg).toBeLessThan(60)
    const i = ssoInclination(6378137 + 550_000)
    expect(i).not.toBeNull()
    expect((i! * 180) / Math.PI).toBeGreaterThan(96)
    expect((i! * 180) / Math.PI).toBeLessThan(99)
  })
})

describe('apsides / Hohmann geometry consistency', () => {
  it('r_p = a(1-e), r_a = a(1+e)', () => {
    const a = 7_000_000
    const e = 0.15
    expect(a * (1 - e)).toBeCloseTo(5_950_000)
    expect(a * (1 + e)).toBeCloseTo(8_050_000)
  })

  it('Hohmann transfer ellipse matches circular r1,r2 at apo/peri', () => {
    const r1 = EARTH_RADIUS + 200_000
    const r2 = EARTH_RADIUS + 35_786_000
    const a = (r1 + r2) / 2
    const e = Math.abs(r2 - r1) / (r1 + r2)
    expect(a * (1 - e)).toBeCloseTo(Math.min(r1, r2), 3)
    expect(a * (1 + e)).toBeCloseTo(Math.max(r1, r2), 3)
  })
})

