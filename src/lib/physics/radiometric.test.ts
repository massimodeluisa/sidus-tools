import { describe, expect, it } from 'vitest'
import { C, EARTH_MU, EARTH_RADIUS } from './constants'
import {
  DSN_TURNAROUND_KA,
  DSN_TURNAROUND_X,
  allanRangeRateSigma,
  dsnArraySnrGain,
  ionThrusterBudget,
  lowThrustEscapeSpiral,
  rangeRateFromClockOffset,
  twoWayDopplerHz,
  twoWayRangeRateFromClockOffset,
} from './radiometric'
import { dopplerShiftHz } from './discovery-wave'

describe('radiometric (DESCANSO / low-thrust escape)', () => {
  it('DSN turnaround ratios match Thornton & Border X and Ka factors', () => {
    expect(DSN_TURNAROUND_X).toBeCloseTo(880 / 749, 12)
    expect(DSN_TURNAROUND_KA).toBeCloseTo(3344 / 749, 12)
  })

  it('two-way Doppler is twice the one-way radial shift', () => {
    const f0 = 8.4e9
    const vr = 3000
    const one = dopplerShiftHz(f0, vr)
    const two = twoWayDopplerHz(f0, vr)
    expect(one).not.toBeNull()
    expect(two).toBeCloseTo(2 * one!, 9)
  })

  it('constant clock offset maps to Δρ̇ = c Δf/f', () => {
    expect(rangeRateFromClockOffset(1e-13)).toBeCloseTo(C * 1e-13, 12)
    expect(rangeRateFromClockOffset(0)).toBe(0)
  })

  it('two-way clock range-rate is half the one-way mapping', () => {
    expect(twoWayRangeRateFromClockOffset(1e-13)).toBeCloseTo((C * 1e-13) / 2, 12)
    expect(twoWayRangeRateFromClockOffset(0)).toBe(0)
    expect(twoWayRangeRateFromClockOffset(Number.NaN)).toBeNull()
  })

  it('Allan white-FM range-rate sigma is √2 c σ_y', () => {
    const sy = 1e-13
    expect(allanRangeRateSigma(sy)).toBeCloseTo(Math.SQRT2 * C * sy, 12)
    expect(allanRangeRateSigma(0)).toBeNull()
  })

  it('identical-antenna array SNR gain is N linear and 10 log10(N) dB', () => {
    const g = dsnArraySnrGain(4)
    expect(g).not.toBeNull()
    expect(g!.gainLin).toBe(4)
    expect(g!.gainDb).toBeCloseTo(10 * Math.log10(4), 12)
    expect(dsnArraySnrGain(1)?.gainDb).toBe(0)
    expect(dsnArraySnrGain(0)).toBeNull()
  })

  it('spiral-to-escape Δv equals v_circ; impulsive is (√2−1) v_circ', () => {
    const r = EARTH_RADIUS + 400_000
    const got = lowThrustEscapeSpiral(EARTH_MU, r)
    expect(got).not.toBeNull()
    const v = Math.sqrt(EARTH_MU / r)
    expect(got!.vCirc).toBeCloseTo(v, 9)
    expect(got!.dvSpiral).toBeCloseTo(v, 9)
    expect(got!.dvImpulsive).toBeCloseTo((Math.SQRT2 - 1) * v, 9)
  })

  it('ion budget returns η, ve, Isp, and α when dry mass is set', () => {
    const b = ionThrusterBudget(0.092, 3.5e-6, 2300, 51)
    expect(b).not.toBeNull()
    expect(b!.eta).toBeCloseTo((0.092 * 0.092) / (2 * 3.5e-6 * 2300), 12)
    expect(b!.ve).toBeCloseTo(0.092 / 3.5e-6, 9)
    expect(b!.isp).toBeCloseTo(b!.ve / 9.80665, 9)
    expect(b!.alpha).toBeCloseTo(2300 / 51, 12)
    expect(ionThrusterBudget(0.092, 3.5e-6, 2300)?.alpha).toBeNull()
  })
})
