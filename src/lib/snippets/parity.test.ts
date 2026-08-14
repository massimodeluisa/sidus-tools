/**
 * Physics ↔ snippet parity: evaluate pure-SI expression cores against shipped physics.
 * No hard-coded expected mission numbers without going through real physics functions.
 */
import { describe, expect, it } from 'vitest'
import {
  circularOrbitVelocity,
  convertById,
  EARTH_MU,
  EARTH_RADIUS,
  orbitalPeriod,
  toSi,
} from '@/lib/physics'
import { getSnippets } from './index'
import {
  makeSnippet,
  portPythonToRust,
  portPythonToZig,
  willEmitSystemsLangs,
} from './make'
import { renderLiveCode } from './liveValues'
import {
  createRunnerUrl,
  primaryRunnerUrl,
  UNSUPPORTED_ONLINE_RUN_LANGS,
} from './runners'

/** Minimal pure expression evaluator for generated assignment lines (test only). */
function evalAssignments(
  code: string,
  bindings: Record<string, number>,
): Record<string, number> {
  const env: Record<string, number> = { ...bindings, Math, PI: Math.PI, M_PI: Math.PI }
  // Strip comments and includes
  const lines = code
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith('#') &&
        !l.startsWith('//') &&
        !l.startsWith('%') &&
        !l.startsWith('/*') &&
        !l.startsWith('*') &&
        !l.startsWith('!') &&
        !l.startsWith('#include') &&
        !l.startsWith('import ') &&
        !l.startsWith('from ') &&
        !l.startsWith('const std') &&
        !l.startsWith('pub fn') &&
        !l.startsWith('fn main') &&
        !l.startsWith('program ') &&
        !l.startsWith('end ') &&
        !l.startsWith('implicit ') &&
        !l.startsWith('real(') &&
        l !== '}' &&
        l !== '{',
    )

  const Math_ = Math
  for (const line of lines) {
    let s = line.replace(/;+\s*$/, '')
    // C: const double x = ...
    s = s.replace(/^const\s+double\s+/, '')
    // rust: let x = ...
    s = s.replace(/^let\s+/, '')
    // zig: const x = ...
    // js: const x = ...
    s = s.replace(/^const\s+/, '')
    const m = s.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (!m) continue
    const [, name, rhs0] = m
    let rhs = rhs0
      .replace(/\bmath\./g, 'Math.')
      .replace(/\bM_PI\b/g, 'Math.PI')
      .replace(/\bstd:f64:consts:PI\b/g, 'Math.PI')
      .replace(/\bpow\s*\(/g, 'Math.pow(')
      .replace(/(?<!Math\.)\bsqrt\s*\(/g, 'Math.sqrt(')
      .replace(/(?<!Math\.)\bsin\s*\(/g, 'Math.sin(')
      .replace(/(?<!Math\.)\bcos\s*\(/g, 'Math.cos(')
      .replace(/\bfabs\s*\(/g, 'Math.abs(')
      .replace(/\bfmax\s*\(/g, 'Math.max(')
      .replace(/\bfmin\s*\(/g, 'Math.min(')
      .replace(/\(([^()]+)\)\.sqrt\(\)/g, 'Math.sqrt($1)')
      .replace(/\(([^()]+)\)\.sin\(\)/g, 'Math.sin($1)')
      .replace(/\(([^()]+)\)\.cos\(\)/g, 'Math.cos($1)')
      .replace(/\(([^()]+)\)\.powi\((\d+)\)/g, 'Math.pow($1,$2)')
      .replace(/\(([^()]+)\)\.powf\(([^()]+)\)/g, 'Math.pow($1,$2)')
      .replace(/_f64\b/g, '')

    // eslint-disable-next-line no-new-func
    const fn = new Function('env', 'Math', `with (env) { return (${rhs}); }`) as (
      env: Record<string, number>,
      Math: Math,
    ) => number
    const val = fn(env, Math)
    if (typeof val === 'number' && Number.isFinite(val)) env[name] = val
  }
  return env
}

describe('snippet integrity', () => {
  it('orbit-3d formula is registered', () => {
    const s = getSnippets('orbit-3d')
    expect(s).toBeTruthy()
    expect(s!.code.python).toMatch(/math\.sqrt/)
  })

  it('makeSnippet emits systems langs for portable pure-SI bodies', () => {
    expect(willEmitSystemsLangs('import math\nv = math.sqrt(mu / r)\n')).toBe(true)
    const sn = makeSnippet('t', 'a', 'import math\nv = math.sqrt(mu / r)', 'v')
    expect(sn.code.c).toMatch(/sqrt/)
    expect(sn.code.rust).toMatch(/sqrt|pow/)
    expect(sn.code.fortran).toMatch(/sqrt/)
  })

  it('does not invent systems langs for non-portable Python', () => {
    const sn = makeSnippet(
      't',
      'a',
      'def f(x):\n  return x\ny = f(1)',
      'y',
    )
    expect(sn.code.c).toBeUndefined()
    expect(sn.code.python).toMatch(/def f/)
  })

  it('no remaining See Python reference fake ports in registry samples', () => {
    for (const id of ['custom-body', 'hohmann-time', 'units', 'circular-orbit', 'orbit-3d']) {
      const s = getSnippets(id)
      expect(s).toBeTruthy()
      for (const body of Object.values(s!.code)) {
        if (!body) continue
        expect(body).not.toMatch(/See Python reference/i)
        expect(body).not.toMatch(/Port from Python/i)
      }
    }
  })
})

describe('physics parity via pure-SI cores', () => {
  it('circular orbit: live physics matches evaluated snippet core (JS path)', () => {
    const mu = EARTH_MU
    const r = EARTH_RADIUS + 400_000
    const vPhys = circularOrbitVelocity(mu, r)
    const TPhys = orbitalPeriod(mu, r)
    expect(vPhys).toBeGreaterThan(0)
    expect(TPhys).toBeGreaterThan(0)

    const sn = getSnippets('circular-orbit')
    expect(sn?.code.javascript).toBeTruthy()
    // Evaluate formula body with full-precision SI bindings (not URL-rounded preamble)
    const env = evalAssignments(sn!.code.javascript!, {
      mu,
      R: EARTH_RADIUS,
      h: 400_000,
    })
    const vSnip = env.v
    const TSnip = env.T ?? env.t
    expect(vSnip).toBeDefined()
    expect(Math.abs(vSnip! - vPhys!) / vPhys!).toBeLessThan(1e-12)
    if (TSnip != null) {
      expect(Math.abs(TSnip - TPhys!) / TPhys!).toBeLessThan(1e-12)
    }
    // Preamble must still inject live numbers
    const live = renderLiveCode(sn!.code.javascript!, 'javascript', { mu, r })
    expect(live).toMatch(/live inputs/)
    expect(live).toMatch(/mu\s*=/)
  })

  it('units conversion: physics convertById matches affine formula from live factors', () => {
    const value = 1
    const fromToBase = toSi(1, 'kgm3') // 1
    const peer = convertById(value, 'kgm3', 'gcm3')
    // SI = value * fromToBase; out = SI / toBase_gcm3; gcm3 toBase = 1000
    const si = value * fromToBase
    const out = si / 1000
    expect(out).toBeCloseTo(peer, 12)
    expect(peer).toBeCloseTo(0.001, 12)
  })

  it('orbit-3d snippet v1 matches circularOrbitVelocity for same SI inputs', () => {
    const mu = EARTH_MU
    const R = EARTH_RADIUS
    const h1 = 400_000
    const r1 = R + h1
    const v1 = circularOrbitVelocity(mu, r1)!
    const sn = getSnippets('orbit-3d')!
    const env = evalAssignments(sn.code.python!, { mu, R, h1, h2: 35_786_000 })
    expect(env.r1).toBeCloseTo(r1, 6)
    expect(Math.abs(env.v1 - v1) / v1).toBeLessThan(1e-12)
  })
})

describe('nested systems ports match pure-SI math', () => {
  it('spherical-distance rust uses idiomatic methods, not broken chains', () => {
    const rust = getSnippets('spherical-distance')!.code.rust!
    // Idiomatic: lat1.sin(), … .acos(): never free acos(sin(…)) wrappers
    expect(rust).toMatch(/lat1\.sin\(\)/)
    expect(rust).toMatch(/\.acos\(\)/)
    expect(rust).not.toMatch(/abs_f/)
    expect(rust).not.toMatch(/\.acos\(\)\.sin/)
    // Numeric parity: evaluate JS body vs nested formula
    const lat1 = 0.5
    const lat2 = 0.7
    const lon1 = 0.1
    const lon2 = 0.4
    const cTrue = Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1),
    )
    const js = getSnippets('spherical-distance')!.code.javascript!
    const env = evalAssignments(js, { lat1, lat2, lon1, lon2, R: 6_371_000 })
    expect(Math.abs(env.c - cTrue) / cTrue).toBeLessThan(1e-12)
  })

  it('spherical-distance / elevation-azimuth Zig atan2 is single std.math.atan2 (no std.std…)', () => {
    for (const id of ['spherical-distance', 'elevation-azimuth'] as const) {
      const zig = getSnippets(id)!.code.zig
      expect(zig, `${id} must emit Zig`).toBeTruthy()
      expect(zig!).not.toMatch(/\bstd\.std\b/)
      // exactly one std.math.atan2 (or zero if body has no atan2: spherical has bearing)
      const hits = zig!.match(/std\.math\.atan2/g) ?? []
      if (id === 'spherical-distance' || id === 'elevation-azimuth') {
        expect(hits.length).toBe(1)
      }
      expect(zig!).not.toMatch(/std\.math\.math/)
    }
  })

  it('vector-angle Zig hypot is std.math.sqrt of squares: never std.pow or std.std', () => {
    const zig = getSnippets('vector-angle')!.code.zig!
    expect(zig).toMatch(/std\.math\.sqrt/)
    expect(zig).not.toMatch(/\bstd\.pow\s*\(/)
    expect(zig).not.toMatch(/\bstd\.std\b/)
    // 3-arg hypot expanded to sum of squares
    expect(zig).toMatch(/ax\s*\*\s*ax/)
  })

  it('eclipse-duration rust/zig: acos(sqrt(1-(R/a)^2)) idiomatic', () => {
    const rust = getSnippets('eclipse-duration')!.code.rust!
    const zig = getSnippets('eclipse-duration')!.code.zig!
    // Rust method chain: (1.0 - (R/a).powi(2)).sqrt().acos()
    expect(rust).toMatch(/\.powi\(2\)/)
    expect(rust).toMatch(/\.sqrt\(\)\.acos\(\)/)
    expect(rust).not.toMatch(/abs_f/)
    // Zig 0.14: std.math.acos/sqrt
    expect(zig).toMatch(/std\.math\.acos\(std\.math\.sqrt\(/)
    expect(zig).toMatch(/std\.math\.pow\(f64/)
    expect(zig).not.toMatch(/@acos|@sqrt\(/)
    const R = 6_371_000
    const a = R + 400_000
    const betaTrue = Math.acos(Math.sqrt(1 - (R / a) ** 2))
    const js = getSnippets('eclipse-duration')!.code.javascript!
    const env = evalAssignments(js, { R, h: 400_000, T: 5600 })
    expect(Math.abs(env.beta - betaTrue) / betaTrue).toBeLessThan(1e-12)
  })

  it('vector-angle rust uses hypot methods + clamp + acos', () => {
    const rust = getSnippets('vector-angle')!.code.rust!
    expect(rust).toMatch(/\.hypot\(/)
    expect(rust).toMatch(/\.clamp\(-1(?:\.0)?,\s*1(?:\.0)?\)\.acos\(\)/)
    expect(rust).not.toMatch(/abs_f/)
    expect(rust).not.toMatch(/math\.hypot/)
    const ax = 1
    const ay = 0
    const az = 0
    const bx = 0
    const by = 1
    const bz = 0
    const thetaTrue = Math.acos(0) // orthogonal
    const js = getSnippets('vector-angle')!.code.javascript!
    expect(js).toMatch(/Math\.(max|hypot)/)
    const env = evalAssignments(js, { ax, ay, az, bx, by, bz })
    expect(Math.abs(env.theta - thetaTrue)).toBeLessThan(1e-12)
  })

  it('rust/zig: bare abs and int literals are f64-safe (idiomatic rust)', () => {
    const py = 'd = abs(ra - rp)\nx = 1 + e\ny = 2 * ra'
    const rust = portPythonToRust(py)
    const zig = portPythonToZig(py)
    expect(rust).toMatch(/\(ra - rp\)\.abs\(\)/)
    expect(rust).not.toMatch(/abs_f/)
    // Float lits get concrete `_f64` so method receivers typecheck (E0689)
    expect(rust).toMatch(/1\.0_f64\s*\+\s*e/)
    expect(rust).toMatch(/2\.0_f64\s*\*\s*ra/)
    expect(rust).not.toMatch(/(?<![A-Za-z0-9_.])1\s*\+/)
    expect(zig).toMatch(/@abs\(/)
    expect(zig).not.toMatch(/@fabs/)
    expect(zig).not.toMatch(/std\.math\.fabs/)
    expect(zig).toMatch(/@as\(f64,\s*1\.0\)\s*\+\s*e/)
    expect(zig).toMatch(/@as\(f64,\s*2\.0\)\s*\*\s*ra/)
  })

  it('promoteBareIntsToF64 never mangles scientific notation', () => {
    const py = 'G = 6.6743e-11\nP0 = 4.56e-6\nk = 1.83e-4'
    const rust = portPythonToRust(py)
    const zig = portPythonToZig(py)
    expect(rust).toMatch(/6\.6743e-11_f64\b/)
    expect(rust).toMatch(/4\.56e-6_f64\b/)
    expect(rust).not.toMatch(/e-\d+\.0/)
    expect(zig).toMatch(/6\.6743e-11\b/)
    expect(zig).not.toMatch(/e-\d+\.0/)
  })

  it('port helpers: nested sin inside acos (idiomatic rust methods)', () => {
    const py = 'c = math.acos(math.sin(x))'
    const r = portPythonToRust(py)
    expect(r).toMatch(/\(x\)\.sin\(\)\.acos\(\)|\(\(x\)\.sin\(\)\)\.acos\(\)/)
    expect(r).not.toMatch(/abs_f|fn sqrt/)
    const z = portPythonToZig(py)
    expect(z).toMatch(/std\.math\.acos\(std\.math\.sin\(x\)\)/)
  })
})

describe('library-backed snippets declare deps', () => {
  it('sgp4 / look-angles / pass-predict expose package URLs', () => {
    for (const id of ['sgp4', 'look-angles', 'pass-predict']) {
      const s = getSnippets(id)!
      expect(s.deps?.length).toBeGreaterThan(0)
      expect(s.deps!.some((d) => /satellite|sgp4/i.test(d.name))).toBe(true)
      expect(s.deps!.every((d) => d.url.startsWith('http'))).toBe(true)
    }
  })

  it('pure-SI tools need no deps (circular-orbit)', () => {
    const s = getSnippets('circular-orbit')!
    expect(s.deps ?? []).toHaveLength(0)
  })
})

describe('online runners', () => {
  it('uses Godbolt (godbolt.org) for every runnable language', async () => {
    const js = 'const x = 1\nconsole.log(x)'
    const py = 'x = 1\nprint(x)'
    const rs = 'fn main() { println!("ok"); }'
    const c = '#include <stdio.h>\nint main(void){ printf("ok\\n"); return 0; }\n'

    for (const [lang, code] of [
      ['javascript', js],
      ['typescript', 'const x: number = 1\nconsole.log(x)'],
      ['python', py],
      ['rust', rs],
      ['c', c],
      ['cpp', '#include <cstdio>\nint main(){ std::puts("ok"); }\n'],
    ] as const) {
      const sync = primaryRunnerUrl(lang, code)
      expect(sync, lang).toMatch(/^https:\/\/godbolt\.org\//)
      const asyncUrl = await createRunnerUrl(lang, code)
      expect(asyncUrl, lang).toMatch(/^https:\/\/godbolt\.org\//)
    }
  })

  it('documents unsupported online-run languages', () => {
    expect(UNSUPPORTED_ONLINE_RUN_LANGS).toContain('matlab')
    expect(UNSUPPORTED_ONLINE_RUN_LANGS).toContain('latex')
    expect(primaryRunnerUrl('latex', '%')).toBeNull()
    expect(primaryRunnerUrl('matlab', 'x=1')).toBeNull()
  })
})
