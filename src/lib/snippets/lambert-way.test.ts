/**
 * GitHub #115: long-way Lambert exports keep the requested way and refuse a
 * residual that did not converge. The refused geometry used to emit the
 * short-way velocity.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EARTH_MU, coplanarRadii, lambertSolve } from '@/lib/physics'
import { lambertSnippets } from './lambert'
import { stripTsTypes } from './live-values'
import { CODE_LANGS, type CodeLang } from './types'

type LambertBag = {
  mu: number
  r1_m: number
  r2_m: number
  ang_rad: number
  tof_s: number
  way: 'short' | 'long'
}

type LambertOut = {
  v1_x: number
  v1_y: number
  v1_z: number
  v2_x: number
  v2_y: number
  v2_z: number
  dnu: number
}

const LONG_WAY: LambertBag = {
  mu: EARTH_MU,
  r1_m: 7e6,
  r2_m: 7e6,
  ang_rad: Math.PI / 2,
  tof_s: 2_000,
  way: 'long',
}

/** 7000 km, 8000 km, 90 deg, 10000 s, long way. */
const REFUSED: LambertBag = {
  mu: 3.986004418e14,
  r1_m: 7_000_000,
  r2_m: 8_000_000,
  ang_rad: Math.PI / 2,
  tof_s: 10_000,
  way: 'long',
}

const SHORT_WAY_VELOCITY = [7315.758911, 4905.470186, 0]

function evalJsFamily(body: string, bag: LambertBag): LambertOut {
  const header = Object.entries(bag)
    .map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`)
    .join('\n')
  const fn = new Function(
    `${header}\n${body}\nreturn { v1_x, v1_y, v1_z, v2_x, v2_y, v2_z, dnu };`,
  ) as () => LambertOut
  return fn()
}

function pythonReady(): boolean {
  try {
    execFileSync('python3', ['-c', 'import numpy'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function evalPython(body: string, bag: LambertBag): LambertOut {
  const dir = mkdtempSync(join(tmpdir(), 'sidus-lambert-'))
  const script = join(dir, 'lambert.py')
  const header = Object.entries(bag)
    .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
    .join('\n')
  writeFileSync(
    script,
    `${header}\n${body}\nprint(float(v1_x), float(v1_y), float(v1_z), float(v2_x), float(v2_y), float(v2_z), float(dnu))\n`,
  )
  try {
    const printed = execFileSync('python3', [script], { encoding: 'utf8' }).trim().split(/\s+/)
    const [v1_x, v1_y, v1_z, v2_x, v2_y, v2_z, dnu] = printed.map(Number)
    return { v1_x, v1_y, v1_z, v2_x, v2_y, v2_z, dnu }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function expectMatchesSolution(got: LambertOut, want: { v1: readonly number[]; v2: readonly number[]; dnu: number }) {
  expect(got.v1_x).toBeCloseTo(want.v1[0]!, 4)
  expect(got.v1_y).toBeCloseTo(want.v1[1]!, 4)
  expect(got.v1_z).toBeCloseTo(want.v1[2]!, 4)
  expect(got.v2_x).toBeCloseTo(want.v2[0]!, 4)
  expect(got.v2_y).toBeCloseTo(want.v2[1]!, 4)
  expect(got.v2_z).toBeCloseTo(want.v2[2]!, 4)
  expect(got.dnu).toBeCloseTo(want.dnu, 8)
}

function expectRefused(got: LambertOut) {
  for (const value of [got.v1_x, got.v1_y, got.v1_z, got.v2_x, got.v2_y, got.v2_z]) {
    expect(Number.isFinite(value)).toBe(false)
  }
  const miss = Math.hypot(
    (Number.isFinite(got.v1_x) ? got.v1_x : 0) - SHORT_WAY_VELOCITY[0]!,
    (Number.isFinite(got.v1_y) ? got.v1_y : 0) - SHORT_WAY_VELOCITY[1]!,
    (Number.isFinite(got.v1_z) ? got.v1_z : 0) - SHORT_WAY_VELOCITY[2]!,
  )
  expect(miss).toBeGreaterThan(1)
}

describe('Lambert way exports (#115)', () => {
  const core = (() => {
    const { r1, r2 } = coplanarRadii(LONG_WAY.r1_m, LONG_WAY.r2_m, LONG_WAY.ang_rad)
    return lambertSolve(LONG_WAY.mu, r1, r2, LONG_WAY.tof_s, false)
  })()

  it('keeps way and a convergence guard in every language', () => {
    for (const { id } of CODE_LANGS) {
      const body = lambertSnippets.code[id as CodeLang]
      expect(body, id).toBeTruthy()
      expect(body, id).toMatch(/\bway\b/)
      expect(body, id).toMatch(/converged|lambert_ok/)
    }
  })

  it('javascript matches the long-way solver and refuses the 10000 s case', () => {
    expect(core).not.toBeNull()
    expect(core!.dnu).toBeGreaterThan(Math.PI)
    expectMatchesSolution(evalJsFamily(lambertSnippets.code.javascript!, LONG_WAY), core!)
    expectRefused(evalJsFamily(lambertSnippets.code.javascript!, REFUSED))
    expect(lambertSolve(
      REFUSED.mu,
      coplanarRadii(REFUSED.r1_m, REFUSED.r2_m, REFUSED.ang_rad).r1,
      coplanarRadii(REFUSED.r1_m, REFUSED.r2_m, REFUSED.ang_rad).r2,
      REFUSED.tof_s,
      false,
    )).toBeNull()
  })

  it('typescript matches the same long-way and refused cases', () => {
    const body = stripTsTypes(lambertSnippets.code.typescript!)
    expectMatchesSolution(evalJsFamily(body, LONG_WAY), core!)
    expectRefused(evalJsFamily(body, REFUSED))
  })

  it('python matches the physics function when numpy is installed', () => {
    if (!pythonReady()) return
    expectMatchesSolution(evalPython(lambertSnippets.code.python!, LONG_WAY), core!)
    expectRefused(evalPython(lambertSnippets.code.python!, REFUSED))
  })
})
