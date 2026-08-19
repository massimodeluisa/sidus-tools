import { describe, it, expect } from 'vitest'
import { getSnippets } from '../index'
import { safeIdent } from '../liveValues'
import type { CodeLang } from '../types'
import { EXPECTED, UNVERIFIABLE } from './expected'
import { asInjected, inputBagFor, scenariosFor } from './inputs'

/** Pilot scope for the snippet verification harness. */
const PILOT = [
  'circular-orbit',
  'hohmann',
  'vis-viva',
  'plane-change',
  'rocket-equation',
  'link-budget',
  'heat-flux',
  'metabolic-load',
  'j2-drift',
  'dynamic-pressure',
  'antenna-gain-effective',
  'nyquist-rate',
  'quaternion-euler',
  'look-angles',
  'kepler-propagate',
] as const

/** Languages whose bodies may rename a result through `safeIdent`. */
const IDENT_LANGS: CodeLang[] = ['c', 'rust', 'zig', 'fortran']
const BODY_LANGS: CodeLang[] = [
  'c',
  'cpp',
  'rust',
  'zig',
  'python',
  'javascript',
  'typescript',
  'matlab',
  'julia',
  'fortran',
]

function expectedFor(id: string): Record<string, number> {
  const fn = EXPECTED[id]
  if (!fn) throw new Error(`no EXPECTED entry for ${id}`)
  return fn(asInjected(inputBagFor(id)) as Record<string, number | string>)
}

/** Language bodies of `id` that mention any of `keys` verbatim or via safeIdent. */
function bodiesMentioning(id: string, keys: string[]): number {
  const snip = getSnippets(id)
  let hits = 0
  for (const lang of BODY_LANGS) {
    const body = snip?.code[lang]
    if (!body) continue
    const spellings = new Set(keys)
    if (IDENT_LANGS.includes(lang)) for (const k of keys) spellings.add(safeIdent(lang, k))
    const found = [...spellings].some((s) =>
      new RegExp(`(?<![A-Za-z0-9_])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9_])`).test(body),
    )
    if (found) hits++
  }
  return hits
}

describe('snippet verification expected values', () => {
  for (const id of PILOT) {
    describe(id, () => {
      it('has an EXPECTED entry', () => {
        expect(EXPECTED[id]).toBeTypeOf('function')
      })

      if (id in UNVERIFIABLE) {
        it('is documented as unverifiable and returns no expected values', () => {
          expect(UNVERIFIABLE[id]).toBeTruthy()
          expect(Object.keys(expectedFor(id))).toHaveLength(0)
        })
        return
      }

      it('returns finite numbers for the tool input bag', () => {
        const out = expectedFor(id)
        expect(Object.keys(out).length).toBeGreaterThan(0)
        for (const [key, value] of Object.entries(out)) {
          expect(Number.isFinite(value), `${id}.${key} = ${value}`).toBe(true)
        }
      })

      it('names at least one result that appears in 8+ language bodies', () => {
        const keys = Object.keys(expectedFor(id))
        const best = Math.max(...keys.map((k) => bodiesMentioning(id, [k])))
        expect(best).toBeGreaterThanOrEqual(8)
      })
    })
  }

  it('covers exactly the pilot tools', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual([...PILOT].sort())
  })
})

describe('snippet verification scenarios', () => {
  for (const id of PILOT) {
    describe(id, () => {
      it('has at least 3 scenarios', () => {
        expect(scenariosFor(id).length).toBeGreaterThanOrEqual(3)
      })

      it('every scenario has a name and a finite expected-value map', () => {
        const fn = EXPECTED[id]
        if (!fn) throw new Error(`no EXPECTED entry for ${id}`)
        for (const scenario of scenariosFor(id)) {
          expect(scenario.name, `${id} scenario name`).toBeTruthy()
          const out = fn(asInjected(scenario.bag) as Record<string, number | string>)
          for (const [key, value] of Object.entries(out)) {
            expect(Number.isFinite(value), `${id}[${scenario.name}].${key} = ${value}`).toBe(true)
          }
        }
      })
    })
  }
})
