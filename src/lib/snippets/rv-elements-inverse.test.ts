import { describe, expect, it } from 'vitest'
import { getSnippets, renderLiveCode } from './index'
import { CODE_LANGS } from './types'
import { SUPPLEMENTAL_EXPECTED } from './verify/expected/supplemental'
import { asInjected, scenariosFor } from './verify/inputs'

describe('rv-elements inverse code export', () => {
  it('provides a hand-authored fragment for every supported language', () => {
    const snippet = getSnippets('rv-elements-inverse')
    expect(snippet).toBeDefined()
    for (const { id } of CODE_LANGS) {
      expect(snippet?.code[id]?.trim(), id).toBeTruthy()
    }
  })

  it('matches shipped elementsToRv for elliptic, near-circular retrograde, and hyperbolic scenarios', () => {
    const snippet = getSnippets('rv-elements-inverse')
    const expectedFn = SUPPLEMENTAL_EXPECTED['rv-elements-inverse']!
    for (const scenario of scenariosFor('rv-elements-inverse')) {
      const bag = asInjected(scenario.bag) as Record<string, number | string>
      const rendered = renderLiveCode(snippet!.code.javascript!, 'javascript', bag)
      const actual = new Function(
        `${rendered}\nreturn { rx_out, ry_out, rz_out, vx_out, vy_out, vz_out }`,
      )() as Record<string, number>
      const expected = expectedFn(bag)
      for (const key of Object.keys(expected)) {
        expect(
          Math.abs(actual[key]! - expected[key]!),
          `${scenario.name}.${key}`,
        ).toBeLessThan(key.startsWith('r') ? 1e-7 : 1e-10)
      }
    }
  })
})
