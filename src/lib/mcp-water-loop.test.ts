import { describe, expect, it } from 'vitest'
import { MCP_TOOL_DEFS } from '../../mcp/full-catalog'
import {
  BVAD_ISS_WATER,
  ISS_DAY_O2_KG,
  ISS_UPA_RECOVERY,
  waterLoopBudget,
} from './physics/eclss'

describe('water_loop MCP', () => {
  const tool = MCP_TOOL_DEFS.find((definition) => definition.name === 'water_loop')!

  it('matches the page when reserve is omitted', () => {
    const got = tool.run({ crew: 4, days: 180 })
    const expected = waterLoopBudget({
      ...BVAD_ISS_WATER,
      o2Kg: ISS_DAY_O2_KG,
      etaUrine: ISS_UPA_RECOVERY,
      etaCondensate: 1,
      etaHygiene: 0,
      crew: 4,
      durationS: 180 * 86400,
      reserveFrac: 0.1,
    })
    expect(got).toEqual(expected)
  })

  it('keeps an explicit zero reserve', () => {
    const reserved = tool.run({ crew: 4, days: 180 }) as { missionKg: number }
    const bare = tool.run({ crew: 4, days: 180, reserve: 0 }) as { missionKg: number }
    expect(bare.missionKg).toBeCloseTo(reserved.missionKg / 1.1, 9)
  })
})
