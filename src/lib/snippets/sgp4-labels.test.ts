/**
 * Label regression: the sgp4 tool must never ship systems-language tabs
 * that claim SGP4 while running a Kepler mean-motion proxy.
 */
import { describe, expect, it } from 'vitest'
import { sgp4Snippets } from './sgp4'
import { passPredictSnippets } from './pass-predict'
import { wrapAsRunnable } from './liveValues'

const SYSTEMS_LANGS = ['c', 'cpp', 'rust', 'zig', 'fortran'] as const

describe('sgp4 snippet labels', () => {
  it('sgp4 tool omits systems languages from the UI source of truth', () => {
    for (const lang of SYSTEMS_LANGS) {
      expect(sgp4Snippets.code[lang]).toBeUndefined()
    }
  })

  it('any re-added sgp4 systems snippet keeps the Kepler / not-full-SGP4 label after wrapping', () => {
    for (const lang of SYSTEMS_LANGS) {
      const src = sgp4Snippets.code[lang]
      if (!src) continue // vacuous today; guards future re-addition

      if (/SGP4|pure SI/i.test(src)) {
        expect(src).toMatch(/not full SGP4|Kepler/i)
      }

      const wrapped = wrapAsRunnable(src, lang, {})
      if (/SGP4|pure SI/i.test(wrapped)) {
        expect(wrapped).toMatch(/not full SGP4|Kepler/i)
      }
    }
  })

  it("pass-predict systems snippets keep the 'not full AOS search' label", () => {
    for (const lang of SYSTEMS_LANGS) {
      const body = passPredictSnippets.code[lang]
      expect(body).toBeTruthy()
      expect(body).toMatch(/not full AOS search/)

      const wrapped = wrapAsRunnable(body!, lang, {})
      expect(wrapped).toMatch(/not full AOS search/)
    }
  })
})
