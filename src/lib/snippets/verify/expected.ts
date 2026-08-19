/**
 * Expected numeric results for snippet verification, sourced from shipped physics.
 *
 * Verification chain:
 *   snippet listing (11 langs) → compiled/executed locally → printed numbers
 *     → EXPECTED (this module) → shipped `src/lib/physics` exports
 *     → golden tests anchored to published sources.
 *
 * This module never re-derives physics: every value comes from a shipped export, so a
 * mismatch means the language listing disagrees with the physics the site actually ships.
 * Keys are the assigned variable names as they appear in the snippet bodies; several
 * tools rename results per language (rust `t` vs `T`, js `lfsDb` vs `lfs_db`), so the
 * union of those spellings is returned. Printed names with no shipped counterpart
 * (pure intermediates such as j2 `p`/`k`) are omitted by design.
 */
import {
  EARTH_J2,
  ISA_G0,
  ISA_L,
  ISA_P0,
  ISA_R_AIR,
  ISA_T0,
  G0,
  METABOLIC_RATES,
  SUTTON_GRAVES_K_EARTH,
  circularOrbitVelocity,
  degToRad,
  dynamicPressure,
  effectiveAperture,
  euler321ToQuat,
  exhaustVelocity,
  hohmannTransfer,
  isaAtmosphere,
  j2ArgpRate,
  j2RaanRate,
  keplerPropagate,
  linkBudget,
  localGravity,
  machNumber,
  meanMotion,
  metabolicBudget,
  nyquistSampleRate,
  orbitalPeriod,
  planeChangeDeltaV,
  radToDeg,
  respiratoryQuotient,
  rocketDeltaV,
  specificEnergy,
  suttonGravesHeatFlux,
  vdot,
  visViva,
  vnorm,
} from '../../physics'
import type { Vec3 } from '../../physics'

export type ExpectedFn = (bag: Record<string, number | string>) => Record<string, number>

/** First finite numeric value among `keys`; throws so a missing input is never silent. */
function num(bag: Record<string, number | string>, ...keys: string[]): number {
  for (const k of keys) {
    const v = bag[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  throw new Error(`missing numeric input: ${keys.join(' | ')}`)
}

/** Assign `value` to every language spelling of the same result, skipping nulls. */
function put(
  out: Record<string, number>,
  names: string[],
  value: number | null | undefined,
): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) return
  for (const n of names) out[n] = value
}

/**
 * Tools whose snippets have no shipped counterpart with the same input contract.
 * They return `{}` on purpose: the runner reports them as uncovered instead of
 * asserting numbers that shipped physics does not actually produce.
 */
export const UNVERIFIABLE: Readonly<Record<string, string>> = {
  'look-angles':
    'snippet uses a WGS-84 ellipsoid + ECEF satellite vector in a SEZ frame; shipped topocentricElAz is spherical and takes target lat/lon/height. js/ts additionally call satellite.js with new Date() (non-deterministic).',
}

export const EXPECTED: Record<string, ExpectedFn> = {
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

  'rocket-equation': (bag) => {
    const isp = num(bag, 'isp', 'Isp')
    const out: Record<string, number> = {}
    put(out, ['g0'], G0)
    put(out, ['ve'], exhaustVelocity(isp))
    put(out, ['dv'], rocketDeltaV(isp, num(bag, 'm0'), num(bag, 'mf')))
    return out
  },

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

  'heat-flux': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['k'], SUTTON_GRAVES_K_EARTH)
    put(
      out,
      ['q'],
      suttonGravesHeatFlux(num(bag, 'rho'), num(bag, 'v'), num(bag, 'rn', 'Rn', 'R_n')),
    )
    return out
  },

  'metabolic-load': (bag) => {
    const durationS = num(bag, 'tS', 't_s')
    const crew = num(bag, 'crew')
    const rates = METABOLIC_RATES.nominal
    const b = metabolicBudget('nominal', durationS, crew)
    const out: Record<string, number> = {}
    put(out, ['o2_rate', 'o2Rate'], rates.o2KgS)
    put(out, ['co2_rate', 'co2Rate'], rates.co2KgS)
    put(out, ['heat_W', 'heatW', 'heat_w'], rates.heatW)
    if (!b) return out
    put(out, ['o2'], b.o2Kg)
    put(out, ['co2'], b.co2Kg)
    put(out, ['heat_J', 'heatJ', 'heat_j'], b.heatJ)
    put(out, ['RQ', 'rq'], respiratoryQuotient(b.o2Kg, b.co2Kg))
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

  'dynamic-pressure': (bag) => {
    const v = num(bag, 'v')
    const isa = isaAtmosphere(num(bag, 'h', 'h_m'))
    const out: Record<string, number> = {}
    put(out, ['T0', 't0'], ISA_T0)
    put(out, ['P0', 'p0'], ISA_P0)
    put(out, ['L', 'lapse'], ISA_L)
    put(out, ['g0'], ISA_G0)
    put(out, ['R', 'Rair', 'r_air'], ISA_R_AIR)
    if (!isa) return out
    put(out, ['T', 't'], isa.T)
    put(out, ['p'], isa.p)
    put(out, ['rho'], isa.rho)
    put(out, ['a'], isa.a)
    put(out, ['q'], dynamicPressure(isa.rho, v))
    put(out, ['M', 'm'], machNumber(v, isa.a))
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

  'quaternion-euler': (bag) => {
    const q = euler321ToQuat(num(bag, 'yaw'), num(bag, 'pitch'), num(bag, 'roll'))
    const out: Record<string, number> = {}
    if (!q) return out
    put(out, ['qw'], q.w)
    put(out, ['qx'], q.x)
    put(out, ['qy'], q.y)
    put(out, ['qz'], q.z)
    return out
  },

  // See UNVERIFIABLE: no shipped export shares this snippet's contract.
  'look-angles': () => ({}),

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
}
