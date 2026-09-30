import { describe, expect, it } from 'vitest'
import { meanAnomalyFromESnippets } from './mean-anomaly-from-e'

describe('mean-anomaly-from-e snippets', () => {
  it('preserves the elliptic eccentricity domain in assumptions and copied code', () => {
    expect(meanAnomalyFromESnippets.assumptions).toContain('0 <= e < 1')

    for (const [language, source] of Object.entries(meanAnomalyFromESnippets.code)) {
      if (language === 'latex') {
        expect(source).toContain('0\\le e<1')
      } else {
        expect(source).toContain('0 <= e < 1')
      }
    }
  })
})
