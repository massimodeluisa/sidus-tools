/**
 * ECLSS / crew systems engineering helpers (educational, SI).
 * Rates informed by NASA OCHMO metabolic tables (order-of-magnitude ISS ops).
 */

export const R_UNIV = 8.314462618 // J/(mol·K)
export const M_O2 = 0.031998 // kg/mol
export const M_CO2 = 0.04401
export const M_N2 = 0.028014
export const M_H2O = 0.018015
/** LiOH molar mass kg/mol */
export const M_LIOH = 0.02395
/**
 * Practical CO2 capacity of LiOH canisters (kg CO2 / kg LiOH).
 * Stoichiometry 2 LiOH + CO2 → Li2CO3 + H2O ⇒ 0.919 kg/kg theoretical;
 * flight canisters are lower (~0.8-0.9): default 0.85.
 */
export const LIOH_CO2_CAPACITY = 0.85

/** Activity levels used for metabolic budgeting */
export type MetabolicActivity = 'sleep' | 'nominal' | 'light' | 'exercise'

/**
 * Instantaneous metabolic rates [kg/s] and heat [W] per crewmember.
 * O2/CO2 from NASA OCHMO-style mission-day tables (kg/min × 1e-4 → kg/s).
 */
export const METABOLIC_RATES: Record<
  MetabolicActivity,
  { o2KgS: number; co2KgS: number; h2oKgS: number; heatW: number; label: string }
> = {
  // 3.60e-4 kg/min O2, 4.55e-4 CO2
  sleep: {
    o2KgS: 3.6e-4 / 60,
    co2KgS: 4.55e-4 / 60,
    h2oKgS: 2.5e-4 / 60, // respiratory + insensible order of magnitude
    heatW: 85,
    label: 'Sleep',
  },
  // 5.68e-4 / 7.2e-4 kg/min
  nominal: {
    o2KgS: 5.68e-4 / 60,
    co2KgS: 7.2e-4 / 60,
    h2oKgS: 4e-4 / 60,
    heatW: 120,
    label: 'Nominal (awake)',
  },
  light: {
    o2KgS: 1.0e-3 / 60,
    co2KgS: 1.2e-3 / 60,
    h2oKgS: 6e-4 / 60,
    heatW: 180,
    label: 'Light work',
  },
  // 39.4e-4 / 49.85e-4 kg/min @ 75% VO2max
  exercise: {
    o2KgS: 39.4e-4 / 60,
    co2KgS: 49.85e-4 / 60,
    h2oKgS: 2.0e-3 / 60,
    heatW: 550,
    label: 'Exercise (75% VO₂max)',
  },
}

/** Reference ISS-ish daily totals (kg/crew/day) with exercise block: OCHMO order */
export const ISS_DAY_O2_KG = 0.82
export const ISS_DAY_CO2_KG = 1.04

export type MetabolicBudget = {
  o2Kg: number
  co2Kg: number
  h2oKg: number
  heatJ: number
  heatAvgW: number
  durationS: number
  crew: number
}

/**
 * Integrate a single activity for `durationS` seconds for `crew` people.
 */
export function metabolicBudget(
  activity: MetabolicActivity,
  durationS: number,
  crew: number,
): MetabolicBudget | null {
  if (!(durationS > 0) || !(crew > 0)) return null
  const r = METABOLIC_RATES[activity]
  const o2Kg = r.o2KgS * durationS * crew
  const co2Kg = r.co2KgS * durationS * crew
  const h2oKg = r.h2oKgS * durationS * crew
  const heatJ = r.heatW * durationS * crew
  return {
    o2Kg,
    co2Kg,
    h2oKg,
    heatJ,
    heatAvgW: r.heatW * crew,
    durationS,
    crew,
  }
}

/** RQ = moles CO2 / moles O2 */
export function respiratoryQuotient(o2Kg: number, co2Kg: number): number | null {
  if (!(o2Kg > 0) || !(co2Kg > 0)) return null
  return co2Kg / M_CO2 / (o2Kg / M_O2)
}

export type CabinAtmosphere = {
  pTotalPa: number
  ppO2Pa: number
  ppCO2Pa: number
  ppN2Pa: number
  ppH2OPa: number
  fracO2: number
  fracCO2: number
  /** Dry-gas O2 fraction (no H2O) */
  dryFracO2: number
  nTotalMol: number
}

/**
 * Ideal-gas partial pressures from gas masses in free volume V [m³] at T [K].
 */
export function cabinFromMasses(
  V: number,
  T: number,
  masses: { o2: number; n2: number; co2: number; h2o?: number },
): CabinAtmosphere | null {
  if (!(V > 0) || !(T > 0)) return null
  const nO2 = masses.o2 / M_O2
  const nN2 = masses.n2 / M_N2
  const nCO2 = masses.co2 / M_CO2
  const nH2O = (masses.h2o ?? 0) / M_H2O
  if ([nO2, nN2, nCO2, nH2O].some((n) => n < 0 || !Number.isFinite(n))) return null
  const nTotal = nO2 + nN2 + nCO2 + nH2O
  if (!(nTotal > 0)) return null
  const pTotalPa = (nTotal * R_UNIV * T) / V
  const pp = (n: number) => (n * R_UNIV * T) / V
  const ppO2Pa = pp(nO2)
  const ppCO2Pa = pp(nCO2)
  const ppN2Pa = pp(nN2)
  const ppH2OPa = pp(nH2O)
  const nDry = nO2 + nN2 + nCO2
  return {
    pTotalPa,
    ppO2Pa,
    ppCO2Pa,
    ppN2Pa,
    ppH2OPa,
    fracO2: nO2 / nTotal,
    fracCO2: nCO2 / nTotal,
    dryFracO2: nDry > 0 ? nO2 / nDry : 0,
    nTotalMol: nTotal,
  }
}

/**
 * Build sea-level-like cabin: total P, dry O2 mole fraction, optional ppCO2 and RH.
 * Returns gas masses [kg].
 */
export function cabinMassesFromComposition(
  V: number,
  T: number,
  pTotalPa: number,
  dryO2Frac: number,
  ppCO2Pa = 0,
  rh = 0,
): { o2: number; n2: number; co2: number; h2o: number } | null {
  if (!(V > 0) || !(T > 0) || !(pTotalPa > 0)) return null
  if (dryO2Frac < 0 || dryO2Frac > 1) return null
  // Saturation vapor pressure water (Tetens, Pa)
  const Tc = T - 273.15
  const pSat = 610.94 * Math.exp((17.625 * Tc) / (Tc + 243.04))
  const ppH2O = Math.min(pTotalPa * 0.5, Math.max(0, rh) * pSat)
  const pDry = Math.max(0, pTotalPa - ppH2O - Math.max(0, ppCO2Pa))
  const ppO2 = dryO2Frac * pDry
  const ppN2 = (1 - dryO2Frac) * pDry
  const n = (p: number) => (p * V) / (R_UNIV * T)
  return {
    o2: n(ppO2) * M_O2,
    n2: n(ppN2) * M_N2,
    co2: n(Math.max(0, ppCO2Pa)) * M_CO2,
    h2o: n(ppH2O) * M_H2O,
  }
}

/** Add metabolic CO2 / remove O2 over Δt; return new masses + atmosphere */
export function applyMetabolism(
  V: number,
  T: number,
  masses: { o2: number; n2: number; co2: number; h2o: number },
  activity: MetabolicActivity,
  durationS: number,
  crew: number,
): { masses: typeof masses; atm: CabinAtmosphere } | null {
  const b = metabolicBudget(activity, durationS, crew)
  if (!b) return null
  const next = {
    o2: Math.max(0, masses.o2 - b.o2Kg),
    n2: masses.n2,
    co2: masses.co2 + b.co2Kg,
    h2o: masses.h2o + b.h2oKg,
  }
  const atm = cabinFromMasses(V, T, next)
  if (!atm) return null
  return { masses: next, atm }
}

/**
 * LiOH canister lifetime at constant CO2 production rate.
 * m_lioh [kg], co2Rate [kg/s] → duration [s] and CO2 capacity [kg].
 */
export function liohDuration(
  mLiohKg: number,
  co2RateKgS: number,
  capacity = LIOH_CO2_CAPACITY,
): { capacityKg: number; durationS: number } | null {
  if (!(mLiohKg > 0) || !(co2RateKgS > 0) || !(capacity > 0)) return null
  const capacityKg = mLiohKg * capacity
  return { capacityKg, durationS: capacityKg / co2RateKgS }
}

/**
 * Stoichiometric LiOH mass for a given CO2 mass (theoretical + practical).
 */
export function liohForCo2(co2Kg: number, capacity = LIOH_CO2_CAPACITY): number {
  return co2Kg / capacity
}

/**
 * Isothermal cabin leak through orifice (choked sonic when ΔP large).
 * Returns approximate time [s] to go from P0 to P1 (P1 < P0), vacuum outside.
 * mdot_choked ≈ C_d A P0 √(γ/(R_spec T)) · (2/(γ+1))^((γ+1)/(2(γ-1)))
 * Integrate isothermal: t = (V/(R_spec T)) ∫ dP / (−ṁ/P) …
 * For choked ṁ ∝ P ⇒ exponential: t = (V / (A c*)) ln(P0/P1)
 */
export function leakDepressTime(
  V: number,
  A: number,
  P0: number,
  P1: number,
  T = 293.15,
  Cd = 0.65,
  gamma = 1.4,
  Rspec = 287.05, // J/(kg·K) air
): number | null {
  if (!(V > 0) || !(A > 0) || !(P0 > P1) || !(P1 > 0) || !(T > 0)) return null
  const g = gamma
  const factor = Math.pow(2 / (g + 1), (g + 1) / (2 * (g - 1)))
  // characteristic velocity-like constant: ṁ = Cd A P * K, K = factor * sqrt(g/(R T))
  const K = factor * Math.sqrt(g / (Rspec * T))
  // m = P V /(R T); dm/dt = −Cd A K P ⇒ dP/dt = −(Cd A K R T / V) P
  // τ = V / (Cd A K R T)
  const tau = V / (Cd * A * K * Rspec * T)
  return tau * Math.log(P0 / P1)
}

/** Ideal-gas mass to change pressure by ΔP at fixed V,T (makeup gas). */
export function repressMass(
  V: number,
  T: number,
  dP: number,
  MolarMass = M_N2,
): number | null {
  if (!(V > 0) || !(T > 0) || !Number.isFinite(dP)) return null
  const n = (dP * V) / (R_UNIV * T)
  return n * MolarMass
}

/**
 * Coolant loop heat transport: Q = ṁ cp ΔT [W].
 * Returns required mass flow [kg/s] for heat load Q [W] and allowable ΔT [K].
 */
export function coolantMassFlow(
  QdotW: number,
  dT: number,
  cp = 4184, // water J/(kg·K); ammonia ~4700, etc.
): number | null {
  if (!(QdotW > 0) || !(dT > 0) || !(cp > 0)) return null
  return QdotW / (cp * dT)
}

export function heatFromFlow(mdot: number, dT: number, cp = 4184): number | null {
  if (!(mdot > 0) || !(dT > 0) || !(cp > 0)) return null
  return mdot * cp * dT
}

/** pp in Pa → mmHg (medical/ops units) */
export function paToMmHg(p: number): number {
  return p / 133.322
}

export function mmHgToPa(mm: number): number {
  return mm * 133.322
}

/**
 * Rough “smac-style” flags (educational, not flight rules).
 * Long-duration ppCO2 often discussed ~2.5-5.3 mmHg; ppO2 cabin ~146-178 mmHg typical 14.7 psi 21% band.
 */
/** Stable i18n key suffixes under `fields.flag_*` for cabin atmosphere UI. */
export function atmosphereFlags(atm: CabinAtmosphere): string[] {
  const flags: string[] = []
  const o2mm = paToMmHg(atm.ppO2Pa)
  const c2mm = paToMmHg(atm.ppCO2Pa)
  if (o2mm < 140) flags.push('flag_ppo2_low')
  if (o2mm > 185) flags.push('flag_ppo2_high')
  if (c2mm > 5.3) flags.push('flag_ppco2_smac')
  else if (c2mm > 3.0) flags.push('flag_ppco2_elevated')
  if (atm.pTotalPa < 95_000) flags.push('flag_p_low')
  if (atm.pTotalPa > 105_000) flags.push('flag_p_high')
  if (flags.length === 0) flags.push('flag_within_bands')
  return flags
}
