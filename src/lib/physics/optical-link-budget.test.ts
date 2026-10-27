import { describe, expect, it } from 'vitest'
import { MCP_TOOL_DEFS } from '../../../mcp/full-catalog'
import { opticalLinkReceivedPower } from './gnss-optical'
import { laserLinkBudgetSnippets } from '../snippets/tools/laser-link-budget'

const BASE = {
  ptW: 1,
  etaT: 1,
  etaR: 1,
  gt: 1,
  gr: 1,
  wavelengthM: 1.55e-6,
  rangeM: 1000,
  lossLin: 1,
}

describe('optical link budget physical input domain', () => {
  it('matches an independent far-field Friis reference at unit efficiencies and loss', () => {
    const expectedW = 1.5214008981294782e-20
    const actualW = opticalLinkReceivedPower(BASE)!
    expect(Math.abs(actualW / expectedW - 1)).toBeLessThan(1e-14)
  })

  it('rejects efficiencies above one and passive loss factors below one', () => {
    const ideal = opticalLinkReceivedPower(BASE)!
    expect(opticalLinkReceivedPower({ ...BASE, etaT: 1.5, etaR: 1.5 })).toBeNull()

    const eta07 = { ...BASE, etaT: 0.7, etaR: 0.7 }
    const noLoss = opticalLinkReceivedPower(eta07)!
    expect(noLoss / ideal).toBeCloseTo(0.49, 14)
    expect(opticalLinkReceivedPower({ ...eta07, lossLin: 0.5 })).toBeNull()
    expect(opticalLinkReceivedPower({ ...eta07, lossLin: 2 })! / noLoss).toBeCloseTo(0.5, 14)
  })

  it('rejects non-finite efficiency and loss inputs', () => {
    expect(opticalLinkReceivedPower({ ...BASE, etaT: Number.NaN })).toBeNull()
    expect(opticalLinkReceivedPower({ ...BASE, etaR: Number.POSITIVE_INFINITY })).toBeNull()
    expect(opticalLinkReceivedPower({ ...BASE, lossLin: Number.POSITIVE_INFINITY })).toBeNull()
    expect(opticalLinkReceivedPower({ ...BASE, lossLin: Number.NaN })).toBeNull()
  })

  it('rejects non-finite transmitter, gain, wavelength, and range inputs', () => {
    for (const key of ['ptW', 'gt', 'gr', 'wavelengthM', 'rangeM'] as const) {
      expect(opticalLinkReceivedPower({ ...BASE, [key]: Number.POSITIVE_INFINITY }), key).toBeNull()
    }
  })

  it('constrains MCP inputs to finite physical domains', () => {
    const tool = MCP_TOOL_DEFS.find((candidate) => candidate.name === 'laser_link_budget')!
    for (const key of ['pt_w', 'gt', 'gr', 'wavelength_m', 'range_m'] as const) {
      expect(tool.inputSchema[key]!.safeParse(1).success, key).toBe(true)
      expect(tool.inputSchema[key]!.safeParse(0).success, key).toBe(false)
      expect(tool.inputSchema[key]!.safeParse(-1).success, key).toBe(false)
      expect(tool.inputSchema[key]!.safeParse(Number.POSITIVE_INFINITY).success, key).toBe(false)
    }
    const etaT = tool.inputSchema.eta_t!
    const etaR = tool.inputSchema.eta_r!

    expect(etaT.safeParse(1).success).toBe(true)
    expect(etaR.safeParse(0.7).success).toBe(true)
    expect(etaT.safeParse(1.01).success).toBe(false)
    expect(etaR.safeParse(Number.POSITIVE_INFINITY).success).toBe(false)
    expect(
      tool.run({
        pt_w: 1,
        gt: 1,
        gr: 1,
        wavelength_m: BASE.wavelengthM,
        range_m: BASE.rangeM,
        eta_t: 1.01,
      }),
    ).toBeNull()
  })

  it('documents the domain and far-field model in every formula export', () => {
    expect(laserLinkBudgetSnippets.assumptions).toContain('Far-field')
    expect(laserLinkBudgetSnippets.assumptions).toContain('etaT, etaR <= 1')
    expect(laserLinkBudgetSnippets.assumptions).toContain('L >= 1')
    for (const lang of [
      'python', 'javascript', 'typescript', 'c', 'cpp', 'rust', 'zig', 'fortran', 'matlab', 'julia', 'latex',
    ] as const) {
      expect(laserLinkBudgetSnippets.code[lang], lang).toContain('L >= 1')
    }
  })
})

describe('optical link far-field validity domain', () => {
  const WAVELENGTH_M = 1.55e-6
  const TX_RADIUS_M = 0.1
  const RX_RADIUS_M = 0.25
  const GT = 164322237687.23178
  const GR = 1027013985545.1985
  const THRESHOLD_M = 101341.69850289656
  const FAR_FIELD = {
    ptW: 1,
    etaT: 1,
    etaR: 1,
    gt: GT,
    gr: GR,
    wavelengthM: WAVELENGTH_M,
    lossLin: 1,
  }

  it('withholds the far-field result below k Rt Rr', () => {
    expect(opticalLinkReceivedPower({ ...FAR_FIELD, rangeM: 1000 })).toBeNull()
    expect(
      opticalLinkReceivedPower({
        ...FAR_FIELD,
        rangeM: 1000,
        txRadiusM: TX_RADIUS_M,
        rxRadiusM: RX_RADIUS_M,
      }),
    ).toBeNull()
    expect(opticalLinkReceivedPower({ ...FAR_FIELD, rangeM: 1000 })).not.toBe(
      2567.5349638629964,
    )
  })

  it('matches the unchanged Friis expression above the threshold', () => {
    const rangeM = 200_000
    const expected =
      (FAR_FIELD.ptW *
        FAR_FIELD.etaT *
        FAR_FIELD.etaR *
        GT *
        GR *
        (WAVELENGTH_M / (4 * Math.PI * rangeM)) ** 2) /
      FAR_FIELD.lossLin
    const actual = opticalLinkReceivedPower({
      ...FAR_FIELD,
      rangeM,
      txRadiusM: TX_RADIUS_M,
      rxRadiusM: RX_RADIUS_M,
    })
    expect(actual).not.toBeNull()
    expect(Math.abs(actual! / expected - 1)).toBeLessThan(1e-14)
  })

  it('uses the circular-aperture gains to derive the threshold when radii are absent', () => {
    expect(opticalLinkReceivedPower({ ...FAR_FIELD, rangeM: 200_000 })).not.toBeNull()
    expect(opticalLinkReceivedPower({ ...FAR_FIELD, rangeM: THRESHOLD_M })).not.toBeNull()
    expect(
      opticalLinkReceivedPower({ ...FAR_FIELD, rangeM: THRESHOLD_M * (1 - 1e-12) }),
    ).toBeNull()
  })

  it('places the boundary exactly at the provided-aperture threshold', () => {
    expect(
      opticalLinkReceivedPower({
        ...FAR_FIELD,
        rangeM: THRESHOLD_M,
        txRadiusM: TX_RADIUS_M,
        rxRadiusM: RX_RADIUS_M,
      }),
    ).not.toBeNull()
    expect(
      opticalLinkReceivedPower({
        ...FAR_FIELD,
        rangeM: THRESHOLD_M * (1 - 1e-12),
        txRadiusM: TX_RADIUS_M,
        rxRadiusM: RX_RADIUS_M,
      }),
    ).toBeNull()
  })

  it('rejects a lone or non-positive aperture radius', () => {
    expect(
      opticalLinkReceivedPower({ ...FAR_FIELD, rangeM: 200_000, txRadiusM: TX_RADIUS_M }),
    ).toBeNull()
    expect(
      opticalLinkReceivedPower({ ...FAR_FIELD, rangeM: 200_000, rxRadiusM: RX_RADIUS_M }),
    ).toBeNull()
    expect(
      opticalLinkReceivedPower({
        ...FAR_FIELD,
        rangeM: 200_000,
        txRadiusM: 0,
        rxRadiusM: RX_RADIUS_M,
      }),
    ).toBeNull()
    expect(
      opticalLinkReceivedPower({
        ...FAR_FIELD,
        rangeM: 200_000,
        txRadiusM: Number.NaN,
        rxRadiusM: RX_RADIUS_M,
      }),
    ).toBeNull()
  })
})
