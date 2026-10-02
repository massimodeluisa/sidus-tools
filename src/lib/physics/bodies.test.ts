import { describe, expect, it } from 'vitest'
import { getBody } from './bodies'

describe('planetary gravitational parameters', () => {
  it('uses JPL primary-body GMs for Jupiter, Saturn, and Uranus', () => {
    expect(getBody('jupiter').mu).toBe(1.266865319e17)
    expect(getBody('saturn').mu).toBe(3.793120623e16)
    expect(getBody('uranus').mu).toBe(5.7939513e15)
  })
})

describe('body constants', () => {
  it('uses the JPL Pluto-body GM rather than a rounded stale value', () => {
    // JPL PLU060 reports Pluto GM = 869.3 ± 0.4 km^3/s^2.
    expect(getBody('pluto').mu).toBe(869.3e9)
  })
})
