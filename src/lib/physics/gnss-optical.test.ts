import { describe, expect, it } from 'vitest'
import { klobucharIonoDelayM } from './gnss-optical'

const GPS_L1_HZ = 1.57542e9

describe('GPS Klobuchar obliquity mapping on supplied vertical TEC', () => {
  it('matches an independent low-elevation IS-GPS obliquity-factor anchor', () => {
    const delay = klobucharIonoDelayM((5 * Math.PI) / 180, 10, GPS_L1_HZ)
    expect(delay).not.toBeNull()
    expect(delay!).toBeCloseTo(4.914665471214046, 12)
  })

  it('uses the finite horizon mapping and scales with inverse frequency squared', () => {
    const zenith = klobucharIonoDelayM(Math.PI / 2, 10, GPS_L1_HZ)!
    const horizon = klobucharIonoDelayM(0, 10, GPS_L1_HZ)!
    const doubledFrequency = klobucharIonoDelayM(
      Math.PI / 2,
      10,
      2 * GPS_L1_HZ,
    )!

    expect(horizon / zenith).toBeCloseTo(3.382032 / 1.000432, 12)
    expect(doubledFrequency / zenith).toBeCloseTo(0.25, 12)
    expect(klobucharIonoDelayM(Math.PI / 2, 0, GPS_L1_HZ)).toBe(0)
  })

  it('rejects impossible elevations and non-finite or nonphysical inputs', () => {
    for (const elev of [-Number.EPSILON, Math.PI / 2 + Number.EPSILON, NaN, Infinity]) {
      expect(klobucharIonoDelayM(elev, 10, GPS_L1_HZ)).toBeNull()
    }
    for (const tecu of [-1, NaN, Infinity]) {
      expect(klobucharIonoDelayM(Math.PI / 4, tecu, GPS_L1_HZ)).toBeNull()
    }
    for (const freq of [0, -1, NaN, Infinity]) {
      expect(klobucharIonoDelayM(Math.PI / 4, 10, freq)).toBeNull()
    }
  })
})
