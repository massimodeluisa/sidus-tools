import { describe, expect, it } from 'vitest'
import {
  alongTrackFromDeltaM,
  apoapsisRaiseFromCircular,
  batteryEnergyJ,
  diffractionResolution,
  dragForce,
  equilibriumTemperature,
  groundTrackShiftPerOrbit,
  rcsDeltaV,
  solarArrayPower,
  thermalRadiatedPower,
  wheelMomentum,
} from './power'
import { EARTH_MU, EARTH_RADIUS } from './constants'

describe('power / sensors physics', () => {
  it('solar array peaks at normal incidence', () => {
    const p0 = solarArrayPower(10, 0.3, 0, 1)!
    const p60 = solarArrayPower(10, 0.3, 60, 1)!
    expect(p0).toBeGreaterThan(p60)
  })

  it('battery energy scales with C and V', () => {
    expect(batteryEnergyJ(10, 28)).toBe(10 * 28 * 3600)
  })

  it('RCS Δv = Ft/m', () => {
    expect(rcsDeltaV(10, 2, 100)).toBeCloseTo(0.2)
  })

  it('diffraction finer with larger D', () => {
    const a = diffractionResolution(10e9, 1)!
    const b = diffractionResolution(10e9, 2)!
    expect(b.thetaRad).toBeLessThan(a.thetaRad)
  })

  it('thermal power grows with T^4', () => {
    const q1 = thermalRadiatedPower(1, 300, 1)!
    const q2 = thermalRadiatedPower(1, 600, 1)!
    expect(q2 / q1).toBeCloseTo(16, 5)
  })

  it('equilibrium temperature positive in sunlight', () => {
    const T = equilibriumTemperature(0.3, 0.8, 0, 1)!
    expect(T).toBeGreaterThan(200)
    expect(T).toBeLessThan(400)
  })

  it('drag force positive', () => {
    expect(dragForce(1e-12, 7600, 2.2, 5)!).toBeGreaterThan(0)
  })

  it('wheel momentum', () => {
    expect(wheelMomentum(0.1, 100)).toBeCloseTo(10)
  })

  it('apo raise needs energy', () => {
    const r = EARTH_RADIUS + 200e3
    const ra = EARTH_RADIUS + 1000e3
    const d = apoapsisRaiseFromCircular(EARTH_MU, r, ra)!
    expect(d.dv).toBeGreaterThan(0)
  })

  it('ground track shift westward for prograde (negative lon)', () => {
    const dL = groundTrackShiftPerOrbit(5400)!
    expect(dL).toBeLessThan(0)
  })

  it('along-track from ΔM', () => {
    const a = 7000e3
    expect(alongTrackFromDeltaM(a, 0.01)).toBeCloseTo(70e3, -2)
  })
})
