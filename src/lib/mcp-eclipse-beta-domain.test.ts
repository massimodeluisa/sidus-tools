import { describe, expect, it } from 'vitest'
import { MCP_TOOL_DEFS } from '../../mcp/full-catalog'

describe('eclipse_beta MCP input domain', () => {
  const tool = MCP_TOOL_DEFS.find((definition) => definition.name === 'eclipse_beta')

  it('accepts both beta-angle endpoints and rejects values outside [-90, 90] degrees', () => {
    expect(tool).toBeDefined()
    const betaSchema = tool!.inputSchema.beta_deg!
    expect(betaSchema.safeParse(-90).success).toBe(true)
    expect(betaSchema.safeParse(90).success).toBe(true)
    expect(betaSchema.safeParse(-90.000001).success).toBe(false)
    expect(betaSchema.safeParse(90.000001).success).toBe(false)
  })
})
