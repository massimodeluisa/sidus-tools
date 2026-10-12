import { describe, expect, it } from 'vitest'
import { en } from '../i18n/locales/en'
import { tipForLabel } from './field-tips'

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

  it('does not treat a hyphenated compound as its pieces', () => {
    expect(tipForLabel('Range-rate error')).toMatch(/one-way/i)
    expect(tipForLabel('Range-rate error')).not.toMatch(/path length/i)
    expect(tipForLabel('Range-rate error (one-way)')).not.toMatch(/path length/i)
    expect(tipForLabel('Range-rate error (two-way)')).toMatch(/half/i)
    expect(tipForLabel('Duration')).toMatch(/budget|simulation/i)
  })

  it('keeps nearby labels on their own tip', () => {
    expect(tipForLabel('Display time zone')).toMatch(/time zone/i)
    expect(tipForLabel('Display time zone')).not.toMatch(/propulsion|specific impulse/i)
    expect(tipForLabel('Max el at (local)')).toMatch(/maximum elevation/i)
    expect(tipForLabel('Max el at (local)')).not.toMatch(/vector component/i)
    expect(tipForLabel('Two-way Doppler')).toMatch(/round-trip/i)
    expect(tipForLabel('Two-way Doppler')).not.toMatch(/vector component/i)
    const clock = tipForLabel('Fractional frequency offset Δf/f')
    expect(clock).toMatch(/clock/i)
    expect(clock).not.toMatch(/^RF/)
  })

  it('does not assign a category sentence to a label outside that category', () => {
    const lengthToken = /(?<![a-z0-9-])(?:altitude|height|apoapsis|periapsis|radius|range|distance|sma|semi-major)(?![a-z0-9-])/i
    const propulsionToken = /(?<![a-z0-9-])(?:i_?sp|impulse|thrust|force|mdot|flow|newton)(?![a-z0-9-])/i
    const vectorToken = /(?<![a-z0-9-])(?:vector|position|velocity|ax|ay|az|bx|by|bz|east|north|up)(?![a-z0-9-])/i
    const labels: string[] = []
    const walk = (node: unknown) => {
      if (typeof node === 'string') labels.push(node)
      else if (node && typeof node === 'object') {
        for (const value of Object.values(node)) walk(value)
      }
    }
    walk(en.fields)
    for (const label of labels) {
      const tip = tipForLabel(label) ?? ''
      if (tip.startsWith('Length scale')) expect(label, label).toMatch(lengthToken)
      if (tip.startsWith('Propulsion / force') || tip.startsWith('Vacuum specific impulse')) {
        expect(label, label).toMatch(propulsionToken)
      }
      if (tip.startsWith('Vector component')) expect(label, label).toMatch(vectorToken)
    }
  })
})
