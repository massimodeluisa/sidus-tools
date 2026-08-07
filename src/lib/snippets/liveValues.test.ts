import { describe, expect, it } from 'vitest'
import {
  applyValuePlaceholders,
  enrichLiveValues,
  extractAssignedNames,
  formatCodeNumber,
  freeVarsNeeded,
  liveValuesPreamble,
  renderLiveCode,
  safeIdent,
  stripTsTypes,
  wrapAsRunnable,
} from './liveValues'
import { getSnippets } from './index'

describe('live code values', () => {
  it('formats numbers for code', () => {
    expect(formatCodeNumber(400)).toBe('400')
    expect(formatCodeNumber(3.986004418e14)).toMatch(/e14$/i)
    expect(formatCodeNumber(0.0000123)).toMatch(/e-/i)
  })

  it('builds python preamble from live values', () => {
    const p = liveValuesPreamble('python', { mu: 3.986e14, r: 6_778_137, body: 'earth' })
    expect(p).toContain('# --- live inputs')
    expect(p).toContain('mu = ')
    expect(p).toContain('r = 6778137')
    expect(p).toContain("body = 'earth'")
  })

  it('renames reserved python keyword from', () => {
    expect(safeIdent('python', 'from')).toBe('from_id')
    const p = liveValuesPreamble('python', { from: 'km', value: 1 })
    expect(p).toContain('from_id =')
    expect(p).not.toMatch(/^from =/m)
  })

  it('js uses const', () => {
    const p = liveValuesPreamble('javascript', { v: 7800 })
    expect(p).toContain('const v = 7800')
  })

  it('replaces {{placeholders}}', () => {
    expect(applyValuePlaceholders('v = {{v}}', 'python', { v: 7.8 })).toBe('v = 7.8')
  })

  it('enriches r from R + h_m', () => {
    const e = enrichLiveValues({ R: 6378137, h_m: 400_000, mu: 1e14 })
    expect(e?.r).toBe(6378137 + 400_000)
  })

  it('renderLiveCode builds runnable python with prints', () => {
    const out = renderLiveCode(
      'import math\nv = math.sqrt(mu / r)',
      'python',
      { mu: 1e5, r: 1000 },
    )
    expect(out).toContain('mu = ')
    expect(out).toContain('r = 1000')
    expect(out).toContain('v = math.sqrt')
    expect(out).toMatch(/print\(.*v/)
  })

  it('wraps C with main, includes, and printf', () => {
    const out = wrapAsRunnable(
      'double v_esc = sqrt(2.0 * mu / r);\ndouble v_c = sqrt(mu / r);',
      'c',
      { mu: 3.986e14, r: 6378137 },
    )
    expect(out).toContain('#include <stdio.h>')
    expect(out).toContain('#include <math.h>')
    expect(out).toContain('int main(void)')
    expect(out).toContain('const double mu =')
    expect(out).toContain('const double r =')
    expect(out).toContain('v_esc')
    expect(out).toContain('printf')
    expect(out).toContain('return 0')
  })

  it('keeps C helper functions outside main (units pattern)', () => {
    const body = `double to_si(double value, double to_base, double offset) {
  return value * to_base + offset;
}
int main(void) {
  double si = to_si(value, fromToBase, fromOffset);
  printf("SI base = %.12g\\n", si);
  return 0;
}`
    const out = wrapAsRunnable(body, 'c', {
      value: 1,
      fromToBase: 1000,
      fromOffset: 0,
    })
    // helper must appear BEFORE main
    expect(out.indexOf('double to_si')).toBeLessThan(out.indexOf('int main'))
    expect(out).toContain('to_si(value, fromToBase, fromOffset)')
    // must not invent undefined symbols in results from default params
    expect(out).not.toContain('toOffset')
    expect(out).not.toContain('from_off')
  })

  it('wraps C++ with std includes and main', () => {
    const out = wrapAsRunnable(
      'double v_esc = std::sqrt(2.0 * mu / r);',
      'cpp',
      { mu: 1e14, r: 7e6 },
    )
    expect(out).toContain('#include <cmath>')
    expect(out).toContain('int main()')
    expect(out).toContain('std::printf')
  })

  it('wraps rust fragment into fn main (not top-level let)', () => {
    const out = wrapAsRunnable(
      'let v_esc = (2.0 * mu / r).sqrt();\nlet v_c = (mu / r).sqrt();',
      'rust',
      { mu: 3.986e14, r: 6378137 },
    )
    expect(out).toContain('fn main()')
    const mainIdx = out.indexOf('fn main()')
    const muIdx = out.indexOf('let mu =')
    expect(muIdx).toBeGreaterThan(mainIdx)
    expect(out).toContain('println!')
  })

  it('injects live values inside existing rust main', () => {
    const body = `use std::f64::consts::PI;
fn sqrt(x: f64) -> f64 { x.sqrt() }
fn main() {
    let v = sqrt(mu / r);
}`
    const out = wrapAsRunnable(body, 'rust', { mu: 1e5, r: 1000 })
    expect(out).toContain('fn main()')
    expect(out).toContain('let mu =')
    expect(out).toContain('println!')
    const beforeMain = out.slice(0, out.indexOf('fn main()'))
    expect(beforeMain).not.toMatch(/^\s*let mu/m)
    expect(beforeMain).toContain('fn sqrt')
  })

  it('js prints with console.log', () => {
    const out = renderLiveCode(
      'const v = Math.sqrt(mu / r)',
      'javascript',
      { mu: 1e5, r: 1000 },
    )
    expect(out).toContain('console.log')
    expect(out).toContain('const mu =')
  })

  it('does not print function default params as results (units TS)', () => {
    const sn = getSnippets('units')!
    const out = renderLiveCode(sn.code.typescript!, 'typescript', {
      value: 1,
      from: 'km',
      fromToBase: 1000,
      fromOffset: 0,
    })
    expect(out).toContain('const si = toSi')
    expect(out).toContain('console.log("si =", si)')
    // default params may appear in the helper signature: must not be printed as results
    expect(out).not.toMatch(/console\.log\("toOffset"/)
    expect(out).not.toMatch(/console\.log\("fromOffset"/)
  })

  it('units C keeps to_si helper and compiles structure', () => {
    const sn = getSnippets('units')!
    const out = renderLiveCode(sn.code.c!, 'c', {
      value: 1,
      fromToBase: 1000,
      fromOffset: 0,
    })
    expect(out.indexOf('double to_si')).toBeLessThan(out.indexOf('int main'))
    expect(out).toContain('to_si(value, fromToBase, fromOffset)')
  })

  it('extractAssignedNames finds only top-level formula vars', () => {
    expect(extractAssignedNames('const v = 1\nconst T = 2')).toEqual(['v', 'T'])
    expect(extractAssignedNames('v_esc = math.sqrt(2*mu/r)')).toContain('v_esc')
    // defaults inside function signatures must be ignored
    expect(
      extractAssignedNames(`function convert(
  fromOffset = 0,
  toOffset = 0,
): number {
  const si = 1
  return si
}
const si = 1`),
    ).toEqual(['si'])
  })

  it('stripTsTypes removes param and return annotations', () => {
    expect(stripTsTypes('const v: number = 1')).toBe('const v = 1')
    const stripped = stripTsTypes(
      'function toSi(value: number, toBase: number, offset = 0): number {\n  return value * toBase + offset\n}',
    )
    expect(stripped).not.toContain(': number')
    expect(stripped).toContain('function toSi(value, toBase, offset = 0)')
  })

  it('rocket-equation C uses isp (not Isp) and only free live inputs', async () => {
    const { getSnippets } = await import('./index')
    const sn = getSnippets('rocket-equation')!
    const out = renderLiveCode(sn.code.c!, 'c', {
      m0_kg: 500000,
      mf_kg: 100000,
      isp: 330,
      m0: 500000,
      mf: 100000,
      body: 'earth',
      mode: 'forward',
    })
    expect(out).toContain('const double isp = 330')
    expect(out).toContain('isp * g0')
    expect(out).not.toMatch(/\bIsp\b/)
    expect(out).not.toContain('m0_kg')
    expect(out).toMatch(/int main/)
    expect(out).toContain('printf')
  })

  it('canonicalizes Isp→isp even if snippet still has Isp', () => {
    const out = renderLiveCode('double ve = Isp * g0;\ndouble g0 = 9.8;', 'c', {
      isp: 300,
    })
    // g0 assigned in body: not injected; isp free: injected; Isp rewritten
    expect(out).toContain('isp')
    expect(out).not.toMatch(/\bIsp\b/)
  })

  it('propellant-mass / equal-stage / solar-pressure / heat-flux / ideal-thrust compile as pure C', () => {
    const cases: Array<{ id: string; values: Record<string, number> }> = [
      { id: 'propellant-mass', values: { dv: 3200, mf: 5000, isp: 320 } },
      { id: 'equal-stage', values: { dv: 9000, n: 3, isp: 300 } },
      { id: 'solar-pressure', values: { m: 500, A: 20, Cr: 1.2, r_au: 1 } },
      { id: 'heat-flux', values: { rho: 1e-4, v: 7500, Rn: 0.5 } },
      { id: 'ideal-thrust', values: { mdot: 250, ve: 3000 } },
      { id: 'light-time', values: { range: 384400e3 } },
      { id: 'antenna-beamwidth', values: { f: 12e9, D: 3, k: 70 } },
      { id: 'solar-array', values: { A: 20, eta: 0.3, ang: 0, r_au: 1 } },
      { id: 'thermal-rad', values: { A: 1, T: 300, eps: 0.8 } },
      { id: 'delta-a-burn', values: { dv: 10, a: 6778137, mu: 3.986e14 } },
    ]
    for (const { id, values } of cases) {
      const sn = getSnippets(id)!
      expect(sn.code.c, id).toBeTruthy()
      const out = renderLiveCode(sn.code.c!, 'c', values)
      expect(out, id).toContain('int main')
      expect(out, id).toContain('printf')
      // no multi-statement glue on one const line
      expect(out, id).not.toMatch(/const double \w+ = [^;]+; \w+ =/)
      // no undefined common constants
      if (out.includes('g0')) expect(out).toMatch(/g0\s*=\s*9\.80665|const double g0/)
      if (/\bP0\b/.test(out)) expect(out).toMatch(/P0\s*=\s*4\.56|const double P0/)
      if (/\bc\b/.test(out) && id === 'light-time') expect(out).toMatch(/c\s*=\s*299792458/)
    }
  })

  it('equal-stage uses n (not undeclared N) and injects n from UI', () => {
    const sn = getSnippets('equal-stage')!
    const out = renderLiveCode(sn.code.c!, 'c', { dv: 9000, n: 3, isp: 300 })
    expect(out).toContain('const double n = 3')
    expect(out).toMatch(/dv\s*\/\s*n/)
    expect(out).toContain('g0 = 9.80665')
  })

  it('ideal-thrust is linear (no mdot used before define)', () => {
    const sn = getSnippets('ideal-thrust')!
    const out = renderLiveCode(sn.code.c!, 'c', { mdot: 250, ve: 3000 })
    expect(out).toContain('const double mdot = 250')
    expect(out).toContain('const double F = mdot * ve')
    // no second mdot assignment that would redeclare
    expect(out.match(/const double mdot/g)?.length).toBe(1)
  })

  it('injects PHYSICS_DEFAULTS for free constants when UI omits them', () => {
    const out = renderLiveCode('double x = g0 * c * P0;', 'c', {})
    expect(out).toMatch(/const double g0 = 9\.80665/)
    expect(out).toMatch(/const double c = /)
    expect(out).toMatch(/const double P0 = /)
  })

  it('link-budget: UI bag (ptW/freqHz/…) injects python free vars pt_w/f_hz/…', () => {
    const sn = getSnippets('link-budget')!
    const py = sn.code.python!
    // Simulate LinkBudgetTool SI bag (camelCase) without snake_case aliases
    const bag = {
      ptW: 10,
      gt: 30,
      gr: 30,
      freqHz: 12e9,
      rangeM: 1_000_000,
      loss: 2,
      tSysK: 290,
      req: 50,
    }
    const free = freeVarsNeeded(py)
    expect(free.has('pt_w')).toBe(true)
    expect(free.has('def')).toBe(false)
    expect(free.has('fspl_db')).toBe(false)
    expect(free.has('d_km')).toBe(false)
    expect(free.has('log10')).toBe(false)

    const out = renderLiveCode(py, 'python', bag)
    expect(out).toMatch(/pt_w\s*=\s*10/)
    expect(out).toMatch(/gt_dbi\s*=\s*30/)
    expect(out).toMatch(/f_hz\s*=/)
    expect(out).toMatch(/range_km\s*=/)
    expect(out).toMatch(/other_loss_db\s*=\s*2/)
    expect(out).toMatch(/t_sys_k\s*=\s*290/)
    expect(out).toMatch(/required_cn0_dbhz\s*=\s*50/)
    // runnable order: live inputs before formula use of pt_w
    expect(out.indexOf('pt_w =')).toBeLessThan(out.indexOf('math.log10(pt_w)'))
  })

  it('freeVarsNeeded peels Rust fn main so assigns inside are not free', () => {
    const body = `use std::f64::consts::PI;
fn sqrt(x: f64) -> f64 { x.sqrt() }
fn main() {
    let v = sqrt(mu / r);
    let a = v * v / mu;
}`
    const free = freeVarsNeeded(body)
    expect(free.has('mu')).toBe(true)
    expect(free.has('r')).toBe(true)
    expect(free.has('v')).toBe(false)
    expect(free.has('a')).toBe(false)
    expect(free.has('sqrt')).toBe(false)
    expect(free.has('main')).toBe(false)
    expect(free.has('x')).toBe(false) // helper param
  })

  it('freeVarsNeeded peels Zig pub fn main', () => {
    const body = `const std = @import("std");
pub fn main() void {
    const v = @sqrt(mu / r);
}`
    const free = freeVarsNeeded(body)
    expect(free.has('mu')).toBe(true)
    expect(free.has('r')).toBe(true)
    expect(free.has('v')).toBe(false)
    expect(free.has('std')).toBe(false)
  })

  it('renderLiveCode injects free vars into rust makeSnippet body without redecl', () => {
    const sn = getSnippets('circular-orbit')!
    const rust = sn.code.rust
    if (!rust) return
    const out = renderLiveCode(rust, 'rust', { mu: 3.986e14, r: 6.778e6 })
    expect(out).toMatch(/let mu = /)
    expect(out).toMatch(/fn main/)
    // free injects live inside main once
    expect((out.match(/\blet mu\b/g) ?? []).length).toBe(1)
  })
})
