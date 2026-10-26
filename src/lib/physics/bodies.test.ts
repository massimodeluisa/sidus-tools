import { describe, expect, it } from 'vitest'
import { getBody } from './bodies'
import { G } from './constants'

describe('Moon body mass', () => {
  it('is derived consistently from the JPL DE440 GM and current G estimate', () => {
    const moon = getBody('moon')
    expect(moon.mass).toBe(7.3458e22)
    expect(Math.abs(moon.mass * G - moon.mu) / moon.mu).toBeLessThan(1e-5)
  })
})

describe('body constants', () => {
  it('uses the JPL Pluto-body GM rather than a rounded stale value', () => {
    // JPL PLU060 reports Pluto GM = 869.3 ± 0.4 km^3/s^2.
    expect(getBody('pluto').mu).toBe(869.3e9)
  })
})
