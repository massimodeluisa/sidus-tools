import { describe, expect, it } from 'vitest'
import { MCP_TOOL_DEFS } from '../../../mcp/full-catalog'
import { klobucharIonoDelayM, saastamoinenTropoDelay } from './gnss-optical'
import { gnssIonosphereKlobucharSnippets } from '../snippets/tools/gnss-ionosphere-klobuchar'
import { gnssTroposphereDelaySnippets } from '../snippets/tools/gnss-troposphere-delay'

const L1_HZ = 1.57542e9
const LANGS = [
  'python',
  'javascript',
  'typescript',
  'c',
  'cpp',
  'rust',
  'zig',
  'fortran',
  'matlab',
  'julia',
  'latex',
] as const

/** Independent copy of Saastamoinen 1972, pressures in pascals. */
function saastamoinen1972M(elevRad: number, pPa: number, tK: number, ePa: number): number {
  const z = Math.PI / 2 - elevRad
  const pHpa = pPa / 100
  const eHpa = ePa / 100
  return (0.002277 / Math.cos(z)) * (pHpa + (1255 / tK + 0.05) * eHpa - 1.16 * Math.tan(z) ** 2)
}

describe('GPS Klobuchar obliquity mapping', () => {
  it('matches the 5 deg, 10 TECU, L1 obliquity anchor and not the old 1/sin factor', () => {
    const elev = (5 * Math.PI) / 180
    const delay = klobucharIonoDelayM(elev, 10, L1_HZ)
    const vertical = (40.3 * 10 * 1e16) / (L1_HZ * L1_HZ)
    expect(vertical).toBeCloseTo(1.6237244751, 10)
    expect(delay).toBeCloseTo(4.9146654712, 10)
    expect(delay).not.toBeCloseTo(18.6301490175, 2)
  })

  it('rejects elevation outside [0, 90] deg and non-finite inputs', () => {
    expect(klobucharIonoDelayM((120 * Math.PI) / 180, 10, L1_HZ)).toBeNull()
    expect(klobucharIonoDelayM((-1 * Math.PI) / 180, 10, L1_HZ)).toBeNull()
    expect(klobucharIonoDelayM(Math.PI / 2 + 1e-9, 10, L1_HZ)).toBeNull()
    expect(klobucharIonoDelayM(Number.NaN, 10, L1_HZ)).toBeNull()
    expect(klobucharIonoDelayM(0.5, Number.NaN, L1_HZ)).toBeNull()
    expect(klobucharIonoDelayM(0.5, Number.POSITIVE_INFINITY, L1_HZ)).toBeNull()
    expect(klobucharIonoDelayM(0.5, 10, 0)).toBeNull()
    expect(klobucharIonoDelayM(0.5, 10, Number.NaN)).toBeNull()
    expect(klobucharIonoDelayM(0.5, -1, L1_HZ)).toBeNull()
    expect(klobucharIonoDelayM(0, 10, L1_HZ)).not.toBeNull()
    expect(klobucharIonoDelayM(Math.PI / 2, 10, L1_HZ)).not.toBeNull()
  })

  it('constrains the MCP elevation domain and names the obliquity factor', () => {
    const tool = MCP_TOOL_DEFS.find((candidate) => candidate.name === 'gnss_ionosphere_klobuchar')!
    expect(tool.description).toContain('GPS Klobuchar obliquity')
    expect(tool.description).toContain('Not the complete broadcast correction')
    expect(tool.inputSchema.elev_deg!.safeParse(5).success).toBe(true)
    expect(tool.inputSchema.elev_deg!.safeParse(0).success).toBe(true)
    expect(tool.inputSchema.elev_deg!.safeParse(90).success).toBe(true)
    expect(tool.inputSchema.elev_deg!.safeParse(120).success).toBe(false)
    expect(tool.inputSchema.elev_deg!.safeParse(-1).success).toBe(false)
    expect(tool.inputSchema.elev_deg!.safeParse(Number.POSITIVE_INFINITY).success).toBe(false)
    expect(tool.inputSchema.tecu!.safeParse(-1).success).toBe(false)
    expect(tool.inputSchema.freq_hz!.safeParse(0).success).toBe(false)
    expect(tool.run({ elev_deg: 120, tecu: 10, freq_hz: L1_HZ })).toBeNull()
    expect(tool.run({ elev_deg: 5, tecu: 10, freq_hz: L1_HZ })).toEqual({
      delay_m: klobucharIonoDelayM((5 * Math.PI) / 180, 10, L1_HZ),
    })
  })

  it('names the obliquity factor and the elevation domain in every export', () => {
    expect(gnssIonosphereKlobucharSnippets.assumptions).toContain('GPS Klobuchar obliquity')
    expect(gnssIonosphereKlobucharSnippets.assumptions).toContain('Not the complete GPS broadcast')
    expect(gnssIonosphereKlobucharSnippets.assumptions).toContain('[0, pi/2]')
    for (const lang of LANGS) {
      expect(gnssIonosphereKlobucharSnippets.code[lang], lang).toContain('GPS Klobuchar obliquity')
      expect(gnssIonosphereKlobucharSnippets.code[lang], lang).toContain('[0, pi/2]')
    }
  })
})

describe('Saastamoinen 1972 troposphere delay', () => {
  const pPa = 1013.25 * 100
  const tK = 288.15
  const ePa = 11 * 100

  it('matches the 1972 equation at zenith, 30 deg, 5 deg, and changed meteorology', () => {
    const cases = [
      { elev: Math.PI / 2, pPa, tK, ePa, anchor: 2.4175115640812077 },
      { elev: (30 * Math.PI) / 180, pPa, tK, ePa, anchor: 4.819175208162416 },
      { elev: (5 * Math.PI) / 180, pPa, tK, ePa, anchor: 23.77850676731056 },
      { elev: (30 * Math.PI) / 180, pPa: 1000 * 100, tK: 300, ePa: 20 * 100, anchor: 4.92372408 },
    ]
    for (const row of cases) {
      const delay = saastamoinenTropoDelay(row.elev, row.pPa, row.tK, row.ePa)
      const independent = saastamoinen1972M(row.elev, row.pPa, row.tK, row.ePa)
      expect(delay).not.toBeNull()
      expect(delay!).toBeCloseTo(independent, 12)
      expect(delay!).toBeCloseTo(row.anchor, 8)
    }
  })

  it('rejects elevation outside 5-90 deg and invalid meteorology', () => {
    expect(saastamoinenTropoDelay((5 * Math.PI) / 180 - 1e-12, pPa, tK, ePa)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 2 + 1e-12, pPa, tK, ePa)).toBeNull()
    expect(saastamoinenTropoDelay((4 * Math.PI) / 180, pPa, tK, ePa)).toBeNull()
    expect(saastamoinenTropoDelay((120 * Math.PI) / 180, pPa, tK, ePa)).toBeNull()
    expect(saastamoinenTropoDelay(Number.NaN, pPa, tK, ePa)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 4, 0, tK, ePa)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 4, -1, tK, 0)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 4, pPa, 0, ePa)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 4, pPa, -10, ePa)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 4, pPa, tK, -1)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 4, pPa, tK, pPa + 1)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 4, Number.POSITIVE_INFINITY, tK, ePa)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 4, pPa, Number.NaN, ePa)).toBeNull()
    expect(saastamoinenTropoDelay((5 * Math.PI) / 180, pPa, tK, 0)).not.toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 2, pPa, tK, pPa)).not.toBeNull()
  })

  it('constrains MCP inputs to the page domain in pascals', () => {
    const tool = MCP_TOOL_DEFS.find((candidate) => candidate.name === 'gnss_troposphere_delay')!
    expect(tool.description).toContain('Saastamoinen 1972')
    expect(tool.inputSchema.elev_deg!.safeParse(5).success).toBe(true)
    expect(tool.inputSchema.elev_deg!.safeParse(90).success).toBe(true)
    expect(tool.inputSchema.elev_deg!.safeParse(4.9).success).toBe(false)
    expect(tool.inputSchema.elev_deg!.safeParse(90.1).success).toBe(false)
    expect(tool.inputSchema.p_pa!.safeParse(0).success).toBe(false)
    expect(tool.inputSchema.t_k!.safeParse(0).success).toBe(false)
    expect(tool.inputSchema.e_pa!.safeParse(-1).success).toBe(false)
    expect(tool.inputSchema.p_pa!.safeParse(Number.POSITIVE_INFINITY).success).toBe(false)
    expect(tool.run({ elev_deg: 30, p_pa: pPa, t_k: tK, e_pa: pPa + 1 })).toBeNull()
    expect(tool.run({ elev_deg: 4, p_pa: pPa, t_k: tK, e_pa: ePa })).toBeNull()
    expect(tool.run({ elev_deg: 30, p_pa: pPa, t_k: tK, e_pa: ePa })).toEqual({
      delay_m: saastamoinenTropoDelay((30 * Math.PI) / 180, pPa, tK, ePa),
    })
  })

  it('exports the 1972 equation and the same input domain in every language', () => {
    expect(gnssTroposphereDelaySnippets.assumptions).toContain('Saastamoinen 1972')
    expect(gnssTroposphereDelaySnippets.assumptions).toContain('0 <= e <= p')
    for (const lang of LANGS) {
      const body = gnssTroposphereDelaySnippets.code[lang]
      expect(body, lang).toContain('Saastamoinen 1972')
      expect(body, lang).toContain('0 <= e <= p')
      expect(body, lang).toContain('1.16')
      expect(body, lang).toContain('100')
    }
  })
})
