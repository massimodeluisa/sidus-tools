import { describe, expect, it } from 'vitest'
import { SOLAR_PRESSURE_1AU, solarRadiationAccel, solarRadiationForce } from './mission'

describe('solar radiation coefficient domain', () => {
  it('accepts Cr = 2 and rejects Cr above 2', () => {
    expect(solarRadiationForce(10, 2, 1)).toBeCloseTo(SOLAR_PRESSURE_1AU * 10 * 2, 12)
    expect(solarRadiationForce(10, 3, 1)).toBeNull()
    expect(solarRadiationForce(10, 0, 1)).toBeNull()
    expect(solarRadiationForce(10, Number.POSITIVE_INFINITY, 1)).toBeNull()
    expect(solarRadiationAccel(500, 10, Number.POSITIVE_INFINITY, 1)).toBeNull()
    expect(solarRadiationAccel(500, 10, 2, 1)).toBeCloseTo((SOLAR_PRESSURE_1AU * 10 * 2) / 500, 12)
  })
})
