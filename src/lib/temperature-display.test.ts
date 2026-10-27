import { describe, expect, it } from 'vitest'
import { PLANCK_SCHEMA } from '@/components/tools/PlanckRadianceTool'
import { WIEN_SCHEMA } from '@/components/tools/WienPeakTool'
import { planckSpectralRadiance, toSi, wienPeakWavelength } from '@/lib/physics'
import { constrainStored } from '@/lib/use-tool-search-params'

describe('temperature display units', () => {
  it('keeps a positive-kelvin Celsius value instead of clamping it to 0', () => {
    expect(PLANCK_SCHEMA.T.min).toBeUndefined()
    expect(PLANCK_SCHEMA.T.parse('-100')).toBe(-100)
    expect(WIEN_SCHEMA.T.parse('-100')).toBe(-100)
    const stored = constrainStored(PLANCK_SCHEMA, {
      lam: 10_000,
      lamu: 'nm',
      T: -100,
      Tu: 'C',
    })
    expect(stored.T).toBe(-100)
    expect(stored.Tu).toBe('C')
    const kelvin = toSi(-100, 'C')
    expect(kelvin).toBeCloseTo(173.15, 10)
    const cold = planckSpectralRadiance(10e-6, kelvin)
    const clamped = planckSpectralRadiance(10e-6, toSi(0, 'C'))
    expect(cold).not.toBeNull()
    expect(clamped).not.toBeNull()
    expect(clamped! / cold!).toBeGreaterThan(10)
    expect(wienPeakWavelength(kelvin)).toBeGreaterThan(wienPeakWavelength(toSi(0, 'C'))!)
  })

  it('keeps a positive-kelvin Fahrenheit value', () => {
    expect(WIEN_SCHEMA.T.parse('-40')).toBe(-40)
    expect(toSi(-40, 'F')).toBeGreaterThan(0)
    expect(wienPeakWavelength(toSi(-40, 'F'))).not.toBeNull()
  })
})
