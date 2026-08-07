/**
 * High-trust reference benchmarks for shipped pure physics.
 * Expected values are derived independently from the same closed-form
 * equations as textbooks (not copied from SIDUS outputs), then compared
 * to the exported functions under test.
 *
 * Sources (formulas / constants class):
 * - Vallado, Fundamentals of Astrodynamics and Applications
 * - Curtis, Orbital Mechanics for Engineering Students
 * - WGS-84 / standard μ⊕ = 3.986004418e14 m³/s², R⊕ = 6378137 m
 */
import { describe, expect, it } from 'vitest'
import { EARTH_MU, EARTH_RADIUS, G0, C, AU } from './constants'
import {
  circularOrbitVelocity,
  escapeVelocity,
  hohmannTransfer,
  orbitalPeriod,
  planeChangeDeltaV,
  rocketDeltaV,
  visViva,
  biellipticTransfer,
} from './orbital'
import { muFromMass, surfaceGravity, sphereOfInfluence, lightTime } from './mission'
import {
  characteristicEnergy,
  departureBurnFromCircular,
  hyperbolicEccentricity,
} from './hyperbolic'
import { geoRadius, circularizeBurn, hohmannWithPlaneChange } from './maneuvers'
import { freeSpacePathLossDb } from './link'
import { suttonGravesHeatFlux, SUTTON_GRAVES_K_EARTH } from './ops'
import { TOOLS } from '@/data/tools'
import { getToolPrecision, TOOL_PRECISION } from '@/data/precision'

/** Independent closed-form (must not call SIDUS exports). */
function refVesc(mu: number, r: number) {
  return Math.sqrt((2 * mu) / r)
}
function refVcirc(mu: number, r: number) {
  return Math.sqrt(mu / r)
}
function refPeriod(mu: number, a: number) {
  return 2 * Math.PI * Math.sqrt((a * a * a) / mu)
}

describe('precision reference: Earth two-body (WGS-class μ,R)', () => {
  it('surface escape velocity matches independent √(2μ/R)', () => {
    const expected = refVesc(EARTH_MU, EARTH_RADIUS)
    const got = escapeVelocity(EARTH_MU, EARTH_RADIUS)
    // bit-level same formula path; residual must be ~0
    expect(Math.abs(got - expected) / expected).toBeLessThan(1e-15)
    // Published class: ~11.18 km/s (spherical Earth, this μ,R)
    expect(got / 1000).toBeGreaterThan(11.17)
    expect(got / 1000).toBeLessThan(11.2)
  })

  it('400 km LEO circular speed matches independent √(μ/r)', () => {
    const r = EARTH_RADIUS + 400_000
    const expected = refVcirc(EARTH_MU, r)
    const got = circularOrbitVelocity(EARTH_MU, r)
    expect(Math.abs(got - expected) / expected).toBeLessThan(1e-15)
    expect(got / 1000).toBeGreaterThan(7.66)
    expect(got / 1000).toBeLessThan(7.68)
  })

  it('v_esc / v_circ identity is √2 within 1e-15 relative', () => {
    const r = EARTH_RADIUS + 500_000
    const ratio = escapeVelocity(EARTH_MU, r) / circularOrbitVelocity(EARTH_MU, r)
    expect(Math.abs(ratio - Math.SQRT2) / Math.SQRT2).toBeLessThan(1e-15)
  })

  it('orbital period 400 km matches independent 2π√(a³/μ)', () => {
    const a = EARTH_RADIUS + 400_000
    const expected = refPeriod(EARTH_MU, a)
    const got = orbitalPeriod(EARTH_MU, a)
    expect(Math.abs(got - expected) / expected).toBeLessThan(1e-15)
    // ~92.4 min class
    expect(got / 60).toBeGreaterThan(92)
    expect(got / 60).toBeLessThan(93)
  })

  it('vis-viva at peri/apo of e=0.1 matches independent formula', () => {
    const a = 8000e3
    const e = 0.1
    const rp = a * (1 - e)
    const ra = a * (1 + e)
    const vpExp = Math.sqrt(EARTH_MU * (2 / rp - 1 / a))
    const vaExp = Math.sqrt(EARTH_MU * (2 / ra - 1 / a))
    expect(Math.abs(visViva(EARTH_MU, rp, a) - vpExp) / vpExp).toBeLessThan(1e-15)
    expect(Math.abs(visViva(EARTH_MU, ra, a) - vaExp) / vaExp).toBeLessThan(1e-15)
  })
})

describe('precision reference: maneuvers', () => {
  it('plane change 60° at 7.5 km/s matches 2 v sin(Δi/2)', () => {
    const v = 7500
    const di = Math.PI / 3
    const expected = 2 * v * Math.sin(di / 2)
    const got = planeChangeDeltaV(v, di)
    expect(Math.abs(got - expected) / expected).toBeLessThan(1e-15)
  })

  it('Hohmann LEO→GEO: independent two-burn Δv sum', () => {
    const r1 = EARTH_RADIUS + 200_000
    const r2 = EARTH_RADIUS + 35_786_000
    const a = (r1 + r2) / 2
    const v1 = Math.sqrt(EARTH_MU / r1)
    const v2 = Math.sqrt(EARTH_MU / r2)
    const vp = Math.sqrt(EARTH_MU * (2 / r1 - 1 / a))
    const va = Math.sqrt(EARTH_MU * (2 / r2 - 1 / a))
    const dv1 = Math.abs(vp - v1)
    const dv2 = Math.abs(v2 - va)
    const expected = dv1 + dv2
    const got = hohmannTransfer(EARTH_MU, r1, r2)
    expect(Math.abs(got.dvTotal - expected) / expected).toBeLessThan(1e-14)
    expect(got.dvTotal / 1000).toBeGreaterThan(3.8)
    expect(got.dvTotal / 1000).toBeLessThan(4.0)
  })

  it('bielliptic reduces to two-body energy consistent burns', () => {
    const r1 = EARTH_RADIUS + 300_000
    const r2 = EARTH_RADIUS + 100_000_000
    const rb = EARTH_RADIUS + 400_000_000
    const b = biellipticTransfer(EARTH_MU, r1, r2, rb)
    expect(b.dvTotal).toBeGreaterThan(0)
    expect(Number.isFinite(b.tof)).toBe(true)
  })

  it('Tsiolkovsky Δv = Isp g0 ln(m0/mf)', () => {
    const isp = 300
    const m0 = 10
    const mf = 1
    const expected = isp * G0 * Math.log(m0 / mf)
    const got = rocketDeltaV(isp, m0, mf)
    expect(Math.abs(got - expected) / expected).toBeLessThan(1e-15)
  })

  it('GEO radius from sidereal day matches a³ = μ T²/(4π²)', () => {
    const T = 86164.0905
    const expected = Math.cbrt((EARTH_MU * T * T) / (4 * Math.PI * Math.PI))
    const got = geoRadius(EARTH_MU, T)!
    expect(Math.abs(got - expected) / expected).toBeLessThan(1e-15)
    expect(got / 1000).toBeGreaterThan(42_160)
    expect(got / 1000).toBeLessThan(42_170)
  })

  it('circularize burn residual is |vell−vc|', () => {
    const a = 10_000e3
    const e = 0.2
    const c = circularizeBurn(EARTH_MU, a, e, 'apo')!
    const ra = a * (1 + e)
    const vell = Math.sqrt(EARTH_MU * (2 / ra - 1 / a))
    const vc = Math.sqrt(EARTH_MU / ra)
    expect(c.dv).toBeCloseTo(Math.abs(vell - vc), 8)
  })

  it('combined Hohmann+plane is cheaper than sequential pure plane at LEO for large Δi', () => {
    const r1 = EARTH_RADIUS + 200e3
    const r2 = EARTH_RADIUS + 35_786e3
    const h = hohmannWithPlaneChange(EARTH_MU, r1, r2, (28.5 * Math.PI) / 180)!
    expect(h.savings).toBeGreaterThan(0)
    expect(h.dvCombined).toBeLessThan(h.hohmann.dvTotal + h.dvPlaneAtR1)
  })
})

describe('precision reference: hyperbolic', () => {
  it('C3 = v_∞² exactly', () => {
    const v = 3200
    expect(characteristicEnergy(v)).toBe(v * v)
  })

  it('departure Δv = vp−vc with independent vp', () => {
    const r = EARTH_RADIUS + 300e3
    const vInf = 2500
    const vp = Math.sqrt(vInf * vInf + (2 * EARTH_MU) / r)
    const vc = Math.sqrt(EARTH_MU / r)
    const d = departureBurnFromCircular(EARTH_MU, r, vInf)!
    expect(Math.abs(d.vp - vp) / vp).toBeLessThan(1e-14)
    expect(Math.abs(d.dv - (vp - vc)) / d.dv).toBeLessThan(1e-14)
    expect(hyperbolicEccentricity(EARTH_MU, r, vInf)).toBeCloseTo(
      1 + (r * vInf * vInf) / EARTH_MU,
      12,
    )
  })
})

describe('precision reference: mission helpers', () => {
  it('μ = G M for a known mass recovers product', () => {
    const M = 1e24
    const mu = muFromMass(M)!
    // G from constants
    expect(mu).toBeCloseTo(6.6743e-11 * M, 5)
  })

  it('surface g = μ/R²', () => {
    const g = surfaceGravity(EARTH_MU, EARTH_RADIUS)!
    const expected = EARTH_MU / (EARTH_RADIUS * EARTH_RADIUS)
    expect(Math.abs(g - expected) / expected).toBeLessThan(1e-15)
  })

  it('SOI scales as a (m/M)^0.4', () => {
    const a = AU
    const m = 5.9722e24
    const M = 1.98847e30
    const expected = a * (m / M) ** 0.4
    const got = sphereOfInfluence(a, m, M)!
    expect(Math.abs(got - expected) / expected).toBeLessThan(1e-14)
  })

  it('light time for 1 c·s is 1 s', () => {
    expect(lightTime(C)).toBeCloseTo(1, 12)
  })
})

describe('precision reference: RF and aero constants', () => {
  it('FSPL at 1 km, 1 MHz matches 20log d + 20log f + 32.44', () => {
    const dKm = 1
    const fMHz = 1
    const expected = 20 * Math.log10(dKm) + 20 * Math.log10(fMHz) + 32.44
    const got = freeSpacePathLossDb(dKm, fMHz)!
    expect(Math.abs(got - expected)).toBeLessThan(1e-12)
  })

  it('Sutton-Graves scales as v³ and uses shipped k', () => {
    const rho = 1e-4
    const Rn = 0.5
    const v = 7000
    const expected = SUTTON_GRAVES_K_EARTH * Math.sqrt(rho / Rn) * v ** 3
    const got = suttonGravesHeatFlux(rho, v, Rn)!
    expect(Math.abs(got - expected) / expected).toBeLessThan(1e-14)
  })
})

describe('precision metadata coverage', () => {
  it('every live tool id has an explicit TOOL_PRECISION entry', () => {
    const live = TOOLS.filter((t) => t.status === 'live')
    const missing = live.filter((t) => !TOOL_PRECISION[t.id]).map((t) => t.id)
    expect(missing, `missing precision notes: ${missing.join(', ')}`).toEqual([])
  })

  it('getToolPrecision always returns limits text', () => {
    for (const t of TOOLS.filter((x) => x.status === 'live')) {
      const p = getToolPrecision(t.id)
      expect(p.limits.length).toBeGreaterThan(20)
      expect(p.errorClass.length).toBeGreaterThan(5)
    }
  })
})
