import { describe, it, expect } from 'vitest'
import { safeIdent } from '../liveValues'
import type { CodeLang } from '../types'
import { EXPECTED } from './expected'
import { put } from './expected/shared'
import { asInjected, inputBagFor } from './inputs'
import { compareResults, printedKeyVariants, resolvePrintedValue } from '../../../../scripts/verify-snippets'

/**
 * Guards the comparison-completeness bug: the render path (`wrapAsRunnable` →
 * `canonicalizePhysicsIds`) rewrites physics-notation ids (Isp, Cd, Cr, Rn,
 * Qdot, Tc, G0, …) to their lowercase canonical spelling before printing, for
 * every language. Before the fix, the runner's comparison loop looked up an
 * EXPECTED key only as `printed.get(key) ?? printed.get(safeIdent(lang, key))`
 * — never canonicalized — so a key spelled the physics-notation way (e.g.
 * `Isp`) could never find its printed `isp` counterpart and was silently
 * `continue`d out of the scenario instead of compared or failed.
 *
 * `isentropic-nozzle` and `hall-thruster-isp` are the concrete, currently
 * shipped instances of this: both EXPECTED entries return a result keyed
 * `'Isp'`.
 */
const LANGS: CodeLang[] = ['c', 'cpp', 'rust', 'fortran', 'python', 'javascript', 'typescript', 'matlab', 'julia']

/**
 * Reconstruction of the pre-fix runner's lookup, kept only here to prove the
 * regression: `printed.get(key) ?? printed.get(safeIdent(lang, key))`, with
 * no physics-id canonicalization. Never reintroduce this into the runner.
 */
function preFixResolve(key: string, lang: CodeLang, printed: Map<string, number>): number | undefined {
  return printed.get(key) ?? printed.get(safeIdent(lang, key))
}

describe('comparison-completeness: canonicalized EXPECTED keys', () => {
  it('hall-thruster-isp and isentropic-nozzle EXPECTED both key a result "Isp" (the real regression case)', () => {
    const hallKeys = Object.keys(EXPECTED['hall-thruster-isp']!(asInjected(inputBagFor('hall-thruster-isp')) as Record<string, number | string>))
    const nozzleKeys = Object.keys(
      EXPECTED['isentropic-nozzle']!(asInjected(inputBagFor('isentropic-nozzle')) as Record<string, number | string>),
    )
    expect(hallKeys).toContain('Isp')
    expect(nozzleKeys).toContain('Isp')
  })

  describe('red-before / green-after', () => {
    for (const lang of LANGS) {
      it(`${lang}: printed "isp" (post-canonicalization, as every language's render path produces) was invisible to the pre-fix lookup and is found by the fixed one`, () => {
        const printed = new Map([['isp', 2141.272497836997]])

        // Red: this is exactly the bug. The pre-fix lookup never canonicalizes
        // the EXPECTED key, so `Isp` never resolves to the printed `isp`.
        expect(preFixResolve('Isp', lang, printed)).toBeUndefined()

        // Green: the fixed lookup canonicalizes the same way the render path did.
        expect(resolvePrintedValue('Isp', lang, printed)).toBe(2141.272497836997)
      })
    }
  })

  it('printedKeyVariants includes both the raw and canonicalized spelling', () => {
    expect(printedKeyVariants('Isp', 'fortran')).toEqual(['Isp', 'Isp', 'isp', 'isp'])
  })

  describe('compareResults', () => {
    it('(a) a canonicalization-needing key is actually compared, not silently skipped', () => {
      const expected = { Isp: 2141.272497836997 }
      const printed = new Map([['isp', 2141.272497836997]])
      const result = compareResults('hall-thruster-isp', 'unit', 'python', expected, printed, new Set(), 1e-9)

      expect('status' in result).toBe(false)
      if ('status' in result) throw new Error('unreachable')
      expect(result.compared).toContain('Isp')
      expect(result.mismatches).toHaveLength(0)
    })

    it('(b) fails loudly, never silently skips, when the expected key was truly never printed', () => {
      const expected = { Isp: 2141.272497836997 }
      const printed = new Map<string, number>() // nothing printed at all, even canonicalized
      const result = compareResults('hall-thruster-isp', 'unit', 'python', expected, printed, new Set(), 1e-9)

      expect('status' in result).toBe(true)
      if (!('status' in result)) throw new Error('unreachable')
      expect(result.status).toBe('fail-numeric')
      expect(result.detail).toBe('expected key Isp was never printed by the snippet')
    })

    it('still excludes an echoed live input from comparison after canonicalization (no false failure)', () => {
      const expected = { Isp: 300 }
      const printed = new Map([['isp', 300]])
      // MATLAB echoes uncompiled live-input assigns; canonical "isp" was injected as an input.
      const result = compareResults('hall-thruster-isp', 'unit', 'matlab', expected, printed, new Set(['isp']), 1e-9)

      expect('status' in result).toBe(false)
      if ('status' in result) throw new Error('unreachable')
      expect(result.compared).toHaveLength(0)
    })
  })
})

/**
 * Guards the alias-GROUP semantics decided after the per-key rule above turned
 * out to be too strict on its own: `put(out, names, value)` in the EXPECTED
 * domain files declares ONE logical value under multiple acceptable printed
 * spellings (different language ports print only one of them — e.g. plotter's
 * `x_mid`/`xMid`: c/fortran/python print `x_mid`, js/ts print `xMid`). A rule
 * that demanded every individual spelling be printed failed such tools in
 * EVERY language. The unit of strictness is the alias group `put()` declares
 * (tracked via `getAliasGroups` in expected/shared.ts): resolve every declared
 * spelling; zero resolved still fails loudly (nothing is silently skipped),
 * one or more resolved are each compared and any mismatch fails.
 */
describe('comparison-completeness: put() alias groups (plotter x_mid/xMid)', () => {
  it('plotter EXPECTED declares x_mid/xMid as one alias group with the same value', () => {
    const bag = asInjected(inputBagFor('plotter')) as Record<string, number | string>
    const expected = EXPECTED['plotter']!(bag)
    expect(expected.x_mid).toBeDefined()
    expect(expected.xMid).toBe(expected.x_mid)
  })

  it('(a) a group is resolved and compared when only ONE declared spelling was printed', () => {
    // Isolated single-group fixture (real plotter names/value, built through the
    // real `put()`) so the interaction with plotter's other group (y_mid/yMid)
    // doesn't also need satisfying here.
    const expected: Record<string, number> = {}
    put(expected, ['x_mid', 'xMid'], 5)
    const printed = new Map([['x_mid', 5]]) // e.g. the c/fortran/python spelling; xMid never printed
    const result = compareResults('plotter', 'unit', 'python', expected, printed, new Set(), 1e-9)

    expect('status' in result).toBe(false)
    if ('status' in result) throw new Error('unreachable')
    expect(result.compared).toContain('x_mid')
    expect(result.compared).not.toContain('xMid')
    expect(result.mismatches).toHaveLength(0)
  })

  it('(b) fails loudly when NEITHER declared spelling of a group was printed', () => {
    const expected: Record<string, number> = {}
    put(expected, ['x_mid', 'xMid'], 5)
    const printed = new Map<string, number>() // neither x_mid nor xMid printed
    const result = compareResults('plotter', 'unit', 'python', expected, printed, new Set(), 1e-9)

    expect('status' in result).toBe(true)
    if (!('status' in result)) throw new Error('unreachable')
    expect(result.status).toBe('fail-numeric')
    expect(result.detail).toBe('value x_mid never printed under any declared spelling (tried: x_mid, xMid)')
  })
})
