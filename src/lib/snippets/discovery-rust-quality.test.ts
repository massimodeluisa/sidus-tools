/**
 * Structural gate: every discovery-wave snippet's Rust body must be rustc-safe
 * educational fragments (no free math fns, no powi(float), no **).
 *
 * Discovery tools are those registered after `isentropic-nozzle` in ToolRenderer
 * (waves A–C + pass 3–4). Failures here mean make.ts port or SPECS regen is broken.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getSnippets } from './index'

function discoveryIds(): string[] {
  const tr = readFileSync(
    resolve(process.cwd(), 'src/components/tools/ToolRenderer.tsx'),
    'utf8',
  )
  const keys = [...tr.matchAll(/'([a-z0-9-]+)':\s*L\(/g)].map((m) => m[1])
  const start = keys.indexOf('isentropic-nozzle')
  if (start < 0) throw new Error('isentropic-nozzle missing from ToolRenderer')
  return keys.slice(start)
}

/** Free math calls not preceded by `.` or path `::` / word char. */
const FREE_MATH =
  /(?<![\w.])\b(abs|fabs|log10|min|max|sin|cos|tan|sqrt|pow|asin|acos|atan|atan2|exp|ln|log)\s*\(/g

describe('discovery Rust snippet quality gate', () => {
  const ids = discoveryIds()

  it('discovers a full wave set (engines → pass4)', () => {
    expect(ids.length).toBeGreaterThanOrEqual(80)
    expect(ids).toContain('isentropic-nozzle')
    expect(ids).toContain('impedance-matching')
    expect(ids).toContain('gravity-gradient-torque')
    expect(ids).toContain('earth-ir-flux')
  })

  it('every discovery formulaId has a snippet with rust body', () => {
    for (const id of ids) {
      const sn = getSnippets(id)
      expect(sn, id).toBeTruthy()
      expect(sn!.code.rust?.trim().length, id).toBeGreaterThan(10)
    }
  })

  it('no free math functions, float powi, or ** in discovery Rust', () => {
    const failures: string[] = []
    for (const id of ids) {
      // Strip // comments (assumptions prose often contains "sqrt(...)" words)
      const rust = getSnippets(id)!
        .code.rust!.split('\n')
        .map((line) => {
          const i = line.indexOf('//')
          return i >= 0 ? line.slice(0, i) : line
        })
        .join('\n')
      if (rust.includes('**')) failures.push(`${id}: leftover **`)
      if (/\.powi\(\s*\d+\.\d+/.test(rust)) failures.push(`${id}: powi(float)`)
      FREE_MATH.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = FREE_MATH.exec(rust)) !== null) {
        const around = rust.slice(Math.max(0, m.index - 8), m.index + m[0].length)
        if (around.includes('::')) continue
        failures.push(`${id}: free ${m[1]}( at …${around}…`)
      }
      if (/\.cos\(\(\)\)|\.sin\(\(\)\)|\.tan\(\(\)\)/.test(rust)) {
        failures.push(`${id}: empty method call .cos(()) style`)
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})
