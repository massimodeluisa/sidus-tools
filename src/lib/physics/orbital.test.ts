import { describe, expect, it } from 'vitest'
import {
  EARTH_MU,
  EARTH_RADIUS,
  apsidesWithSpeeds,
  circularOrbitVelocity,
  elementsToRv,
  hohmannTransfer,
  j2RaanRate,
  multiStageDeltaV,
  orbitalPeriod,
  planeChangeDeltaV,
  rvToElements,
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

describe('Cartesian / classical elements conversion', () => {
  it('round-trips an equatorial retrograde circular state', () => {
    const radius = 7_000_000
    const r = [0, radius, 0] as [number, number, number]
    const v = [circularOrbitVelocity(EARTH_MU, radius), 0, 0] as [number, number, number]
    const elements = rvToElements(r, v, EARTH_MU)
    expect(elements).not.toBeNull()
    const state = elementsToRv(elements!, EARTH_MU)
    expect(state).not.toBeNull()
    expect(state!.r[0]).toBeCloseTo(r[0], 6)
    expect(state!.r[1]).toBeCloseTo(r[1], 6)
    expect(state!.r[2]).toBeCloseTo(r[2], 6)
    expect(state!.v[0]).toBeCloseTo(v[0], 6)
    expect(state!.v[1]).toBeCloseTo(v[1], 6)
    expect(state!.v[2]).toBeCloseTo(v[2], 6)
  })

  it('recovers periapsis for an eccentric equatorial retrograde state', () => {
    const a = 9_000_000
    const e = 0.2
    const argp = 0.7
    const nu = 0.4
    const p = a * (1 - e * e)
    const rPf = p / (1 + e * Math.cos(nu))
    const xPf = rPf * Math.cos(nu)
    const yPf = rPf * Math.sin(nu)
    const speedScale = Math.sqrt(EARTH_MU / p)
    const vxPf = -speedScale * Math.sin(nu)
    const vyPf = speedScale * (e + Math.cos(nu))
    const cosArgp = Math.cos(argp)
    const sinArgp = Math.sin(argp)

    // R3(0) R1(pi) R3(argp) reflects the perifocal y-axis.
    const r = [cosArgp * xPf - sinArgp * yPf, -sinArgp * xPf - cosArgp * yPf, 0] as [number, number, number]
    const v = [cosArgp * vxPf - sinArgp * vyPf, -sinArgp * vxPf - cosArgp * vyPf, 0] as [number, number, number]
    const elements = rvToElements(r, v, EARTH_MU)

    expect(elements).not.toBeNull()
    expect(elements!.a).toBeCloseTo(a, 7)
    expect(elements!.e).toBeCloseTo(e, 13)
    expect(elements!.i).toBeCloseTo(Math.PI, 13)
    expect(elements!.raan).toBe(0)
    expect(elements!.argp).toBeCloseTo(argp, 13)
    expect(elements!.nu).toBeCloseTo(nu, 13)

    const state = elementsToRv(elements!, EARTH_MU)
    expect(state).not.toBeNull()
    expect(Math.hypot(...state!.r.map((x, i) => x - r[i]!)) / Math.hypot(...r)).toBeLessThan(1e-12)
    expect(Math.hypot(...state!.v.map((x, i) => x - v[i]!)) / Math.hypot(...v)).toBeLessThan(1e-12)
  })

  const hyperbola = { a: -10_000_000, e: 1.5, i: 0, raan: 0, argp: 0 }

  it.each([140, 180, 220])('rejects hyperbolic true anomaly %i outside the physical branch', (nuDeg) => {
    expect(elementsToRv({ ...hyperbola, nu: (nuDeg * Math.PI) / 180 }, EARTH_MU)).toBeNull()
  })

  it.each([120, 240])('preserves hyperbolic invariants at valid true anomaly %i deg', (nuDeg) => {
    const state = elementsToRv(
      { ...hyperbola, nu: (nuDeg * Math.PI) / 180 },
      EARTH_MU,
    )
    expect(state).not.toBeNull()

    const radius = Math.hypot(...state!.r)
    const speedSquared = state!.v.reduce((sum, component) => sum + component * component, 0)
    const energy = speedSquared / 2 - EARTH_MU / radius
    const h = [
      state!.r[1] * state!.v[2] - state!.r[2] * state!.v[1],
      state!.r[2] * state!.v[0] - state!.r[0] * state!.v[2],
      state!.r[0] * state!.v[1] - state!.r[1] * state!.v[0],
    ]
    const hSquared = h.reduce((sum, component) => sum + component * component, 0)
    const p = Math.abs(hyperbola.a) * (hyperbola.e * hyperbola.e - 1)
    const expectedEnergy = -EARTH_MU / (2 * hyperbola.a)
    const expectedHSquared = EARTH_MU * p

    expect(Math.abs(energy - expectedEnergy) / expectedEnergy).toBeLessThan(1e-12)
    expect(Math.abs(hSquared - expectedHSquared) / expectedHSquared).toBeLessThan(1e-12)
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

