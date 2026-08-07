import { describe, expect, it } from 'vitest'
import {
  characteristicVelocity,
  coldGasThrust,
  densityImpulse,
  idealCstar,
  ionThrusterEfficiency,
  isentropicExitVelocity,
  isentropicNozzle,
  mixtureRatio,
  tankPropellantMass,
  throatAreaFromThrust,
  thrustFromCf,
} from './engines-ext'
import {
  gnssDopFromUnitVectors,
  gnssPseudorange,
  laserRangeFromRtt,
  laserSpotRadius,
  opticalLinkReceivedPower,
  saastamoinenTropoDelay,
} from './gnss-optical'
import {
  ballisticRangeFlat,
  bankAngleRad,
  coverageSwathWidth,
  dopplerShiftHz,
  freeFallTimeConstG,
  geoPropellantBudget,
  geoStationkeepingDvYear,
  magneticTorque,
  orbitLifetimeRough,
  reflectionCoeff,
  returnLossDb,
  slewTimeMin,
  terminalVelocity,
  tisserandParameter,
  vswrFromGamma,
  walkerSpacing,
} from './discovery-wave'
import { C, G0 } from './constants'

describe('engines-ext', () => {
  it('mixture ratio and tank mass', () => {
    expect(mixtureRatio(6, 1)).toBeCloseTo(6, 12)
    expect(tankPropellantMass(1, 0.9, 1000)).toBeCloseTo(900, 12)
  })

  it('isentropic nozzle area ratio > 1 for pe < pc', () => {
    const n = isentropicNozzle({ gamma: 1.4, peOverPc: 0.1 })
    expect(n).not.toBeNull()
    expect(n!.areaRatio).toBeGreaterThan(1)
    expect(n!.Me).toBeGreaterThan(1)
  })

  it('exit velocity and c* are positive', () => {
    const ve = isentropicExitVelocity(1.2, 300, 3500, 0.01)
    expect(ve).not.toBeNull()
    expect(ve!).toBeGreaterThan(1000)
    const cs = idealCstar(1.2, 300, 3500)
    expect(cs).not.toBeNull()
    // √(R Tc/γ)·((γ+1)/2)^… with γ=1.2, R=300, Tc=3500 ≈ 1707 m/s
    expect(cs!).toBeGreaterThan(1500)
    expect(cs!).toBeLessThan(1900)
  })

  it('thrust / throat / ion / cold-gas', () => {
    expect(thrustFromCf(1.5, 1e7, 0.01)).toBeCloseTo(1.5e5, 6)
    expect(throatAreaFromThrust(1.5e5, 1.5, 1e7)).toBeCloseTo(0.01, 12)
    expect(characteristicVelocity(1e7, 0.01, 50)).toBeCloseTo(2000, 6)
    expect(coldGasThrust(0.01, 800)).toBeCloseTo(8, 12)
    expect(ionThrusterEfficiency(0.05, 1e-6, 1000)).not.toBeNull()
    expect(densityImpulse(1000, 300)).toBe(300_000)
  })
})

describe('gnss-optical', () => {
  it('pseudorange and RTT range', () => {
    const rho = gnssPseudorange(0, 0.07)
    expect(rho).toBeCloseTo(C * 0.07, 3)
    expect(laserRangeFromRtt(0.002)).toBeCloseTo(C * 0.001, 3)
  })

  it('GDOP finite for 4 tetrahedral-ish LOS', () => {
    const dop = gnssDopFromUnitVectors([
      [1, 0, 0.5],
      [-0.5, 0.866, 0.5],
      [-0.5, -0.866, 0.5],
      [0, 0, 1],
    ])
    expect(dop).not.toBeNull()
    expect(dop!.gdop).toBeGreaterThan(0)
    expect(dop!.gdop).toBeLessThan(20)
  })

  it('optical link and spot', () => {
    const pr = opticalLinkReceivedPower({
      ptW: 1,
      etaT: 0.5,
      etaR: 0.5,
      gt: 1e6,
      gr: 1e6,
      wavelengthM: 1.55e-6,
      rangeM: 1e6,
    })
    expect(pr).not.toBeNull()
    expect(pr!).toBeGreaterThan(0)
    expect(laserSpotRadius(1e6, 1e-5)).toBeCloseTo(10, 6)
  })

  it('tropo delay positive at mid elevation', () => {
    const d = saastamoinenTropoDelay(Math.PI / 4, 0.7, 100)
    expect(d).not.toBeNull()
    expect(d!).toBeGreaterThan(0)
  })
})

describe('discovery-wave', () => {
  it('RF reflection and VSWR', () => {
    const g = reflectionCoeff(50, 100)
    expect(g).not.toBeNull()
    expect(g!).toBeCloseTo(1 / 3, 12)
    expect(vswrFromGamma(g!)).toBeCloseTo(2, 12)
    expect(returnLossDb(g!)).toBeGreaterThan(0)
  })

  it('ballistics and free-fall', () => {
    const t = freeFallTimeConstG(100, G0)
    expect(t).not.toBeNull()
    expect(t!).toBeCloseTo(Math.sqrt(200 / G0), 10)
    const b = ballisticRangeFlat(100, Math.PI / 4)
    expect(b).not.toBeNull()
    expect(b!.range).toBeCloseTo(10000 / G0, 5)
    expect(terminalVelocity(100, 1, 1, 1.2)).not.toBeNull()
    expect(bankAngleRad(100, 500)).not.toBeNull()
  })

  it('slew, magnetic torque, walker, GEO budget', () => {
    const ts = slewTimeMin(0.1, 0.05, 0.01)
    expect(ts).not.toBeNull()
    expect(ts!).toBeGreaterThan(0)
    expect(magneticTorque(1, 3e-5, Math.PI / 2)).toBeCloseTo(3e-5, 12)
    const w = walkerSpacing(24, 3)
    expect(w!.satsPerPlane).toBe(8)
    const geo = geoStationkeepingDvYear()
    expect(geo.dVYear).toBe(50)
    const pb = geoPropellantBudget(1000, 220, 50, 15)
    expect(pb).not.toBeNull()
    expect(pb!.mProp).toBeGreaterThan(0)
  })

  it('coverage and tisserand', () => {
    // 500 km, 20° FOV: half-angle formula → ~177 km, not the old ~2400 km
    const sw = coverageSwathWidth(500_000, (20 * Math.PI) / 180)
    expect(sw).not.toBeNull()
    expect(sw!).toBeGreaterThan(100_000)
    expect(sw!).toBeLessThan(300_000)
    const T = tisserandParameter(1.5e11, 0.1, 0.1, 1.5e11)
    expect(T).not.toBeNull()
    expect(dopplerShiftHz(2e9, 1000)).toBeCloseTo((2e9 * 1000) / C, 3)
  })

  it('orbit lifetime includes radius a', () => {
    const t = orbitLifetimeRough(1e-12, 100, 7500, 50_000, 6_778_000)
    expect(t).not.toBeNull()
    // H β / (ρ v a) ≈ 50e3 * 100 / (1e-12 * 7500 * 6.778e6) ≈ 9.84e7 s ~ 3.1 yr
    expect(t!).toBeGreaterThan(1e7)
    expect(t!).toBeLessThan(5e8)
  })
})

import {
  opticalGsd,
  solarSailAccel,
  finiteBurnDv,
  bPlaneImpactParameter,
  jacobiConstant,
  stefanBoltzmannPower,
  wienPeakWavelength,
  captureCircularizeDv,
  flightPathAngle,
  meanAnomalyFromE,
  radarRangeResolution,
  linkMarginDb,
} from './discovery-wave'
import { hyperbolicEccentricity } from './hyperbolic'

describe('discovery pass 3', () => {
  it('optical GSD and solar sail', () => {
    expect(opticalGsd(500_000, 1e-5)).toBeCloseTo(5, 6)
    const a = solarSailAccel(1361, 100, 10, 1)
    expect(a).not.toBeNull()
    expect(a!).toBeGreaterThan(0)
  })

  it('finite burn and capture', () => {
    const dv = finiteBurnDv(3000, 1000, 2, 50)
    expect(dv).not.toBeNull()
    expect(dv!).toBeGreaterThan(0)
    expect(captureCircularizeDv(3.986e14, 6578e3, 1000)).not.toBeNull()
  })

  it('b-plane, jacobi, hyperbolic e', () => {
    expect(bPlaneImpactParameter(3.986e14, 3000, Math.PI / 2)).not.toBeNull()
    expect(jacobiConstant(0.8, 0, 0, 0.1, 0.01215)).not.toBeNull()
    expect(hyperbolicEccentricity(3.986e14, 6578e3, 3000)).toBeGreaterThan(1)
  })

  it('thermal, radar, Kepler helpers', () => {
    expect(stefanBoltzmannPower(1, 300, 1)).not.toBeNull()
    expect(wienPeakWavelength(5800)).not.toBeNull()
    expect(radarRangeResolution(50e6)).toBeCloseTo(C / 1e8, 3)
    expect(linkMarginDb(55, 45)).toBe(10)
    expect(meanAnomalyFromE(Math.PI / 3, 0.1)).not.toBeNull()
    expect(flightPathAngle(0.2, Math.PI / 4)).not.toBeNull()
  })
})
