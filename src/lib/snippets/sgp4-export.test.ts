import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { eciSiToGeodetic, parseTle, propagateEci } from '@/lib/physics/sgp4'
import { freeVarsNeeded, renderLiveCode, stripTsTypes } from './live-values'
import { sgp4Snippets } from './sgp4'

const INPUTS = {
  at: '2000-06-27T18:50:19.733Z',
  tleLine1: '1 00005U 58002B   00179.78495062  .00000023  00000-0  28098-4 0  4753',
  tleLine2: '2 00005  34.2682 348.7242 1859667 331.7664  19.3264 10.82419157413667',
}

describe('SGP4 code exports', () => {
  it.each(['javascript', 'typescript', 'python'] as const)(
    '%s consumes the live TLE and fixed UTC time without unbound inputs',
    (lang) => {
      const source = sgp4Snippets.code[lang]
      expect(source).toBeTruthy()

      const rendered = renderLiveCode(source!, lang, INPUTS)
      expect(rendered).toContain(INPUTS.tleLine1)
      expect(rendered).toContain(INPUTS.tleLine2)
      expect(rendered).toContain(INPUTS.at)
      expect(rendered).not.toContain('24100.50000000')
      expect(rendered).not.toMatch(/new Date\(\)|datetime\.now\(/)

      const unresolved = [...freeVarsNeeded(source!, lang)].filter((name) =>
        ['at', 'tleLine1', 'tleLine2'].includes(name),
      )
      expect(unresolved.sort()).toEqual(['at', 'tleLine1', 'tleLine2'])
    },
  )

  /**
   * Vallado sat 00005 at its epoch. JavaScript and TypeScript call the same
   * satellite.js surface as `propagateEci`. Python calls python-sgp4, which
   * stays inside a few centimetres of that state on this vector.
   */
  it('javascript and typescript propagation matches propagateEci', () => {
    const want = physicsAtInputs()
    for (const lang of ['javascript', 'typescript'] as const) {
      const out = runExport(lang)
      expect(distance(numbers(out, 'r_m'), want.r)).toBeLessThan(1e-6)
      expect(distance(numbers(out, 'v_ms'), want.v)).toBeLessThan(1e-6)
      expect(numbers(out, 'latDeg')[0]).toBeCloseTo(want.latDeg, 9)
      expect(numbers(out, 'lonDeg')[0]).toBeCloseTo(want.lonDeg, 9)
      expect(numbers(out, 'alt_m')[0]).toBeCloseTo(want.altM, 6)
    }
  })

  it('python propagation matches propagateEci when python-sgp4 is installed', () => {
    if (!pythonSgp4()) return
    const want = physicsAtInputs()
    const out = runExport('python')
    expect(distance(numbers(out, 'r_m'), want.r)).toBeLessThan(0.1)
    expect(distance(numbers(out, 'v_ms'), want.v)).toBeLessThan(1e-4)
  })
})

function physicsAtInputs() {
  const parsed = parseTle(`${INPUTS.tleLine1}\n${INPUTS.tleLine2}`)
  if (!parsed.ok) throw new Error(parsed.error)
  const date = new Date(INPUTS.at)
  const state = propagateEci(parsed.satrec, date)
  if (!state) throw new Error('propagateEci returned null')
  const geo = eciSiToGeodetic(state.r, date)
  if (!geo) throw new Error('eciSiToGeodetic returned null')
  return { r: state.r, v: state.v, latDeg: geo.latDeg, lonDeg: geo.lonDeg, altM: geo.heightM }
}

function pythonSgp4(): boolean {
  try {
    execFileSync('python3', ['-c', 'from sgp4.api import Satrec, jday'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function runExport(lang: 'javascript' | 'typescript' | 'python'): string {
  const source = sgp4Snippets.code[lang]!
  const body = lang === 'typescript' ? stripTsTypes(source) : source
  if (lang === 'typescript') expect(body).not.toMatch(/:\s*\[/)
  const rendered = renderLiveCode(body, lang, INPUTS)
  const root = process.cwd()
  mkdirSync(join(root, '.verify-tmp'), { recursive: true })
  // Not `sgp4.py`: that name makes `import sgp4` load the snippet instead of the package.
  const dir = mkdtempSync(join(root, '.verify-tmp', 'sgp4-export-'))
  const file = join(dir, lang === 'python' ? 'propagate.py' : 'propagate.mjs')
  writeFileSync(file, rendered)
  try {
    const cmd = lang === 'python' ? 'python3' : 'node'
    return execFileSync(cmd, [file], { encoding: 'utf8', cwd: root })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function numbers(text: string, name: string): number[] {
  const lines = text.split('\n').filter((line) => line.startsWith(`${name} =`))
  const line = lines.at(-1)
  if (!line) throw new Error(`missing printed ${name}`)
  return [...line.matchAll(/[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/g)].map((match) => Number(match[0]))
}

function distance(got: number[], want: readonly number[]): number {
  return Math.hypot(got[0]! - want[0]!, got[1]! - want[1]!, got[2]! - want[2]!)
}
