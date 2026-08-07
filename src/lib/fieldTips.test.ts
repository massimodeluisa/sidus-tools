import { describe, expect, it } from 'vitest'
import { tipForLabel } from './fieldTips'

describe('fieldTips', () => {
  it('resolves common labels', () => {
    expect(tipForLabel('Altitude')).toMatch(/body/i)
    expect(tipForLabel('Isp (vacuum)')).toMatch(/impulse|g₀|g0|seconds/i)
    expect(tipForLabel('v_circ')).toMatch(/√|sqrt|circular/i)
  })

  it('still returns a generic educational tip for unknown labels', () => {
    const t = tipForLabel('xyzzy-not-a-real-field-99')
    expect(t).toBeTruthy()
    expect(t).toMatch(/educational|xyzzy/i)
  })

  it('never leaves a non-empty label without a tip', () => {
    for (const l of ['AOS (UTC)', 'Load power', 'Short way (≤ 180°)', 'μ = GM']) {
      expect(tipForLabel(l)?.length).toBeGreaterThan(8)
    }
  })
})
