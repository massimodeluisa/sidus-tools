/**
 * Golden-case matrix: engineer regression anchors with cited source class.
 * Expected values use independent closed-form (or published-class bands).
 * `got` always calls shipped SIDUS physics exports.
 */
import {
  EARTH_MU,
  EARTH_RADIUS,
  EARTH_MASS,
  G0,
  C,
  AU,
  SUN_MU,
} from '../constants'
import {
  circularOrbitVelocity,
  escapeVelocity,
  hohmannTransfer,
  orbitalPeriod,
  planeChangeDeltaV,
  rocketDeltaV,
  visViva,
  biellipticTransfer,
  apsidesWithSpeeds,
  specificEnergyCircular,
  multiStageDeltaV,
  localGravity,
} from '../orbital'
import {
  characteristicEnergy,
  departureBurnFromCircular,
  hyperbolicEccentricity,
  gravityAssistTurn,
} from '../hyperbolic'
import {
  geoRadius,
  circularizeBurn,
  hohmannWithPlaneChange,
  deltaAFromTangentialDv,
} from '../maneuvers'
import {
  muFromMass,
  surfaceGravity,
  sphereOfInfluence,
  lightTime,
  synodicPeriod,
  circularEclipseDuration,
} from '../mission'
import { freeSpacePathLossDb, linkBudget } from '../link'
import { suttonGravesHeatFlux, SUTTON_GRAVES_K_EARTH } from '../ops'
import {
  propellantForDeltaV,
  idealThrust,
  massRatioForDeltaV,
  ispFromVe,
} from '../propulsion'
import {
  HELIO_SMA_M,
  heliocentricHohmann,
  hohmannPhaseAngle,
  patchedConicDeparture,
  surfaceAccess,
} from '../planetary'
import {
  greatCircleDistance,
  greatCircleAngle,
  topocentricElAz,
  angleBetween,
  geodeticToEcef,
  initialBearing,
} from '../geometry'
import { getBody } from '../bodies'
import { metabolicBudget, liohDuration } from '../eclss'
import { solarArrayPower, rcsDeltaV, angularDiameter } from '../power'
import type { GoldenCase } from './types'

const R = EARTH_RADIUS
const MU = EARTH_MU

/** Independent closed-form (must not call SIDUS exports). */
const ref = {
  vCirc: (mu: number, r: number) => Math.sqrt(mu / r),
  vEsc: (mu: number, r: number) => Math.sqrt((2 * mu) / r),
  period: (mu: number, a: number) => 2 * Math.PI * Math.sqrt((a * a * a) / mu),
  visViva: (mu: number, r: number, a: number) => Math.sqrt(mu * (2 / r - 1 / a)),
  plane: (v: number, di: number) => 2 * v * Math.sin(Math.abs(di) / 2),
  hohmann(mu: number, r1: number, r2: number) {
    const a = (r1 + r2) / 2
    const v1 = Math.sqrt(mu / r1)
    const v2 = Math.sqrt(mu / r2)
    const vp = Math.sqrt(mu * (2 / r1 - 1 / a))
    const va = Math.sqrt(mu * (2 / r2 - 1 / a))
    return {
      a,
      dv1: Math.abs(vp - v1),
      dv2: Math.abs(v2 - va),
      dvTotal: Math.abs(vp - v1) + Math.abs(v2 - va),
      tof: Math.PI * Math.sqrt((a * a * a) / mu),
    }
  },
  bielliptic(mu: number, r1: number, r2: number, rb: number) {
    const a1 = (r1 + rb) / 2
    const a2 = (r2 + rb) / 2
    const v1 = Math.sqrt(mu / r1)
    const v2 = Math.sqrt(mu / r2)
    const v1p = Math.sqrt(mu * (2 / r1 - 1 / a1))
    const v1b = Math.sqrt(mu * (2 / rb - 1 / a1))
    const v2b = Math.sqrt(mu * (2 / rb - 1 / a2))
    const v2p = Math.sqrt(mu * (2 / r2 - 1 / a2))
    return Math.abs(v1p - v1) + Math.abs(v2b - v1b) + Math.abs(v2 - v2p)
  },
}

// ─── two-body ─────────────────────────────────────────────────────────────

const twoBody: GoldenCase[] = [
  {
    id: 'tb-esc-surface',
    domain: 'two-body',
    name: 'Earth surface escape (spherical catalog μ,R)',
    source: 'Vallado Ch.1; Curtis §2.4; WGS-84-class μ⊕, R⊕',
    checks: [
      {
        key: 'v_esc',
        expected: ref.vEsc(MU, R),
        got: () => escapeVelocity(MU, R),
        relTol: 1e-15,
      },
      {
        key: 'v_esc_class_11_18_km_s',
        expected: 11.18e3,
        got: () => escapeVelocity(MU, R),
        relTol: 2e-3,
      },
    ],
  },
  {
    id: 'tb-leo-400',
    domain: 'two-body',
    name: 'Circular LEO 400 km: v and period',
    source: 'Curtis §2.4-2.5; Vallado circular-orbit formulas',
    checks: [
      {
        key: 'v_circ',
        expected: ref.vCirc(MU, R + 400e3),
        got: () => circularOrbitVelocity(MU, R + 400e3),
        relTol: 1e-15,
      },
      {
        key: 'period',
        expected: ref.period(MU, R + 400e3),
        got: () => orbitalPeriod(MU, R + 400e3),
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'tb-esc-circ-ratio',
    domain: 'two-body',
    name: 'v_esc / v_circ = √2',
    source: 'Curtis §2.4 identity',
    checks: [
      {
        key: 'ratio',
        expected: Math.SQRT2,
        got: () => {
          const r = R + 500e3
          return escapeVelocity(MU, r) / circularOrbitVelocity(MU, r)
        },
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'tb-visviva-ellipse',
    domain: 'two-body',
    name: 'Vis-viva peri/apo e=0.2 a=10 000 km',
    source: 'Vallado vis-viva; Curtis §2.4',
    checks: (() => {
      const a = 10_000e3
      const e = 0.2
      const rp = a * (1 - e)
      const ra = a * (1 + e)
      return [
        {
          key: 'v_peri',
          expected: ref.visViva(MU, rp, a),
          got: () => visViva(MU, rp, a),
          relTol: 1e-15,
        },
        {
          key: 'v_apo',
          expected: ref.visViva(MU, ra, a),
          got: () => visViva(MU, ra, a),
          relTol: 1e-15,
        },
      ]
    })(),
  },
  {
    id: 'tb-energy-circular',
    domain: 'two-body',
    name: 'Specific energy circular LEO',
    source: 'ε = −μ/(2a); Vallado Ch.1',
    checks: [
      {
        key: 'epsilon',
        expected: -MU / (2 * (R + 400e3)),
        got: () => specificEnergyCircular(MU, R + 400e3),
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'tb-apsides-speeds',
    domain: 'two-body',
    name: 'Apsides with speeds a=8000 km e=0.1',
    source: 'Curtis §2.4-2.6',
    checks: (() => {
      const a = 8000e3
      const e = 0.1
      const rp = a * (1 - e)
      const ra = a * (1 + e)
      return [
        { key: 'rp', expected: rp, got: () => apsidesWithSpeeds(MU, a, e)!.rp, relTol: 1e-15 },
        { key: 'ra', expected: ra, got: () => apsidesWithSpeeds(MU, a, e)!.ra, relTol: 1e-15 },
        {
          key: 'vp',
          expected: ref.visViva(MU, rp, a),
          got: () => apsidesWithSpeeds(MU, a, e)!.vp,
          relTol: 1e-14,
        },
        {
          key: 'va',
          expected: ref.visViva(MU, ra, a),
          got: () => apsidesWithSpeeds(MU, a, e)!.va,
          relTol: 1e-14,
        },
      ]
    })(),
  },
  {
    id: 'tb-moon-circ',
    domain: 'two-body',
    name: 'Moon 100 km circular speed from catalog μ',
    source: 'JPL/IAU-class Moon constants (catalog)',
    checks: [
      {
        key: 'v_circ',
        expected: (() => {
          const m = getBody('moon')
          return Math.sqrt(m.mu / (m.radius + 100e3))
        })(),
        got: () => {
          const m = getBody('moon')
          return circularOrbitVelocity(m.mu, m.radius + 100e3)
        },
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'tb-mars-escape',
    domain: 'two-body',
    name: 'Mars surface escape from catalog μ,R',
    source: 'JPL Horizons-class Mars μ,R (catalog)',
    checks: [
      {
        key: 'v_esc',
        expected: (() => {
          const m = getBody('mars')
          return Math.sqrt((2 * m.mu) / m.radius)
        })(),
        got: () => {
          const m = getBody('mars')
          return escapeVelocity(m.mu, m.radius)
        },
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'tb-local-g-leo',
    domain: 'two-body',
    name: 'Local g at 400 km = μ/r²',
    source: 'Newton inverse-square; Vallado',
    checks: [
      {
        key: 'g',
        expected: MU / (R + 400e3) ** 2,
        got: () => localGravity(MU, R + 400e3),
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'tb-period-iss-class',
    domain: 'two-body',
    name: '400 km period ~92.5 min class',
    source: 'Published LEO period band (spherical two-body)',
    checks: [
      {
        key: 'period_min',
        expected: 92.5,
        got: () => orbitalPeriod(MU, R + 400e3) / 60,
        relTol: 0.02,
      },
    ],
  },
]

// ─── maneuvers ────────────────────────────────────────────────────────────

const maneuvers: GoldenCase[] = [
  {
    id: 'mn-plane-60',
    domain: 'maneuvers',
    name: 'Pure plane change 60° at 7.5 km/s',
    source: 'Vallado; Curtis §6.6 Δv = 2v sin(Δi/2)',
    checks: [
      {
        key: 'dv',
        expected: ref.plane(7500, Math.PI / 3),
        got: () => planeChangeDeltaV(7500, Math.PI / 3),
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'mn-plane-90',
    domain: 'maneuvers',
    name: '90° plane change costs v√2',
    source: 'Δv = 2v sin(π/4) = v√2',
    checks: [
      {
        key: 'dv',
        expected: 7500 * Math.SQRT2,
        got: () => planeChangeDeltaV(7500, Math.PI / 2),
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'mn-hohmann-leo-geo',
    domain: 'maneuvers',
    name: 'Hohmann LEO 200 km → GEO 35786 km',
    source: 'Curtis §6.3; Vallado Hohmann; NASA GRC',
    checks: (() => {
      const r1 = R + 200e3
      const r2 = R + 35_786e3
      const exp = ref.hohmann(MU, r1, r2)
      const g = () => hohmannTransfer(MU, r1, r2)
      return [
        { key: 'dv1', expected: exp.dv1, got: () => g().dv1, relTol: 1e-14 },
        { key: 'dv2', expected: exp.dv2, got: () => g().dv2, relTol: 1e-14 },
        { key: 'dvTotal', expected: exp.dvTotal, got: () => g().dvTotal, relTol: 1e-14 },
        { key: 'tof', expected: exp.tof, got: () => g().tof, relTol: 1e-14 },
        { key: 'dvTotal_class_3_9_km_s', expected: 3.9e3, got: () => g().dvTotal, relTol: 0.05 },
      ]
    })(),
  },
  {
    id: 'mn-geo-sma',
    domain: 'maneuvers',
    name: 'GEO SMA from sidereal day 86164.0905 s',
    source: 'a³ = μ T²/(4π²)',
    checks: [
      {
        key: 'a',
        expected: Math.cbrt((MU * 86164.0905 ** 2) / (4 * Math.PI * Math.PI)),
        got: () => geoRadius(MU, 86164.0905)!,
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'mn-circularize-apo',
    domain: 'maneuvers',
    name: 'Circularize at apoapsis a=10 Mm e=0.2',
    source: 'Curtis circularization |v_ell − v_c|',
    checks: (() => {
      const a = 10_000e3
      const e = 0.2
      const ra = a * (1 + e)
      const vell = ref.visViva(MU, ra, a)
      const vc = ref.vCirc(MU, ra)
      return [
        {
          key: 'dv',
          expected: Math.abs(vell - vc),
          got: () => circularizeBurn(MU, a, e, 'apo')!.dv,
          relTol: 1e-12,
        },
      ]
    })(),
  },
  {
    id: 'mn-hohmann-plane-savings',
    domain: 'maneuvers',
    name: 'Combined Hohmann+plane cheaper than sequential (28.5°)',
    source: 'Vallado combined maneuvers; Curtis §6.6-6.7',
    checks: [
      {
        key: 'savings_gt_0',
        expected: 1,
        got: () => {
          const h = hohmannWithPlaneChange(MU, R + 200e3, R + 35_786e3, (28.5 * Math.PI) / 180)!
          return h.savings > 0 ? 1 : 0
        },
        absTol: 0,
      },
    ],
  },
  {
    id: 'mn-delta-a-gauss',
    domain: 'maneuvers',
    name: 'Gauss first-order Δa ≈ 2a Δv/v',
    source: 'Gauss variational equations (tangential); Vallado',
    checks: (() => {
      const a = R + 400e3
      const v = ref.vCirc(MU, a)
      const dv = 1
      return [
        {
          key: 'da',
          expected: (2 * a * dv) / v,
          got: () => deltaAFromTangentialDv(a, v, dv)!,
          relTol: 1e-14,
        },
      ]
    })(),
  },
  {
    id: 'mn-bielliptic',
    domain: 'maneuvers',
    name: 'Bielliptic three-burn Δv independent formula',
    source: 'Curtis §6.4 bielliptic',
    checks: [
      {
        key: 'dvTotal',
        expected: ref.bielliptic(MU, R + 300e3, R + 100e6, R + 400e6),
        got: () => biellipticTransfer(MU, R + 300e3, R + 100e6, R + 400e6).dvTotal,
        relTol: 1e-14,
      },
    ],
  },
  {
    id: 'mn-hohmann-tof-half-period',
    domain: 'maneuvers',
    name: 'Hohmann TOF = half transfer ellipse period',
    source: 'Curtis §6.3 TOF = π √(a_t³/μ)',
    checks: (() => {
      const r1 = R + 400e3
      const r2 = R + 2000e3
      const a = 0.5 * (r1 + r2)
      return [
        {
          key: 'tof',
          expected: Math.PI * Math.sqrt((a * a * a) / MU),
          got: () => hohmannTransfer(MU, r1, r2).tof,
          relTol: 1e-14,
        },
      ]
    })(),
  },
]

// ─── hyperbolic ───────────────────────────────────────────────────────────

const hyperbolic: GoldenCase[] = [
  {
    id: 'hy-c3',
    domain: 'hyperbolic',
    name: 'C3 = v_∞²',
    source: 'Vallado; NASA C3 definition',
    checks: [
      {
        key: 'c3',
        expected: 9e6,
        got: () => characteristicEnergy(3000),
        absTol: 0,
      },
    ],
  },
  {
    id: 'hy-depart-leo',
    domain: 'hyperbolic',
    name: 'Departure from 300 km circular, v_∞=2.5 km/s',
    source: 'Curtis §8.2-8.3; Vallado departure',
    checks: (() => {
      const r = R + 300e3
      const vInf = 2500
      const vp = Math.sqrt(vInf * vInf + (2 * MU) / r)
      const vc = Math.sqrt(MU / r)
      return [
        {
          key: 'vp',
          expected: vp,
          got: () => departureBurnFromCircular(MU, r, vInf)!.vp,
          relTol: 1e-14,
        },
        {
          key: 'dv',
          expected: vp - vc,
          got: () => departureBurnFromCircular(MU, r, vInf)!.dv,
          relTol: 1e-14,
        },
        {
          key: 'e',
          expected: 1 + (r * vInf * vInf) / MU,
          got: () => hyperbolicEccentricity(MU, r, vInf)!,
          relTol: 1e-14,
        },
      ]
    })(),
  },
  {
    id: 'hy-turn-angle',
    domain: 'hyperbolic',
    name: 'Gravity-assist turn δ = 2 arcsin(1/e)',
    source: 'Vallado flyby; Curtis §8.8',
    checks: [
      {
        key: 'delta',
        expected: 2 * Math.asin(1 / 1.5),
        got: () => gravityAssistTurn(1.5)!,
        relTol: 1e-14,
      },
    ],
  },
  {
    id: 'hy-parabolic-edge',
    domain: 'hyperbolic',
    name: 'v_∞=0 ⇒ e=1',
    source: 'Conic section classification',
    checks: [
      {
        key: 'e',
        expected: 1,
        got: () => hyperbolicEccentricity(MU, R + 200e3, 0)!,
        absTol: 1e-15,
      },
    ],
  },
  {
    id: 'hy-c3-zero-escape',
    domain: 'hyperbolic',
    name: 'Zero C3 is parabolic edge',
    source: 'C3=0 ⇔ v_∞=0',
    checks: [
      {
        key: 'c3',
        expected: 0,
        got: () => characteristicEnergy(0),
        absTol: 0,
      },
    ],
  },
]

// ─── planetary ────────────────────────────────────────────────────────────

const planetary: GoldenCase[] = [
  {
    id: 'pl-earth-mars-hohmann',
    domain: 'planetary',
    name: 'Heliocentric Earth→Mars Hohmann',
    source: 'Curtis §8.3; Vallado; JPL-class SMA fractions of AU',
    checks: (() => {
      const r1 = HELIO_SMA_M.earth
      const r2 = HELIO_SMA_M.mars
      const exp = ref.hohmann(SUN_MU, r1, r2)
      const g = () => heliocentricHohmann(r1, r2)!
      return [
        { key: 'tof', expected: exp.tof, got: () => g().tof, relTol: 1e-12 },
        { key: 'dvTotal', expected: exp.dvTotal, got: () => g().dvTotal, relTol: 1e-12 },
        { key: 'tof_days_class', expected: 259 * 86400, got: () => g().tof, relTol: 0.08 },
      ]
    })(),
  },
  {
    id: 'pl-earth-mars-phase',
    domain: 'planetary',
    name: 'Ideal Hohmann phase angle Earth→Mars',
    source: 'Curtis §8.3 φ = π(1 − (a_t/r₂)^{3/2})',
    checks: (() => {
      const r1 = HELIO_SMA_M.earth
      const r2 = HELIO_SMA_M.mars
      const aT = 0.5 * (r1 + r2)
      const phi = Math.PI * (1 - (aT / r2) ** 1.5)
      return [
        {
          key: 'phase',
          expected: phi,
          got: () => hohmannPhaseAngle(r1, r2)!,
          relTol: 1e-12,
        },
      ]
    })(),
  },
  {
    id: 'pl-earth-mars-synodic',
    domain: 'planetary',
    name: 'Earth-Mars synodic ~780 d',
    source: 'T_syn = 2π/|n₂−n₁|',
    checks: [
      {
        key: 't_syn_days',
        expected: 780,
        got: () => synodicPeriod(SUN_MU, HELIO_SMA_M.earth, HELIO_SMA_M.mars)! / 86400,
        relTol: 0.05,
      },
    ],
  },
  {
    id: 'pl-patched-c3',
    domain: 'planetary',
    name: 'Patched-conic Earth park → Mars: C3 = v_∞²',
    source: 'Patched-conic teaching; collinear v_∞',
    checks: [
      {
        key: 'c3_equals_vinf2',
        expected: 1,
        got: () => {
          const earth = getBody('earth')
          const res = patchedConicDeparture({
            rParkM: earth.radius + 200e3,
            muPlanet: earth.mu,
            rPlanetHelioM: HELIO_SMA_M.earth,
            rTargetHelioM: HELIO_SMA_M.mars,
          })!
          return Math.abs(res.c3 - res.vInf ** 2) < 1e-6 ? 1 : 0
        },
        absTol: 0,
      },
      {
        key: 'v_inf_class',
        expected: 3e3,
        got: () => {
          const earth = getBody('earth')
          return patchedConicDeparture({
            rParkM: earth.radius + 200e3,
            muPlanet: earth.mu,
            rPlanetHelioM: HELIO_SMA_M.earth,
            rTargetHelioM: HELIO_SMA_M.mars,
          })!.vInf
        },
        relTol: 0.25,
      },
    ],
  },
  {
    id: 'pl-moon-g',
    domain: 'planetary',
    name: 'Moon surface g ~1.62 m/s²',
    source: 'g=μ/R²; JPL-class Moon',
    checks: [
      {
        key: 'g',
        expected: 1.62,
        got: () => surfaceAccess({ body: getBody('moon') })!.g,
        relTol: 0.03,
      },
    ],
  },
  {
    id: 'pl-venus-earth-synodic',
    domain: 'planetary',
    name: 'Earth-Venus synodic ~584 d',
    source: 'Synodic period circular coplanar',
    checks: [
      {
        key: 't_syn_days',
        expected: 584,
        got: () => synodicPeriod(SUN_MU, HELIO_SMA_M.earth, HELIO_SMA_M.venus)! / 86400,
        relTol: 0.05,
      },
    ],
  },
  {
    id: 'pl-1au',
    domain: 'planetary',
    name: 'Earth heliocentric SMA = 1 AU',
    source: 'IAU AU definition',
    checks: [
      {
        key: 'a',
        expected: AU,
        got: () => HELIO_SMA_M.earth,
        absTol: 1,
      },
    ],
  },
  {
    id: 'pl-earth-jupiter-tof',
    domain: 'planetary',
    name: 'Earth→Jupiter Hohmann TOF multi-year class',
    source: 'Curtis interplanetary Hohmann',
    checks: [
      {
        key: 'tof_years',
        expected: 2.7,
        got: () =>
          heliocentricHohmann(HELIO_SMA_M.earth, HELIO_SMA_M.jupiter)!.tof /
          (86400 * 365.25),
        relTol: 0.15,
      },
    ],
  },
]

// ─── geometry ─────────────────────────────────────────────────────────────

const geometry: GoldenCase[] = [
  {
    id: 'geo-quarter-equator',
    domain: 'geometry',
    name: 'Equator 90° arc = R·π/2',
    source: 'Spherical law of cosines',
    checks: [
      {
        key: 'distance',
        expected: (R * Math.PI) / 2,
        got: () => greatCircleDistance(R, 0, 0, 0, Math.PI / 2)!,
        relTol: 1e-12,
      },
      {
        key: 'angle',
        expected: Math.PI / 2,
        got: () => greatCircleAngle(0, 0, 0, Math.PI / 2)!,
        relTol: 1e-12,
      },
    ],
  },
  {
    id: 'geo-poles-90',
    domain: 'geometry',
    name: 'Pole to equator 90°',
    source: 'Spherical geometry',
    checks: [
      {
        key: 'angle',
        expected: Math.PI / 2,
        got: () => greatCircleAngle(Math.PI / 2, 0, 0, 0)!,
        relTol: 1e-12,
      },
    ],
  },
  {
    id: 'geo-orthogonal',
    domain: 'geometry',
    name: 'Angle between basis vectors π/2',
    source: 'Euclidean 3D',
    checks: [
      {
        key: 'theta',
        expected: Math.PI / 2,
        got: () => angleBetween([1, 0, 0], [0, 1, 0])!,
        absTol: 1e-15,
      },
    ],
  },
  {
    id: 'geo-ecef-equator',
    domain: 'geometry',
    name: 'ECEF (0,0,h=0) → (R,0,0)',
    source: 'Spherical geodetic → ECEF',
    checks: [
      {
        key: 'x',
        expected: R,
        got: () => geodeticToEcef(0, 0, 0, R)![0],
        relTol: 1e-12,
      },
    ],
  },
  {
    id: 'geo-zenith',
    domain: 'geometry',
    name: 'Zenith target el≈90°, range≈400 km',
    source: 'Topocentric ENU; Vallado',
    checks: [
      {
        key: 'el_deg',
        expected: 90,
        got: () => {
          const lat = (45 * Math.PI) / 180
          return (topocentricElAz(lat, 0, 0, lat, 0, 400e3, R)!.el * 180) / Math.PI
        },
        absTol: 0.5,
      },
      {
        key: 'range',
        expected: 400e3,
        got: () => {
          const lat = (45 * Math.PI) / 180
          return topocentricElAz(lat, 0, 0, lat, 0, 400e3, R)!.range
        },
        relTol: 1e-6,
      },
    ],
  },
  {
    id: 'geo-bearing-east',
    domain: 'geometry',
    name: 'Equator eastbound bearing ≈ 90°',
    source: 'Forward azimuth on sphere',
    checks: [
      {
        key: 'az_deg',
        expected: 90,
        got: () => (initialBearing(0, 0, 0, 0.1)! * 180) / Math.PI,
        absTol: 0.5,
      },
    ],
  },
  {
    id: 'geo-zero-distance',
    domain: 'geometry',
    name: 'Identical points → distance 0',
    source: 'Great-circle identity',
    checks: [
      {
        key: 'd',
        expected: 0,
        got: () => greatCircleDistance(R, 0.3, 0.5, 0.3, 0.5)!,
        absTol: 1e-6,
      },
    ],
  },
  {
    id: 'geo-antipode',
    domain: 'geometry',
    name: 'Antipodal equator points angle π',
    source: 'Spherical geometry',
    checks: [
      {
        key: 'angle',
        expected: Math.PI,
        got: () => greatCircleAngle(0, 0, 0, Math.PI)!,
        relTol: 1e-12,
      },
    ],
  },
]

// ─── propulsion ───────────────────────────────────────────────────────────

const propulsion: GoldenCase[] = [
  {
    id: 'pr-tsiolkovsky',
    domain: 'propulsion',
    name: 'Tsiolkovsky Δv = Isp g0 ln(m0/mf)',
    source: 'Tsiolkovsky; Sutton; NASA GRC',
    checks: [
      {
        key: 'dv',
        expected: 300 * G0 * Math.log(10),
        got: () => rocketDeltaV(300, 10, 1),
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'pr-mass-ratio',
    domain: 'propulsion',
    name: 'Mass ratio R = exp(Δv/(Isp g0))',
    source: 'Invert Tsiolkovsky',
    checks: [
      {
        key: 'R',
        expected: Math.exp(3000 / (300 * G0)),
        got: () => massRatioForDeltaV(300, 3000)!,
        relTol: 1e-14,
      },
    ],
  },
  {
    id: 'pr-propellant',
    domain: 'propulsion',
    name: 'Propellant from dry mass and Δv',
    source: 'm0 = mf exp(Δv/ve)',
    checks: (() => {
      const isp = 320
      const dv = 2500
      const dry = 500
      const ratio = Math.exp(dv / (isp * G0))
      const m0 = dry * ratio
      return [
        {
          key: 'prop',
          expected: m0 - dry,
          got: () => propellantForDeltaV(isp, dv, dry)!.prop,
          relTol: 1e-12,
        },
      ]
    })(),
  },
  {
    id: 'pr-ideal-thrust',
    domain: 'propulsion',
    name: 'F = ṁ ve',
    source: 'Ideal rocket thrust',
    checks: [
      {
        key: 'F',
        expected: 300_000,
        got: () => idealThrust(100, 3000)!,
        absTol: 0,
      },
    ],
  },
  {
    id: 'pr-isp-ve',
    domain: 'propulsion',
    name: 'Isp = ve/g0',
    source: 'Isp definition',
    checks: [
      {
        key: 'Isp',
        expected: 3000 / G0,
        got: () => ispFromVe(3000)!,
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'pr-multi-stage',
    domain: 'propulsion',
    name: 'Two stages sum Δv',
    source: 'Ideal multi-stage',
    checks: (() => {
      const stages = [
        { ve: 3000, m0: 100_000, mf: 20_000 },
        { ve: 3200, m0: 15_000, mf: 4_000 },
      ]
      const exp =
        3000 * Math.log(100_000 / 20_000) + 3200 * Math.log(15_000 / 4_000)
      return [
        {
          key: 'dvTotal',
          expected: exp,
          got: () => multiStageDeltaV(stages)!.dvTotal,
          relTol: 1e-14,
        },
      ]
    })(),
  },
  {
    id: 'pr-zero-dv-ratio-1',
    domain: 'propulsion',
    name: 'Δv=0 ⇒ mass ratio 1',
    source: 'Tsiolkovsky limit',
    checks: [
      {
        key: 'R',
        expected: 1,
        got: () => massRatioForDeltaV(300, 0)!,
        absTol: 1e-15,
      },
    ],
  },
]

// ─── link RF ──────────────────────────────────────────────────────────────

const linkRf: GoldenCase[] = [
  {
    id: 'rf-fspl-1-1',
    domain: 'link-rf',
    name: 'FSPL 1 km, 1 MHz',
    source: 'Friis / ITU FSPL',
    checks: [
      {
        key: 'fspl_db',
        expected: 32.44,
        got: () => freeSpacePathLossDb(1, 1)!,
        absTol: 1e-12,
      },
    ],
  },
  {
    id: 'rf-fspl-1000-2g',
    domain: 'link-rf',
    name: 'FSPL 1000 km, 2 GHz',
    source: 'Friis FSPL',
    checks: [
      {
        key: 'fspl_db',
        expected: 20 * Math.log10(1000) + 20 * Math.log10(2000) + 32.44,
        got: () => freeSpacePathLossDb(1000, 2000)!,
        absTol: 1e-10,
      },
    ],
  },
  {
    id: 'rf-link-budget',
    domain: 'link-rf',
    name: 'Link budget finite C/N0, Pr < Pt',
    source: 'SMAD-class educational link',
    checks: [
      {
        key: 'ok',
        expected: 1,
        got: () => {
          const lb = linkBudget({
            ptW: 10,
            gtDbi: 5,
            grDbi: 20,
            freqHz: 2.2e9,
            rangeM: 1e6,
            otherLossDb: 2,
            tSysK: 200,
          })
          return lb && lb.cn0DbHz != null && Number.isFinite(lb.cn0DbHz) && lb.prW < 10
            ? 1
            : 0
        },
        absTol: 0,
      },
    ],
  },
  {
    id: 'rf-fspl-increases-with-range',
    domain: 'link-rf',
    name: 'FSPL grows with range',
    source: 'Friis monotonicity',
    checks: [
      {
        key: 'delta_db',
        expected: 1,
        got: () => {
          const a = freeSpacePathLossDb(100, 1000)!
          const b = freeSpacePathLossDb(1000, 1000)!
          return b > a ? 1 : 0
        },
        absTol: 0,
      },
    ],
  },
]

// ─── mission ──────────────────────────────────────────────────────────────

const mission: GoldenCase[] = [
  {
    id: 'ms-mu-gm',
    domain: 'mission',
    name: 'μ = G M',
    source: 'Newtonian GM; BIPM G',
    checks: [
      {
        key: 'mu',
        expected: 6.6743e-11 * 1e24,
        got: () => muFromMass(1e24)!,
        relTol: 1e-12,
      },
    ],
  },
  {
    id: 'ms-surface-g',
    domain: 'mission',
    name: 'Earth surface g = μ/R²',
    source: 'Vallado spherical Earth',
    checks: [
      {
        key: 'g',
        expected: MU / (R * R),
        got: () => surfaceGravity(MU, R)!,
        relTol: 1e-15,
      },
    ],
  },
  {
    id: 'ms-soi',
    domain: 'mission',
    name: 'Earth SOI Laplace a=1 AU',
    source: 'r ≈ a (m/M)^{2/5}; Vallado',
    checks: [
      {
        key: 'r_soi',
        expected: AU * (EARTH_MASS / 1.98847e30) ** 0.4,
        got: () => sphereOfInfluence(AU, EARTH_MASS, 1.98847e30)!,
        relTol: 1e-12,
      },
    ],
  },
  {
    id: 'ms-light-time',
    domain: 'mission',
    name: '1 light-second',
    source: 't=d/c; CODATA c',
    checks: [
      {
        key: 't',
        expected: 1,
        got: () => lightTime(C)!,
        absTol: 1e-12,
      },
    ],
  },
  {
    id: 'ms-eclipse-leo',
    domain: 'mission',
    name: 'LEO eclipse fraction in (0, 0.5)',
    source: 'Vallado cylindrical shadow teaching',
    checks: [
      {
        key: 'ok',
        expected: 1,
        got: () => {
          const e = circularEclipseDuration(R + 400e3, R, MU)!
          return e.fraction > 0 && e.fraction < 0.5 ? 1 : 0
        },
        absTol: 0,
      },
    ],
  },
  {
    id: 'ms-g-m-earth-band',
    domain: 'mission',
    name: 'G·M_earth within 2% of catalog μ',
    source: 'Known G vs high-precision μ table caveat',
    checks: [
      {
        key: 'ratio',
        expected: 1,
        got: () => muFromMass(EARTH_MASS)! / MU,
        relTol: 0.02,
      },
    ],
  },
]

// ─── ops / aero ───────────────────────────────────────────────────────────

const opsAero: GoldenCase[] = [
  {
    id: 'op-sutton-graves',
    domain: 'ops-aero',
    name: 'Sutton-Graves heat flux',
    source: 'Sutton-Graves; educational k',
    checks: (() => {
      const rho = 1e-4
      const Rn = 0.5
      const v = 7000
      const exp = SUTTON_GRAVES_K_EARTH * Math.sqrt(rho / Rn) * v ** 3
      return [
        {
          key: 'q_dot',
          expected: exp,
          got: () => suttonGravesHeatFlux(rho, v, Rn)!,
          relTol: 1e-14,
        },
      ]
    })(),
  },
  {
    id: 'op-solar-array',
    domain: 'ops-aero',
    name: 'Solar array power positive at 1 AU',
    source: 'SMAD-class; S0 in power.ts',
    checks: [
      {
        key: 'ok',
        expected: 1,
        got: () => {
          const P = solarArrayPower(5, 0.3, 0, 1)
          return P != null && P > 1000 ? 1 : 0 // 5 m² × 0.3 × 1361 ≈ 2 kW
        },
        absTol: 0,
      },
      {
        key: 'P',
        expected: 1361 * 0.3 * 5,
        got: () => solarArrayPower(5, 0.3, 0, 1)!,
        relTol: 1e-12,
      },
    ],
  },
  {
    id: 'op-rcs',
    domain: 'ops-aero',
    name: 'RCS Δv = Ft/m',
    source: 'Impulse definition',
    checks: [
      {
        key: 'dv',
        expected: 0.1,
        got: () => rcsDeltaV(1, 10, 100)!,
        absTol: 1e-15,
      },
    ],
  },
  {
    id: 'op-ang-diam-moon',
    domain: 'ops-aero',
    name: 'Moon angular diameter at mean distance',
    source: 'α = 2 atan(R/d) (SIDUS / geometric diameter)',
    checks: (() => {
      const moon = getBody('moon')
      const d = 384_400e3
      return [
        {
          key: 'alpha',
          expected: 2 * Math.atan(moon.radius / d),
          got: () => angularDiameter(moon.radius, d)!,
          relTol: 1e-14,
        },
      ]
    })(),
  },
  {
    id: 'op-heat-scales-v3',
    domain: 'ops-aero',
    name: 'Heat flux doubles scale when v · 2^{1/3}',
    source: 'Sutton-Graves v³ scaling',
    checks: [
      {
        key: 'ratio',
        expected: 8,
        got: () => {
          const a = suttonGravesHeatFlux(1e-4, 4000, 0.5)!
          const b = suttonGravesHeatFlux(1e-4, 8000, 0.5)!
          return b / a
        },
        relTol: 1e-12,
      },
    ],
  },
]

// ─── ECLSS ────────────────────────────────────────────────────────────────

const eclss: GoldenCase[] = [
  {
    id: 'ec-metabolic',
    domain: 'eclss',
    name: 'Metabolic nominal 1 crew 24 h positive',
    source: 'NASA OCHMO-order educational rates',
    checks: [
      {
        key: 'ok',
        expected: 1,
        got: () => {
          const m = metabolicBudget('nominal', 86400, 1)
          return m && m.o2Kg > 0 && m.co2Kg > 0 ? 1 : 0
        },
        absTol: 0,
      },
    ],
  },
  {
    id: 'ec-lioh',
    domain: 'eclss',
    name: 'LiOH duration = capacity·mass / rate',
    source: 'Educational canister capacity',
    checks: [
      {
        key: 'duration_s',
        expected: (2 * 0.85) / 4e-5,
        got: () => liohDuration(2, 4e-5, 0.85)!.durationS,
        relTol: 1e-12,
      },
    ],
  },
  {
    id: 'ec-metabolic-scales-crew',
    domain: 'eclss',
    name: 'Metabolic O2 scales with crew count',
    source: 'Linear crew scaling (educational)',
    checks: [
      {
        key: 'ratio',
        expected: 4,
        got: () => {
          const a = metabolicBudget('nominal', 3600, 1)!.o2Kg
          const b = metabolicBudget('nominal', 3600, 4)!.o2Kg
          return b / a
        },
        relTol: 1e-12,
      },
    ],
  },
]

export const GOLDEN_CASES: GoldenCase[] = [
  ...twoBody,
  ...maneuvers,
  ...hyperbolic,
  ...planetary,
  ...geometry,
  ...propulsion,
  ...linkRf,
  ...mission,
  ...opsAero,
  ...eclss,
]

export function casesByDomain(): Record<string, GoldenCase[]> {
  const map: Record<string, GoldenCase[]> = {}
  for (const c of GOLDEN_CASES) {
    ;(map[c.domain] ??= []).push(c)
  }
  return map
}

export function domainStats(): { domain: string; n: number }[] {
  return Object.entries(casesByDomain()).map(([domain, cases]) => ({
    domain,
    n: cases.length,
  }))
}
