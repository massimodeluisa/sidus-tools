/**
 * Expected numeric results for RF/comms/GNSS/optical/ADCS satellite-category tools,
 * sourced from shipped physics. See expected/index.ts for the verification chain
 * this module feeds.
 */
import {
  circularEclipseDuration,
  conjunctionPc2d,
  dataVolumeBits,
  diffractionLimitAngle,
  diffractionResolution,
  dopplerShiftHz,
  ebN0FromCn0,
  eclipseWithBeta,
  effectiveAperture,
  eirpDbW,
  eirpLinear,
  figureOfMeritGT,
  figureOfMeritGTDb,
  gravityGradientTorque,
  gnssPseudorange,
  horizonSlantRange,
  antennaBeamwidth,
  j2RaanRate,
  klobucharIonoDelayM,
  laserRangeFromRtt,
  laserRangeFromTof,
  laserSpotRadius,
  lightTime,
  linkBudget,
  linkMarginDb,
  magneticTorque,
  magnetorquerMoment,
  nyquistSampleRate,
  opticalLinkReceivedPower,
  opticalQFromSnr,
  orbitalPeriod,
  pointingBudgetRss,
  radarRangeResolution,
  radarReceivedPower,
  raanPeriodS,
  rainAttenuationDb,
  reflectionCoeff,
  residualDipoleTorque,
  returnLossDb,
  rwMomentum,
  sarAzimuthResolution,
  slewTimeMin,
  solarRadiationAccel,
  solarRadiationForce,
  starTrackerNoiseRad,
  sunSensorAngle,
  triadQuest,
  vswrFromGamma,
  wheelMomentum,
  wheelTorque,
  groundTrackShiftPerOrbit,
  EARTH_J2,
} from '../../../physics'
import { num, put, type ExpectedFn } from './shared'

/**
 * Tools whose snippets have no shipped counterpart with the same formula.
 * They return `{}` on purpose: the runner reports them as uncovered instead of
 * asserting numbers that shipped physics does not actually produce.
 */
export const UNVERIFIABLE_RF: Readonly<Record<string, string>> = {
  'gnss-geometry-gdop':
    'snippet computes an ad hoc "spread * horiz" portability proxy (its own comment: "full inv not portable"), not the shipped gnssDopFromUnitVectors matrix-inversion GDOP; the two formulas diverge for every input, not just an edge case.',
  'gnss-troposphere-delay':
    'snippet omits the "- tan(z)^2" term shipped saastamoinenTropoDelay subtracts inside the parens, and omits its height/latitude scale factor (exp(-h/7000) * (1+0.1 cos 2*lat)) entirely; the two formulas diverge for every input.',
}

export const RF_EXPECTED: Record<string, ExpectedFn> = {
  'link-budget': (bag) => {
    const gtDbi = num(bag, 'gt_dbi', 'gtDbi')
    const res = linkBudget({
      ptW: num(bag, 'pt_w', 'ptW'),
      gtDbi,
      grDbi: num(bag, 'gr_dbi', 'grDbi'),
      freqHz: num(bag, 'f_hz', 'fHz'),
      rangeM: num(bag, 'range_km', 'rangeKm') * 1000,
      otherLossDb: num(bag, 'other_loss_db', 'otherLossDb'),
      tSysK: num(bag, 't_sys_k', 'tSysK'),
      requiredCn0DbHz: num(bag, 'required_cn0_dbhz', 'requiredCn0'),
    })
    const out: Record<string, number> = {}
    if (!res) return out
    put(out, ['lfs_db', 'lfsDb'], res.lfsDb)
    put(out, ['pt_dbw', 'ptDbw'], res.eirpDbw - gtDbi)
    put(out, ['eirp'], res.eirpDbw)
    put(out, ['pr_dbw', 'prDbw'], res.prDbw)
    put(out, ['pr_w', 'prW'], res.prW)
    put(out, ['cn0_dbhz', 'cn0DbHz'], res.cn0DbHz)
    put(out, ['margin'], res.marginDb)
    put(out, ['lam'], res.wavelengthM)
    return out
  },

  'antenna-gain-effective': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['Ae'], effectiveAperture(num(bag, 'G'), num(bag, 'lam')))
    return out
  },

  'nyquist-rate': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['fs'], nyquistSampleRate(num(bag, 'f_max', 'fmax')))
    return out
  },

  // —— GNSS / optical (gnss-optical.ts) ——

  'gnss-pseudorange': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['rho'],
      gnssPseudorange(num(bag, 'tTx'), num(bag, 'tRx'), num(bag, 'bias')),
    )
    return out
  },

  'gnss-ionosphere-klobuchar': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['d'],
      klobucharIonoDelayM(num(bag, 'elev'), num(bag, 'tecu'), num(bag, 'f')),
    )
    return out
  },

  'laser-link-budget': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['Pr'],
      opticalLinkReceivedPower({
        ptW: num(bag, 'pt'),
        etaT: num(bag, 'etaT'),
        etaR: num(bag, 'etaR'),
        gt: num(bag, 'gt'),
        gr: num(bag, 'gr'),
        wavelengthM: num(bag, 'lam'),
        rangeM: num(bag, 'R'),
        lossLin: num(bag, 'L'),
      }),
    )
    return out
  },

  'laser-pointing-jitter': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['r_spot'], laserSpotRadius(num(bag, 'R'), num(bag, 'theta')))
    return out
  },

  'laser-time-of-flight': (bag) => {
    const t = num(bag, 't')
    const out: Record<string, number> = {}
    put(out, ['R_rtt'], laserRangeFromRtt(t))
    put(out, ['R_one'], laserRangeFromTof(t))
    return out
  },

  'optical-ber-q': (bag) => {
    const snrLin = 10 ** (num(bag, 'snrDb') / 10)
    const out: Record<string, number> = {}
    put(out, ['Q'], opticalQFromSnr(snrLin))
    return out
  },

  'geo-light-time': () => {
    // No free vars: the snippet hardcodes h_GEO=35786000 m and c=299792458 m/s
    // (constants, not injected inputs), so every scenario is the same number.
    const out: Record<string, number> = {}
    put(out, ['t'], lightTime(35_786_000))
    return out
  },

  // —— RF extras (discovery-wave.ts) ——

  'impedance-matching': (bag) => {
    const z0 = num(bag, 'z0')
    const zL = num(bag, 'zL')
    const gamma = reflectionCoeff(z0, zL)
    const out: Record<string, number> = {}
    put(out, ['G'], gamma)
    if (gamma != null) {
      put(out, ['VSWR'], vswrFromGamma(gamma))
      put(out, ['RL'], returnLossDb(gamma))
    }
    return out
  },

  'doppler-shift-leo': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['fd'], dopplerShiftHz(num(bag, 'f0'), num(bag, 'vr')))
    return out
  },

  'radar-equation': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['Pr'],
      radarReceivedPower({
        pt: num(bag, 'pt'),
        g: num(bag, 'G'),
        wavelength: num(bag, 'lam'),
        rcs: num(bag, 'rcs'),
        range: num(bag, 'R'),
      }),
    )
    return out
  },

  'rain-attenuation-simple': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['A'],
      rainAttenuationDb(num(bag, 'rate'), num(bag, 'path'), num(bag, 'k'), num(bag, 'alpha')),
    )
    return out
  },

  'ttc-ebno': (bag) => {
    const cn0Lin = 10 ** (num(bag, 'cn0') / 10)
    const rb = num(bag, 'rb')
    const ebn0 = ebN0FromCn0(cn0Lin, rb)
    const out: Record<string, number> = {}
    put(out, ['cn0_lin'], cn0Lin)
    if (ebn0 != null) {
      put(out, ['ebn0'], ebn0)
      put(out, ['ebn0_db'], 10 * Math.log10(ebn0))
    }
    return out
  },

  'sar-azimuth-resolution': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['daz'], sarAzimuthResolution(num(bag, 'lam'), num(bag, 'theta')))
    return out
  },

  'radar-range-resolution': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['dr'], radarRangeResolution(num(bag, 'B')))
    return out
  },

  'link-margin': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['margin'], linkMarginDb(num(bag, 'cn0'), num(bag, 'req')))
    return out
  },

  'diffraction-limit': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['theta'], diffractionLimitAngle(num(bag, 'lam'), num(bag, 'D')))
    return out
  },

  'data-volume': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['V'],
      dataVolumeBits(num(bag, 'R'), num(bag, 'T'), num(bag, 'eta')),
    )
    return out
  },

  // —— Antenna / horizon / diffraction (ops.ts, power.ts) ——

  'horizon-range': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['d'], horizonSlantRange(num(bag, 'h'), num(bag, 'R')))
    return out
  },

  'antenna-beamwidth': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['theta'],
      antennaBeamwidth(num(bag, 'f'), num(bag, 'D'), num(bag, 'k')),
    )
    return out
  },

  diffraction: (bag) => {
    const res = diffractionResolution(num(bag, 'f'), num(bag, 'D'), num(bag, 'range_m'))
    const out: Record<string, number> = {}
    if (!res) return out
    put(out, ['theta'], res.thetaRad)
    put(out, ['gsd'], res.gsdM)
    return out
  },

  'eirp-gt': (bag) => {
    const P = num(bag, 'P')
    const G = num(bag, 'G')
    const Tsys = num(bag, 'Tsys')
    const out: Record<string, number> = {}
    put(out, ['eirp'], eirpLinear(P, G))
    put(out, ['gt'], figureOfMeritGT(G, Tsys))
    put(out, ['eirp_dbw'], eirpDbW(P, G))
    put(out, ['gt_db'], figureOfMeritGTDb(G, Tsys))
    return out
  },

  // —— ADCS / pointing (discovery-wave.ts, power.ts, wave10/11.ts) ——

  'reaction-wheel': (bag) => {
    const I = num(bag, 'I')
    const omega = (num(bag, 'rpm') * 2 * Math.PI) / 60
    const out: Record<string, number> = {}
    put(out, ['H', 'h'], wheelMomentum(I, omega))
    put(out, ['torque'], wheelTorque(I, num(bag, 'alpha')))
    return out
  },

  'slew-rate-pointing': (bag) => {
    // Snippet always prints the triangular-profile (accel-limited) time t_acc
    // regardless of dth vs wmax^2/amax; only valid to compare in that regime
    // (see UNVERIFIABLE_RF-style note in the report: coast-phase branch is dead code).
    const out: Record<string, number> = {}
    put(out, ['t'], slewTimeMin(num(bag, 'dth'), num(bag, 'wmax'), num(bag, 'amax')))
    return out
  },

  'magnetic-torque': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['tau'], magneticTorque(num(bag, 'm'), num(bag, 'B'), num(bag, 'ang')))
    return out
  },

  'gravity-gradient-torque': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['tau'],
      gravityGradientTorque(num(bag, 'mu'), num(bag, 'r'), num(bag, 'dI'), num(bag, 'delta')),
    )
    return out
  },

  'rw-momentum-capacity': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['h'], rwMomentum(num(bag, 'I'), num(bag, 'w')))
    return out
  },

  'sun-sensor-cone': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['theta'],
      sunSensorAngle(
        [num(bag, 'bx'), num(bag, 'by'), num(bag, 'bz')],
        [num(bag, 'sx'), num(bag, 'sy'), num(bag, 'sz')],
      ),
    )
    return out
  },

  'star-tracker-noise': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['sigma'], starTrackerNoiseRad(num(bag, 'pix'), num(bag, 'n')))
    return out
  },

  'magnetorquer-moment': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['m'],
      magnetorquerMoment(num(bag, 'N'), num(bag, 'I'), num(bag, 'A')),
    )
    return out
  },

  'pointing-budget-rss': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['sigma'],
      pointingBudgetRss([num(bag, 's1'), num(bag, 's2'), num(bag, 's3')]),
    )
    return out
  },

  'residual-dipole-torque': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['tau'], residualDipoleTorque(num(bag, 'm'), num(bag, 'B')))
    return out
  },

  'conjunction-pc': (bag) => {
    const out: Record<string, number> = {}
    put(
      out,
      ['pc'],
      conjunctionPc2d(num(bag, 'miss'), num(bag, 'sx'), num(bag, 'sy'), num(bag, 'rad')),
    )
    return out
  },

  'quest-attitude': (bag) => {
    // Snippet's `cosres` is TRIAD's cos(residual angle); shipped triadQuest
    // returns the angle itself (residualTriad = acos(...)), so Math.cos inverts
    // it back for comparison (trivial output arithmetic, not a re-derivation).
    const est = triadQuest({
      w1: [num(bag, 'w1x'), num(bag, 'w1y'), num(bag, 'w1z')],
      w2: [num(bag, 'w2x'), num(bag, 'w2y'), num(bag, 'w2z')],
      v1: [num(bag, 'v1x'), num(bag, 'v1y'), num(bag, 'v1z')],
      v2: [num(bag, 'v2x'), num(bag, 'v2y'), num(bag, 'v2z')],
    })
    const out: Record<string, number> = {}
    if (est) put(out, ['cosres'], Math.cos(est.residualTriad))
    return out
  },

  // —— Orbit-adjacent satellite-ops tools (power.ts, mission.ts, j2.ts) ——

  'ground-track': (bag) => {
    const mu = num(bag, 'mu')
    const a = num(bag, 'R') + num(bag, 'h')
    const T = orbitalPeriod(mu, a)
    const out: Record<string, number> = {}
    put(out, ['T', 't'], T)
    put(out, ['dL', 'd_l'], groundTrackShiftPerOrbit(T))
    return out
  },

  'eclipse-duration': (bag) => {
    const R = num(bag, 'R')
    const a = R + num(bag, 'h')
    const ecl = circularEclipseDuration(a, R)
    const out: Record<string, number> = {}
    if (ecl) put(out, ['t_ecl'], num(bag, 'T') * ecl.fraction)
    return out
  },

  'eclipse-beta': (bag) => {
    const mu = num(bag, 'mu')
    const R = num(bag, 'R')
    const a = R + num(bag, 'h')
    const T = orbitalPeriod(mu, a)
    const out: Record<string, number> = {}
    put(out, ['T', 't'], T)
    put(out, ['t_ecl'], eclipseWithBeta(a, R, num(bag, 'betaRad'), T))
    return out
  },

  'nodal-period': (bag) => {
    const mu = num(bag, 'mu')
    const a = num(bag, 'a')
    const e = num(bag, 'e')
    const iRad = num(bag, 'i')
    const R = num(bag, 'R')
    const raanRate = j2RaanRate(mu, a, e, iRad, EARTH_J2, R)
    const out: Record<string, number> = {}
    if (raanRate != null) put(out, ['T', 't'], raanPeriodS(raanRate))
    return out
  },

  'solar-pressure': (bag) => {
    const A = num(bag, 'A')
    const Cr = num(bag, 'Cr')
    const rAu = num(bag, 'r_au')
    const m = num(bag, 'm')
    const out: Record<string, number> = {}
    put(out, ['F', 'f'], solarRadiationForce(A, Cr, rAu))
    put(out, ['a'], solarRadiationAccel(m, A, Cr, rAu))
    return out
  },
}
