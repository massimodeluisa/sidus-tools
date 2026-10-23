import { describe, expect, it } from 'vitest'
import { ebSnippets } from './tools/eclipse-beta'
import { wrapAsRunnable } from './live-values'
import type { CodeLang } from './types'

const guardByLanguage: Record<CodeLang, string> = {
  python: 'if not (-math.pi / 2 <= betaRad <= math.pi / 2)',
  javascript: 'betaRad >= -Math.PI / 2 && betaRad <= Math.PI / 2',
  typescript: 'betaRad >= -Math.PI / 2 && betaRad <= Math.PI / 2',
  c: 'betaRad >= -M_PI / 2.0 && betaRad <= M_PI / 2.0',
  cpp: 'betaRad >= -M_PI / 2.0 && betaRad <= M_PI / 2.0',
  rust: 'std::f64::consts::FRAC_PI_2',
  zig: 'betaRad <= std.math.pi / 2.0',
  fortran: 'betaRad <= 1.57079632679489661923d0',
  matlab: 'betaRad <= pi/2',
  julia: '-pi / 2 <= betaRad',
  latex: '|\\beta| \\le \\pi/2',
}

const noEclipseByLanguage: Record<CodeLang, string> = {
  python: 'if arg >= 1.0:',
  javascript: 'arg >= 1.0 ? 0 : Math.acos(arg)',
  typescript: 'arg >= 1.0 ? 0 : Math.acos(arg)',
  c: 'if (arg >= 1.0) frac = 0.0;',
  cpp: 'if (arg >= 1.0) frac = 0.0;',
  rust: 'if arg >= 1.0 { 0.0 }',
  zig: 'if (arg >= 1.0) 0.0',
  fortran: 'if (arg >= 1.0d0) then',
  matlab: 'if arg >= 1',
  julia: 'if arg >= 1.0',
  latex: 'f = 0\\ (x\\ge 1)',
}

describe('eclipse-beta snippet domain', () => {
  it('documents the principal beta-angle domain and no-eclipse boundary in every language', () => {
    expect(ebSnippets.assumptions).toContain('[-pi/2, pi/2]')
    expect(ebSnippets.assumptions).toContain('x≥1 (no eclipse)')
    for (const lang of Object.keys(guardByLanguage) as CodeLang[]) {
      const body = ebSnippets.code[lang]
      expect(body, lang).toContain(guardByLanguage[lang])
      expect(body, lang).toContain(noEclipseByLanguage[lang])
      if (lang !== 'latex') {
        expect(wrapAsRunnable(body, lang, { h: 400_000, betaRad: 0.3, mu: 3.986e14, R: 6_378_137 }), lang)
          .toContain(guardByLanguage[lang])
      }
    }
  })

  it('returns a finite zero eclipse duration above the critical beta angle', () => {
    const run = new Function(
      'h',
      'betaRad',
      'mu',
      'R',
      `${ebSnippets.code.javascript}\nreturn { arg, frac, t_ecl }`,
    ) as (h: number, betaRad: number, mu: number, R: number) => {
      arg: number
      frac: number
      t_ecl: number
    }
    const result = run(400_000, (80 * Math.PI) / 180, 3.986_004_418e14, 6_378_137)

    expect(result.arg).toBeGreaterThan(1)
    expect(Number.isFinite(result.t_ecl)).toBe(true)
    expect(result.frac).toBe(0)
    expect(result.t_ecl).toBe(0)
  })
})
