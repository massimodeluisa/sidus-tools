import { describe, expect, it } from 'vitest'
import { rocketSnippets } from './rocket-equation'
import { EXPECTED } from './verify/expected'

const EXECUTABLE_LANGUAGES = [
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
] as const

describe('rocket-equation code export solve modes', () => {
  it('exports both solve branches and outputs in every executable language', () => {
    for (const language of EXECUTABLE_LANGUAGES) {
      const source = rocketSnippets.code[language]
      expect(source, `${language} source`).toContain('solve_for_m0')
      expect(source, `${language} source`).toContain('dv_target')
      expect(source, `${language} source`).toContain('dv_result')
      expect(source, `${language} source`).toContain('m0_result')
    }
    expect(rocketSnippets.code.latex).toContain('\\exp')
    expect(rocketSnippets.code.latex).toContain('I_{sp} g_0')
    expect(rocketSnippets.code.latex).toContain('\\operatorname{expm1}')
  })

  it('matches an independent inverse-equation anchor and reports target delta-v', () => {
    const isp = 330
    const mf = 100_000
    const dvTarget = 9000
    const result = EXPECTED['rocket-equation']({
      isp,
      m0: 500_000,
      mf,
      dv_target: dvTarget,
      solve_for_m0: 1,
    })
    const independentM0 = mf * Math.exp(dvTarget / (isp * 9.80665))

    expect(result.dv_result).toBe(dvTarget)
    expect(independentM0).toBeCloseTo(1_613_586.1498216598, 7)
    expect(result.m0_result).toBeCloseTo(independentM0, 7)
    expect(result.propellant_result).toBeCloseTo(independentM0 - mf, 7)
  })

  it('preserves the zero-delta-v inverse limit: m0 equals mf with no propellant', () => {
    const result = EXPECTED['rocket-equation']({
      isp: 300,
      m0: 9999,
      mf: 1200,
      dv_target: 0,
      solve_for_m0: 1,
    })

    expect(result.dv_result).toBe(0)
    expect(result.m0_result).toBe(1200)
    expect(result.propellant_result).toBe(0)
    expect(result.mass_ratio).toBe(1)
  })

  it('preserves small positive inverse propellant mass without subtracting rounded masses', () => {
    const isp = 320
    const mf = 5000
    const dvTarget = 1e-12
    const result = EXPECTED['rocket-equation']({
      isp,
      m0: mf,
      mf,
      dv_target: dvTarget,
      solve_for_m0: 1,
    })
    const stableExpected = mf * Math.expm1(dvTarget / (isp * 9.80665))
    const roundedSubtraction = mf * Math.exp(dvTarget / (isp * 9.80665)) - mf

    expect(result.propellant_result).toBe(stableExpected)
    expect(Math.abs(roundedSubtraction - stableExpected) / stableExpected).toBeGreaterThan(0.4)
  })
})
