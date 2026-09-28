import { describe, expect, it } from 'vitest'
import { MCP_TOOL_DEFS } from '../../mcp/full-catalog'

const flybySpeed = MCP_TOOL_DEFS.find((tool) => tool.name === 'flyby_speed')!
const periapsisSpeed = MCP_TOOL_DEFS.find((tool) => tool.name === 'flyby_periapsis_speed')!

describe('flyby MCP API semantics', () => {
  it('labels the legacy turn-angle calculation without changing its result contract', () => {
    expect(flybySpeed.description).toMatch(/does not calculate periapsis speed/i)
    const result = flybySpeed.run({ v_inf_in_m_s: 5000, turn_deg: 30 }) as Record<string, number>
    expect(result.e).toBeCloseTo(1 / Math.sin(Math.PI / 12), 12)
    expect(result.turn_rad).toBeCloseTo(Math.PI / 6, 12)
    expect(result.turn_deg).toBeCloseTo(30, 12)
    expect(result.v_inf_m_s).toBe(5000)
  })

  it('computes periapsis speed from two-body specific energy in SI', () => {
    const result = periapsisSpeed.run({
      mu_m3_s2: 3.986004418e14,
      periapsis_radius_m: 6_778_137,
      v_inf_m_s: 5000,
    }) as Record<string, number>
    expect(result.periapsis_radius_m).toBe(6_778_137)
    expect(result.v_esc_m_s).toBeCloseTo(Math.sqrt((2 * 3.986004418e14) / 6_778_137), 10)
    expect(result.v_p_m_s).toBeCloseTo(11_942.092319991702, 10)
  })

  it('rejects nonphysical radii, gravitational parameters, speeds, and overflow', () => {
    expect(periapsisSpeed.run({ mu_m3_s2: 0, periapsis_radius_m: 1, v_inf_m_s: 1 })).toBeNull()
    expect(periapsisSpeed.run({ mu_m3_s2: 1, periapsis_radius_m: 0, v_inf_m_s: 1 })).toBeNull()
    expect(periapsisSpeed.run({ mu_m3_s2: 1, periapsis_radius_m: 1, v_inf_m_s: -1 })).toBeNull()
    expect(periapsisSpeed.run({ mu_m3_s2: Number.MAX_VALUE, periapsis_radius_m: 1, v_inf_m_s: 1 })).toBeNull()
  })

  it('includes the new tool in the discoverable name catalog', () => {
    const listed = MCP_TOOL_DEFS.find((tool) => tool.name === 'list_mcp_tools')!.run({}) as {
      count: number
      tools: string[]
    }
    expect(listed.tools).toContain('flyby_periapsis_speed')
    expect(listed.tools).toEqual(expect.arrayContaining(MCP_TOOL_DEFS.map((tool) => tool.name)))
    expect(listed.count).toBe(listed.tools.length)
  })
})
