/**
 * Expected numeric results for spacecraft/vehicle-systems pilot tools (propulsion,
 * thermal, ECLSS, aero, attitude), sourced from shipped physics.
 * See expected/index.ts for the verification chain this module feeds.
 */
import {
  G0,
  ISA_G0,
  ISA_L,
  ISA_P0,
  ISA_R_AIR,
  ISA_T0,
  METABOLIC_RATES,
  SUTTON_GRAVES_K_EARTH,
  dynamicPressure,
  euler321ToQuat,
  exhaustVelocity,
  isaAtmosphere,
  machNumber,
  metabolicBudget,
  respiratoryQuotient,
  rocketDeltaV,
  suttonGravesHeatFlux,
} from '../../../physics'
import { num, put, type ExpectedFn } from './shared'

export const SYSTEMS_EXPECTED: Record<string, ExpectedFn> = {
  'rocket-equation': (bag) => {
    const isp = num(bag, 'isp', 'Isp')
    const out: Record<string, number> = {}
    put(out, ['g0'], G0)
    put(out, ['ve'], exhaustVelocity(isp))
    put(out, ['dv'], rocketDeltaV(isp, num(bag, 'm0'), num(bag, 'mf')))
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
}
