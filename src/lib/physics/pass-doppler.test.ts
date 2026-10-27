import { describe, expect, it } from 'vitest'
import { dopplerShiftHz } from './discovery-wave'
import { EARTH_ROTATION_RATE } from './power'
import {
  eciRangeRateMps,
  observerRotationVelocityEci,
  passDopplerPoints,
} from './pass-doppler'
import { observerEciPosition, parseTle } from './sgp4'
import { vdot } from './vector'

const CASE_A_L1 = '1 00005U 58002B   00179.78495062  .00000023  00000-0  28098-4 0  4753'
const CASE_A_L2 = '2 00005  34.2682 348.7242 1859667 331.7664  19.3264 10.82419157413667'

describe('observerRotationVelocityEci', () => {
  it('is ω × r about z and perpendicular to the site position', () => {
    const date = new Date('2000-06-27T18:50:19.734Z')
    const r = observerEciPosition({ latDeg: 34, lonDeg: -118, heightM: 100 }, date)
    const v = observerRotationVelocityEci(r)
    expect(v[2]).toBe(0)
    expect(Math.hypot(v[0], v[1])).toBeCloseTo(EARTH_ROTATION_RATE * Math.hypot(r[0], r[1]), 8)
    expect(vdot(r, v)).toBeCloseTo(0, 6)
  })
})

describe('eciRangeRateMps', () => {
  it('is positive when the relative velocity points along the line of sight away from the observer', () => {
    const parsed = parseTle(`${CASE_A_L1}\n${CASE_A_L2}`)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error('unreachable')
    const observer = { latDeg: 0, lonDeg: 0, heightM: 0 }
    const date = new Date(Math.round((parsed.satrec.jdsatepoch - 2440587.5) * 86400000))
    const rate = eciRangeRateMps(parsed.satrec, observer, date)
    expect(rate).not.toBeNull()
    expect(Number.isFinite(rate)).toBe(true)
  })
})

describe('passDopplerPoints', () => {
  it('shifts high at AOS, near zero at closest approach, and low at LOS', () => {
    const parsed = parseTle(`${CASE_A_L1}\n${CASE_A_L2}`)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error('unreachable')

    const f0 = 145.8e6
    const observer = { latDeg: 34, lonDeg: -118, heightM: 100 }
    const start = new Date(Math.round((parsed.satrec.jdsatepoch - 2440587.5) * 86400000))
    const points = passDopplerPoints({
      satrec: parsed.satrec,
      observer,
      f0,
      start,
      horizonH: 6,
      stepS: 30,
      minElDeg: 10,
      refineS: 1,
    })
    expect(points).toBeTruthy()
    if (!points) throw new Error('unreachable')

    expect(points.aos.rangeRateMps).toBeLessThan(0)
    expect(points.los.rangeRateMps).toBeGreaterThan(0)
    expect(Math.abs(points.closest.rangeRateMps)).toBeLessThan(Math.abs(points.aos.rangeRateMps))
    expect(Math.abs(points.closest.rangeRateMps)).toBeLessThan(Math.abs(points.los.rangeRateMps))
    expect(points.aos.shiftHz).toBeGreaterThan(0)
    expect(points.los.shiftHz).toBeLessThan(0)
    expect(points.aos.shiftHz).toBeCloseTo(dopplerShiftHz(f0, -points.aos.rangeRateMps)!, 6)
    expect(points.closest.shiftHz).toBeCloseTo(dopplerShiftHz(f0, -points.closest.rangeRateMps)!, 6)
    expect(points.los.shiftHz).toBeCloseTo(dopplerShiftHz(f0, -points.los.rangeRateMps)!, 6)
    expect(points.closest.at.getTime()).toBeGreaterThan(points.aos.at.getTime())
    expect(points.closest.at.getTime()).toBeLessThan(points.los.at.getTime())
  })

  it('returns null when the carrier frequency is not positive', () => {
    const parsed = parseTle(`${CASE_A_L1}\n${CASE_A_L2}`)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error('unreachable')
    expect(
      passDopplerPoints({
        satrec: parsed.satrec,
        observer: { latDeg: 34, lonDeg: -118, heightM: 100 },
        f0: 0,
        start: new Date('2000-06-27T18:50:19.734Z'),
      }),
    ).toBeNull()
  })
})
