import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { MCP_TOOL_DEFS } from '../../mcp/full-catalog'

const tool = MCP_TOOL_DEFS.find((entry) => entry.name === 'sar_azimuth_resolution')
if (!tool) throw new Error('sar_azimuth_resolution MCP definition is missing')

const schema = z.object(tool.inputSchema)

describe('sar_azimuth_resolution MCP contract', () => {
  it('defines the input angle as the total focused-processing beamwidth', () => {
    expect(tool.description).toContain('total angular span')
    expect(tool.description).toContain('processing beamwidth')
    expect(tool.description).toContain('radians')
  })

  it('accepts finite positive wavelength and angle inputs only', () => {
    const valid = { wavelength_m: 0.03, synth_angle_rad: 0.1 }
    expect(schema.safeParse(valid).success).toBe(true)

    for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(schema.safeParse({ ...valid, wavelength_m: value }).success).toBe(false)
      expect(schema.safeParse({ ...valid, synth_angle_rad: value }).success).toBe(false)
    }
  })

  it('matches the focused-SAR equation-derived reference case', () => {
    // NASA SWOT User Handbook Eqs. 8.77-8.78: with rho0=700 km,
    // L_SA ~= theta_SA*rho0 = 70 km and delta_x ~= (lambda/(2*L_SA))*rho0 = 0.15 m.
    expect(tool.run({ wavelength_m: 0.03, synth_angle_rad: 0.1 })).toEqual({ res_m: 0.15 })
  })

  it('returns no result if the runner is called directly with an invalid angle', () => {
    expect(tool.run({ wavelength_m: 0.03, synth_angle_rad: 0 })).toBeNull()
  })
})
