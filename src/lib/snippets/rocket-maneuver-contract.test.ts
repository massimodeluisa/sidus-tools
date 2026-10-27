import { describe, expect, it } from 'vitest'
import {
  EARTH_MU,
  EARTH_RADIUS,
  G0,
  circularizeBurn,
  hohmannWithPlaneChange,
  multiStageDeltaV,
  planeChangeAtApsides,
  planeChangeDeltaV,
  propellantForDeltaV,
  rocketDeltaV,
} from '@/lib/physics'
import { multiStageSnippets } from './multi-stage'
import { planeChangeSnippets } from './plane-change'
import { rocketSnippets } from './rocket-equation'
import { circularizeSnippets } from './tools/circularize'
import { hohmannPlaneSnippets } from './tools/hohmann-plane'
import { planeApoSnippets } from './tools/plane-change-apo'
import { propellantMassSnippets } from './tools/propellant-mass'
import type { CodeLang, FormulaSnippet } from './types'

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

function lit(value: number | string): string {
  return typeof value === 'string' ? JSON.stringify(value) : String(value)
}

function runJs(body: string, values: Record<string, number | string>, names: string[]): Record<string, number> {
  const preamble = Object.entries(values)
    .map(([key, value]) => `const ${key} = ${lit(value)};`)
    .join('\n')
  const returned = names.join(', ')
  // eslint-disable-next-line no-new-func
  const fn = new Function(`${preamble}\n${body}\nreturn { ${returned} };`) as () => Record<string, number>
  return fn()
}

function executableBodies(snippet: FormulaSnippet): string[] {
  return EXECUTABLE.map((lang) => {
    const body = snippet.code[lang]
    expect(body, lang).toBeTruthy()
    return body!
  })
}

describe('rocket-equation exports honor solve mode and stable evaluations', () => {
  const stale = { isp: 330, m0: 500_000, mf: 100_000, dv_si: 9000 }

  it('inverse mode reports the target Δv and the solved wet mass', () => {
    const out = runJs(rocketSnippets.code.javascript!, { ...stale, mode: 'm0' }, ['dv', 'prop', 'm0_solved'])
    const solved = propellantForDeltaV(330, 9000, 100_000, G0)!
    expect(out.dv).toBe(9000)
    expect(out.m0_solved).toBeCloseTo(solved.m0, 8)
    expect(out.dv).not.toBeCloseTo(rocketDeltaV(330, 500_000, 100_000), 0)
  })

  it('forward mode keeps the mass-ratio Δv', () => {
    const out = runJs(rocketSnippets.code.javascript!, { ...stale, mode: 'dv' }, ['dv', 'prop', 'm0_solved'])
    expect(out.dv).toBeCloseTo(rocketDeltaV(330, 500_000, 100_000), 8)
    expect(out.m0_solved).toBe(500_000)
  })

  it('near-unity forward Δv matches log1p, not the direct ratio logarithm', () => {
    const m0 = 5000 + 1e-12
    const out = runJs(
      rocketSnippets.code.javascript!,
      { isp: 320, m0, mf: 5000, dv_si: 1, mode: 'dv' },
      ['dv'],
    )
    const stable = rocketDeltaV(320, m0, 5000)
    const direct = 320 * G0 * Math.log(m0 / 5000)
    expect(out.dv).toBeCloseTo(stable, 18)
    expect(Math.abs(out.dv - direct) / stable).toBeGreaterThan(0.2)
  })

  it('tiny inverse propellant matches expm1', () => {
    const out = runJs(
      rocketSnippets.code.javascript!,
      { isp: 320, m0: 6000, mf: 5000, dv_si: 1e-12, mode: 'm0' },
      ['dv', 'prop', 'm0_solved'],
    )
    const solved = propellantForDeltaV(320, 1e-12, 5000, G0)!
    expect(out.dv).toBe(1e-12)
    expect(out.prop).toBeCloseTo(solved.prop, 18)
    expect(out.prop).toBeCloseTo(1.5933065827780133e-12, 18)
    expect(Math.abs(out.prop - (out.m0_solved - 5000)) / out.prop).toBeGreaterThan(0.4)
  })

  it('every executable body branches on mode and uses log1p and expm1', () => {
    for (const lang of EXECUTABLE) {
      const body = rocketSnippets.code[lang]!
      expect(body, lang).toBeTruthy()
      expect(body, lang).toMatch(/\bmode\b/)
      expect(body, lang).toMatch(/\bdv_si\b/)
      if (lang === 'fortran') {
        const code = body.split('\n').filter((line) => !line.trim().startsWith('!')).join('\n')
        expect(code).toMatch(/xrel - 0\.5d0 \* xrel \* xrel \+ xrel \* xrel \* xrel \/ 3\.0d0/)
        expect(code).toMatch(/x \+ 0\.5d0 \* x \* x \+ x \* x \* x \/ 6\.0d0/)
        expect(code).not.toMatch(/\blog1p\b/)
        expect(code).not.toMatch(/\bexpm1\b/)
      } else {
        expect(body, lang).toMatch(/log1p|\.ln_1p\(/)
        expect(body, lang).toMatch(/expm1|\.exp_m1\(/)
      }
    }
    expect(rocketSnippets.code.latex).toMatch(/expm1/)
  })
})

describe('propellant-mass exports use expm1', () => {
  it('matches mf*expm1 at Δv = 1e-12 m/s', () => {
    const out = runJs(
      propellantMassSnippets.code.javascript!,
      { isp: 320, mf: 5000, dv: 1e-12, g0: 9.80665 },
      ['m0', 'prop'],
    )
    const solved = propellantForDeltaV(320, 1e-12, 5000, 9.80665)!
    expect(out.prop).toBeCloseTo(solved.prop, 18)
    expect(out.prop).toBeCloseTo(1.5933065827780133e-12, 18)
    expect(out.m0).toBeCloseTo(solved.m0, 12)
    expect(Math.abs(out.prop - (out.m0 - 5000)) / out.prop).toBeGreaterThan(0.4)
  })

  it('does not subtract the rounded wet mass in any executable body', () => {
    for (const lang of EXECUTABLE) {
      const body = propellantMassSnippets.code[lang]!
      expect(body, lang).toBeTruthy()
      const code = lang === 'fortran'
        ? body.split('\n').filter((line) => !line.trim().startsWith('!')).join('\n')
        : body
      if (lang === 'fortran') {
        expect(code).toMatch(/x \+ 0\.5d0 \* x \* x \+ x \* x \* x \/ 6\.0d0/)
        expect(code).not.toMatch(/\bexpm1\b/)
      } else {
        expect(code, lang).toMatch(/expm1|\.exp_m1\(/)
      }
      expect(code, lang).not.toMatch(/m0\s*-\s*mf/)
    }
  })
})

describe('plane-change exports keep a nonnegative magnitude', () => {
  it('folds 540 deg to +15000 m/s and rejects negative speed', () => {
    const wrapped = runJs(planeChangeSnippets.code.javascript!, { v: 7500, di_deg: 540 }, ['dv'])
    expect(wrapped.dv).toBeCloseTo(planeChangeDeltaV(7500, (540 * Math.PI) / 180), 10)
    expect(wrapped.dv).toBeCloseTo(15_000, 8)
    expect(wrapped.dv).toBeGreaterThan(0)
    const negative = runJs(planeChangeSnippets.code.javascript!, { v: -7500, di_deg: 28.5 }, ['dv'])
    expect(negative.dv).toBeNaN()
  })

  it('matches the positive apoapsis burn for a signed inclination', () => {
    const di = (-28.5 * Math.PI) / 180
    const values = {
      R: EARTH_RADIUS,
      hp: 200_000,
      ha: 35_786_000,
      mu: EARTH_MU,
      di,
    }
    const out = runJs(planeApoSnippets.code.javascript!, values, ['dv'])
    const helper = planeChangeAtApsides(EARTH_MU, EARTH_RADIUS + 200_000, EARTH_RADIUS + 35_786_000, di)!
    expect(out.dv).toBeCloseTo(helper.dvApo, 8)
    expect(out.dv).toBeGreaterThan(0)
    expect(out.dv).toBeCloseTo(786.405401, 3)
  })

  it('folds the included angle in every executable body', () => {
    for (const body of executableBodies(planeChangeSnippets)) {
      expect(body).toMatch(/\btheta\b/)
      expect(body).toMatch(/v\s*<\s*0/)
    }
    for (const body of executableBodies(planeApoSnippets)) {
      expect(body).toMatch(/\btheta\b/)
    }
  })
})

describe('inward Hohmann-plus-plane exports', () => {
  it('uses a nonnegative first burn at the destination apsis', () => {
    const out = runJs(
      hohmannPlaneSnippets.code.javascript!,
      {
        R: EARTH_RADIUS,
        h1: 400_000,
        h2: 200_000,
        mu: EARTH_MU,
        di: (28.5 * Math.PI) / 180,
      },
      ['dv1', 'dv2', 'dv'],
    )
    const helper = hohmannWithPlaneChange(
      EARTH_MU,
      EARTH_RADIUS + 400_000,
      EARTH_RADIUS + 200_000,
      (28.5 * Math.PI) / 180,
    )!
    expect(out.dv1).toBeCloseTo(helper.dv1, 8)
    expect(out.dv1).toBeCloseTo(57.631962674, 6)
    expect(out.dv1).toBeGreaterThan(0)
    expect(out.dv2).toBeCloseTo(helper.dv2, 6)
    expect(out.dv).toBeCloseTo(helper.dvCombined, 6)
  })

  it('takes the absolute departure and names the destination apsis in every body', () => {
    for (const body of [...executableBodies(hohmannPlaneSnippets), hohmannPlaneSnippets.code.latex!]) {
      expect(body).toMatch(/destination apsis/)
      expect(body).toMatch(/abs\(vp - v1\)|\(vp - v1\)\.abs\(\)|fabs\(vp - v1\)|@abs\(vp - v1\)|\|v_p - v_1\|/)
    }
  })
})

describe('circularize exports honor the selected apsis', () => {
  it('uses periapsis for a = 8000 km and e = 0.1', () => {
    const out = runJs(
      circularizeSnippets.code.javascript!,
      { a: 8_000_000, e: 0.1, mu: EARTH_MU, at: 'peri' },
      ['r', 'vEll', 'vCirc', 'dv'],
    )
    const burn = circularizeBurn(EARTH_MU, 8_000_000, 0.1, 'peri')!
    expect(out.r).toBeCloseTo(burn.r, 8)
    expect(out.vEll).toBeCloseTo(burn.vEll, 6)
    expect(out.vCirc).toBeCloseTo(burn.vCirc, 6)
    expect(out.dv).toBeCloseTo(363.162668, 3)
    const apo = runJs(
      circularizeSnippets.code.javascript!,
      { a: 8_000_000, e: 0.1, mu: EARTH_MU, at: 'apo' },
      ['dv'],
    )
    expect(apo.dv).toBeCloseTo(circularizeBurn(EARTH_MU, 8_000_000, 0.1, 'apo')!.dv, 6)
    expect(out.dv).not.toBeCloseTo(apo.dv, 0)
  })

  it('reads at and both apsides in every executable body and in LaTeX', () => {
    for (const body of executableBodies(circularizeSnippets)) {
      expect(body).toMatch(/\bat\b/)
      expect(body).toMatch(/1(?:\.0d0|\.0)?\s*-\s*e/)
      expect(body).toMatch(/1(?:\.0d0|\.0)?\s*\+\s*e/)
    }
    expect(circularizeSnippets.code.latex).toMatch(/1-e/)
    expect(circularizeSnippets.code.latex).toMatch(/1\+e/)
  })
})

describe('multi-stage exports use log1p near unit mass ratio', () => {
  it('matches the stable stage Δv and still gates inactive stages', () => {
    const m0 = 5000 + 1e-12
    const out = runJs(
      multiStageSnippets.code.javascript!,
      {
        isp1: 320,
        m01: m0,
        mf1: 5000,
        isp2: 310,
        m02: 25_000,
        mf2: 0,
        isp3: 450,
        m03: 6000,
        mf3: 0,
        stages: 1,
      },
      ['dv1', 'dv2', 'dv3', 'dv_total'],
    )
    const expected = multiStageDeltaV([{ ve: 320 * G0, m0, mf: 5000 }])!
    expect(out.dv1).toBeCloseTo(expected.dv[0]!, 16)
    expect(out.dv1).toBeCloseTo(5.708221578970551e-13, 18)
    expect(out.dv2).toBe(0)
    expect(out.dv3).toBe(0)
    expect(out.dv_total).toBeCloseTo(out.dv1, 18)
    const direct = 320 * G0 * Math.log(m0 / 5000)
    expect(Math.abs(out.dv1 - direct) / out.dv1).toBeGreaterThan(0.2)
  })

  it('keeps the active-stage gate and a stable logarithm in every executable body', () => {
    for (const lang of EXECUTABLE) {
      const body = multiStageSnippets.code[lang]!
      expect(body, lang).toBeTruthy()
      if (lang === 'fortran') {
        const code = body.split('\n').filter((line) => !line.trim().startsWith('!')).join('\n')
        expect(code).toMatch(/xrel - 0\.5d0 \* xrel \* xrel \+ xrel \* xrel \* xrel \/ 3\.0d0/)
        expect(code).not.toMatch(/\blog1p\b/)
      } else {
        expect(body, lang).toMatch(/log1p|\.ln_1p\(/)
      }
      expect(body, lang).toMatch(/\bn\s*>=\s*2\b/)
      expect(body, lang).toMatch(/\bn\s*>=\s*3\b/)
      expect(body, lang).toMatch(/dv_total\b[^=\n]*=\s*dv1\s*\+\s*dv2\s*\+\s*dv3/)
    }
  })
})
