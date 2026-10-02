import { describe, expect, it } from 'vitest'
import { getBody } from './bodies'
import { EARTH_MU, EARTH_RADIUS } from './constants'

describe('body reference radii', () => {
  it('uses the current JPL mean radius for Mercury', () => {
    expect(getBody('mercury').radius).toBe(2_439_400)
  })

  it('retains the paired WGS 84 Earth GM and equatorial reference radius', () => {
    expect(getBody('earth').mu).toBe(EARTH_MU)
    expect(getBody('earth').radius).toBe(EARTH_RADIUS)
    expect(EARTH_RADIUS).toBe(6_378_137)
    expect(EARTH_MU).toBe(3.986004418e14)
  })
})

describe('body constants', () => {
  it('uses the JPL Pluto-body GM rather than a rounded stale value', () => {
    // JPL PLU060 reports Pluto GM = 869.3 ± 0.4 km^3/s^2.
    expect(getBody('pluto').mu).toBe(869.3e9)
  })
})
