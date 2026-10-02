import { describe, expect, it } from 'vitest'
import { getBody } from './bodies'

describe('body constants', () => {
  it('uses the JPL Neptune-primary GM rather than the Neptune-system GM', () => {
    // JPL NEP097 reports Neptune GM = 6835099.97 ± 9.63 km^3/s^2.
    expect(getBody('neptune').mu).toBe(6.83509997e15)
  })

  it('uses the JPL Pluto-body GM rather than a rounded stale value', () => {
    // JPL PLU060 reports Pluto GM = 869.3 ± 0.4 km^3/s^2.
    expect(getBody('pluto').mu).toBe(869.3e9)
  })
})
