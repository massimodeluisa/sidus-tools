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

  it('Hohmann-family C export shows R+h1, not a bare 6578137 that looks like Earth radius', () => {
    const bag = {
      R: 6378137,
      h1: 200_000,
      h2: 35_786_000,
      mu: 3.986004418e14,
      di: 0.5,
    }
    for (const id of ['hohmann', 'hohmann-time', 'hohmann-plane'] as const) {
      const sn = getSnippets(id)!
      const out = renderLiveCode(sn.code.c!, 'c', bag)
      expect(out, id).toContain('const double R = 6378137.0')
      expect(out, id).toContain('const double h1 = 200000.0')
      expect(out, id).toMatch(/const double r1 = R \+ h1/)
      expect(out, id).toMatch(/const double r2 = R \+ h2/)
      expect(out, id).not.toContain('const double r1 = 6578137')
      expect(out, id).toMatch(/circular-orbit radii/)
    }
  })

  it('does not inject display-km as SI for vis-viva / apsides / sso-period', () => {
    const vis = renderLiveCode(getSnippets('vis-viva')!.code.c!, 'c', {
      r: 6_778_137,
      a: 6_778_137,
      mu: 3.986004418e14,
    })
    expect(vis).toContain('const double r = 6778137.0')
    expect(vis).not.toContain('const double r = 6778.0')

    const sso = renderLiveCode(getSnippets('sso-period')!.code.c!, 'c', { h: 600_000 })
    expect(sso).toContain('const double h = 600000.0')
    expect(sso).toMatch(/a = R \+ h/)
    expect(sso).not.toContain('const double h = 600.0')

    const circ = renderLiveCode(getSnippets('circular-orbit')!.code.c!, 'c', {
      R: 6378137,
      h: 400_000,
      mu: 3.986004418e14,
    })
    expect(circ).toContain('const double R = 6378137.0')
    expect(circ).toMatch(/const double r = R \+ h/)
    expect(circ).not.toContain('const double r = 6778137')
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

  it('extractAssignedNames recognizes a typed TS declaration (const NAME: TYPE = ...)', () => {
    expect(
      extractAssignedNames('const dv: number = isp * g0 * Math.log(m0/mf)'),
    ).toContain('dv')
  })

  it('extractAssignedNames recognizes a typed Zig declaration (const NAME: TYPE = ...)', () => {
    expect(extractAssignedNames('const L: f64 = 0.0065;')).toContain('L')
  })

  it('extractAssignedNames still finds an untyped declaration (unchanged)', () => {
    expect(extractAssignedNames('const v = 1\nconst T = 2')).toEqual(['v', 'T'])
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

  it('extractAssignedNames(lang=julia) drops locals defined inside function...end', () => {
    const body = `function kepler_propagate(mu, r0, v0, dt)
    r0n = hypot(r0...)
    alpha = 2/r0n
    chi = sqrt(mu) * alpha * dt
    return chi
end
r0 = [rx, ry, rz]
result = kepler_propagate(mu, r0, v0, dt_s)
r_x = result`
    expect(extractAssignedNames(body, 'julia')).toEqual(['r0', 'result', 'r_x'])
  })

  it('extractAssignedNames(lang=matlab) drops locals defined inside function...end', () => {
    const body = `function [r,v] = kepler_propagate(mu,r0,v0,dt)
  r0n = norm(r0);
  alpha = 2/r0n;
  chi = sqrt(mu)*alpha*dt;
end
r0 = [rx, ry, rz];
[rvec, vvec] = kepler_propagate(mu, r0, v0, dt);
r_x = rvec(1);`
    expect(extractAssignedNames(body, 'matlab')).toEqual(['r0', 'r_x'])
  })

  it('extractAssignedNames(lang=julia) tracks nested if/for inside a function without leaking locals', () => {
    const body = `function solve(mu, dt)
    chi = 1.0
    for i in 1:10
        z = chi * chi
        if z > 1e-8
            s = sqrt(z)
        else
            s = 0.0
        end
        chi += s
    end
    return chi
end
result = solve(mu, dt)
r_x = result`
    expect(extractAssignedNames(body, 'julia')).toEqual(['result', 'r_x'])
  })

  it('extractAssignedNames(lang=…) leaves python/js/rust analysis unchanged', () => {
    const pyBody = 'def foo(x):\n    y = x + 1\n    return y\nz = 1'
    expect(extractAssignedNames(pyBody, 'python')).toEqual(extractAssignedNames(pyBody))
    expect(extractAssignedNames(pyBody, 'python')).toEqual(['z'])

    const jsBody = `function convert(
  fromOffset = 0,
  toOffset = 0,
): number {
  const si = 1
  return si
}
const si = 1`
    expect(extractAssignedNames(jsBody, 'javascript')).toEqual(extractAssignedNames(jsBody))
    expect(extractAssignedNames(jsBody, 'javascript')).toEqual(['si'])

    const rustBody = `use std::f64::consts::PI;
fn sqrt(x: f64) -> f64 { x.sqrt() }
fn main() {
    let v = sqrt(mu / r);
    let a = v * v / mu;
}`
    expect(freeVarsNeeded(rustBody, 'rust')).toEqual(freeVarsNeeded(rustBody))
    expect(freeVarsNeeded(rustBody, 'rust').has('mu')).toBe(true)
    expect(freeVarsNeeded(rustBody, 'rust').has('v')).toBe(false)
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
