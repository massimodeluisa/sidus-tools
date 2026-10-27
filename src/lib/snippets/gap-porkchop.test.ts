import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EARTH_MU, EARTH_RADIUS, SUN_MU } from '../physics/constants'
import { HELIO_SMA_M, hohmannPhaseAngle } from '../physics/planetary'
import { heoOrbitFromPerigee } from '../physics/wave10'
import { helioHohmannSnippets } from './tools/helio-hohmann'
import { molniyaTundraSnippets } from './tools/molniya-tundra'
import { porkchopEarthMarsSnippets } from './tools/porkchop-earth-mars'
import { CODE_LANGS } from './types'

describe('heliocentric phase export (#187)', () => {
  it('javascript returns the signed principal angle and the same Δv', () => {
    const body = helioHohmannSnippets.code.javascript!
    const run = new Function(
      'mu',
      'r1',
      'r2',
      `${body}\nreturn { dv1, dv2, phase };`,
    ) as (mu: number, r1: number, r2: number) => { dv1: number; dv2: number; phase: number }
    const r1 = HELIO_SMA_M.jupiter!
    const r2 = HELIO_SMA_M.mercury!
    const out = run(SUN_MU, r1, r2)
    expect((out.phase * 180) / Math.PI).toBeCloseTo(-72.7504, 4)
    expect(out.phase).toBeCloseTo(hohmannPhaseAngle(r1, r2)!, 10)
    expect(out.dv1).toBeGreaterThan(0)
    expect(out.dv2).toBeGreaterThan(0)
    for (const { id } of CODE_LANGS) {
      const body = helioHohmannSnippets.code[id]!
      if (id === 'latex') expect(body).toContain('\\phi\\in[-\\pi,\\pi)')
      else expect(body, id).toContain('[-π, π)')
    }
  })
})

describe('porkchop C3 export (#189)', () => {
  it('describes one supplied v1 and does not loop dates', () => {
    for (const { id } of CODE_LANGS) {
      const body = porkchopEarthMarsSnippets.code[id]!
      expect(body, id).toContain('supplied v1')
      expect(body, id).toContain('Does not loop dates')
      expect(body, id).not.toContain('Grid loops')
      expect(body, id).not.toMatch(/\bnM\b/)
      expect(body, id).not.toMatch(/\bLM\b/)
      expect(body, id).not.toMatch(/\bfor\s*\(/)
      expect(body, id).not.toMatch(/\bwhile\s*\(/)
    }
    const body = porkchopEarthMarsSnippets.code.javascript!
    const run = new Function(
      'mu',
      'aE',
      'LE0',
      't0',
      'tDep',
      'v1x',
      'v1y',
      'v1z',
      `${body}\nreturn c3;`,
    ) as (
      mu: number,
      aE: number,
      LE0: number,
      t0: number,
      tDep: number,
      v1x: number,
      v1y: number,
      v1z: number,
    ) => number
    const mu = SUN_MU
    const aE = 149_597_870_700
    const LE0 = 1.7534336883759651
    const t0 = 946_728_000
    const tDep = 1_596_067_200
    const v1x = 28_103.33202062955
    const v1y = 16_375.164072485328
    const v1z = 0
    const nE = Math.sqrt(mu / aE ** 3)
    const LE = LE0 + nE * (tDep - t0)
    const vEx = -nE * aE * Math.sin(LE)
    const vEy = nE * aE * Math.cos(LE)
    const c3 = (v1x - vEx) ** 2 + (v1y - vEy) ** 2 + v1z ** 2
    expect(run(mu, aE, LE0, t0, tDep, v1x, v1y, v1z)).toBeCloseTo(c3, 8)
  })
})

describe('Molniya dwell export (#195)', () => {
  it('javascript matches the 600 km, 30° apogee window', () => {
    const body = molniyaTundraSnippets.code.javascript!
    const run = new Function(
      'kind',
      'h',
      'mu',
      'R',
      'delta',
      `${body}\nreturn dwell;`,
    ) as (kind: number, h: number, mu: number, R: number, delta: number) => number
    const delta = (30 * Math.PI) / 180
    const dwell = run(0, 600_000, EARTH_MU, EARTH_RADIUS, delta)
    const orbit = heoOrbitFromPerigee({
      kind: 'molniya',
      perigeeAlt: 600_000,
      dwellHalfAngle: delta,
    })
    expect(orbit).not.toBeNull()
    expect(dwell).toBeCloseTo(orbit!.dwell, 8)
    expect(dwell).toBeCloseTo(25995.420865, 3)
    for (const { id } of CODE_LANGS) {
      expect(molniyaTundraSnippets.code[id], id).toMatch(/dwell/)
      expect(molniyaTundraSnippets.code[id], id).toMatch(/delta/)
    }
    const tool = readFileSync(resolve(process.cwd(), 'src/components/tools/MolniyaTundraTool.tsx'), 'utf8')
    expect(tool).toContain('delta: toSi(p.dwell, p.du)')
  })
})

describe('porkchop epoch note (#192)', () => {
  it('renders the documented epoch key', () => {
    const tool = readFileSync(
      resolve(process.cwd(), 'src/components/tools/PorkchopEarthMarsTool.tsx'),
      'utf8',
    )
    expect(tool).toContain("t('fields.porkchop_epoch_note')")
  })
})
