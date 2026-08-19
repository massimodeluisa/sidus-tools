/**
 * Expected numeric results for orbital-mechanics pilot tools, sourced from shipped physics.
 * See expected/index.ts for the verification chain this module feeds.
 */
import {
  EARTH_J2,
  EARTH_MU,
  EARTH_RADIUS,
  EARTH_SIDEREAL_DAY_S,
  OMEGA_SUN,
  alongTrackFromDeltaM,
  apoapsisRaiseFromCircular,
  apsidesWithSpeeds,
  argPerigeeDriftJ2,
  biellipticTransfer,
  circularOrbitVelocity,
  circularizeBurn,
  coellipticDrift,
  coverageSwathWidth,
  criticalInclinationRad,
  cwMeanMotion,
  cwPropagate,
  degToRad,
  deltaAFromTangentialDv,
  deltaMFromAlongTrack,
  departureBurnFromCircular,
  deorbitBurn,
  dragMakeupDvPerRev,
  earthRotationBoost,
  elementsToRv,
  escapeVelocity,
  flightPathAngle,
  frozenEccentricityJ2J3,
  geoDriftRate,
  geoRadius,
  geoStationkeepingDvYear,
  gibbs,
  heoOrbitFromPerigee,
  hohmannTransfer,
  hohmannWithPlaneChange,
  herrickGibbs,
  hyperbolicEccentricity,
  hyperbolicPeriapsisSpeed,
  j2ArgpRate,
  j2RaanRate,
  jacobiConstant,
  keplerPropagate,
  lambertSolve,
  launchAzimuth,
  localGravity,
  losRangeRate,
  lunisolarRates,
  meanAnomalyFromE,
  meanMotion,
  meanMotionFromAltitude,
  oberthEnergyGain,
  opticalGsd,
  orbitLifetimeRough,
  orbitalPeriod,
  planeChangeDeltaV,
  radToDeg,
  repeatingGroundTrackPeriod,
  revisitTimeSimple,
  rvToElements,
  schweighartSedwick,
  semiMajorFromPeriod,
  specificEnergy,
  sphereOfInfluence,
  ssoInclination,
  ssoPeriod,
  synodicPeriod,
  umbraLength,
  vcross,
  vdot,
  visViva,
  vnorm,
  walkerSpacing,
} from '../../../physics'
import type { CwState, Vec3 } from '../../../physics'
import { num, put, type ExpectedFn, type ToleranceOverrides } from './shared'

export const ORBITS_EXPECTED: Record<string, ExpectedFn> = {
  'circular-orbit': (bag) => {
    const mu = num(bag, 'mu')
    const r = num(bag, 'R') + num(bag, 'h')
    const out: Record<string, number> = {}
    put(out, ['v'], circularOrbitVelocity(mu, r))
    put(out, ['T', 't'], orbitalPeriod(mu, r))
    put(out, ['g'], localGravity(mu, r))
    return out
  },

  hohmann: (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const t = hohmannTransfer(mu, R + num(bag, 'h1'), R + num(bag, 'h2'))
    const out: Record<string, number> = {}
    put(out, ['dv1'], t.dv1)
    put(out, ['dv2'], t.dv2)
    put(out, ['a'], t.a)
    put(out, ['tof'], t.tof)
    return out
  },

  'vis-viva': (bag) => {
    const mu = num(bag, 'mu')
    const out: Record<string, number> = {}
    put(out, ['v'], visViva(mu, num(bag, 'r'), num(bag, 'a')))
    put(out, ['energy'], specificEnergy(mu, num(bag, 'a')))
    return out
  },

  'plane-change': (bag) => {
    const di = degToRad(num(bag, 'di_deg', 'diDeg'))
    const out: Record<string, number> = {}
    put(out, ['di'], di)
    put(out, ['dv'], planeChangeDeltaV(num(bag, 'v'), di))
    return out
  },

  'j2-drift': (bag) => {
    const mu = num(bag, 'mu')
    const a = num(bag, 'a')
    const e = num(bag, 'e')
    const iRad = num(bag, 'i', 'i_rad', 'iRad')
    const rEq = num(bag, 'R', 'r_eq')
    const raan = j2RaanRate(mu, a, e, iRad, EARTH_J2, rEq)
    const argp = j2ArgpRate(mu, a, e, iRad, EARTH_J2, rEq)
    const out: Record<string, number> = {}
    put(out, ['J2', 'j2'], EARTH_J2)
    put(out, ['n'], meanMotion(mu, a))
    put(out, ['dOmega', 'd_omega', 'draan'], raan)
    put(out, ['domega', 'd_argp', 'dargp'], argp)
    if (raan != null)
      put(out, ['dOmega_deg_day', 'd_omega_deg_day', 'draan_deg_day'], radToDeg(raan) * 86400)
    if (argp != null)
      put(out, ['domega_deg_day', 'd_argp_deg_day', 'dargp_deg_day'], radToDeg(argp) * 86400)
    return out
  },

  'kepler-propagate': (bag) => {
    const r0: Vec3 = [num(bag, 'rx'), num(bag, 'ry'), num(bag, 'rz')]
    const v0: Vec3 = [num(bag, 'vx'), num(bag, 'vy'), num(bag, 'vz')]
    const out: Record<string, number> = {}
    put(out, ['r0n'], vnorm(r0))
    put(out, ['v0n'], vnorm(v0))
    put(out, ['rdv'], vdot(r0, v0))
    const propagated = keplerPropagate(num(bag, 'mu'), { r: r0, v: v0 }, num(bag, 'dt_s'))
    if (!propagated) {
      throw new Error('kepler-propagate: keplerPropagate returned null for the verification input bag')
    }
    put(out, ['r_x'], propagated.r[0])
    put(out, ['r_y'], propagated.r[1])
    put(out, ['r_z'], propagated.r[2])
    put(out, ['v_x'], propagated.v[0])
    put(out, ['v_y'], propagated.v[1])
    put(out, ['v_z'], propagated.v[2])
    return out
  },

  escape: (bag) => {
    const mu = num(bag, 'mu')
    const r = num(bag, 'R') + num(bag, 'h')
    const vEsc = escapeVelocity(mu, r)
    const vc = circularOrbitVelocity(mu, r)
    const out: Record<string, number> = {}
    put(out, ['r'], r)
    put(out, ['v_esc', 'vEsc'], vEsc)
    put(out, ['v_c', 'vC'], vc)
    put(out, ['ratio'], vEsc / vc)
    return out
  },

  bielliptic: (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const t = biellipticTransfer(mu, R + num(bag, 'h1'), R + num(bag, 'h2'), R + num(bag, 'hb'))
    const out: Record<string, number> = {}
    put(out, ['dv1'], t.dv1)
    put(out, ['dv2'], t.dv2)
    put(out, ['dv3'], t.dv3)
    put(out, ['dv'], t.dvTotal)
    put(out, ['tof'], t.tof)
    put(out, ['a1'], t.a1)
    put(out, ['a2'], t.a2)
    return out
  },

  lambert: (bag) => {
    const mu = num(bag, 'mu')
    const ang = num(bag, 'ang_rad')
    const r1m = num(bag, 'r1_m')
    const r2m = num(bag, 'r2_m')
    const r1: Vec3 = [r1m, 0, 0]
    const r2: Vec3 = [r2m * Math.cos(ang), r2m * Math.sin(ang), 0]
    const sol = lambertSolve(mu, r1, r2, num(bag, 'tof_s'), true)
    if (!sol) throw new Error('lambert: lambertSolve returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['v1_x', 'v1x'], sol.v1[0])
    put(out, ['v1_y', 'v1y'], sol.v1[1])
    put(out, ['v1_z', 'v1z'], sol.v1[2])
    put(out, ['v2_x', 'v2x'], sol.v2[0])
    put(out, ['v2_y', 'v2y'], sol.v2[1])
    put(out, ['v2_z', 'v2z'], sol.v2[2])
    put(out, ['dnu'], sol.dnu)
    return out
  },

  /**
   * python/js/ts define rv_to_elements/rvToElements but never call or print
   * anything (no top-level statement outside the function body): confirmed by
   * rendering those three languages' live code, which produces only the live-input
   * preamble with zero print lines. Those three cells are expected to fail-parse;
   * see the report for this found snippet bug. c/cpp/rust/zig/fortran only compute
   * through `i` (no raan/argp/nu branches); matlab/julia compute the full set.
   */
  'rv-elements': (bag) => {
    const mu = num(bag, 'mu')
    const r: Vec3 = [num(bag, 'rx'), num(bag, 'ry'), num(bag, 'rz')]
    const v: Vec3 = [num(bag, 'vx'), num(bag, 'vy'), num(bag, 'vz')]
    const el = rvToElements(r, v, mu)
    if (!el) throw new Error('rv-elements: rvToElements returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['rmag'], vnorm(r))
    put(out, ['vmag'], vnorm(v))
    const hvec = vcross(r, v)
    put(out, ['hx'], hvec[0])
    put(out, ['hy'], hvec[1])
    put(out, ['hz'], hvec[2])
    put(out, ['h'], el.h)
    put(out, ['rdv'], vdot(r, v))
    put(out, ['e'], el.e)
    put(out, ['energy'], el.energy)
    put(out, ['a'], el.a)
    put(out, ['i'], el.i)
    put(out, ['raan'], el.raan)
    put(out, ['argp'], el.argp)
    put(out, ['nu'], el.nu)
    return out
  },

  apsides: (bag) => {
    const s = apsidesWithSpeeds(num(bag, 'mu'), num(bag, 'a'), num(bag, 'e'))
    if (!s) throw new Error('apsides: apsidesWithSpeeds returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['rp'], s.rp)
    put(out, ['ra'], s.ra)
    put(out, ['vp'], s.vp)
    put(out, ['va'], s.va)
    return out
  },

  bodies: (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const out: Record<string, number> = {}
    put(out, ['v_circ', 'vCirc'], circularOrbitVelocity(mu, R))
    put(out, ['v_esc', 'vEsc'], escapeVelocity(mu, R))
    put(out, ['g_surf', 'gSurf'], localGravity(mu, R))
    return out
  },

  'launch-azimuth': (bag) => {
    const lat = num(bag, 'lat')
    const i = num(bag, 'i')
    const az = launchAzimuth(lat, i)
    if (!az) throw new Error('launch-azimuth: launchAzimuth returned null for the verification input bag')
    // The snippet's `beta`/`az1` are the raw asin(...) principal value (range
    // [-pi/2, pi/2]); the shipped launchAzimuth() only exposes the wrapped
    // [0, 2pi) form. Undo the wrap (same angle mod 2pi) rather than re-deriving
    // the trig itself.
    const beta = az.azimuthRad > Math.PI ? az.azimuthRad - 2 * Math.PI : az.azimuthRad
    const out: Record<string, number> = {}
    put(out, ['beta'], beta)
    put(out, ['az1'], beta)
    put(out, ['az2'], az.complementaryRad)
    put(out, ['v_boost'], earthRotationBoost(lat, EARTH_RADIUS + num(bag, 'h')))
    return out
  },

  sso: (bag) => {
    const h = num(bag, 'h')
    const a = EARTH_RADIUS + h
    const i = ssoInclination(a, EARTH_MU, EARTH_RADIUS, EARTH_J2, OMEGA_SUN)
    const T = ssoPeriod(a, EARTH_MU)
    const out: Record<string, number> = {}
    put(out, ['i'], i)
    put(out, ['T', 't'], T)
    return out
  },

  'cw-rendezvous': (bag) => {
    const mu = num(bag, 'mu')
    const a = num(bag, 'R') + num(bag, 'h')
    const n = cwMeanMotion(mu, a)
    if (n == null) throw new Error('cw-rendezvous: cwMeanMotion returned null for the verification input bag')
    const s0: CwState = {
      x: num(bag, 'x'),
      y: num(bag, 'y'),
      z: num(bag, 'z'),
      vx: num(bag, 'vx'),
      vy: num(bag, 'vy'),
      vz: num(bag, 'vz'),
    }
    const sf = cwPropagate(n, s0, num(bag, 'tf'))
    if (!sf) throw new Error('cw-rendezvous: cwPropagate returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['x_f', 'xF'], sf.x)
    put(out, ['y_f', 'yF'], sf.y)
    put(out, ['z_f', 'zF'], sf.z)
    put(out, ['vx_f', 'vxF'], sf.vx)
    put(out, ['vy_f', 'vyF'], sf.vy)
    put(out, ['vz_f', 'vzF'], sf.vz)
    return out
  },

  phasing: (bag) => {
    const mu = num(bag, 'mu')
    const r = num(bag, 'R') + num(bag, 'h')
    const n_t = meanMotion(mu, r)!
    const T_t = orbitalPeriod(mu, r)
    const T_c = T_t + num(bag, 'phase') / (num(bag, 'n') * n_t)
    const a_c = Math.cbrt((mu * T_c * T_c) / (4 * Math.PI * Math.PI))
    const t = hohmannTransfer(mu, r, a_c)
    const out: Record<string, number> = {}
    put(out, ['n_t', 'nT'], n_t)
    put(out, ['T_t', 'TT', 't_t'], T_t)
    put(out, ['T_c', 'tc'], T_c)
    put(out, ['a_c', 'ac'], a_c)
    put(out, ['v1'], t.v1)
    put(out, ['v2'], t.v2)
    put(out, ['vp'], t.vPeri)
    put(out, ['va'], t.vApo)
    put(out, ['dv1'], t.dv1)
    put(out, ['dv2'], t.dv2)
    put(out, ['dv_total', 'dvTotal'], 2 * (t.dv1 + t.dv2))
    return out
  },

  'hyperbolic-c3': (bag) => {
    const mu = num(bag, 'mu')
    const r = num(bag, 'R') + num(bag, 'h')
    const vInf = num(bag, 'v_inf')
    const d = departureBurnFromCircular(mu, r, vInf)
    if (!d) throw new Error('hyperbolic-c3: departureBurnFromCircular returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['C3', 'c3'], d.c3)
    put(out, ['v_p'], d.vp)
    put(out, ['v_c'], d.vc)
    put(out, ['dv'], d.dv)
    put(out, ['e'], hyperbolicEccentricity(mu, r, vInf))
    return out
  },

  'hohmann-plane': (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const di = num(bag, 'di')
    const t = hohmannWithPlaneChange(mu, R + num(bag, 'h1'), R + num(bag, 'h2'), di)
    if (!t) throw new Error('hohmann-plane: hohmannWithPlaneChange returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['v1'], t.hohmann.v1)
    put(out, ['v2'], t.hohmann.v2)
    put(out, ['vp'], t.hohmann.vPeri)
    put(out, ['va'], t.hohmann.vApo)
    put(out, ['dv1'], t.dv1)
    put(out, ['dv2'], t.dv2)
    put(out, ['dv'], t.dvCombined)
    return out
  },

  soi: (bag) => {
    const out: Record<string, number> = {}
    put(out, ['r_soi', 'rSoi'], sphereOfInfluence(num(bag, 'a'), num(bag, 'm'), num(bag, 'M')))
    return out
  },

  'synodic-period': (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const out: Record<string, number> = {}
    put(out, ['t_syn', 'T_syn', 'tSyn'], synodicPeriod(mu, R + num(bag, 'h1'), R + num(bag, 'h2')))
    return out
  },

  circularize: (bag) => {
    const b = circularizeBurn(num(bag, 'mu'), num(bag, 'a'), num(bag, 'e'), 'apo')
    if (!b) throw new Error('circularize: circularizeBurn returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['r'], b.r)
    put(out, ['v_circ', 'vCirc'], b.vCirc)
    put(out, ['v_ell', 'vEll'], b.vEll)
    put(out, ['dv'], b.dv)
    return out
  },

  'geo-orbit': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['a'], geoRadius(num(bag, 'mu'), num(bag, 'T')))
    return out
  },

  'delta-a-burn': (bag) => {
    const a = num(bag, 'R') + num(bag, 'h')
    const mu = num(bag, 'mu')
    const v = circularOrbitVelocity(mu, a)
    const out: Record<string, number> = {}
    put(out, ['a'], a)
    put(out, ['v'], v)
    put(out, ['da'], deltaAFromTangentialDv(a, v, num(bag, 'dv')))
    return out
  },

  'plane-change-apo': (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const rp = R + num(bag, 'hp')
    const ra = R + num(bag, 'ha')
    const a = (rp + ra) / 2
    const v = visViva(mu, ra, a)
    const out: Record<string, number> = {}
    put(out, ['rp'], rp)
    put(out, ['ra'], ra)
    put(out, ['a'], a)
    put(out, ['v'], v)
    put(out, ['dv'], planeChangeDeltaV(v, num(bag, 'di')))
    return out
  },

  coelliptic: (bag) => {
    const mu = num(bag, 'mu')
    const a = num(bag, 'R') + num(bag, 'h')
    const d = coellipticDrift(mu, a, num(bag, 'da'))
    if (!d) throw new Error('coelliptic: coellipticDrift returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['a'], a)
    put(out, ['n'], d.n)
    put(out, ['n_rel', 'nRel'], d.nRel)
    return out
  },

  'los-range-rate': (bag) => {
    const x = num(bag, 'x')
    const vx = num(bag, 'vx')
    const r = losRangeRate([x, 0, 0], [vx, 0, 0])
    if (!r) throw new Error('los-range-rate: losRangeRate returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['rho'], r.range)
    put(out, ['rhodot'], r.rangeRate)
    return out
  },

  oberth: (bag) => {
    const v = circularOrbitVelocity(num(bag, 'mu'), num(bag, 'a'))
    const out: Record<string, number> = {}
    put(out, ['v'], v)
    put(out, ['dE'], oberthEnergyGain(v, num(bag, 'dv')))
    return out
  },

  deorbit: (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const b = deorbitBurn(mu, R + num(bag, 'h'), R + num(bag, 'hp'))
    if (!b) throw new Error('deorbit: deorbitBurn returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['a'], b.a)
    put(out, ['v_c', 'vC'], b.vc)
    put(out, ['v_a', 'vA'], b.vApo)
    put(out, ['dv'], b.dv)
    put(out, ['tof'], b.tofHalf)
    return out
  },

  'mean-motion': (bag) => {
    const m = meanMotionFromAltitude(num(bag, 'h'), num(bag, 'mu'), num(bag, 'R'))
    if (!m) throw new Error('mean-motion: meanMotionFromAltitude returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['a'], m.a)
    put(out, ['n'], m.n)
    return out
  },

  'apo-raise': (bag) => {
    const R = num(bag, 'R')
    const r = apoapsisRaiseFromCircular(num(bag, 'mu'), R + num(bag, 'h'), R + num(bag, 'ha'))
    if (!r) throw new Error('apo-raise: apoapsisRaiseFromCircular returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['a'], r.a)
    put(out, ['vp'], r.vp)
    put(out, ['vc'], r.vc)
    put(out, ['dv'], r.dv)
    return out
  },

  'along-track': (bag) => {
    const a = num(bag, 'R') + num(bag, 'h')
    const out: Record<string, number> = {}
    put(out, ['a'], a)
    put(out, ['dy_from_dM', 'dy_from_d_m'], alongTrackFromDeltaM(a, num(bag, 'dM')))
    put(out, ['dM_from_dy', 'd_m_from_dy'], deltaMFromAlongTrack(a, num(bag, 'dy')))
    return out
  },

  'period-match': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['a'], semiMajorFromPeriod(num(bag, 'mu'), num(bag, 'T')))
    return out
  },

  'hohmann-time': (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const t = hohmannTransfer(mu, R + num(bag, 'h1'), R + num(bag, 'h2'))
    const out: Record<string, number> = {}
    put(out, ['a'], t.a)
    put(out, ['tof'], t.tof)
    return out
  },

  'orbital-energy': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['eps'], specificEnergy(num(bag, 'mu'), num(bag, 'a')))
    return out
  },

  'true-anomaly': (bag) => {
    const mu = num(bag, 'mu')
    const state = elementsToRv(
      { a: num(bag, 'a'), e: num(bag, 'e'), i: 0, raan: 0, argp: 0, nu: num(bag, 'nu') },
      mu,
    )
    if (!state) throw new Error('true-anomaly: elementsToRv returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['r'], vnorm(state.r))
    return out
  },

  'flyby-speed': (bag) => {
    const mu = num(bag, 'mu')
    const r = num(bag, 'R') + num(bag, 'h')
    const out: Record<string, number> = {}
    put(out, ['r'], r)
    put(out, ['vp'], hyperbolicPeriapsisSpeed(mu, r, num(bag, 'vinf')))
    return out
  },

  'eccentric-anomaly': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['M', 'm'], meanAnomalyFromE(num(bag, 'Ea'), num(bag, 'e')))
    return out
  },

  'rendezvous-catchup': (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const r1 = R + num(bag, 'h1')
    const r2 = R + num(bag, 'h2')
    const T1 = orbitalPeriod(mu, r1)
    const T2 = orbitalPeriod(mu, r2)
    const phi = num(bag, 'phi')
    const out: Record<string, number> = {}
    put(out, ['T1', 't1'], T1)
    put(out, ['T2', 't2'], T2)
    put(out, ['N', 'n'], (phi / (2 * Math.PI)) * (T1 / Math.abs(T2 - T1)))
    return out
  },

  'sso-period': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['a'], EARTH_RADIUS + num(bag, 'h'))
    put(out, ['T'], ssoPeriod(EARTH_RADIUS + num(bag, 'h'), EARTH_MU))
    return out
  },

  'critical-inclination': () => {
    const out: Record<string, number> = {}
    put(out, ['i'], criticalInclinationRad())
    return out
  },

  'relative-period': (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const T1 = orbitalPeriod(mu, R + num(bag, 'h1'))
    const T2 = orbitalPeriod(mu, R + num(bag, 'h2'))
    const out: Record<string, number> = {}
    put(out, ['T1', 't1'], T1)
    put(out, ['T2', 't2'], T2)
    put(out, ['dT', 'd_t'], T2 - T1)
    return out
  },

  'energy-vinf': (bag) => {
    const mu = num(bag, 'mu')
    const r = num(bag, 'r')
    const v = num(bag, 'v')
    const el = rvToElements([r, 0, 0], [0, v, 0], mu)
    if (!el) throw new Error('energy-vinf: rvToElements returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['eps'], el.energy)
    put(out, ['vinf'], Math.sqrt(2 * Math.abs(el.energy)))
    return out
  },

  'specific-angular-momentum': (bag) => {
    const mu = num(bag, 'mu')
    const state = elementsToRv(
      { a: num(bag, 'a'), e: num(bag, 'e'), i: 0, raan: 0, argp: 0, nu: 0 },
      mu,
    )
    if (!state) throw new Error('specific-angular-momentum: elementsToRv returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['h'], vnorm(vcross(state.r, state.v)))
    return out
  },

  'escape-margin': (bag) => {
    const mu = num(bag, 'mu')
    const r = num(bag, 'R') + num(bag, 'h')
    const vc = circularOrbitVelocity(mu, r)
    const out: Record<string, number> = {}
    put(out, ['r'], r)
    put(out, ['vc'], vc)
    put(out, ['dv'], escapeVelocity(mu, r) - vc)
    return out
  },

  'constellation-walker': (bag) => {
    const w = walkerSpacing(num(bag, 'T'), num(bag, 'P'))
    if (!w) throw new Error('constellation-walker: walkerSpacing returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['spp'], w.satsPerPlane)
    put(out, ['d_in'], w.inPlaneSpacingRad)
    put(out, ['d_pl'], w.planeSpacingRad)
    return out
  },

  'coverage-swath': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['swath'], coverageSwathWidth(num(bag, 'h'), num(bag, 'fov')))
    return out
  },

  'revisit-time-simple': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['t_rev'], revisitTimeSimple(num(bag, 'T'), num(bag, 'swath')))
    return out
  },

  'geo-stationkeeping-dv': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['dv_year'], geoStationkeepingDvYear(num(bag, 'ns'), num(bag, 'ew')).dVYear)
    return out
  },

  'drag-make-up-dv': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['dv'], dragMakeupDvPerRev(num(bag, 'rho'), num(bag, 'a'), num(bag, 'v'), num(bag, 'B')))
    return out
  },

  'optical-gsd': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['GSD'], opticalGsd(num(bag, 'h'), num(bag, 'ifov')))
    return out
  },

  'cr3bp-jacobi': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['C'],
      jacobiConstant(num(bag, 'x'), num(bag, 'y'), num(bag, 'vx'), num(bag, 'vy'), num(bag, 'mu')),
    )
    return out
  },

  'orbit-lifetime-rough': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['t'],
      orbitLifetimeRough(num(bag, 'rho'), num(bag, 'beta'), num(bag, 'v'), num(bag, 'H'), num(bag, 'a')),
    )
    return out
  },

  'geo-drift-rate': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['rate'], geoDriftRate(num(bag, 'a'), num(bag, 'aGeo'), num(bag, 'nGeo')))
    return out
  },

  'arg-perigee-drift-j2': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['wdot'],
      argPerigeeDriftJ2(num(bag, 'n'), num(bag, 'j2'), num(bag, 'R'), num(bag, 'sma_p'), num(bag, 'i')),
    )
    return out
  },

  'umbra-length': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['L'], umbraLength(num(bag, 'd'), num(bag, 'Rs'), num(bag, 'Rb')))
    return out
  },

  'mean-anomaly-from-e': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['M'], meanAnomalyFromE(num(bag, 'E'), num(bag, 'e')))
    return out
  },

  'flight-path-angle': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['phi'], flightPathAngle(num(bag, 'e'), num(bag, 'nu')))
    return out
  },

  'repeating-ground-track': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['T'], repeatingGroundTrackPeriod(num(bag, 'k'), num(bag, 'days')))
    return out
  },

  'molniya-tundra': (bag) => {
    const kind = num(bag, 'kind')
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const h = num(bag, 'h')
    const o = heoOrbitFromPerigee({
      kind: kind > 0.5 ? 'tundra' : 'molniya',
      perigeeAlt: h,
      mu,
      bodyR: R,
    })
    if (!o) throw new Error('molniya-tundra: heoOrbitFromPerigee returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['Tsid'], EARTH_SIDEREAL_DAY_S)
    put(out, ['T'], o.period)
    put(out, ['a'], o.a)
    put(out, ['rp'], o.rp)
    put(out, ['ra'], o.ra)
    put(out, ['e'], o.e)
    put(out, ['i'], o.inclination)
    return out
  },

  'frozen-orbit': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['e'],
      frozenEccentricityJ2J3(num(bag, 'a'), num(bag, 'inc'), num(bag, 'j2'), num(bag, 'j3'), num(bag, 'Rb')),
    )
    return out
  },

  /**
   * c1/c2/c3 and the N/D/S/Lg/B intermediates are computed inside the shipped
   * herrickGibbs/gibbs functions but not returned: pure intermediates with no
   * shipped counterpart, omitted per the pilots' precedent (see module doc).
   */
  'herrick-gibbs': (bag) => {
    const mu = num(bag, 'mu')
    const r1: Vec3 = [num(bag, 'r1x'), num(bag, 'r1y'), num(bag, 'r1z')]
    const r2: Vec3 = [num(bag, 'r2x'), num(bag, 'r2y'), num(bag, 'r2z')]
    const r3: Vec3 = [num(bag, 'r3x'), num(bag, 'r3y'), num(bag, 'r3z')]
    const t1 = num(bag, 't1')
    const t2 = num(bag, 't2')
    const t3 = num(bag, 't3')
    const hg = herrickGibbs({ r1, r2, r3, t1, t2, t3, mu })
    const gb = gibbs({ r1, r2, r3, mu })
    if (!hg || !gb) throw new Error('herrick-gibbs: herrickGibbs/gibbs returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['r1n'], vnorm(r1))
    put(out, ['r2n'], vnorm(r2))
    put(out, ['r3n'], vnorm(r3))
    put(out, ['dt21'], t2 - t1)
    put(out, ['dt32'], t3 - t2)
    put(out, ['dt31'], t3 - t1)
    put(out, ['hv2x'], hg.v2[0])
    put(out, ['hv2y'], hg.v2[1])
    put(out, ['hv2z'], hg.v2[2])
    put(out, ['gv2x'], gb.v2[0])
    put(out, ['gv2y'], gb.v2[1])
    put(out, ['gv2z'], gb.v2[2])
    return out
  },

  'lunisolar-rates': (bag) => {
    const e = num(bag, 'e')
    const r = lunisolarRates({
      a: num(bag, 'a'),
      e,
      iRad: num(bag, 'inc'),
      mu: num(bag, 'mu'),
      mu3: num(bag, 'mu3'),
      d3: num(bag, 'd3'),
      i3: num(bag, 'i3_rad'),
      e3: num(bag, 'e3'),
    })
    if (!r) throw new Error('lunisolar-rates: lunisolarRates returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['n'], r.nSat)
    put(out, ['n3'], r.n3)
    put(out, ['se'], Math.sqrt(1 - e * e))
    put(out, ['p2'], r.p2)
    put(out, ['e3fac'], r.e3Fac)
    put(out, ['k'], ((r.n3 * r.n3) / r.nSat) * r.scale)
    put(out, ['raanDot'], r.raanRate)
    put(out, ['argpDot'], r.argpRate)
    return out
  },

  'schweighart-sedwick': (bag) => {
    const mu = num(bag, 'mu')
    const a = num(bag, 'a')
    const n = meanMotion(mu, a)
    const r = schweighartSedwick({
      a,
      iRad: num(bag, 'inc'),
      state0: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      dt: 0,
      mu,
      j2: num(bag, 'j2'),
      bodyR: num(bag, 'Rb'),
    })
    if (!r) throw new Error('schweighart-sedwick: schweighartSedwick returned null for the verification input bag')
    const out: Record<string, number> = {}
    put(out, ['n'], n)
    put(out, ['s'], r.s)
    put(out, ['nBar'], r.nBar)
    put(out, ['nZ'], r.nZ)
    return out
  },
}

/**
 * rv-elements `nu` on vallado-ex-2-4: acos ill-conditioning at |x|->1, not a formula
 * bug (see the python/js/ts/c/cpp/rust/fortran/julia/matlab bodies, all of which agree
 * with shipped physics here to well within this override). For this scenario the acos
 * argument is 2.6e-9 from 1; d(acos)/dx ~ 1.4e4 there, so a single last-bit difference
 * between independent libm implementations amplifies to ~1.5e-12 rad, comfortably
 * clearing the default 1e-9 relative gate's implied ~7e-14 rad absolute budget. A real
 * branch/sign/formula bug in this tool would miss by O(1) rad, eleven orders louder, so
 * the default relative gate still catches those on every other key and scenario.
 */
export const TOLERANCE_OVERRIDES_ORBITS: ToleranceOverrides = {
  'rv-elements': {
    'vallado-ex-2-4': {
      nu: {
        absTol: 1e-11,
        why: 'acos ill-conditioning at |x|->1: argument is 2.6e-9 from 1, d(acos)/dx~1.4e4 amplifies 1-ulp libm differences to ~1.5e-12 rad; absolute criterion justified, relative 1e-9 unattainable cross-libm',
      },
    },
  },
}
