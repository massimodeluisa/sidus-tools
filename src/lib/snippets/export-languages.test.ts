/**
 * Phase-1 formulas must keep a body for every CodeLang. SGP4 is the
 * documented exception: only the library-backed languages ship.
 */
import { describe, expect, it } from 'vitest'
import { getSnippets } from './index'
import { CODE_LANGS } from './types'

const COMPLETE = [
  'lambert',
  'look-angles',
  'gnss-geometry-gdop',
  'j2-drift',
  'cabin-leak',
  'eclipse-duration',
  'solar-pressure',
  'delta-a-burn',
  'coelliptic',
  'mean-motion',
  'solar-array',
  'horizon-range',
  'angular-diameter',
  'diffraction',
  'eclipse-beta',
  'eccentric-anomaly',
  'scale-height',
  'helio-hohmann',
  'gnss-pseudorange',
  'rain-attenuation-simple',
  'ttc-ebno',
  'solar-sail-accel',
  'orbit-lifetime-rough',
  'mean-anomaly-from-e',
  'exponential-density',
  'solar-flux-distance',
] as const

describe('phase-1 export languages', () => {
  it.each(COMPLETE)('%s ships every language', (id) => {
    const snippet = getSnippets(id)
    expect(snippet, id).toBeTruthy()
    for (const { id: lang } of CODE_LANGS) {
      expect(snippet!.code[lang]?.trim(), `${id}:${lang}`).toBeTruthy()
    }
  })
})
