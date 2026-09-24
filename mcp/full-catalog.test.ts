import { describe, expect, it } from 'vitest'
import { MCP_TOOL_DEFS } from './full-catalog'

describe('equal_stage MCP tool', () => {
  const equalStage = MCP_TOOL_DEFS.find((tool) => tool.name === 'equal_stage')!

  it('uses the same normalized integer stage count as the web calculator', () => {
    expect(
      equalStage.run({ total_dv_m_s: 9000, n_stages: 2.4, isp_s: 300 }),
    ).toEqual({
      dvStage: 4500,
      massRatio: 4.616211372684578,
      ve: 2941.995,
    })
  })

  it('rejects a fractional input that rounds below one stage', () => {
    expect(
      equalStage.run({ total_dv_m_s: 9000, n_stages: 0.49, isp_s: 300 }),
    ).toBeNull()
  })
})
