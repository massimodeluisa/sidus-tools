/**
 * Expected numeric results for the crew/ECLSS, planetary/interplanetary, and
 * geometry-category tools, sourced from shipped physics.
 * See expected/index.ts for the verification chain this module feeds.
 */
import {
  angleBetween,
  bPlaneImpactParameter,
  bPlaneTarget,
  captureCircularizeDv,
  cabinFromMasses,
  characteristicEnergy,
  circularOrbitVelocity,
  coolantMassFlow,
  departureBurnFromCircular,
  escapeVelocity,
  greatCircleAngle,
  greatCircleDistance,
  heatFromFlow,
  heliocentricCircularState,
  heliocentricHohmann,
  hillSphere,
  hohmannPhaseAngle,
  hyperbolicEccentricity,
  hyperbolicPeriapsisSpeed,
  leakDepressTime,
  liohDuration,
  waterLoopBudget,
  paToMmHg,
  pumpCrankFlyby,
  surfaceGravity,
  thermalRadiatedPower,
  tisserandParameter,
} from '../../../physics'
import type { Vec3 } from '../../../physics'
import { num, put, type ExpectedFn } from './shared'

/** No planetary snippets currently lack an expected-value implementation. */
export const UNVERIFIABLE_PLANETARY: Readonly<Record<string, string>> = {}

export const PLANETARY_EXPECTED: Record<string, ExpectedFn> = {
  // ─── ECLSS / crew ────────────────────────────────────────────────────

  'cabin-atmosphere': (bag) => {
    const V = num(bag, 'V')
    const T = num(bag, 'T')
    const atm = cabinFromMasses(V, T, {
      o2: num(bag, 'm_O2'),
      n2: num(bag, 'm_N2'),
      co2: num(bag, 'm_CO2'),
      h2o: num(bag, 'm_H2O'),
    })
    const out: Record<string, number> = {}
    if (!atm) return out
    put(out, ['P', 'p'], atm.pTotalPa)
    put(out, ['ppO2', 'pp_o2'], atm.ppO2Pa)
    put(out, ['ppCO2', 'pp_co2'], atm.ppCO2Pa)
    put(out, ['ppH2O', 'pp_h2o'], atm.ppH2OPa)
    put(out, ['ppCO2_mmHg', 'pp_co2_mmhg'], paToMmHg(atm.ppCO2Pa))
    return out
  },

  'lioh-scrubber': (bag) => {
    const d = liohDuration(num(bag, 'm'), num(bag, 'co2RateManual'), num(bag, 'capacity'))
    const out: Record<string, number> = {}
    if (!d) return out
    put(out, ['co2Cap', 'co2_cap'], d.capacityKg)
    put(out, ['tS', 't_s'], d.durationS)
    return out
  },

  'cabin-leak': (bag) => {
    const t = leakDepressTime(
      num(bag, 'V'),
      num(bag, 'A'),
      num(bag, 'P0'),
      num(bag, 'P1'),
      num(bag, 'T'),
      num(bag, 'Cd'),
    )
    const out: Record<string, number> = {}
    put(out, ['t'], t)
    return out
  },

  'water-loop': (bag) => {
    const b = waterLoopBudget({
      potableKg: num(bag, 'potable'),
      hygieneKg: num(bag, 'hygiene'),
      flushKg: num(bag, 'flush'),
      o2Kg: num(bag, 'o2'),
      urineKg: num(bag, 'urine'),
      condensateKg: num(bag, 'condensate'),
      etaUrine: num(bag, 'eta_u'),
      etaCondensate: num(bag, 'eta_c'),
      etaHygiene: num(bag, 'eta_h'),
      crew: num(bag, 'crew'),
      durationS: num(bag, 'tS'),
      reserveFrac: num(bag, 'reserve'),
    })
    const out: Record<string, number> = {}
    if (!b) return out
    put(out, ['elec'], b.electrolysisKg)
    put(out, ['demand'], b.demandKg)
    put(out, ['recovered'], b.recoveredKg)
    put(out, ['makeup'], b.makeupKg)
    put(out, ['mission'], b.missionKg)
    put(out, ['openloop'], b.openLoopKg)
    put(out, ['saved'], b.savedKg)
    return out
  },

  'thermal-loop': (bag) => {
    const Q = num(bag, 'Q')
    const dT = num(bag, 'dT')
    const mdot = coolantMassFlow(Q, dT)
    const out: Record<string, number> = {}
    put(out, ['mdot'], mdot)
    if (mdot == null) return out
    put(out, ['Qcheck', 'Q_check', 'q_check'], heatFromFlow(mdot, dT))
    return out
  },

  'thermal-rad': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['Q', 'q'], thermalRadiatedPower(num(bag, 'A'), num(bag, 'T'), num(bag, 'eps')))
    return out
  },

  // ─── Planetary / interplanetary ─────────────────────────────────────

  'helio-hohmann': (bag) => {
    const mu = num(bag, 'mu')
    const r1 = num(bag, 'r1')
    const r2 = num(bag, 'r2')
    const h = heliocentricHohmann(r1, r2, mu)
    const out: Record<string, number> = {}
    if (!h) return out
    put(out, ['a'], h.a)
    put(out, ['dv1'], h.dv1)
    put(out, ['dv2'], h.dv2)
    put(out, ['tof'], h.tof)
    put(out, ['phase'], hohmannPhaseAngle(r1, r2))
    return out
  },

  'patched-conic-depart': (bag) => {
    const R = num(bag, 'R')
    const h = num(bag, 'h')
    const mu = num(bag, 'mu')
    const vInf = num(bag, 'v_inf')
    const rPark = R + h
    const burn = departureBurnFromCircular(mu, rPark, vInf)
    const out: Record<string, number> = {}
    put(out, ['r_park'], rPark)
    put(out, ['C3', 'c3'], characteristicEnergy(vInf))
    if (!burn) return out
    put(out, ['v_p'], burn.vp)
    put(out, ['v_c'], burn.vc)
    put(out, ['dv'], burn.dv)
    return out
  },

  'surface-g-escape': (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const rPark = num(bag, 'r_park')
    const out: Record<string, number> = {}
    put(out, ['g'], surfaceGravity(mu, R))
    put(out, ['v_esc'], escapeVelocity(mu, R))
    const vc = circularOrbitVelocity(mu, rPark)
    put(out, ['v_c'], vc)
    put(out, ['dv_esc'], escapeVelocity(mu, rPark) - vc)
    return out
  },

  'tisserand-parameter': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['Tpar'],
      tisserandParameter(num(bag, 'a'), num(bag, 'e'), num(bag, 'i'), num(bag, 'ap')),
    )
    return out
  },

  'b-plane-impact': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['b'], bPlaneImpactParameter(num(bag, 'mu'), num(bag, 'vinf'), num(bag, 'delta')))
    return out
  },

  'hyperbolic-eccentricity': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['e'], hyperbolicEccentricity(num(bag, 'mu'), num(bag, 'rp'), num(bag, 'vinf')))
    return out
  },

  'capture-circularize': (bag) => {
    const mu = num(bag, 'mu')
    const rp = num(bag, 'rp')
    const vinf = num(bag, 'vinf')
    const out: Record<string, number> = {}
    put(out, ['vp'], hyperbolicPeriapsisSpeed(mu, rp, vinf))
    put(out, ['vc'], circularOrbitVelocity(mu, rp))
    put(out, ['dv'], captureCircularizeDv(mu, rp, vinf))
    return out
  },

  'hill-sphere': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['rH'], hillSphere(num(bag, 'a'), num(bag, 'm'), num(bag, 'M')))
    return out
  },

  'porkchop-earth-mars': (bag) => {
    const mu = num(bag, 'mu')
    const aE = num(bag, 'aE')
    const LE0 = num(bag, 'LE0')
    const tDep = num(bag, 'tDep')
    const v1x = num(bag, 'v1x')
    const v1y = num(bag, 'v1y')
    const v1z = num(bag, 'v1z')
    const earth = heliocentricCircularState(aE, LE0, tDep, mu)
    const out: Record<string, number> = {}
    if (!earth) return out
    const [vEx, vEy] = earth.v
    put(out, ['nE'], Math.sqrt(mu / aE ** 3))
    put(out, ['LE'], earth.L)
    put(out, ['vEx'], vEx)
    put(out, ['vEy'], vEy)
    put(out, ['c3'], (v1x - vEx) ** 2 + (v1y - vEy) ** 2 + v1z ** 2)
    return out
  },

  'b-plane-target': (bag) => {
    const vInf: Vec3 = [num(bag, 'vx'), num(bag, 'vy'), num(bag, 'vz')]
    const t = bPlaneTarget({ vInf, mu: num(bag, 'mu'), rp: num(bag, 'rp'), clock: num(bag, 'theta') })
    const out: Record<string, number> = {}
    if (!t) return out
    put(out, ['v'], t.vInf)
    put(out, ['e'], t.e)
    put(out, ['b'], t.b)
    put(out, ['delta'], t.turn)
    put(out, ['bT'], t.bDotT)
    put(out, ['bR'], t.bDotR)
    return out
  },

  'pump-crank': (bag) => {
    const p = pumpCrankFlyby({
      vInf: num(bag, 'vinf'),
      mu: num(bag, 'mu'),
      rp: num(bag, 'rp'),
      pump: num(bag, 'pump'),
      crank: num(bag, 'crank'),
      // vPlanet only affects the heliocentric dvHelio/energyGain fields the snippet
      // never prints; the v_inf-frame e/turn/vInfOutMag it does print are independent
      // of vPlanet, so any positive placeholder satisfies the guard without affecting them.
      vPlanet: 1,
    })
    const out: Record<string, number> = {}
    if (!p) return out
    put(out, ['e'], p.e)
    put(out, ['delta'], p.turn)
    put(out, ['vout'], p.vInfOutMag)
    return out
  },

  // ─── Geometry ────────────────────────────────────────────────────────

  'spherical-distance': (bag) => {
    const lat1 = num(bag, 'lat1')
    const lon1 = num(bag, 'lon1')
    const lat2 = num(bag, 'lat2')
    const lon2 = num(bag, 'lon2')
    const R = num(bag, 'R')
    const out: Record<string, number> = {}
    put(out, ['c'], greatCircleAngle(lat1, lon1, lat2, lon2))
    put(out, ['s'], greatCircleDistance(R, lat1, lon1, lat2, lon2))
    // Shipped initialBearing() wraps a negative atan2(y,x) into [0, 2*pi); the snippet's
    // raw `bearing = atan2(y, x)` never wraps, so mirror that instead of calling initialBearing.
    const dLon = lon2 - lon1
    const y = Math.sin(dLon) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
    put(out, ['bearing'], Math.atan2(y, x))
    return out
  },

  'elevation-azimuth': (bag) => {
    const east = num(bag, 'east')
    const north = num(bag, 'north')
    const up = num(bag, 'up')
    const rho = Math.hypot(east, north, up)
    const el = Math.atan2(up, Math.hypot(east, north))
    const azRaw = Math.atan2(east, north)
    const az = azRaw < 0 ? azRaw + 2 * Math.PI : azRaw
    const out: Record<string, number> = {}
    put(out, ['rho'], rho)
    put(out, ['el'], el)
    put(out, ['az'], az)
    return out
  },

  'vector-angle': (bag) => {
    const a: Vec3 = [num(bag, 'ax'), num(bag, 'ay'), num(bag, 'az')]
    const b: Vec3 = [num(bag, 'bx'), num(bag, 'by'), num(bag, 'bz')]
    const out: Record<string, number> = {}
    put(out, ['theta'], angleBetween(a, b))
    return out
  },
}
