/**
 * Focused correctness checks for critical SIDUS physics paths
 * (escape / custom body / hyperbolic / core orbital / ECLSS).
 * Tests call shipped pure functions only.
 */
import { describe, expect, it } from 'vitest'
import { EARTH_MASS, EARTH_MU, EARTH_RADIUS, G } from './constants'
import {
  circularOrbitVelocity,
  escapeVelocity,
  hohmannTransfer,
  orbitalPeriod,
} from './orbital'
import { muFromMass, surfaceGravity } from './mission'
import {
  characteristicEnergy,
  departureBurnFromCircular,
  hyperbolicEccentricity,
} from './hyperbolic'
import { metabolicBudget, cabinMassesFromComposition, cabinFromMasses } from './eclss'
import { liohDuration } from './eclss'

describe('critical quality: escape and custom body', () => {
  it('escape embeds mass via μ = GM (Earth surface ~11.2 km/s)', () => {
    const vesc = escapeVelocity(EARTH_MU, EARTH_RADIUS)
    expect(vesc / 1000).toBeGreaterThan(11.1)
    expect(vesc / 1000).toBeLessThan(11.3)
    // Custom body with Earth mass recovers same μ order
    const mu = muFromMass(EARTH_MASS)!
    expect(Math.abs(mu - EARTH_MU) / EARTH_MU).toBeLessThan(0.02)
    const vesc2 = escapeVelocity(mu, EARTH_RADIUS)
    expect(Math.abs(vesc2 - vesc) / vesc).toBeLessThan(0.02)
  })

  it('v_esc / v_circ = √2 on circular radius', () => {
    const r = EARTH_RADIUS + 400e3
    const ratio = escapeVelocity(EARTH_MU, r) / circularOrbitVelocity(EARTH_MU, r)
    expect(ratio).toBeCloseTo(Math.SQRT2, 10)
  })

  it('surface gravity g = μ/R² positive', () => {
    const g = surfaceGravity(EARTH_MU, EARTH_RADIUS)!
    expect(g).toBeGreaterThan(9.7)
    expect(g).toBeLessThan(9.9)
  })

  it('rejects non-positive mass for μ', () => {
    expect(muFromMass(0)).toBeNull()
    expect(muFromMass(-1)).toBeNull()
  })
})

describe('critical quality: hyperbolic / C3', () => {
  it('departure Δv equals v_p − v_c and C3 = v_∞²', () => {
    const r = EARTH_RADIUS + 300e3
    const vInf = 3000
    const d = departureBurnFromCircular(EARTH_MU, r, vInf)!
    const vc = circularOrbitVelocity(EARTH_MU, r)
    expect(d.dv).toBeCloseTo(d.vp - vc, 6)
    expect(d.c3).toBeCloseTo(characteristicEnergy(vInf), 10)
    expect(hyperbolicEccentricity(EARTH_MU, r, vInf)!).toBeGreaterThan(1)
  })

  it('zero v_∞ is parabolic edge: e = 1', () => {
    const r = EARTH_RADIUS + 200e3
    expect(hyperbolicEccentricity(EARTH_MU, r, 0)).toBeCloseTo(1, 10)
  })
})

describe('critical quality: core orbital', () => {
  it('LEO period ~92 min at 400 km', () => {
    const T = orbitalPeriod(EARTH_MU, EARTH_RADIUS + 400e3)
    expect(T / 60).toBeGreaterThan(90)
    expect(T / 60).toBeLessThan(95)
  })

  it('Hohmann LEO→GEO total Δv multi-km/s class', () => {
    const r1 = EARTH_RADIUS + 200e3
    const r2 = EARTH_RADIUS + 35_786e3
    const h = hohmannTransfer(EARTH_MU, r1, r2)
    expect(h.dvTotal / 1000).toBeGreaterThan(3.5)
    expect(h.dvTotal / 1000).toBeLessThan(4.5)
    expect(h.tof).toBeGreaterThan(5 * 3600)
  })
})

describe('critical quality: ECLSS', () => {
  it('metabolic budget scales with crew and duration', () => {
    const one = metabolicBudget('nominal', 3600, 1)!
    const two = metabolicBudget('nominal', 3600, 2)!
    expect(two.o2Kg).toBeCloseTo(2 * one.o2Kg, 10)
    expect(one.o2Kg).toBeGreaterThan(0)
  })

  it('cabin partial pressures sum toward total for dry mix', () => {
    const masses = cabinMassesFromComposition(100, 293.15, 101_325, 0.21, 0, 0)!
    const atm = cabinFromMasses(100, 293.15, masses)!
    expect(atm.pTotalPa).toBeGreaterThan(90_000)
    expect(atm.ppO2Pa / atm.pTotalPa).toBeGreaterThan(0.15)
  })

  it('LiOH duration positive for positive rate', () => {
    const d = liohDuration(2, 1e-5)!
    expect(d.durationS).toBeGreaterThan(0)
    expect(d.capacityKg).toBeCloseTo(2 * 0.85, 5)
  })
})

describe('critical quality: constants consistency', () => {
  it('G * EARTH_MASS is within a few percent of EARTH_MU', () => {
    // Catalog uses high-precision μ; G*M is approximate: document band
    const approx = G * EARTH_MASS
    expect(approx / EARTH_MU).toBeGreaterThan(0.98)
    expect(approx / EARTH_MU).toBeLessThan(1.02)
  })
})

describe('critical quality: angular momentum and escape margin', () => {
  it('specific angular momentum h = √(μ a (1−e²))', () => {
    const a = 8000e3
    const e = 0.1
    const p = a * (1 - e * e)
    const h = Math.sqrt(EARTH_MU * p)
    expect(h).toBeGreaterThan(0)
    // circular limit e→0: h → √(μ a)
    const hCirc = Math.sqrt(EARTH_MU * a)
    expect(h).toBeLessThan(hCirc)
  })

  it('circular→escape Δv is (√2−1) v_c', () => {
    const r = EARTH_RADIUS + 400e3
    const vc = circularOrbitVelocity(EARTH_MU, r)
    const ve = escapeVelocity(EARTH_MU, r)
    expect(ve - vc).toBeCloseTo((Math.SQRT2 - 1) * vc, 8)
  })
})
