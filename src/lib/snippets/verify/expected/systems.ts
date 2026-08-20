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
  blowdownPressureIsentropic,
  blowdownPressureIsothermal,
  boiloffRate,
  characteristicVelocity,
  coldGasThrust,
  densityImpulse,
  deltaVBudget,
  dynamicPressure,
  edelbaumDv,
  equalStageMassRatio,
  euler321ToQuat,
  exhaustVelocity,
  finiteBurnDv,
  geoPropellantBudget,
  gravityLossDv,
  hallExitVelocity,
  idealCstar,
  idealThrust,
  impulseBit,
  ionThrusterEfficiency,
  isaAtmosphere,
  isentropicExitVelocity,
  isentropicNozzle,
  ispFromExitVelocity,
  ispFromVe,
  machNumber,
  metabolicBudget,
  mixtureRatio,
  multiStageDeltaV,
  propellantMass,
  rcsDeltaV,
  respiratoryQuotient,
  rocketDeltaV,
  rocketMassInitial,
  solarSailAccel,
  suttonGravesHeatFlux,
  tankPropellantMass,
  throatAreaFromThrust,
  thrustFromCf,
  thrustToWeight,
  thrusterImpulseBit,
  totalMassFlow,
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

  // ─── Propulsion (category === 'propulsion') ────────────────────────────────

  'multi-stage': (bag) => {
    const isp1 = num(bag, 'isp1')
    const isp2 = num(bag, 'isp2')
    const isp3 = num(bag, 'isp3')
    const m01 = num(bag, 'm01')
    const mf1 = num(bag, 'mf1')
    const m02 = num(bag, 'm02')
    const mf2 = num(bag, 'mf2')
    const m03 = num(bag, 'm03')
    const mf3 = num(bag, 'mf3')
    const out: Record<string, number> = {}
    const res = multiStageDeltaV([
      { ve: exhaustVelocity(isp1), m0: m01, mf: mf1 },
      { ve: exhaustVelocity(isp2), m0: m02, mf: mf2 },
      { ve: exhaustVelocity(isp3), m0: m03, mf: mf3 },
    ])
    if (!res) return out
    put(out, ['dv1'], res.dv[0])
    put(out, ['dv2'], res.dv[1])
    put(out, ['dv3'], res.dv[2])
    put(out, ['dv_total'], res.dvTotal)
    return out
  },

  'propellant-mass': (bag) => {
    const mf = num(bag, 'mf')
    const dv = num(bag, 'dv')
    const isp = num(bag, 'isp')
    const g0 = num(bag, 'g0')
    const out: Record<string, number> = {}
    const m0 = rocketMassInitial(isp, dv, mf, g0)
    put(out, ['m0'], m0)
    put(out, ['prop'], propellantMass(m0, mf))
    return out
  },

  'ideal-thrust': (bag) => {
    const mdot = num(bag, 'mdot')
    const ve = num(bag, 've')
    const out: Record<string, number> = {}
    put(out, ['F'], idealThrust(mdot, ve))
    put(out, ['isp'], ispFromVe(ve))
    return out
  },

  'delta-v-budget': (bag) => {
    const ds = [1, 2, 3, 4, 5, 6].map((i) => num(bag, `d${i}`))
    const out: Record<string, number> = {}
    put(out, ['total'], deltaVBudget(ds)?.total)
    return out
  },

  'equal-stage': (bag) => {
    const dv = num(bag, 'dv')
    const n = num(bag, 'n')
    const isp = num(bag, 'isp')
    const out: Record<string, number> = {}
    put(out, ['ratio'], equalStageMassRatio(dv, n, isp)?.massRatio)
    return out
  },

  rcs: (bag) => {
    const F = num(bag, 'F')
    const t = num(bag, 't')
    const m = num(bag, 'm')
    const tmin = num(bag, 'tmin')
    const out: Record<string, number> = {}
    // Impulse I = F·t is the shipped rcsDeltaV numerator, trivial to re-state.
    put(out, ['I', 'i'], F * t)
    put(out, ['dv'], rcsDeltaV(F, t, m))
    put(out, ['I_bit', 'i_bit'], impulseBit(F, tmin))
    return out
  },

  'impulse-budget': (bag) => {
    const N = num(bag, 'N')
    const F = num(bag, 'F')
    const tMin = num(bag, 't_min')
    const out: Record<string, number> = {}
    const ib = impulseBit(F, tMin)
    if (ib == null) return out
    put(out, ['I_tot', 'i_tot'], N * ib)
    return out
  },

  'mass-ratio-stack': (bag) => {
    const payload = num(bag, 'payload')
    const R = num(bag, 'R')
    const N = num(bag, 'N')
    const out: Record<string, number> = {}
    // No dedicated physics helper: MassRatioStagesTool computes gross = payload·R^N inline.
    put(out, ['gross'], payload * Math.pow(R, N))
    return out
  },

  'payload-fraction': (bag) => {
    const mpl = num(bag, 'mpl')
    const m0 = num(bag, 'm0')
    const out: Record<string, number> = {}
    // No dedicated physics helper: PayloadFractionTool computes f_pl = mpl/m0 inline.
    put(out, ['f_pl'], mpl / m0)
    return out
  },

  'isentropic-nozzle': (bag) => {
    const gamma = num(bag, 'gamma')
    const pepc = num(bag, 'pepc')
    const Rgas = num(bag, 'Rgas')
    const Tc = num(bag, 'Tc')
    const out: Record<string, number> = {}
    const noz = isentropicNozzle({ gamma, peOverPc: pepc })
    if (!noz) return out
    put(out, ['Me'], noz.Me)
    put(out, ['Ae_At'], noz.areaRatio)
    const ve = isentropicExitVelocity(gamma, Rgas, Tc, pepc)
    put(out, ['ve'], ve)
    put(out, ['Isp'], ispFromExitVelocity(ve ?? NaN))
    return out
  },

  'characteristic-velocity-cstar': (bag) => {
    const pc = num(bag, 'pc')
    const At = num(bag, 'At')
    const mdot = num(bag, 'mdot')
    const Rgas = num(bag, 'Rgas')
    const Tc = num(bag, 'Tc')
    const gamma = num(bag, 'gamma')
    const out: Record<string, number> = {}
    const cstarM = characteristicVelocity(pc, At, mdot)
    const cstarI = idealCstar(gamma, Rgas, Tc)
    put(out, ['cstar_m'], cstarM)
    put(out, ['cstar_i'], cstarI)
    if (cstarM != null && cstarI) put(out, ['eta'], cstarM / cstarI)
    return out
  },

  'throat-area-sizing': (bag) => {
    const F = num(bag, 'F')
    const Cf = num(bag, 'Cf')
    const pc = num(bag, 'pc')
    const out: Record<string, number> = {}
    put(out, ['At'], throatAreaFromThrust(F, Cf, pc))
    return out
  },

  'rocket-thrust-chamber': (bag) => {
    const Cf = num(bag, 'Cf')
    const pc = num(bag, 'pc')
    const At = num(bag, 'At')
    const out: Record<string, number> = {}
    put(out, ['F'], thrustFromCf(Cf, pc, At))
    return out
  },

  'mixture-ratio': (bag) => {
    const mox = num(bag, 'mox')
    const mfuel = num(bag, 'mfuel')
    const out: Record<string, number> = {}
    put(out, ['r'], mixtureRatio(mox, mfuel))
    put(out, ['mdot'], totalMassFlow(mox, mfuel))
    return out
  },

  'tank-ullage': (bag) => {
    const V = num(bag, 'V')
    const fill = num(bag, 'fill')
    const rho = num(bag, 'rho')
    const out: Record<string, number> = {}
    put(out, ['m'], tankPropellantMass(V, fill, rho))
    return out
  },

  'blowdown-tank': (bag) => {
    const p1 = num(bag, 'p1')
    const V1 = num(bag, 'V1')
    const V2 = num(bag, 'V2')
    const gamma = num(bag, 'gamma')
    const out: Record<string, number> = {}
    put(out, ['p2_iso'], blowdownPressureIsothermal(p1, V1, V2))
    put(out, ['p2_isen'], blowdownPressureIsentropic(p1, V1, V2, gamma))
    return out
  },

  'propellant-density-impulse': (bag) => {
    const rho = num(bag, 'rho')
    const isp = num(bag, 'isp')
    const out: Record<string, number> = {}
    put(out, ['dpi'], densityImpulse(rho, isp))
    return out
  },

  'cold-gas-thrust': (bag) => {
    const mdot = num(bag, 'mdot')
    const ve = num(bag, 've')
    const out: Record<string, number> = {}
    put(out, ['F'], coldGasThrust(mdot, ve))
    return out
  },

  'ion-thruster-efficiency': (bag) => {
    const T = num(bag, 'T')
    const mdot = num(bag, 'mdot')
    const P = num(bag, 'P')
    const out: Record<string, number> = {}
    put(out, ['eta'], ionThrusterEfficiency(T, mdot, P))
    return out
  },

  'hall-thruster-isp': (bag) => {
    const V = num(bag, 'V')
    const mIon = num(bag, 'mIon')
    const out: Record<string, number> = {}
    const ve = hallExitVelocity(V, mIon)
    put(out, ['ve'], ve)
    put(out, ['Isp'], ispFromExitVelocity(ve ?? NaN))
    return out
  },

  'geo-propellant-budget': (bag) => {
    const dvY = num(bag, 'dvY')
    const life = num(bag, 'life')
    const mdry = num(bag, 'mdry')
    const isp = num(bag, 'isp')
    const out: Record<string, number> = {}
    const res = geoPropellantBudget(mdry, isp, dvY, life)
    if (!res) return out
    put(out, ['dv'], res.dvTotal)
    put(out, ['m0'], res.m0)
    put(out, ['mp'], res.mProp)
    return out
  },

  'solar-sail-accel': (bag) => {
    const eta = num(bag, 'eta')
    const flux = num(bag, 'flux')
    const A = num(bag, 'A')
    const m = num(bag, 'm')
    const out: Record<string, number> = {}
    put(out, ['a'], solarSailAccel(flux, A, m, eta))
    return out
  },

  'finite-burn-dv': (bag) => {
    const m0 = num(bag, 'm0')
    const mdot = num(bag, 'mdot')
    const tb = num(bag, 'tb')
    const ve = num(bag, 've')
    const out: Record<string, number> = {}
    // mf = m0 - mdot·tb is finiteBurnDv's own internal intermediate, trivial to re-state.
    put(out, ['mf'], m0 - mdot * tb)
    put(out, ['dv'], finiteBurnDv(ve, m0, mdot, tb))
    return out
  },

  'thruster-impulse-bit': (bag) => {
    const F = num(bag, 'F')
    const ton = num(bag, 'ton')
    const out: Record<string, number> = {}
    put(out, ['Ibit'], thrusterImpulseBit(F, ton))
    return out
  },

  'gravity-loss': (bag) => {
    const g = num(bag, 'g')
    const tb = num(bag, 'tb')
    const gamma = num(bag, 'gamma')
    const out: Record<string, number> = {}
    put(out, ['dv'], gravityLossDv(g, tb, gamma))
    return out
  },

  'edelbaum-dv': (bag) => {
    const v1 = num(bag, 'v1')
    const v2 = num(bag, 'v2')
    const di = num(bag, 'di')
    const out: Record<string, number> = {}
    put(out, ['dv'], edelbaumDv(v1, v2, di))
    return out
  },

  'boiloff-rate': (bag) => {
    const Q = num(bag, 'Q')
    const hfg = num(bag, 'hfg')
    const out: Record<string, number> = {}
    put(out, ['mdot'], boiloffRate(Q, hfg))
    return out
  },

  'thrust-to-weight': (bag) => {
    const F = num(bag, 'F')
    const m = num(bag, 'm')
    const out: Record<string, number> = {}
    put(out, ['TW'], thrustToWeight(F, m))
    return out
  },
}
