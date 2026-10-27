import { describe, expect, it } from 'vitest'
import { de } from '../i18n/locales/de'
import { en } from '../i18n/locales/en'
import { es } from '../i18n/locales/es'
import { fr } from '../i18n/locales/fr'
import { it as itLocale } from '../i18n/locales/it'
import { ja } from '../i18n/locales/ja'
import { ko } from '../i18n/locales/ko'
import { pt } from '../i18n/locales/pt'
import { ru } from '../i18n/locales/ru'
import { zh } from '../i18n/locales/zh'
import { namedSatellite } from './satellite-display-name'

const locales = [en, de, es, fr, itLocale, ja, ko, pt, ru, zh]

describe('namedSatellite', () => {
  it('drops a blank name and the unnamed two-line token, and keeps a real name', () => {
    expect(namedSatellite('')).toBeNull()
    expect(namedSatellite('   ')).toBeNull()
    expect(namedSatellite('SAT')).toBeNull()
    expect(namedSatellite(' SAT ')).toBeNull()
    expect(namedSatellite('SATELLITE')).toBe('SATELLITE')
    expect(namedSatellite('ISS (ZARYA)')).toBe('ISS (ZARYA)')
  })
})

describe('unnamed satellite label', () => {
  it('uses a generic word in every locale and does not hard-code ISS in the lighting lines', () => {
    expect(en.fields.satellite_unnamed).toBe('satellite')
    for (const locale of locales) {
      expect(locale.fields.satellite_unnamed.trim().length).toBeGreaterThan(0)
      expect(locale.fields.pass_lighting_favorable).toContain('{{name}}')
      expect(locale.fields.pass_lighting_not_favorable).toContain('{{name}}')
      expect(locale.fields.pass_lighting_favorable).not.toMatch(/\bISS\b/)
      expect(locale.fields.pass_lighting_not_favorable).not.toMatch(/\bISS\b/)
    }
  })
})
