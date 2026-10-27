/**
 * Issue 88: the elliptic mean-anomaly export must refuse the parabolic and
 * hyperbolic domains (e >= 1) instead of evaluating M = E - e sin E there.
 */
import { describe, expect, it } from 'vitest'
import { meanAnomalyFromE } from './discovery-wave'
import { getSnippets } from '../snippets'

/** Evaluate the shipped JavaScript body the way a user would run it. */
function evalSnippetJs(body: string, E: number, e: number): number {
  const fn = new Function('E', 'e', `${body}\nreturn M`) as (
    E: number,
    e: number,
  ) => number
  return fn(E, e)
}

describe('meanAnomalyFromE', () => {
  it('keeps the circular case an identity', () => {
    expect(meanAnomalyFromE(0.4, 0)).toBe(0.4)
  })

  it('keeps a near-parabolic elliptic input finite and elliptic', () => {
    const E = 0.3
    const e = 0.999
    const M = meanAnomalyFromE(E, e)
    expect(M).not.toBeNull()
    expect(Number.isFinite(M as number)).toBe(true)
    // The cancellation-safe rearrangement matches the elliptic equation to a fraction of an ulp.
    expect(M).toBeCloseTo(E - e * Math.sin(E), 14)
  })

  it('rejects the parabolic and hyperbolic domains', () => {
    expect(meanAnomalyFromE(1.0, 1)).toBeNull()
    expect(meanAnomalyFromE(1.0, 1.5)).toBeNull()
  })

  it('rejects negative eccentricity', () => {
    expect(meanAnomalyFromE(1.0, -0.1)).toBeNull()
  })

  it('rejects a non-finite eccentric anomaly', () => {
    expect(meanAnomalyFromE(Number.NaN, 0.5)).toBeNull()
    expect(meanAnomalyFromE(Number.POSITIVE_INFINITY, 0.5)).toBeNull()
    expect(meanAnomalyFromE(Number.NEGATIVE_INFINITY, 0.5)).toBeNull()
  })

  it('documents the elliptic domain in the snippet assumptions', () => {
    const snippet = getSnippets('mean-anomaly-from-e')
    expect(snippet).toBeTruthy()
    expect(snippet!.assumptions).toMatch(/elliptic/i)
    expect(snippet!.assumptions).toMatch(/0 <= e < 1/)
  })
})

describe('mean-anomaly-from-e javascript snippet', () => {
  const body = getSnippets('mean-anomaly-from-e')!.code.javascript!

  it('refuses e = 1 and e = 1.5 with a non-finite mean anomaly', () => {
    for (const e of [1, 1.5]) {
      const M = evalSnippetJs(body, 1.0, e)
      expect(Number.isFinite(M), `e = ${e} produced M = ${M}`).toBe(false)
    }
  })

  it('matches the helper for an ordinary elliptic input', () => {
    const E = 0.5
    const e = 0.1
    const expected = meanAnomalyFromE(E, e)
    expect(expected).not.toBeNull()
    expect(evalSnippetJs(body, E, e)).toBe(expected)
  })
})
