/**
 * Structural gate for three mechanical, language-specific snippet bugs:
 *  - Julia uses `^` for exponentiation, not `**` (a `**` body is a syntax error).
 *  - JS/TS `Math.pi` is undefined (case-sensitive); the constant is `Math.PI`.
 *  - LaTeX control words are letter-greedy: `\etaT` parses as the macro
 *    `\etaT` (undefined), swallowing the following identifier letter, so
 *    Greek macros need a separator (`\eta_T`, `\eta T`) before another letter.
 */
import { describe, expect, it } from 'vitest'
import { TOOLS } from '../../data/tools'
import { getSnippets } from './index'

/** Greek macros known to appear in this catalog's LaTeX bodies. */
const GREEK_MACROS = ['eta', 'lambda', 'mu', 'rho', 'theta']

describe('Snippet language-idiom gate', () => {
  const ids = TOOLS.filter((t) => getSnippets(t.id)).map((t) => t.id)

  it('scans a non-trivial number of tools', () => {
    expect(ids.length).toBeGreaterThan(50)
  })

  it('no `**` in any julia body', () => {
    const failures: string[] = []
    for (const id of ids) {
      const julia = getSnippets(id)?.code.julia
      if (!julia) continue
      const m = julia.match(/\*\*/)
      if (m) failures.push(`${id}: julia: found "${m[0]}"`)
    }
    expect(failures, failures.join('\n')).toEqual([])
  })

  it('no `Math.pi` (lowercase) in javascript/typescript bodies', () => {
    const failures: string[] = []
    for (const id of ids) {
      const snip = getSnippets(id)!
      for (const lang of ['javascript', 'typescript'] as const) {
        const body = snip.code[lang]
        if (!body) continue
        const m = body.match(/Math\.pi\b/)
        if (m) failures.push(`${id}: ${lang}: found "${m[0]}"`)
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })

  it('no letter-swallowing Greek control words in latex bodies', () => {
    const failures: string[] = []
    for (const id of ids) {
      const latex = getSnippets(id)?.code.latex
      if (!latex) continue
      for (const macro of GREEK_MACROS) {
        const m = latex.match(new RegExp(`\\\\${macro}[A-Za-z]`))
        if (m) failures.push(`${id}: latex: found "${m[0]}"`)
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})
