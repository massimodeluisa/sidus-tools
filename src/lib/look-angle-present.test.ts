import { describe, expect, it } from 'vitest'
import { presentLookAngles } from './look-angle-present'
import { ecfToEci, gstime } from './vendor/satellite-js-pure'
import { lookAnglesFromEci, observerEciPosition } from './physics/sgp4'

const date = new Date('2024-01-01T00:00:00Z')

function eciFromEcfKm(ecfKm: { x: number; y: number; z: number }): [number, number, number] {
  const eci = ecfToEci(ecfKm, gstime(date))
  return [eci.x * 1000, eci.y * 1000, eci.z * 1000]
}

describe('look-angle page presentation', () => {
  it('reports zero range and a 1.46e-9 m residual as no look angles', () => {
    const observer = { latDeg: 34, lonDeg: -118, heightM: 100 }
    const r = observerEciPosition(observer, date)
    expect(presentLookAngles(true, lookAnglesFromEci(observer, r, date))).toEqual({
      status: 'no_look',
    })
    const near: [number, number, number] = [r[0] + 1.46e-9, r[1], r[2]]
    expect(presentLookAngles(true, lookAnglesFromEci(observer, near, date))).toEqual({
      status: 'no_look',
    })
    const offset: [number, number, number] = [r[0] + 10, r[1], r[2]]
    const shown = presentLookAngles(true, lookAnglesFromEci(observer, offset, date))
    expect(shown.status).toBe('look')
    if (shown.status !== 'look') throw new Error('unreachable: narrowed by expect above')
    expect(Number.isFinite(shown.azimuthRad)).toBe(true)
    expect(shown.azimuthRad).not.toBe(Math.PI)
  })

  it('leaves azimuth undefined at exact zenith and numeric just off zenith', () => {
    const observer = { latDeg: 0, lonDeg: 0, heightM: 0 }
    const zenith = presentLookAngles(
      true,
      lookAnglesFromEci(observer, eciFromEcfKm({ x: 7078.137, y: 0, z: 0 }), date),
    )
    expect(zenith.status).toBe('zenith')
    if (zenith.status !== 'zenith') throw new Error('unreachable: narrowed by expect above')
    expect(zenith.elevationRad).toBeCloseTo(Math.PI / 2, 12)
    expect(zenith.rangeM).toBeCloseTo(700_000, 6)
    expect(zenith).not.toHaveProperty('azimuthRad', Math.PI)

    const off = presentLookAngles(
      true,
      lookAnglesFromEci(observer, eciFromEcfKm({ x: 7078.137, y: 0.001, z: 0 }), date),
    )
    expect(off.status).toBe('look')
    if (off.status !== 'look') throw new Error('unreachable: narrowed by expect above')
    expect(off.azimuthRad).toBeCloseTo(Math.PI / 2, 8)
    expect(off.elevationRad).toBeLessThan(Math.PI / 2)
  })
})
