import { describe, expect, it } from 'vitest'
import {
  BVAD_ISS_WATER,
  ISS_DAY_O2_KG,
  ISS_UPA_RECOVERY,
  WATER_PER_O2_ELECTROLYSIS,
  waterLoopBudget,
  type WaterLoopInputs,
} from './eclss'

const ISS: WaterLoopInputs = {
  ...BVAD_ISS_WATER,
  o2Kg: ISS_DAY_O2_KG,
  etaUrine: ISS_UPA_RECOVERY,
  etaCondensate: 1,
  etaHygiene: 0,
  crew: 4,
  durationS: 180 * 86400,
  reserveFrac: 0,
}

describe('crew water loop budget', () => {
  it('derives the electrolysis ratio from 2 H₂O → 2 H₂ + O₂', () => {
    expect(WATER_PER_O2_ELECTROLYSIS).toBeCloseTo(1.12601, 5)
  })

  it('closes the ISS-class default balance by hand', () => {
    const b = waterLoopBudget(ISS)!
    const electrolysis = 0.82 * WATER_PER_O2_ELECTROLYSIS
    const demand = 2.5 + 0.4 + 0.3 + electrolysis
    const recovered = 0.85 * (1.2 + 0.3) + 2.27
    expect(b.electrolysisKg).toBeCloseTo(electrolysis, 12)
    expect(b.demandKg).toBeCloseTo(demand, 12)
    expect(b.recoveredKg).toBeCloseTo(recovered, 12)
    expect(b.makeupKg).toBeCloseTo(demand - recovered, 12)
    expect(b.missionKg).toBeCloseTo((demand - recovered) * 4 * 180, 9)
    expect(b.openLoopKg).toBeCloseTo(demand * 4 * 180, 9)
    expect(b.savedKg).toBeCloseTo(b.openLoopKg - b.missionKg, 9)
    expect(b.closure).toBeGreaterThan(0.85)
    expect(b.closure).toBeLessThan(0.87)
  })

  it('open loop ships everything and reserve scales linearly', () => {
    const open = waterLoopBudget({ ...ISS, etaUrine: 0, etaCondensate: 0, reserveFrac: 0.1 })!
    expect(open.closure).toBe(0)
    expect(open.missionKg).toBeCloseTo(open.openLoopKg, 9)
    expect(open.missionKg).toBeCloseTo(open.demandKg * 4 * 180 * 1.1, 9)
  })

  it('reports surplus instead of negative makeup', () => {
    const b = waterLoopBudget({ ...ISS, o2Kg: 0, etaHygiene: 1 })!
    expect(b.makeupKg).toBe(0)
    expect(b.surplusKg).toBeGreaterThan(0)
    expect(b.closure).toBe(1)
  })

  it('rejects unphysical inputs', () => {
    expect(waterLoopBudget({ ...ISS, etaUrine: 1.1 })).toBeNull()
    expect(waterLoopBudget({ ...ISS, potableKg: -1 })).toBeNull()
    expect(waterLoopBudget({ ...ISS, crew: 0 })).toBeNull()
    expect(waterLoopBudget({ ...ISS, durationS: 0 })).toBeNull()
    expect(waterLoopBudget({ ...ISS, reserveFrac: -0.1 })).toBeNull()
    expect(waterLoopBudget({ ...ISS, potableKg: NaN })).toBeNull()
  })
})
