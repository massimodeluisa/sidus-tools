/**
 * GitHub #60, #87, #128: rv-elements exports follow the page mode, recover
 * retrograde-equatorial periapsis, and keep a finite semimajor axis when
 * specific energy is finite.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EARTH_MU, elementsToRv, rvToElements } from '@/lib/physics'
import type { Vec3 } from '@/lib/physics'
import { renderLiveCode, stripTsTypes } from './live-values'
import { rvElementsSnippets } from './rv-elements'
import { CODE_LANGS } from './types'

const DEG = Math.PI / 180

/** Default page state. Ignoring mode and converting this vector yields a ≈ 6,778,211.65 m. */
const DEFAULT_STATE = {
  rx: 6_778_137,
  ry: 0,
  rz: 0,
  vx: 0,
  vy: 7668.6,
  vz: 0,
}

/** Issue #60 element-to-state reproduction (Earth, angles in degrees). */
const EL2RV = {
  ...DEFAULT_STATE,
  mu: EARTH_MU,
  mode: 'el2rv',
  ang: 'deg',
  a_km: 9000,
  e: 0.4,
  i_deg: 30,
  raan_deg: 40,
  argp_deg: 20,
  nu_deg: 45,
}

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

function program(lang: 'javascript' | 'typescript' | 'python', values: Record<string, number | string>): string {
  const body = rvElementsSnippets.code[lang]
  if (!body) throw new Error(`missing ${lang}`)
  const source = lang === 'typescript' ? stripTsTypes(body) : body
  const rendered = renderLiveCode(source, lang === 'typescript' ? 'javascript' : lang, values)
  return `${rendered}\nconsole.log("__probe__", JSON.stringify({ a, e, i, raan, argp, nu, energy, h, rx_out, ry_out, rz_out, vx_out, vy_out, vz_out }))\n`
}

function pythonProbe(rendered: string): string {
  return `${rendered}\nimport json\nprint("__probe__", json.dumps({"a": a, "e": e, "i": i, "raan": raan, "argp": argp, "nu": nu, "energy": energy, "h": h, "rx_out": rx_out, "ry_out": ry_out, "rz_out": rz_out, "vx_out": vx_out, "vy_out": vy_out, "vz_out": vz_out}))\n`
}

type Probe = {
  a: number
  e: number
  i: number
  raan: number
  argp: number
  nu: number
  energy: number
  h: number
  rx_out: number
  ry_out: number
  rz_out: number
  vx_out: number
  vy_out: number
  vz_out: number
}

function runExport(lang: 'javascript' | 'typescript' | 'python', values: Record<string, number | string>): Probe {
  const dir = mkdtempSync(join(tmpdir(), 'sidus-rv-'))
  try {
    if (lang === 'python') {
      const body = rvElementsSnippets.code.python
      if (!body) throw new Error('missing python')
      const src = pythonProbe(renderLiveCode(body, 'python', values))
      const file = join(dir, 'rv.py')
      writeFileSync(file, src)
      const run = spawnSync('python3', [file], { cwd: dir, encoding: 'utf8', timeout: 30_000 })
      const out = `${run.stdout ?? ''}\n${run.stderr ?? ''}`
      if (run.status !== 0) throw new Error(`python3 exited ${run.status}\n${out}`)
      return parseProbe(out)
    }
    const src = program(lang, values)
    const file = join(dir, 'rv.mjs')
    writeFileSync(file, src)
    const run = spawnSync('node', [file], { cwd: dir, encoding: 'utf8', timeout: 30_000 })
    const out = `${run.stdout ?? ''}\n${run.stderr ?? ''}`
    if (run.status !== 0) throw new Error(`node exited ${run.status}\n${out}`)
    return parseProbe(out)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function numericField(value: object, key: string): number | undefined {
  const raw = Object.getOwnPropertyDescriptor(value, key)?.value
  return typeof raw === 'number' ? raw : undefined
}

function isProbe(value: unknown): value is Probe {
  if (typeof value !== 'object' || value === null) return false
  const keys = ['a', 'e', 'i', 'raan', 'argp', 'nu', 'energy', 'h', 'rx_out', 'ry_out', 'rz_out', 'vx_out', 'vy_out', 'vz_out']
  return keys.every((key) => numericField(value, key) !== undefined)
}

function parseProbe(output: string): Probe {
  const line = output.split(/\r?\n/).find((row) => row.startsWith('__probe__'))
  if (!line) throw new Error(`no probe\n${output}`)
  const parsed: unknown = JSON.parse(line.slice('__probe__'.length).trim())
  if (!isProbe(parsed)) throw new Error(`probe was not a numeric result\n${output}`)
  return parsed
}

describe('rv-elements export mode (#60)', () => {
  const expected = elementsToRv(
    {
      a: EL2RV.a_km * 1000,
      e: EL2RV.e,
      i: EL2RV.i_deg * DEG,
      raan: EL2RV.raan_deg * DEG,
      argp: EL2RV.argp_deg * DEG,
      nu: EL2RV.nu_deg * DEG,
    },
    EARTH_MU,
  )

  it('element-to-state page result matches the published vector', () => {
    expect(expected).not.toBeNull()
    if (!expected) return
    expect(expected.r[0]).toBeCloseTo(-1_065_308.95, 1)
    expect(expected.r[1]).toBeCloseTo(5_144_206.04, 1)
    expect(expected.r[2]).toBeCloseTo(2_670_509.33, 1)
    expect(expected.v[0]).toBeCloseTo(-9029.815, 2)
    expect(expected.v[1]).toBeCloseTo(-1022.151, 2)
    expect(expected.v[2]).toBeCloseTo(2899.014, 2)
  })

  it('every executable language branches on mode and keeps hyperbolic p positive', () => {
    for (const { id } of CODE_LANGS) {
      if (id === 'latex') continue
      const body = rvElementsSnippets.code[id]
      expect(body, id).toBeTruthy()
      expect(body, id).toContain('a_km')
      expect(body, id).toContain('mode')
      expect(body, id).toMatch(/abs\(|fabs\(|\.abs\(|@abs\(/)
      expect(body, id).not.toMatch(/1e-10/)
    }
  })

  it('rendered javascript el2rv uses a_km and the element angles, not the default state', () => {
    expect(expected).not.toBeNull()
    if (!expected) return
    const javascript = rvElementsSnippets.code.javascript
    if (!javascript) throw new Error('missing javascript')
    const rendered = renderLiveCode(javascript, 'javascript', EL2RV)
    expect(rendered).toContain("mode = 'el2rv'")
    expect(rendered).toContain('a_km')
    const out = runExport('javascript', EL2RV)
    expect(out.a).toBeCloseTo(9_000_000, 6)
    expect(out.e).toBeCloseTo(0.4, 12)
    expect(distance([out.rx_out, out.ry_out, out.rz_out], expected.r)).toBeLessThan(1e-4)
    expect(distance([out.vx_out, out.vy_out, out.vz_out], expected.v)).toBeLessThan(1e-6)
    expect(distance([out.rx_out, out.ry_out, out.rz_out], [DEFAULT_STATE.rx, DEFAULT_STATE.ry, DEFAULT_STATE.rz])).toBeGreaterThan(1e6)
  })

  it('rendered javascript rv2el keeps the state-vector elements when a_km disagrees', () => {
    const state = rvToElements(
      [DEFAULT_STATE.rx, DEFAULT_STATE.ry, DEFAULT_STATE.rz],
      [DEFAULT_STATE.vx, DEFAULT_STATE.vy, DEFAULT_STATE.vz],
      EARTH_MU,
    )
    expect(state).not.toBeNull()
    if (!state) return
    expect(Math.abs(state.a - 6_778_211.65)).toBeLessThan(1)
    const out = runExport('javascript', { ...EL2RV, mode: 'rv2el' })
    expect(out.a).toBeCloseTo(state.a, 6)
    expect(Math.abs(out.a - 9_000_000)).toBeGreaterThan(1e6)
    expect(out.e).toBeCloseTo(state.e, 8)
  })

  it('hyperbolic el2rv keeps positive p, energy, and angular momentum at nu = 120°', () => {
    const a = -10_000_000
    const e = 1.5
    const nu = 120 * DEG
    const p = Math.abs(a) * (e * e - 1)
    const kernel = elementsToRv({ a, e, i: 0, raan: 0, argp: 0, nu }, EARTH_MU)
    expect(kernel).not.toBeNull()
    if (!kernel) return
    const values = {
      ...DEFAULT_STATE,
      mu: EARTH_MU,
      mode: 'el2rv',
      ang: 'deg',
      a_km: a / 1000,
      e,
      i_deg: 0,
      raan_deg: 0,
      argp_deg: 0,
      nu_deg: 120,
    }
    for (const lang of ['javascript', 'typescript', 'python'] as const) {
      const out = runExport(lang, values)
      expect(Number.isFinite(out.rx_out), lang).toBe(true)
      expect(out.energy, lang).toBeGreaterThan(0)
      expect(Math.abs(out.energy - -EARTH_MU / (2 * a)) / Math.abs(EARTH_MU / (2 * a)), lang).toBeLessThan(1e-9)
      expect(Math.abs(out.h * out.h - EARTH_MU * p) / (EARTH_MU * p), lang).toBeLessThan(1e-9)
      expect(distance([out.rx_out, out.ry_out, out.rz_out], kernel.r), lang).toBeLessThan(1e-4)
      expect(distance([out.vx_out, out.vy_out, out.vz_out], kernel.v), lang).toBeLessThan(1e-6)
    }
  })
})

describe('rv-elements retrograde periapsis export (#87)', () => {
  const r: Vec3 = [3_309_432.628, -6_502_239.716, 0]
  const v: Vec3 = [-6_928.414, -4_119.923, 0]

  it('javascript recovers ω ≈ 0.7 rad and round-trips that equatorial retrograde state', () => {
    const kernel = rvToElements(r, v, EARTH_MU)
    expect(kernel).not.toBeNull()
    if (!kernel) return
    expect(kernel.argp).toBeCloseTo(0.7, 5)
    const out = runExport('javascript', {
      ...DEFAULT_STATE,
      mu: EARTH_MU,
      mode: 'rv2el',
      ang: 'deg',
      a_km: 9000,
      e: 0.4,
      i_deg: 180,
      raan_deg: 0,
      argp_deg: 0,
      nu_deg: 0,
      rx: r[0],
      ry: r[1],
      rz: r[2],
      vx: v[0],
      vy: v[1],
      vz: v[2],
    })
    expect(out.argp).toBeCloseTo(0.7, 5)
    expect(out.i).toBeCloseTo(Math.PI, 8)
    expect(out.nu).toBeCloseTo(0.4, 5)
    const back = elementsToRv(
      { a: out.a, e: out.e, i: out.i, raan: out.raan, argp: out.argp, nu: out.nu },
      EARTH_MU,
    )
    expect(back).not.toBeNull()
    if (!back) return
    expect(distance(back.r, r)).toBeLessThan(1e-3)
    expect(distance(back.v, v)).toBeLessThan(1e-6)
  })
})

describe('rv-elements near-parabolic semimajor axis export (#128)', () => {
  const rp = 6_778_137

  function bag(e: number) {
    const speed = Math.sqrt(EARTH_MU * (1 + e) / rp)
    return {
      ...DEFAULT_STATE,
      mu: EARTH_MU,
      mode: 'rv2el',
      ang: 'deg',
      a_km: 6778.137,
      e: 0.001,
      i_deg: 0,
      raan_deg: 0,
      argp_deg: 0,
      nu_deg: 0,
      rx: rp,
      ry: 0,
      rz: 0,
      vx: 0,
      vy: speed,
      vz: 0,
    }
  }

  it('keeps a finite signed a when |e−1| < 1e-10 and energy is nonzero', () => {
    for (const e of [1 - 5e-11, 1 + 5e-11]) {
      const out = runExport('javascript', bag(e))
      const kernel = rvToElements([rp, 0, 0], [0, Math.sqrt(EARTH_MU * (1 + e) / rp), 0], EARTH_MU)
      expect(kernel).not.toBeNull()
      if (!kernel) return
      expect(Math.abs(out.e - 1)).toBeLessThan(1e-10)
      expect(Number.isFinite(out.energy)).toBe(true)
      expect(out.energy).not.toBe(0)
      expect(Number.isFinite(out.a)).toBe(true)
      expect(Math.sign(out.a)).toBe(Math.sign(kernel.a))
      expect(out.a).toBeCloseTo(kernel.a, 4)
    }
  })
})
