/**
 * Expected numeric results for ground-ops/tracking pilot tools, sourced from shipped physics.
 * See expected/index.ts for the verification chain this module feeds.
 */
import {
  aerobrakingDv,
  angularDiameter,
  bankAngleRad,
  ballisticCoefficient,
  ballisticRangeFlat,
  batteryDepthOfDischarge,
  batteryEndurance,
  batteryEnergyJ,
  circularOrbitVelocity,
  dragDeltaVPerRev,
  dragForce,
  earthIrFlux,
  epsOrbitAverage,
  escapeVelocity,
  exponentialDensity,
  freeFallSpeedConstG,
  freeFallTimeConstG,
  hoopStress,
  lightTime,
  lightTimeRoundTrip,
  muFromMass,
  orbitalPeriod,
  panelEolPower,
  planckSpectralRadiance,
  relativityClockRate,
  solarArrayPower,
  solarFluxAtDistance,
  sphereOfInfluence,
  stefanBoltzmannPower,
  surfaceGravity,
  terminalVelocity,
  toSi,
  wienPeakWavelength,
} from '../../../physics'
import { num, put, type ExpectedFn } from './shared'

/**
 * Tools whose snippets have no shipped counterpart with the same input contract.
 * They return `{}` on purpose: the runner reports them as uncovered instead of
 * asserting numbers that shipped physics does not actually produce.
 */
export const UNVERIFIABLE_OPS: Readonly<Record<string, string>> = {
  'look-angles':
    'snippet uses a WGS-84 ellipsoid + ECEF satellite vector in a SEZ frame; shipped topocentricElAz is spherical and takes target lat/lon/height. js/ts additionally call satellite.js with new Date() (non-deterministic).',
}

export const OPS_EXPECTED: Record<string, ExpectedFn> = {
  // See UNVERIFIABLE_OPS: no shipped export shares this snippet's contract.
  'look-angles': () => ({}),

  plotter: (bag) => {
    const xmin = num(bag, 'xmin')
    const xmax = num(bag, 'xmax')
    const xMid = 0.5 * (xmin + xmax)
    const out: Record<string, number> = {}
    put(out, ['x_mid', 'xMid'], xMid)
    put(out, ['y_mid', 'yMid'], Math.sin(xMid))
    return out
  },

  units: (bag) => {
    const value = num(bag, 'value')
    const unitId = String(bag.fromId ?? '')
    const out: Record<string, number> = {}
    put(out, ['si'], toSi(value, unitId))
    return out
  },

  'custom-body': (bag) => {
    const M = num(bag, 'M')
    const R = num(bag, 'R')
    const h = num(bag, 'h')
    const a = num(bag, 'a')
    const m = num(bag, 'm')
    const mPrimary = num(bag, 'M_primary')
    const mu = muFromMass(M)
    const r = R + h
    const out: Record<string, number> = {}
    put(out, ['r'], r)
    put(out, ['r_soi', 'rSoi'], sphereOfInfluence(a, m, mPrimary))
    if (mu == null) return out
    put(out, ['mu'], mu)
    put(out, ['g', 'g_surf'], surfaceGravity(mu, R))
    put(out, ['v_esc', 'vEsc'], escapeVelocity(mu, r))
    put(out, ['v_circ', 'vCirc'], circularOrbitVelocity(mu, r))
    return out
  },

  'light-time': (bag) => {
    const rangeM = num(bag, 'range_m')
    const out: Record<string, number> = {}
    put(out, ['t'], lightTime(rangeM))
    put(out, ['rtt'], lightTimeRoundTrip(rangeM))
    return out
  },

  'ballistic-drag': (bag) => {
    const R = num(bag, 'R')
    const h = num(bag, 'h')
    const mu = num(bag, 'mu')
    const m = num(bag, 'm')
    const Cd = num(bag, 'Cd')
    const A = num(bag, 'A')
    const rho0 = num(bag, 'rho0')
    const H = num(bag, 'H')
    const r = R + h
    const v = circularOrbitVelocity(mu, r)
    const beta = ballisticCoefficient(m, Cd, A)
    const rho = exponentialDensity(h, rho0, H)
    const out: Record<string, number> = {}
    put(out, ['r'], r)
    put(out, ['a'], r)
    put(out, ['v'], v)
    put(out, ['beta'], beta)
    put(out, ['rho'], rho)
    if (beta == null || rho == null) return out
    put(out, ['dv'], dragDeltaVPerRev(rho, v, r, beta))
    return out
  },

  'solar-array': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['P', 'p'],
      solarArrayPower(num(bag, 'A'), num(bag, 'eta'), num(bag, 'ang'), num(bag, 'r_au')),
    )
    return out
  },

  battery: (bag) => {
    const cAh = num(bag, 'C_Ah')
    const V = num(bag, 'V')
    const P = num(bag, 'P')
    const E = batteryEnergyJ(cAh, V)
    const out: Record<string, number> = {}
    put(out, ['E', 'e'], E)
    if (E == null) return out
    put(out, ['t'], batteryEndurance(E, P))
    return out
  },

  'angular-diameter': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['alpha'], angularDiameter(num(bag, 'R'), num(bag, 'd')))
    return out
  },

  'drag-force': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['F', 'f'], dragForce(num(bag, 'rho'), num(bag, 'v'), num(bag, 'Cd'), num(bag, 'A')))
    return out
  },

  'scale-height': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['rho'], exponentialDensity(num(bag, 'h'), num(bag, 'rho0'), num(bag, 'H')))
    return out
  },

  'orbit-3d': (bag) => {
    const R = num(bag, 'R')
    const mu = num(bag, 'mu')
    const r1 = R + num(bag, 'h1')
    const r2 = R + num(bag, 'h2')
    const out: Record<string, number> = {}
    put(out, ['r1'], r1)
    put(out, ['r2'], r2)
    put(out, ['v1'], circularOrbitVelocity(mu, r1))
    put(out, ['T1', 't1'], orbitalPeriod(mu, r1))
    put(out, ['v2'], circularOrbitVelocity(mu, r2))
    put(out, ['T2', 't2'], orbitalPeriod(mu, r2))
    return out
  },

  'free-fall-time': (bag) => {
    const h = num(bag, 'h')
    const g = num(bag, 'g')
    const out: Record<string, number> = {}
    put(out, ['t'], freeFallTimeConstG(h, g))
    put(out, ['v'], freeFallSpeedConstG(h, g))
    return out
  },

  'ballistic-range': (bag) => {
    const res = ballisticRangeFlat(num(bag, 'v0'), num(bag, 'elev'), num(bag, 'g'))
    const out: Record<string, number> = {}
    if (!res) return out
    put(out, ['range_m'], res.range)
    put(out, ['tof'], res.tof)
    put(out, ['hmax'], res.hMax)
    return out
  },

  'terminal-velocity': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['v'],
      terminalVelocity(num(bag, 'm'), num(bag, 'Cd'), num(bag, 'A'), num(bag, 'rho'), num(bag, 'g')),
    )
    return out
  },

  'parachute-descent': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['v'],
      terminalVelocity(num(bag, 'm'), num(bag, 'Cd'), num(bag, 'A'), num(bag, 'rho')),
    )
    return out
  },

  'coordinated-turn-bank': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['phi'], bankAngleRad(num(bag, 'v'), num(bag, 'R'), num(bag, 'g')))
    return out
  },

  'eps-orbit-average': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['Pavg'], epsOrbitAverage(num(bag, 'psun'), num(bag, 'fecl'), num(bag, 'eta')))
    return out
  },

  'relativity-clock-rate': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['df_f'], relativityClockRate(num(bag, 'dPhi'), num(bag, 'v')))
    return out
  },

  'stefan-boltzmann': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['P'], stefanBoltzmannPower(num(bag, 'A'), num(bag, 'T'), num(bag, 'eps')))
    return out
  },

  'wien-peak': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['lam'], wienPeakWavelength(num(bag, 'T')))
    return out
  },

  'aerobraking-pass': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['dv'],
      aerobrakingDv(num(bag, 'ball'), num(bag, 'rho'), num(bag, 'v'), num(bag, 'L')),
    )
    return out
  },

  'panel-eol-power': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['P'], panelEolPower(num(bag, 'p0'), num(bag, 'd'), num(bag, 'years')))
    return out
  },

  'battery-dod': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['DoD'], batteryDepthOfDischarge(num(bag, 'eUsed'), num(bag, 'eCap')))
    return out
  },

  'hoop-stress': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['sigma'], hoopStress(num(bag, 'press'), num(bag, 'rad'), num(bag, 'thk')))
    return out
  },

  'exponential-density': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['rho'], exponentialDensity(num(bag, 'h'), num(bag, 'rho0'), num(bag, 'H')))
    return out
  },

  'solar-flux-distance': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['S'], solarFluxAtDistance(num(bag, 'r'), num(bag, 'S0')))
    return out
  },

  'earth-ir-flux': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['F'], earthIrFlux(num(bag, 'h'), num(bag, 'Te')))
    return out
  },

  'planck-radiance': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['B'], planckSpectralRadiance(num(bag, 'lam'), num(bag, 'T')))
    return out
  },
}
