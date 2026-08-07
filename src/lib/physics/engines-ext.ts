/**
 * Chemical / electric engine and propellant educational models (pure SI).
 * Ideal-gas isentropic nozzle and simple thruster figures of merit.
 */

import { G0 } from './constants'

/** Mixture ratio r = ṁ_ox / ṁ_fuel (or m_ox / m_fuel). */
export function mixtureRatio(mOx: number, mFuel: number): number | null {
  if (!(mOx > 0) || !(mFuel > 0)) return null
  return mOx / mFuel
}

/** Total mass flow from oxidizer + fuel flows. */
export function totalMassFlow(mOxDot: number, mFuelDot: number): number | null {
  if (!(mOxDot >= 0) || !(mFuelDot >= 0) || mOxDot + mFuelDot <= 0) return null
  return mOxDot + mFuelDot
}

/**
 * Isentropic nozzle (choked throat): area ratio Ae/At and exit Mach from pe/pc.
 * γ = cp/cv > 1. pe, pc > 0, pe ≤ pc.
 */
export function isentropicNozzle(opts: {
  gamma: number
  peOverPc: number
}): { areaRatio: number; Me: number; cfIdeal: number } | null {
  const g = opts.gamma
  const pe_pc = opts.peOverPc
  if (!(g > 1) || !(pe_pc > 0) || pe_pc > 1) return null
  const gm1 = g - 1
  const Me2 = (2 / gm1) * ((pe_pc) ** (-gm1 / g) - 1)
  if (!(Me2 > 0)) return null
  const Me = Math.sqrt(Me2)
  const term =
    ((g + 1) / 2) ** (-(g + 1) / (2 * gm1)) *
    (1 / pe_pc) ** (1 / g) *
    (1 / Me) *
    (1 + (gm1 / 2) * Me2) ** ((g + 1) / (2 * gm1))
  // Standard Ae/At formula:
  // Ae/At = (1/Me) * [(1 + (γ-1)/2 Me²)/((γ+1)/2)]^((γ+1)/(2(γ-1)))
  const areaRatio =
    (1 / Me) *
    Math.pow(
      (1 + (gm1 / 2) * Me2) / ((g + 1) / 2),
      (g + 1) / (2 * gm1),
    )
  if (!(areaRatio > 0) || !Number.isFinite(areaRatio)) return null
  // Ideal vacuum thrust coefficient (no divergence loss)
  const cfIdeal =
    Math.sqrt(
      ((2 * g * g) / gm1) *
        Math.pow(2 / (g + 1), (g + 1) / gm1) *
        (1 - pe_pc ** (gm1 / g)),
    ) +
    (pe_pc === 0 ? 0 : 0) // pe/pc * Ae/At term omitted when pe=0; caller may add
  void term
  return { areaRatio, Me, cfIdeal: Number.isFinite(cfIdeal) ? cfIdeal : 0 }
}

/** Exit velocity for isentropic expansion from Tc, R_specific, pe/pc, γ. */
export function isentropicExitVelocity(
  gamma: number,
  R: number,
  Tc: number,
  peOverPc: number,
): number | null {
  if (!(gamma > 1) || !(R > 0) || !(Tc > 0) || !(peOverPc > 0) || peOverPc > 1)
    return null
  const gm1 = gamma - 1
  const ve = Math.sqrt(
    ((2 * gamma) / gm1) * R * Tc * (1 - peOverPc ** (gm1 / gamma)),
  )
  return Number.isFinite(ve) && ve > 0 ? ve : null
}

/** Characteristic velocity c* = pc * At / ṁ. */
export function characteristicVelocity(
  pc: number,
  At: number,
  mdot: number,
): number | null {
  if (!(pc > 0) || !(At > 0) || !(mdot > 0)) return null
  return (pc * At) / mdot
}

/**
 * Ideal characteristic velocity (frozen isentropic):
 *   c* = √(R Tc / γ) · ((γ+1)/2)^((γ+1)/(2(γ−1)))
 * equivalently √(γ R Tc)/γ · ((γ+1)/2)^((γ+1)/(2(γ−1))).
 * (Sutton / NASA GRC teaching form.)
 */
export function idealCstar(gamma: number, R: number, Tc: number): number | null {
  if (!(gamma > 1) || !(R > 0) || !(Tc > 0)) return null
  const gm1 = gamma - 1
  const exp = (gamma + 1) / (2 * gm1)
  const cstar =
    Math.sqrt((R * Tc) / gamma) * Math.pow((gamma + 1) / 2, exp)
  return Number.isFinite(cstar) && cstar > 0 ? cstar : null
}

/** Thrust F = Cf * pc * At. */
export function thrustFromCf(Cf: number, pc: number, At: number): number | null {
  if (!(Cf > 0) || !(pc > 0) || !(At > 0)) return null
  return Cf * pc * At
}

/** Throat area At = F / (Cf pc). */
export function throatAreaFromThrust(
  F: number,
  Cf: number,
  pc: number,
): number | null {
  if (!(F > 0) || !(Cf > 0) || !(pc > 0)) return null
  return F / (Cf * pc)
}

/** Isp from ve. */
export function ispFromExitVelocity(ve: number, g0 = G0): number | null {
  if (!(ve > 0) || !(g0 > 0)) return null
  return ve / g0
}

/** Density specific impulse ρ * Isp (kg/m³ * s) figure of merit. */
export function densityImpulse(rho: number, isp: number): number | null {
  if (!(rho > 0) || !(isp > 0)) return null
  return rho * isp
}

/** Tank propellant mass m = fill * V * ρ. */
export function tankPropellantMass(
  volume: number,
  fillFraction: number,
  density: number,
): number | null {
  if (!(volume > 0) || !(fillFraction > 0) || fillFraction > 1 || !(density > 0))
    return null
  return volume * fillFraction * density
}

/** Isothermal blowdown: p * V^0 constant → p2 = p1 * (V1/V2). For gas-only. */
export function blowdownPressureIsothermal(
  p1: number,
  V1: number,
  V2: number,
): number | null {
  if (!(p1 > 0) || !(V1 > 0) || !(V2 > 0)) return null
  return p1 * (V1 / V2)
}

/** Isentropic blowdown: p V^γ = const. */
export function blowdownPressureIsentropic(
  p1: number,
  V1: number,
  V2: number,
  gamma: number,
): number | null {
  if (!(p1 > 0) || !(V1 > 0) || !(V2 > 0) || !(gamma > 1)) return null
  return p1 * Math.pow(V1 / V2, gamma)
}

/** Cold-gas thrust F = ṁ * ve (+ pe Ae optional; vacuum use ṁ ve). */
export function coldGasThrust(mdot: number, ve: number): number | null {
  if (!(mdot > 0) || !(ve > 0)) return null
  return mdot * ve
}

/** Ion thruster efficiency η = T² / (2 ṁ P). */
export function ionThrusterEfficiency(
  thrustN: number,
  mdot: number,
  powerW: number,
): number | null {
  if (!(thrustN > 0) || !(mdot > 0) || !(powerW > 0)) return null
  const eta = (thrustN * thrustN) / (2 * mdot * powerW)
  return Number.isFinite(eta) && eta > 0 ? eta : null
}

/** Ideal exhaust velocity from discharge voltage: ve = sqrt(2 q V / m) for singly charged.
 *  For monatomic atomic mass m_kg. */
export function hallExitVelocity(
  voltageV: number,
  ionMassKg: number,
  chargeC = 1.602176634e-19,
): number | null {
  if (!(voltageV > 0) || !(ionMassKg > 0) || !(chargeC > 0)) return null
  const ve = Math.sqrt((2 * chargeC * voltageV) / ionMassKg)
  return Number.isFinite(ve) && ve > 0 ? ve : null
}
