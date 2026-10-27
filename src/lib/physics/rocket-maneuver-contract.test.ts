import { describe, expect, it } from 'vitest'
import {
  EARTH_MU,
  EARTH_RADIUS,
  G0,
  circularizeBurn,
  hohmannWithPlaneChange,
  lnMassRatio,
  multiStageDeltaV,
  planeChangeAtApsides,
  planeChangeDeltaV,
  propellantForDeltaV,
  rocketDeltaV,
  visViva,
} from './index'

const ISP = 320
const MF = 5000
const M0 = 5000 + 1e-12

describe('rocket and maneuver contract', () => {
  it('inverts a 9 km/s burn without using a stale wet mass', () => {
    const solved = propellantForDeltaV(330, 9000, 100_000, G0)
    expect(solved).not.toBeNull()
    expect(solved!.m0).toBeCloseTo(1_613_586.1498216598, 4)
    const stale = rocketDeltaV(330, 500_000, 100_000)
    expect(stale).toBeCloseTo(5208.4541203107165, 4)
    expect(solved!.m0).not.toBeCloseTo(500_000, 0)
  })

  it('uses expm1 for propellant at Δv = 1e-12 m/s', () => {
    const solved = propellantForDeltaV(ISP, 1e-12, MF, G0)
    expect(solved).not.toBeNull()
    const cancelled = solved!.m0 - MF
    expect(cancelled).toBeCloseTo(9.094947017729282e-13, 20)
    expect(solved!.prop).toBeCloseTo(1.5933065827780133e-12, 20)
    expect(Math.abs(solved!.prop - cancelled) / solved!.prop).toBeGreaterThan(0.4)
  })

  it('uses log1p for a near-unity mass ratio', () => {
    const stable = rocketDeltaV(ISP, M0, MF)
    const direct = ISP * G0 * Math.log(M0 / MF)
    expect(lnMassRatio(M0, MF)).toBeCloseTo(Math.log1p((M0 - MF) / MF), 18)
    expect(stable).toBeCloseTo(5.708221578970551e-13, 20)
    expect(direct).toBeCloseTo(6.968043919641785e-13, 20)
    expect(Math.abs(direct - stable) / stable).toBeGreaterThan(0.2)
    const staged = multiStageDeltaV([{ ve: ISP * G0, m0: M0, mf: MF }])
    expect(staged).not.toBeNull()
    expect(staged!.dv[0]).toBe(stable)
    expect(staged!.dvTotal).toBe(stable)
  })

  it('keeps a far-from-unity rocket Δv on the direct logarithm', () => {
    expect(rocketDeltaV(300, 10, 1)).toBeCloseTo(300 * G0 * Math.log(10), 12)
  })

  it('folds 540 deg to a nonnegative plane-change magnitude and rejects negative speed', () => {
    const wrapped = planeChangeDeltaV(7500, (540 * Math.PI) / 180)
    expect(wrapped).toBeCloseTo(15_000, 8)
    expect(wrapped).toBeGreaterThan(0)
    expect(planeChangeDeltaV(-7500, (28.5 * Math.PI) / 180)).toBeNaN()
    const rp = EARTH_RADIUS + 200_000
    const ra = EARTH_RADIUS + 35_786_000
    const signed = planeChangeAtApsides(EARTH_MU, rp, ra, (-28.5 * Math.PI) / 180)
    const positive = planeChangeAtApsides(EARTH_MU, rp, ra, (28.5 * Math.PI) / 180)
    expect(signed).not.toBeNull()
    expect(positive).not.toBeNull()
    expect(signed!.dvApo).toBeCloseTo(positive!.dvApo, 10)
    expect(signed!.dvApo).toBeGreaterThan(0)
    expect(signed!.dvApo).toBeCloseTo(786.405401, 3)
    const zero = planeChangeAtApsides(EARTH_MU, rp, ra, 0)
    expect(zero).not.toBeNull()
    expect(zero!.dvPeri).toBe(0)
    expect(zero!.dvApo).toBe(0)
    const a = (rp + ra) / 2
    expect(zero!.ratio).toBeCloseTo(visViva(EARTH_MU, ra, a) / visViva(EARTH_MU, rp, a), 12)
    expect(zero!.ratio).toBeCloseTo(0.156012609, 6)
  })

  it('keeps the inward Hohmann-plus-plane first burn nonnegative', () => {
    const r1 = EARTH_RADIUS + 400_000
    const r2 = EARTH_RADIUS + 200_000
    const got = hohmannWithPlaneChange(EARTH_MU, r1, r2, (28.5 * Math.PI) / 180)
    expect(got).not.toBeNull()
    expect(got!.dv1).toBeCloseTo(57.631962674, 6)
    expect(got!.dv1).toBeGreaterThan(0)
    expect(got!.dv2).toBeCloseTo(3846.94793018, 5)
    expect(got!.dvCombined).toBeCloseTo(3904.579892855, 5)
  })

  it('circularizes the 8000 km ellipse at periapsis', () => {
    const burn = circularizeBurn(EARTH_MU, 8_000_000, 0.1, 'peri')
    expect(burn).not.toBeNull()
    expect(burn!.r).toBeCloseTo(7_200_000, 6)
    expect(burn!.vEll).toBeCloseTo(7803.67155379, 4)
    expect(burn!.vCirc).toBeCloseTo(7440.5088853, 4)
    expect(burn!.dv).toBeCloseTo(363.162668491, 4)
    const apo = circularizeBurn(EARTH_MU, 8_000_000, 0.1, 'apo')
    expect(apo!.dv).toBeCloseTo(345.371335, 3)
    expect(burn!.dv).not.toBeCloseTo(apo!.dv, 0)
  })
})
