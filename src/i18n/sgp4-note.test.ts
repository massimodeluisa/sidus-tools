import { describe, expect, it } from 'vitest'
import { en } from './locales/en'
import { de } from './locales/de'
import { es } from './locales/es'
import { fr } from './locales/fr'
import { it as itLocale } from './locales/it'
import { ja } from './locales/ja'
import { ko } from './locales/ko'
import { pt } from './locales/pt'
import { ru } from './locales/ru'
import { zh } from './locales/zh'

const translatedNotes = {
  de: de.fields.note_sgp4_tle,
  es: es.fields.note_sgp4_tle,
  fr: fr.fields.note_sgp4_tle,
  it: itLocale.fields.note_sgp4_tle,
  ja: ja.fields.note_sgp4_tle,
  ko: ko.fields.note_sgp4_tle,
  pt: pt.fields.note_sgp4_tle,
  ru: ru.fields.note_sgp4_tle,
  zh: zh.fields.note_sgp4_tle,
}

describe('SGP4 limitation note translations', () => {
  it('states TEME, UTC as UT1, and that the Earth-fixed frame is not ITRF', () => {
    const note = en.fields.note_sgp4_tle
    expect(note).toContain('TEME')
    expect(note).toContain('not a generic ECI')
    expect(note).toContain('UTC as UT1')
    expect(note).toContain('ΔUT1 is not applied')
    expect(note).toContain('not ITRF')
    expect(en.fields.r_eci).toBe('r TEME')
    expect(en.fields.title_sgp4_trail).not.toContain('ECI')
    expect(en.fields.subtitle_sgp4_trail.startsWith('TEME ·')).toBe(true)
  })

  it.each(Object.entries(translatedNotes))(
    '%s translates the note and retains the scientific acronyms',
    (_locale, note) => {
      expect(note).not.toBe(en.fields.note_sgp4_tle)
      expect(note).toContain('TLE')
      expect(note).toContain('TEME')
      expect(note).toContain('EOP')
      expect(note).toContain('UT1')
      expect(note).toContain('ΔUT1')
      expect(note).toContain('ITRF')
      expect(note).toContain('PEF')
    },
  )
})
