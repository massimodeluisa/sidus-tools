/**
 * Expected numeric results for orbital-mechanics pilot tools, sourced from shipped physics.
 * See expected/index.ts for the verification chain this module feeds.
 */
import {
  EARTH_J2,
  circularOrbitVelocity,
  degToRad,
  hohmannTransfer,
  j2ArgpRate,
  j2RaanRate,
  keplerPropagate,
  localGravity,
  meanMotion,
  orbitalPeriod,
  planeChangeDeltaV,
  radToDeg,
  specificEnergy,
  vdot,
  visViva,
  vnorm,
} from '../../../physics'
import type { Vec3 } from '../../../physics'
import { num, put, type ExpectedFn } from './shared'

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
}
