/**
 * Structural gate for four mechanical, language-specific snippet bugs:
 *  - Julia uses `^` for exponentiation, not `**` (a `**` body is a syntax error).
 *  - JS/TS `Math.pi` is undefined (case-sensitive); the constant is `Math.PI`.
 *  - LaTeX control words are letter-greedy: `\etaT` parses as the macro
 *    `\etaT` (undefined), swallowing the following identifier letter, so
 *    Greek macros need a separator (`\eta_T`, `\eta T`) before another letter.
 *  - Zig reserves every identifier of the form `i<digits>`/`u<digits>`
 *    (arbitrary-width integer types, e.g. `i3`, `u8`) plus the float/size
 *    type names, as PRIMITIVE TYPES, not ordinary identifiers: a body or a
 *    CodeExport free var sharing one of those spellings fails to compile
 *    ("name shadows primitive"). Checked on both the raw body (its own
 *    const/var/fn-param declarations) and the wrapped output (adds whatever
 *    the CodeExport free-var bag injects as `const NAME = value;`), since a
 *    free-var name can collide without the body ever declaring it itself.
 */
import { describe, expect, it } from 'vitest'
import { TOOLS } from '../../data/tools'
import { getSnippets, wrapAsRunnable } from './index'
import { inputBagFor } from './verify/inputs'

/** Greek macros known to appear in this catalog's LaTeX bodies. */
const GREEK_MACROS = ['eta', 'lambda', 'mu', 'rho', 'theta']

/** Zig primitive type names: arbitrary-width ints (`i3`, `u8`, …) plus floats/sizes. */
const ZIG_PRIMITIVE = /^(?:[iu]\d+|f16|f32|f64|f80|f128|usize|isize)$/

/** `const`/`var` declarations and `fn` parameter names declared in a zig source string. */
function declaredZigIdentifiers(src: string): string[] {
  const names: string[] = []
  for (const m of src.matchAll(/\b(?:const|var)\s+([A-Za-z_][A-Za-z0-9_]*)\b/g)) {
    names.push(m[1]!)
  }
  for (const fn of src.matchAll(/\bfn\s+[A-Za-z_][A-Za-z0-9_]*\s*\(([^)]*)\)/g)) {
    for (const p of fn[1]!.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*:/g)) {
      names.push(p[1]!)
    }
  }
  return names
}

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

  it('no declared identifier shadows a zig primitive type, raw body or wrapped output', () => {
    const failures: string[] = []
    for (const id of ids) {
      const body = getSnippets(id)?.code.zig
      if (!body || !body.trim()) continue

      for (const name of declaredZigIdentifiers(body)) {
        if (ZIG_PRIMITIVE.test(name)) failures.push(`${id}: zig (raw body): declares "${name}"`)
      }

      let wrapped: string
      try {
        wrapped = wrapAsRunnable(body, 'zig', inputBagFor(id))
      } catch (e) {
        failures.push(`${id}: zig (wrapped output): failed to render: ${e instanceof Error ? e.message : String(e)}`)
        continue
      }
      for (const name of declaredZigIdentifiers(wrapped)) {
        if (ZIG_PRIMITIVE.test(name)) failures.push(`${id}: zig (wrapped output): declares "${name}"`)
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})
