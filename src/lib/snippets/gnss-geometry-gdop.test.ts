/**
 * GitHub #61: DOP exports are the diagonal of (HᵀH)⁻¹ with the clock column.
 * Rank-deficient geometry stays non-finite.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { gnssDopFromUnitVectors } from '@/lib/physics'
import { gnssGeometryGdopSnippets } from './tools/gnss-geometry-gdop'
import { stripTsTypes } from './live-values'

type Los = readonly [number, number, number, number, number, number, number, number, number, number, number, number]

const PAGE_DEFAULTS: Los = [1, 0, 0.5, -0.5, 0.866, 0.5, -0.5, -0.866, 0.5, 0, 0, 1]
const VERIFIER_BAG: Los = [0.5, 0.5, 0.7, -0.3, 0.4, 0.86, 0.2, -0.6, 0.77, -0.4, -0.2, 0.89]
const TETRAHEDRON: Los = [1, 1, 1, 1, -1, -1, -1, 1, -1, -1, -1, 1]
const REPEATED: Los = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]

const NAMES = ['ux1', 'uy1', 'uz1', 'ux2', 'uy2', 'uz2', 'ux3', 'uy3', 'uz3', 'ux4', 'uy4', 'uz4'] as const

type Dop = { gdop: number; pdop: number; hdop: number; vdop: number }

function triples(los: Los): Array<readonly [number, number, number]> {
  return [0, 1, 2, 3].map((i) => [los[i * 3]!, los[i * 3 + 1]!, los[i * 3 + 2]!] as const)
}

function evalJs(body: string, los: Los): Dop {
  const header = NAMES.map((name, index) => `const ${name} = ${los[index]};`).join('\n')
  const fn = new Function(
    `${header}\n${body}\nreturn { gdop, pdop, hdop, vdop };`,
  ) as () => Dop
  return fn()
}

function asRunnableTs(body: string): string {
  return stripTsTypes(body).replace(/([A-Za-z0-9_\].])!/g, '$1')
}

function pythonReady(): boolean {
  try {
    execFileSync('python3', ['-c', 'print(1)'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function evalPython(body: string, los: Los): Dop {
  const dir = mkdtempSync(join(tmpdir(), 'sidus-gdop-'))
  const script = join(dir, 'gdop.py')
  const header = NAMES.map((name, index) => `${name} = ${los[index]}`).join('\n')
  writeFileSync(
    script,
    `${header}\n${body}\nprint(float(gdop), float(pdop), float(hdop), float(vdop))\n`,
  )
  try {
    const [gdop, pdop, hdop, vdop] = execFileSync('python3', [script], { encoding: 'utf8' })
      .trim()
      .split(/\s+/)
      .map(Number)
    return { gdop, pdop, hdop, vdop }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function expectDop(got: Dop, want: Dop, relTol?: number) {
  for (const key of ['gdop', 'pdop', 'hdop', 'vdop'] as const) {
    if (relTol === undefined) {
      expect(got[key], key).toBeCloseTo(want[key], 9)
      continue
    }
    /**
     * Digit counts in toBeCloseTo are absolute. Verifier-bag GDOP is ~484, so
     * digits 9 only allows 5e-10. Linux libm and macOS libm differ by ~1e-8
     * there (~2e-11 relative), inside the snippet verifier's 1e-9 relative gate.
     */
    const wantN = want[key]
    const diff = Math.abs(got[key] - wantN)
    const ok = Math.abs(wantN) < 1e-12 ? diff <= 1e-12 : diff / Math.abs(wantN) <= relTol
    expect(ok, `${key}: ${got[key]} vs ${wantN}`).toBe(true)
  }
}

function expectNonFinite(got: Dop) {
  expect(Number.isFinite(got.gdop)).toBe(false)
  expect(Number.isFinite(got.pdop)).toBe(false)
  expect(Number.isFinite(got.hdop)).toBe(false)
  expect(Number.isFinite(got.vdop)).toBe(false)
}

describe('GNSS DOP exports (#61)', () => {
  const page = gnssDopFromUnitVectors(triples(PAGE_DEFAULTS))
  const bag = gnssDopFromUnitVectors(triples(VERIFIER_BAG))
  const tetra = gnssDopFromUnitVectors(triples(TETRAHEDRON))

  it('matches the published page defaults and the tetrahedron diagonal', () => {
    expect(page).not.toBeNull()
    expect(page!.gdop).toBeCloseTo(2.788467994682272, 12)
    expect(page!.pdop).toBeCloseTo(2.4556362247583032, 12)
    expect(page!.hdop).toBeCloseTo(1.290998236047225, 12)
    expect(page!.vdop).toBeCloseTo(2.088892726510427, 12)

    expect(tetra).not.toBeNull()
    expect(tetra!.gdop).toBeCloseTo(Math.sqrt(5 / 2), 12)
    expect(tetra!.pdop).toBeCloseTo(1.5, 12)
    expect(tetra!.hdop).toBeCloseTo(Math.sqrt(3 / 2), 12)
    expect(tetra!.vdop).toBeCloseTo(Math.sqrt(3) / 2, 12)

    expect(bag).not.toBeNull()
    expect(gnssDopFromUnitVectors(triples(REPEATED))).toBeNull()
  })

  it('javascript and typescript match the physics function and reject a repeated line of sight', () => {
    expect(gnssGeometryGdopSnippets.code.javascript).not.toMatch(/(?<![\w.])abs\s*\(/)
    expect(gnssGeometryGdopSnippets.code.typescript).not.toMatch(/(?<![\w.])abs\s*\(/)

    const js = gnssGeometryGdopSnippets.code.javascript!
    const ts = asRunnableTs(gnssGeometryGdopSnippets.code.typescript!)
    for (const body of [js, ts]) {
      expectDop(evalJs(body, PAGE_DEFAULTS), page!)
      expectDop(evalJs(body, VERIFIER_BAG), bag!)
      expectDop(evalJs(body, TETRAHEDRON), tetra!)
      expectNonFinite(evalJs(body, REPEATED))
    }
  })

  it('python matches the physics function when python3 is installed', () => {
    if (!pythonReady()) return
    const body = gnssGeometryGdopSnippets.code.python!
    expectDop(evalPython(body, PAGE_DEFAULTS), page!, 1e-9)
    expectDop(evalPython(body, VERIFIER_BAG), bag!, 1e-9)
    expectDop(evalPython(body, TETRAHEDRON), tetra!, 1e-9)
    expectNonFinite(evalPython(body, REPEATED))
  })
})
