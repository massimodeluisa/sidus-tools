import { describe, expect, it } from 'vitest'
import { de } from '@/i18n/locales/de'
import { en } from '@/i18n/locales/en'
import { es } from '@/i18n/locales/es'
import { fr } from '@/i18n/locales/fr'
import { it as italian } from '@/i18n/locales/it'
import { ja } from '@/i18n/locales/ja'
import { ko } from '@/i18n/locales/ko'
import { pt } from '@/i18n/locales/pt'
import { ru } from '@/i18n/locales/ru'
import { zh } from '@/i18n/locales/zh'
import { TOOL_PRECISION } from '@/data/precision'
import { SOURCES } from '@/data/sources'
import { TOOLS } from '@/data/tools'
import { MCP_TOOL_DEFS } from '../../mcp/full-catalog'

const locales = { en, it: italian, de, fr, es, ru, zh, ja, ko, pt }

function tool(id: string) {
  const found = TOOLS.find((entry) => entry.id === id)
  if (!found) throw new Error(id)
  return found
}

describe('body radius copy', () => {
  it('calls the radius a reference radius and names the Earth WGS 84 equator', () => {
    for (const bundle of Object.values(locales)) {
      expect(bundle.fields.mean_radius.toLowerCase()).not.toContain('mean radius')
      expect(bundle.fields.mean_radius_r.toLowerCase()).not.toContain('mean radius')
      expect(bundle.fields.note_bodies_ref).toMatch(/WGS 84/)
    }
    expect(en.fields.mean_radius).toBe('Reference radius')
    expect(en.fields.disc_m).toBe('Mass')
    expect(en.fields.invalid_latitude.length).toBeGreaterThan(0)
    expect(en.fields.satellite_unnamed.length).toBeGreaterThan(0)
  })
})

describe('catalog copy for the gap issues', () => {
  it('states the coelliptic sign, the sail fraction, and the link margin unit', () => {
    expect(en.fields.tip_coell_dn).toContain('Signed')
    expect(en.fields.tip_coell_dn).not.toContain('|n_chaser')
    expect(tool('solar-sail-accel').description).toContain('not material reflectance')
    expect(tool('link-margin').description).toContain('in dB')
    expect(tool('link-margin').description).not.toContain('[dB-Hz]')
    expect(en.fields.magnetic_dipole_moment).toContain('Magnetic dipole moment')
    expect(en.fields.note_magnetorquer).toContain('A·m²')
  })

  it('translates the battery and solar-array labels', () => {
    const keys = [
      'bus_voltage',
      'load_power',
      'stored_energy',
      'endurance_at_load',
      'array_area',
      'efficiency',
      'sun_incidence_from_normal',
      'electrical_power',
    ] as const
    for (const [name, bundle] of Object.entries(locales)) {
      if (name === 'en') continue
      for (const key of keys) {
        expect(bundle.fields[key], `${name}.${key}`).not.toBe(en.fields[key])
      }
    }
  })

  it('moves panel EOL off the two-body class and cites a power source', () => {
    expect(TOOL_PRECISION['panel-eol-power'].modelClass).not.toBe('two-body-exact')
    expect(TOOL_PRECISION['panel-eol-power'].limits).toContain('does not predict')
    const panel = tool('panel-eol-power')
    expect(panel.sourceIds).toContain('nasa-smallsat-power')
    expect(panel.sourceIds).not.toContain('nasa-grc')
    expect(SOURCES['nasa-smallsat-power'].url.startsWith('http')).toBe(true)
  })

  it('uses subject sources and a non-two-body class for the copy fixes', () => {
    const cases: Array<[string, string, string]> = [
      ['exponential-density', 'atmosphere-order', 'nasa-edl-atmosphere'],
      ['gravity-loss', 'closed-form', 'nasa-launch-tm-2014'],
      ['thruster-impulse-bit', 'closed-form', 'nasa-impulse-bit'],
      ['sar-azimuth-resolution', 'closed-form', 'nasa-swot-handbook'],
      ['radar-range-resolution', 'closed-form', 'nasa-swot-handbook'],
      ['link-margin', 'closed-form', 'nasa-link-margin'],
      ['aerobraking-pass', 'atmosphere-order', 'nasa-drag-coefficient'],
      ['diffraction-limit', 'closed-form', 'nasa-rayleigh-1968'],
      ['magnetorquer-moment', 'closed-form', 'nasa-smallsat-gnc'],
      ['solar-array', 'empirical-const', 'nasa-solar-irradiance'],
      ['battery', 'closed-form', 'nasa-smallsat-power'],
      ['solar-sail-accel', 'empirical-const', 'nasa-solar-sail'],
    ]
    for (const [id, modelClass, sourceId] of cases) {
      expect(TOOL_PRECISION[id].modelClass, id).toBe(modelClass)
      expect(TOOL_PRECISION[id].limits, id).not.toContain('spherical central mass')
      expect(tool(id).sourceIds, id).toContain(sourceId)
      expect(SOURCES[sourceId].url.startsWith('https://'), sourceId).toBe(true)
    }
    expect(TOOL_PRECISION['delta-a-burn'].limits).toContain('Δv/v')
    expect(en.fields.flight_path_above_horiz.length).toBeGreaterThan(0)
    expect(en.fields.panel_degrade_fraction).toContain('Fractional')
    expect(en.fields.sar_processing_beamwidth).toContain('total span')
    expect(en.fields.note_exp_density).toContain('Constant scale height')
    expect(en.fields.note_battery_ideal).toContain('Ideal')
    expect(en.fields.note_solar_array).toContain('0°')
  })
})

describe('flyby_speed MCP description', () => {
  it('identifies the turn-angle eccentricity sketch', () => {
    const flyby = MCP_TOOL_DEFS.find((entry) => entry.name === 'flyby_speed')
    expect(flyby?.description).toContain('Turn-angle eccentricity sketch')
    expect(flyby?.description).toContain('Not the web periapsis speed')
  })
})
