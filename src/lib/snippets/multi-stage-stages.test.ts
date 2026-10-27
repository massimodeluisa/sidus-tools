import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { G0, multiStageDeltaV } from '@/lib/physics'
import { multiStageSnippets } from './multi-stage'
import type { CodeLang } from './types'

/** Shipped MultiStageTool defaults (stages = 2). */
const SHIPPED = {
  isp1: 280,
  m01: 100_000,
  mf1: 30_000,
  isp2: 310,
  m02: 25_000,
  mf2: 8_000,
  isp3: 450,
  m03: 6_000,
  mf3: 2_500,
}

/** Executable export languages (LaTeX keeps its symbolic N-stage sum). */
const EXECUTABLE: CodeLang[] = [
  'python',
  'javascript',
  'typescript',
  'c',
  'cpp',
  'rust',
  'zig',
  'fortran',
  'matlab',
  'julia',
]

function activeStages(n: number): { ve: number; m0: number; mf: number }[] {
  return [
    { ve: SHIPPED.isp1 * G0, m0: SHIPPED.m01, mf: SHIPPED.mf1 },
    { ve: SHIPPED.isp2 * G0, m0: SHIPPED.m02, mf: SHIPPED.mf2 },
    { ve: SHIPPED.isp3 * G0, m0: SHIPPED.m03, mf: SHIPPED.mf3 },
  ].slice(0, n)
}

type JsResult = {
  dv1: number
  dv2: number
  dv3: number
  dv_total: number
  multiStageDv: (stages: Record<string, number>[]) => { dv: number[]; dvTotal: number }
}

/** Evaluate the JavaScript snippet body with a live-input preamble. */
function runJs(values: Record<string, number>): JsResult {
  const body = multiStageSnippets.code.javascript!
  const preamble = Object.entries(values)
    .map(([key, value]) => `const ${key} = ${value};`)
    .join('\n')
  // eslint-disable-next-line no-new-func
  const fn = new Function(
    `${preamble}\n${body}\nreturn { dv1, dv2, dv3, dv_total, multiStageDv };`,
  ) as () => JsResult
  return fn()
}

/** Assignment line for `name`, with the two lines above it (Fortran/MATLAB `if` blocks). */
function guardWindow(body: string, name: string): string | null {
  const lines = body.split('\n')
  const index = lines.findIndex((line) => new RegExp(`\\b${name}\\b[^=\\n]*=`).test(line))
  if (index < 0) return null
  return lines.slice(Math.max(0, index - 2), index + 1).join('\n')
}

describe('multi-stage export: active-stage gating', () => {
  for (const n of [1, 2, 3]) {
    it(`javascript body with stages=${n} sums only the first ${n} stage(s)`, () => {
      const out = runJs({ ...SHIPPED, stages: n })
      const expected = multiStageDeltaV(activeStages(n))
      expect(expected).not.toBeNull()
      expect(out.dv_total).toBeCloseTo(expected!.dvTotal, 9)
      expect(out.dv_total).toBeCloseTo(out.dv1 + out.dv2 + out.dv3, 12)
      if (n < 2) expect(out.dv2).toBe(0)
      if (n < 3) expect(out.dv3).toBe(0)
    })
  }

  it('stages=2 matches the shipped UI value, not the three-stage export value', () => {
    const out = runJs({ ...SHIPPED, stages: 2 })
    expect(out.dv_total).toBeCloseTo(6769.8934685, 6)
    expect(out.dv_total).not.toBeCloseTo(10633.3304405, 6)
  })

  it('never evaluates an inactive stage (bad unused stage does not throw)', () => {
    const out = runJs({ ...SHIPPED, mf3: 0, stages: 2 })
    expect(out.dv3).toBe(0)
    expect(out.dv_total).toBeCloseTo(multiStageDeltaV(activeStages(2))!.dvTotal, 9)

    const one = runJs({ ...SHIPPED, mf2: 0, mf3: 0, stages: 1 })
    expect(one.dv2).toBe(0)
    expect(one.dv3).toBe(0)
    expect(one.dv_total).toBeCloseTo(multiStageDeltaV(activeStages(1))!.dvTotal, 9)
  })

  it('javascript helper accepts isp_s/m0_kg/mf_kg, isp/m0/mf and ve/m0/mf', () => {
    const { multiStageDv } = runJs({ ...SHIPPED, stages: 1 })
    const veOnly = { ve: 2911.7, m0: 50_000, mf: 12_500 }
    // A proxy that throws if the helper reads isp/isp_s while `ve` is present.
    const veNoIsp = new Proxy(
      { ve: 1000, m0: 1000, mf: 500 },
      {
        get(target, prop, receiver) {
          if (prop === 'isp' || prop === 'isp_s') throw new Error('helper touched isp')
          return Reflect.get(target, prop, receiver)
        },
      },
    )
    const result = multiStageDv([
      { isp_s: 280, m0_kg: 100_000, mf_kg: 30_000 },
      { isp: 280, m0: 100_000, mf: 30_000 },
      veOnly,
      veNoIsp,
    ])
    const ispDv = 280 * G0 * Math.log(100_000 / 30_000)
    expect(result.dv[0]).toBeCloseTo(ispDv, 10)
    expect(result.dv[1]).toBeCloseTo(ispDv, 10)
    expect(result.dv[2]).toBeCloseTo(veOnly.ve * Math.log(veOnly.m0 / veOnly.mf), 10)
    expect(result.dv[3]).toBeCloseTo(1000 * Math.log(2), 10)
  })

  it('documents the three helper input forms in every helper port', () => {
    for (const lang of ['python', 'javascript', 'typescript'] as const) {
      const body = multiStageSnippets.code[lang]!
      expect(body, lang).toMatch(/isp_s/)
      expect(body, lang).toMatch(/m0_kg/)
      expect(body, lang).toMatch(/mf_kg/)
      expect(body, lang).toMatch(/\bve\b/)
    }
  })

  it.each(EXECUTABLE)('%s body gates the inactive stages on the active-stage count', (lang) => {
    const body = multiStageSnippets.code[lang]
    expect(body, String(lang)).toBeTruthy()
    // Active count comes from `stages`, clamped/floored to 1..3.
    expect(body).toMatch(/stages/)
    expect(body).toMatch(/floor/i)
    expect(body).toMatch(/\bn\b/)
    for (const [name, stage] of [
      ['dv2', 2],
      ['dv3', 3],
    ] as const) {
      const window = guardWindow(body!, name)
      expect(window, `${lang}: missing ${name} assignment`).not.toBeNull()
      expect(window, `${lang}: ${name} is not gated on n >= ${stage}`).toMatch(
        new RegExp(`\\bn\\s*>=\\s*${stage}\\b`),
      )
    }
    // The total still sums the (possibly zeroed) per-stage terms.
    expect(body).toMatch(/dv_total\b[^=\n]*=\s*dv1\s*\+\s*dv2\s*\+\s*dv3/)
  })
})

describe('multi-stage python helper input forms', () => {
  function runPythonHelper(cases: Record<string, number>[]): number[] {
    const body = multiStageSnippets.code.python!
    const preamble = [
      ...Object.entries(SHIPPED).map(([key, value]) => `${key} = ${value}`),
      'stages = 2',
    ].join('\n')
    const script = [
      preamble,
      body,
      'import json',
      `cases = ${JSON.stringify(cases)}`,
      'print(json.dumps([multi_stage_dv([c])[1] for c in cases]))',
    ].join('\n')
    const printed = execFileSync('python3', ['-c', script], { encoding: 'utf8' })
    return JSON.parse(printed) as number[]
  }

  it('computes ve * ln(m0/mf) for all three documented forms', () => {
    const ve = 2745.862
    const cases = [
      { isp_s: 280, m0_kg: 100_000, mf_kg: 30_000 },
      { isp: 280, m0: 100_000, mf: 30_000 },
      // No isp key at all: must not raise KeyError.
      { ve, m0: 100_000, mf: 30_000 },
    ]
    const [fromIspS, fromIsp, fromVe] = runPythonHelper(cases)
    const ispDv = 280 * G0 * Math.log(100_000 / 30_000)
    expect(fromIspS).toBeCloseTo(ispDv, 9)
    expect(fromIsp).toBeCloseTo(ispDv, 9)
    expect(fromVe).toBeCloseTo(ve * Math.log(100_000 / 30_000), 9)
  })
})
