import { describe, expect, it } from 'vitest'
import { MCP_TOOL_DEFS } from '../../../mcp/full-catalog'
import { radarRangeResolution } from './discovery-wave'

const radarRangeTool = MCP_TOOL_DEFS.find((tool) => tool.name === 'radar_range_resolution')!

describe('radar range resolution', () => {
  it('returns the nominal slant-range bandwidth metric for a 50 MHz input', () => {
    const expectedM = 299_792_458 / (2 * 50_000_000)

    expect(radarRangeResolution(50_000_000)).toBe(expectedM)
    expect(radarRangeTool.run({ bandwidth_hz: 50_000_000 })).toEqual({ res_m: expectedM })
    expect(radarRangeTool.description).toContain('Approximate bandwidth-limited slant-range resolution')
    expect(radarRangeTool.description).toContain('not ground-projected cross-track resolution')
    expect(radarRangeTool.description).toContain('NASA Earthdata')
    expect(radarRangeTool.inputSchema.bandwidth_hz.description).toContain('bandwidth')
  })

  it('requires a finite positive bandwidth and returns a finite positive result', () => {
    for (const bandwidthHz of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(radarRangeResolution(bandwidthHz)).toBeNull()
      expect(radarRangeTool.inputSchema.bandwidth_hz.safeParse(bandwidthHz).success).toBe(false)
      expect(radarRangeTool.run({ bandwidth_hz: bandwidthHz })).toBeNull()
    }
    expect(radarRangeResolution(50_000_000, Number.NaN)).toBeNull()
    expect(radarRangeResolution(50_000_000, Number.POSITIVE_INFINITY)).toBeNull()
    expect(radarRangeResolution(Number.MIN_VALUE)).toBeNull()

    const extremeFiniteBandwidth = radarRangeResolution(Number.MAX_VALUE)
    expect(extremeFiniteBandwidth).not.toBeNull()
    expect(Number.isFinite(extremeFiniteBandwidth)).toBe(true)
    expect(extremeFiniteBandwidth).toBeGreaterThan(0)
    expect(radarRangeTool.inputSchema.bandwidth_hz.safeParse(50_000_000).success).toBe(true)
  })
})
