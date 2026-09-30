import { describe, expect, it } from 'vitest'
import { MCP_TOOL_DEFS } from './full-catalog'

const tool = MCP_TOOL_DEFS.find((entry) => entry.name === 'gnss_ionosphere_klobuchar')!

describe('gnss_ionosphere_klobuchar MCP contract', () => {
  it('rejects elevations outside the geometric domain and non-finite inputs', () => {
    const schema = tool.inputSchema
    for (const elev of [-1, 90.000001, NaN, Infinity]) {
      expect(schema.elev_deg!.safeParse(elev).success).toBe(false)
    }
    for (const tecu of [-1, NaN, Infinity]) {
      expect(schema.tecu!.safeParse(tecu).success).toBe(false)
    }
    for (const frequency of [0, -1, NaN, Infinity]) {
      expect(schema.freq_hz!.safeParse(frequency).success).toBe(false)
    }
    expect(schema.elev_deg!.safeParse(0).success).toBe(true)
    expect(schema.elev_deg!.safeParse(90).success).toBe(true)
    expect(schema.tecu!.safeParse(0).success).toBe(true)
    expect(schema.freq_hz!.safeParse(undefined).success).toBe(true)
  })

  it('adapts degrees to the independently anchored SI delay', () => {
    expect(
      tool.run({ elev_deg: 5, tecu: 10, freq_hz: 1.57542e9 }),
    ).toEqual({ delay_m: 4.914665471214046 })
  })
})
