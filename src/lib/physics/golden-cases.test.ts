/**
 * Engineer-grade golden-case matrix.
 * Fails CI if any shipped physics export regresses outside cited tolerances.
 *
 * Run: npm test -- src/lib/physics/golden-cases.test.ts
 */
import { describe, expect, it } from 'vitest'
import {
  GOLDEN_CASES,
  casesByDomain,
  domainStats,
} from './golden/cases'
import { DOMAIN_DEFAULT_REL_TOL, type GoldenCase, type GoldenCheck } from './golden/types'

function assertCheck(caseId: string, source: string, domain: GoldenCase['domain'], c: GoldenCheck) {
  const got = c.got()
  const exp = c.expected
  expect(Number.isFinite(got), `${caseId}.${c.key}: got not finite (${got})`).toBe(true)
  expect(Number.isFinite(exp), `${caseId}.${c.key}: expected not finite`).toBe(true)

  const absTol = c.absTol
  const relTol = c.relTol ?? DOMAIN_DEFAULT_REL_TOL[domain]

  if (absTol != null && c.relTol == null) {
    const err = Math.abs(got - exp)
    expect(
      err,
      `${caseId}.${c.key}: |${got} − ${exp}| = ${err} > absTol ${absTol}\n  source: ${source}`,
    ).toBeLessThanOrEqual(absTol)
    return
  }

  if (exp === 0) {
    const tol = absTol ?? 1e-15
    expect(
      Math.abs(got),
      `${caseId}.${c.key}: expected ~0, got ${got}\n  source: ${source}`,
    ).toBeLessThanOrEqual(tol)
    return
  }

  const rel = Math.abs(got - exp) / Math.abs(exp)
  if (absTol != null && rel > relTol) {
    // allow pass if absolute is tight enough when both set
    if (Math.abs(got - exp) <= absTol) return
  }
  expect(
    rel,
    `${caseId}.${c.key}: rel err ${rel} > ${relTol} (got=${got}, expected=${exp})\n  source: ${source}`,
  ).toBeLessThanOrEqual(relTol)
}

describe('golden-case matrix inventory', () => {
  it('covers all domains with multiple cases each', () => {
    const by = casesByDomain()
    const required = Object.keys(DOMAIN_DEFAULT_REL_TOL)
    for (const d of required) {
      expect(by[d]?.length, `domain ${d} missing cases`).toBeGreaterThanOrEqual(3)
    }
  })

  it('unique case ids', () => {
    const ids = GOLDEN_CASES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every case has source citation and ≥1 check', () => {
    for (const c of GOLDEN_CASES) {
      expect(c.source.length, c.id).toBeGreaterThan(8)
      expect(c.checks.length, c.id).toBeGreaterThan(0)
    }
  })

  it('logs domain counts (visibility in CI)', () => {
    const stats = domainStats()
    // Not a soft assert: ensure we still have a substantial matrix
    const total = stats.reduce((s, x) => s + x.n, 0)
    expect(total).toBeGreaterThanOrEqual(50)
    // eslint-disable-next-line no-console
    console.log(
      'GOLDEN_MATRIX',
      stats.map((s) => `${s.domain}:${s.n}`).join(' '),
      `TOTAL:${total}`,
    )
  })
})

describe('golden-case matrix (shipped physics)', () => {
  // One vitest case per golden scenario so failures name the scenario clearly
  for (const gc of GOLDEN_CASES) {
    it(`[${gc.domain}] ${gc.id}: ${gc.name}`, () => {
      for (const check of gc.checks) {
        assertCheck(gc.id, gc.source, gc.domain, check)
      }
    })
  }
})
