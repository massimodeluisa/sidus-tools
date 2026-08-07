import { describe, expect, it } from 'vitest'
import {
  convertById,
  convertAllInCategory,
  fromSi,
  PRETTY_DURATION_UNIT,
  toSi,
  TOOL_UNIT_SETS,
} from './units'

describe('units conversion', () => {
  it('linear length and velocity', () => {
    expect(toSi(1, 'km')).toBe(1000)
    expect(fromSi(1000, 'km')).toBe(1)
    expect(convertById(7.8, 'kmps', 'mps')).toBeCloseTo(7800, 6)
  })

  it('temperature affine K/C/F', () => {
    expect(toSi(0, 'C')).toBeCloseTo(273.15, 10)
    expect(fromSi(273.15, 'C')).toBeCloseTo(0, 10)
    expect(toSi(32, 'F')).toBeCloseTo(273.15, 8)
    expect(fromSi(373.15, 'F')).toBeCloseTo(212, 6)
  })

  it('pressure and area', () => {
    expect(toSi(1, 'kPa')).toBe(1000)
    expect(toSi(1, 'mm2')).toBeCloseTo(1e-6, 15)
  })

  it('force N / kN / lbf', () => {
    expect(toSi(1, 'kN')).toBe(1000)
    expect(fromSi(4.4482216152605, 'lbf')).toBeCloseTo(1, 10)
  })

  it('mmHg, heat flux, kg/day mass flow', () => {
    expect(toSi(1, 'mmHg')).toBeCloseTo(133.322387415, 9)
    expect(toSi(1, 'Wcm2')).toBe(1e4)
    expect(fromSi(1e4, 'Wcm2')).toBeCloseTo(1, 10)
    expect(toSi(86400, 'kgpd')).toBeCloseTo(1, 10) // 86400 kg/day → 1 kg/s
    expect(fromSi(1 / 86400, 'kgpd')).toBeCloseTo(1, 10)
    expect(toSi(1, 'km2ps2')).toBe(1e6) // C3: 1 km²/s² = 1e6 J/kg
  })

  it('pretty duration is virtual SI-seconds bridge', () => {
    expect(toSi(120, PRETTY_DURATION_UNIT)).toBe(120)
    expect(convertById(3600, PRETTY_DURATION_UNIT, 'h')).toBe(1)
    expect(convertById(2, 'h', PRETTY_DURATION_UNIT)).toBe(7200)
    expect(TOOL_UNIT_SETS.timePretty[0]).toBe(PRETTY_DURATION_UNIT)
  })

  it('convertAllInCategory temperature table', () => {
    const rows = convertAllInCategory(100, 'C', 'temperature')
    const K = rows.find((r) => r.id === 'K')!
    const F = rows.find((r) => r.id === 'F')!
    expect(K.value).toBeCloseTo(373.15, 8)
    expect(F.value).toBeCloseTo(212, 5)
  })
})
