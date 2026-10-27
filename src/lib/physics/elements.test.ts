import { describe, expect, it } from 'vitest'
import { EARTH_MU, elementsToRv, rvToElements } from './index'
import type { Vec3 } from './index'

const R = 7e6
const V = Math.sqrt(EARTH_MU / R)

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

describe('rvToElements / elementsToRv round trip', () => {
  it('recovers a retrograde equatorial circular state (i = π)', () => {
    const r: Vec3 = [0, R, 0]
    const v: Vec3 = [V, 0, 0]

    const el = rvToElements(r, v, EARTH_MU)
    expect(el).not.toBeNull()
    if (!el) return

    expect(el.e).toBeLessThan(1e-10)
    expect(el.i).toBeCloseTo(Math.PI, 12)

    const back = elementsToRv(el, EARTH_MU)
    expect(back).not.toBeNull()
    if (!back) return

    expect(back.r[1]).toBeGreaterThan(0)
    expect(distance(back.r, r)).toBeLessThan(1e-3)
    expect(distance(back.v, v)).toBeLessThan(1e-9)
  })

  it('still recovers a prograde equatorial circular state (i = 0)', () => {
    const r: Vec3 = [R, 0, 0]
    const v: Vec3 = [0, V, 0]

    const el = rvToElements(r, v, EARTH_MU)
    expect(el).not.toBeNull()
    if (!el) return

    expect(el.e).toBeLessThan(1e-10)
    expect(el.i).toBeLessThan(1e-10)

    const back = elementsToRv(el, EARTH_MU)
    expect(back).not.toBeNull()
    if (!back) return

    expect(distance(back.r, r)).toBeLessThan(1e-3)
    expect(distance(back.v, v)).toBeLessThan(1e-9)
  })
})

describe('eccentric equatorial retrograde periapsis', () => {
  it('recovers ω for a planar retrograde ellipse and round-trips that state', () => {
    // Issue 87. Built in the equatorial plane so n = 0. elementsToRv(i = π)
    // leaves a false node (sin π ≠ 0) and would hide this branch.
    const r: Vec3 = [3_309_432.628, -6_502_239.716, 0]
    const v: Vec3 = [-6_928.414, -4_119.923, 0]

    const el = rvToElements(r, v, EARTH_MU)
    expect(el).not.toBeNull()
    if (!el) return

    expect(el.i).toBeCloseTo(Math.PI, 12)
    expect(el.e).toBeCloseTo(0.2, 6)
    expect(el.a).toBeCloseTo(9_000_000, -1)
    expect(el.argp).toBeCloseTo(0.7, 5)
    expect(el.nu).toBeCloseTo(0.4, 5)

    const back = elementsToRv(el, EARTH_MU)
    expect(back).not.toBeNull()
    if (!back) return

    expect(distance(back.r, r)).toBeLessThan(1e-6)
    expect(distance(back.v, v)).toBeLessThan(1e-9)
  })
})

describe('near-parabolic semimajor axis', () => {
  const rp = 6_778_137

  function atPeriapsis(e: number) {
    const speed = Math.sqrt(EARTH_MU * (1 + e) / rp)
    return rvToElements([rp, 0, 0], [0, speed, 0], EARTH_MU)
  }

  it('keeps a finite positive a when |e−1| < 1e-10 and energy is negative', () => {
    const el = atPeriapsis(1 - 5e-11)
    expect(el).not.toBeNull()
    if (!el) return

    expect(Math.abs(el.e - 1)).toBeLessThan(1e-10)
    expect(el.energy).toBeLessThan(0)
    expect(Number.isFinite(el.energy)).toBe(true)
    expect(Number.isFinite(el.a)).toBe(true)
    expect(el.a).toBeGreaterThan(0)
    expect(el.a).toBe(-EARTH_MU / (2 * el.energy))
  })

  it('keeps a finite negative a when |e−1| < 1e-10 and energy is positive', () => {
    const el = atPeriapsis(1 + 5e-11)
    expect(el).not.toBeNull()
    if (!el) return

    expect(Math.abs(el.e - 1)).toBeLessThan(1e-10)
    expect(el.energy).toBeGreaterThan(0)
    expect(Number.isFinite(el.energy)).toBe(true)
    expect(Number.isFinite(el.a)).toBe(true)
    expect(el.a).toBeLessThan(0)
    expect(el.a).toBe(-EARTH_MU / (2 * el.energy))
  })

  it('reports a = Infinity only for an exact zero-energy parabola', () => {
    const rmag = EARTH_MU / 2
    const el = rvToElements([rmag, 0, 0], [0, 2, 0], EARTH_MU)
    expect(el).not.toBeNull()
    if (!el) return

    expect(el.energy).toBe(0)
    expect(el.e).toBeCloseTo(1, 12)
    expect(el.a).toBe(Infinity)
  })
})

describe('elementsToRv hyperbolic branch', () => {
  const A = -10_000_000
  const E = 1.5
  const P = Math.abs(A) * (E * E - 1)
  const ENERGY = -EARTH_MU / (2 * A)
  const NU_INF = Math.acos(-1 / E)

  const elements = (nu: number) => ({ a: A, e: E, i: 0, raan: 0, argp: 0, nu })

  const specificEnergy = (r: Vec3, v: Vec3): number =>
    (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) / 2 -
    EARTH_MU / Math.hypot(r[0], r[1], r[2])

  const specificAngularMomentum = (r: Vec3, v: Vec3): number =>
    Math.hypot(
      r[1] * v[2] - r[2] * v[1],
      r[2] * v[0] - r[0] * v[2],
      r[0] * v[1] - r[1] * v[0],
    )

  it('rejects true anomalies past the hyperbolic asymptote', () => {
    for (const nuDeg of [140, 180, 220]) {
      const nu = (nuDeg * Math.PI) / 180
      expect(elementsToRv(elements(nu), EARTH_MU)).toBeNull()
    }
  })

  it('rejects the asymptote true anomaly itself', () => {
    expect(NU_INF).toBeCloseTo((131.8103 * Math.PI) / 180, 3)
    expect(elementsToRv(elements(NU_INF), EARTH_MU)).toBeNull()
    expect(elementsToRv(elements(2 * Math.PI - NU_INF), EARTH_MU)).toBeNull()
  })

  it('keeps inbound and outbound anomalies on the occupied branch', () => {
    for (const nuDeg of [120, 240]) {
      const nu = (nuDeg * Math.PI) / 180
      const state = elementsToRv(elements(nu), EARTH_MU)
      expect(state).not.toBeNull()
      if (!state) continue

      const energy = specificEnergy(state.r, state.v)
      expect(Math.abs(energy - ENERGY) / ENERGY).toBeLessThan(1e-9)

      const h = specificAngularMomentum(state.r, state.v)
      expect(Math.abs(h * h - EARTH_MU * P) / (EARTH_MU * P)).toBeLessThan(1e-12)

      const rmag = Math.hypot(state.r[0], state.r[1], state.r[2])
      const rExpected = P / (1 + E * Math.cos(nu))
      expect(Math.abs(rmag - rExpected) / rExpected).toBeLessThan(1e-12)
    }
  })

  it('conserves conic energy and angular momentum across the occupied branch', () => {
    for (const nuDeg of [0, 60, 120, 240, 300]) {
      const state = elementsToRv(elements((nuDeg * Math.PI) / 180), EARTH_MU)
      expect(state).not.toBeNull()
      if (!state) continue

      const energy = specificEnergy(state.r, state.v)
      expect(Math.abs(energy - ENERGY) / ENERGY).toBeLessThan(1e-9)
      const h = specificAngularMomentum(state.r, state.v)
      expect(Math.abs(h * h - EARTH_MU * P) / (EARTH_MU * P)).toBeLessThan(1e-12)
    }
  })

  it('still converts elliptic elements', () => {
    const a = 8_000_000
    const e = 0.1
    const nu = Math.PI / 3
    const state = elementsToRv({ a, e, i: 0, raan: 0, argp: 0, nu }, EARTH_MU)
    expect(state).not.toBeNull()
    if (!state) return

    const energy = specificEnergy(state.r, state.v)
    expect(energy).toBeLessThan(0)
    const expected = -EARTH_MU / (2 * a)
    expect(Math.abs(energy - expected) / Math.abs(expected)).toBeLessThan(1e-9)

    const p = a * (1 - e * e)
    const h = specificAngularMomentum(state.r, state.v)
    expect(Math.abs(h * h - EARTH_MU * p) / (EARTH_MU * p)).toBeLessThan(1e-12)
  })

  it('still rejects parabolas (|e - 1| < 1e-12)', () => {
    expect(
      elementsToRv({ a: -10_000_000, e: 1, i: 0, raan: 0, argp: 0, nu: 0 }, EARTH_MU),
    ).toBeNull()
  })
})
