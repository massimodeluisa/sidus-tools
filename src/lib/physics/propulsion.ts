/** Propulsion helpers beyond multi-stage / Tsiolkovsky (SI). */

import { G0 } from './constants'
import { rocketMassInitial, rocketDeltaV, exhaustVelocity } from './orbital'

/** Ideal thrust F = ṁ · v_e  (vacuum, no pressure term). */
export function idealThrust(mdot: number, ve: number): number | null {
  if (!(mdot > 0) || !(ve > 0)) return null
  return mdot * ve
}

/** ṁ from thrust and Isp: ṁ = F / (Isp g0). */
export function massFlowFromThrustIsp(thrustN: number, ispS: number, g0 = G0): number | null {
  if (!(thrustN > 0) || !(ispS > 0)) return null
  return thrustN / (ispS * g0)
}

/** Isp from ve: Isp = ve / g0. */
export function ispFromVe(ve: number, g0 = G0): number | null {
  if (!(ve > 0) || !(g0 > 0)) return null
  return ve / g0
}

/** Propellant mass for target Δv given dry mass mf. */
export function propellantForDeltaV(
  ispS: number,
  deltaV: number,
  dryMass: number,
  g0 = G0,
): { m0: number; prop: number; ratio: number } | null {
  const m0 = rocketMassInitial(ispS, deltaV, dryMass, g0)
  if (!Number.isFinite(m0) || m0 <= dryMass) return null
  return { m0, prop: m0 - dryMass, ratio: m0 / dryMass }
}

/** Mass ratio required: m0/mf = exp(Δv / (Isp g0)). */
export function massRatioForDeltaV(ispS: number, deltaV: number, g0 = G0): number | null {
  if (!(ispS > 0) || !(deltaV >= 0)) return null
  return Math.exp(deltaV / (ispS * g0))
}

/** Burn time for constant ṁ: t = m_prop / ṁ. */
export function burnTime(propMass: number, mdot: number): number | null {
  if (!(propMass > 0) || !(mdot > 0)) return null
  return propMass / mdot
}

/** Re-export common rocket helpers for tool imports. */
export { rocketDeltaV, rocketMassInitial, exhaustVelocity }
