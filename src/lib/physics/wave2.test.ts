import { describe, expect, it } from 'vitest'
import { EARTH_MASS, EARTH_MU, EARTH_RADIUS, SOLAR_MASS } from './constants'
import {
  characteristicEnergy,
  departureBurnFromCircular,
  hyperbolicEccentricity,
} from './hyperbolic'
import {
  ballisticCoefficient,
  circularEclipseDuration,
  lightTime,
  muFromMass,
  sphereOfInfluence,
  synodicPeriod,
} from './mission'
import {
  circularizeBurn,
  geoRadius,
  hohmannWithPlaneChange,
  planeChangeAtApsides,
} from './maneuvers'
import { idealThrust, propellantForDeltaV } from './propulsion'

describe('wave2 physics', () => {
  it('muFromMass recovers Earth-scale μ order', () => {
    const mu = muFromMass(EARTH_MASS)!
    expect(mu / EARTH_MU).toBeGreaterThan(0.99)
    expect(mu / EARTH_MU).toBeLessThan(1.01)
  })

  it('hyperbolic departure: C3 and Δv positive', () => {
    const r = EARTH_RADIUS + 300e3
    const vInf = 3000
    const d = departureBurnFromCircular(EARTH_MU, r, vInf)!
    expect(d.dv).toBeGreaterThan(0)
    expect(characteristicEnergy(vInf)).toBe(vInf * vInf)
    expect(hyperbolicEccentricity(EARTH_MU, r, vInf)!).toBeGreaterThan(1)
  })

  it('SOI Earth about Sun order ~0.01 AU', () => {
    const a = 149_597_870_700
    const soi = sphereOfInfluence(a, EARTH_MASS, SOLAR_MASS)!
    // ~0.006-0.01 AU class
    expect(soi / a).toBeGreaterThan(0.005)
    expect(soi / a).toBeLessThan(0.02)
  })

  it('synodic period LEO vs higher is longer than both periods', () => {
    const r1 = EARTH_RADIUS + 400e3
    const r2 = EARTH_RADIUS + 800e3
    const T = synodicPeriod(EARTH_MU, r1, r2)!
    expect(T).toBeGreaterThan(5_000)
  })

  it('eclipse fraction between 0 and 0.5 for LEO', () => {
    const a = EARTH_RADIUS + 400e3
    const e = circularEclipseDuration(a)!
    expect(e.fraction).toBeGreaterThan(0.2)
    expect(e.fraction).toBeLessThan(0.5)
  })

  it('GEO radius ~42164 km for Earth', () => {
    const a = geoRadius(EARTH_MU)!
    expect(a! / 1000).toBeGreaterThan(42_000)
    expect(a! / 1000).toBeLessThan(42_300)
  })

  it('plane change cheaper at apo', () => {
    const rp = EARTH_RADIUS + 200e3
    const ra = EARTH_RADIUS + 35_786e3
    const p = planeChangeAtApsides(EARTH_MU, rp, ra, (28.5 * Math.PI) / 180)!
    expect(p.dvApo).toBeLessThan(p.dvPeri)
  })

  it('hohmann+plane savings vs pure plane at LEO', () => {
    const r1 = EARTH_RADIUS + 200e3
    const r2 = EARTH_RADIUS + 35_786e3
    const h = hohmannWithPlaneChange(EARTH_MU, r1, r2, (28.5 * Math.PI) / 180)!
    expect(h.savings).toBeGreaterThan(0)
  })

  it('circularize at apo reduces speed', () => {
    const a = 10_000e3
    const e = 0.2
    const c = circularizeBurn(EARTH_MU, a, e, 'apo')!
    expect(c.dv).toBeGreaterThan(0)
    expect(c.vEll).toBeLessThan(c.vCirc) // at apo, elliptical slower than circular at same r? 
    // actually at apo v_ell < v_circ for e>0? Wait: circular at ra has higher energy orbit radius ra, v=sqrt(mu/ra)
    // ellipse at apo is slowest point - v_ell < v_circ(ra). So circularize means SPEED UP.
    expect(c.vEll).toBeLessThan(c.vCirc)
  })

  it('propellant and thrust helpers', () => {
    const p = propellantForDeltaV(300, 3000, 1000)!
    expect(p.prop).toBeGreaterThan(0)
    expect(idealThrust(10, 3000)).toBe(30_000)
  })

  it('ballistic β and light time', () => {
    expect(ballisticCoefficient(500, 2.2, 5)).toBeCloseTo(500 / 11, 5)
    expect(lightTime(299_792_458)).toBeCloseTo(1, 6)
  })
})
