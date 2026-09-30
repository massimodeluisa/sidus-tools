import { describe, expect, it } from 'vitest'
import {
  EARTH_MU,
  EARTH_RADIUS,
  apsidesWithSpeeds,
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

  it('preserves a tiny positive Δv for nearly equal masses', () => {
    const m0 = 5000 + 1e-12
    expect(m0 - 5000).toBe(9.094947017729282e-13)
    const result = multiStageDeltaV([{ ve: 320 * 9.80665, m0, mf: 5000 }])
    expect(result).not.toBeNull()
    const expectedFromIndependentDecimal = 5.708221578970551e-13
    const relativeError = Math.abs(result!.dv[0]! - expectedFromIndependentDecimal) / expectedFromIndependentDecimal
    expect(relativeError).toBeLessThan(1e-14)
  })

  it('avoids overflow in the mass quotient for extreme finite masses', () => {
    const result = multiStageDeltaV([{ ve: 1, m0: 1e300, mf: 1e-300 }])
    expect(result).not.toBeNull()
    expect(result!.dv[0]).toBeCloseTo(1381.5510557964274, 12)
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

  it('matches the mean-solar J2 nodal rate over a tropical year', async () => {
    const { EARTH_J2, EARTH_MU, EARTH_RADIUS, ssoInclination } = await import('./index')
    const a = EARTH_RADIUS + 550_000
    const meanSolarRate = (2 * Math.PI) / (365.24219 * 86400)
    const n = Math.sqrt(EARTH_MU / (a * a * a))
    const cosI = -((2 / 3) * (a / EARTH_RADIUS) ** 2 * meanSolarRate) / (n * EARTH_J2)
    const expectedI = Math.acos(cosI)
    const actualI = ssoInclination(a)!
    const actualNodeRate = -1.5 * n * EARTH_J2 * (EARTH_RADIUS / a) ** 2 * Math.cos(actualI)

    expect(actualI).toBeCloseTo(expectedI, 13)
    expect(actualNodeRate).toBeCloseTo(meanSolarRate, 15)
  })
})

describe('apsides / Hohmann geometry consistency', () => {
  it('r_p = a(1-e), r_a = a(1+e)', () => {
    const a = 7_000_000
    const e = 0.15
    expect(a * (1 - e)).toBeCloseTo(5_950_000)
    expect(a * (1 + e)).toBeCloseTo(8_050_000)
  })

  it('preserves the nonzero apoapsis speed at the elliptic binary64 boundary', () => {
    const e = 0.9999999999999999
    const result = apsidesWithSpeeds(1, 1, e)

    expect(result).not.toBeNull()
    expect(result!.ra).toBe(2)
    expect(result!.vp).toBe(134_217_728)
    expect(result!.va).toBeGreaterThan(0)
    expect(Math.abs(result!.va / 7.450580596923828e-9 - 1)).toBeLessThan(1e-15)
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

