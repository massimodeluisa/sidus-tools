/** International Standard Atmosphere (troposphere + lower stratosphere). SI. */

/** Sea-level ISA constants */
export const ISA_T0 = 288.15 // K
export const ISA_P0 = 101_325 // Pa
export const ISA_RHO0 = 1.225 // kg/m³
export const ISA_L = 0.0065 // K/m troposphere lapse
export const ISA_G0 = 9.80665
export const ISA_R_AIR = 287.05287 // J/(kg·K)
export const ISA_GAMMA = 1.4

export type IsaLayer = {
  h: number // geometric altitude m
  T: number // K
  p: number // Pa
  rho: number // kg/m³
  a: number // speed of sound m/s
  layer: 'troposphere' | 'tropopause' | 'stratosphere' | 'out_of_range'
}

/**
 * ISA properties for geometric altitude h ∈ [0, 32 km] (common launch/aero band).
 * Troposphere 0-11 km, isothermal 11-20 km, stratosphere 20-32 km (simple).
 */
export function isaAtmosphere(h: number): IsaLayer | null {
  if (!Number.isFinite(h) || h < 0 || h > 32_000) return null

  let T: number
  let p: number
  let layer: IsaLayer['layer']

  if (h <= 11_000) {
    layer = 'troposphere'
    T = ISA_T0 - ISA_L * h
    p = ISA_P0 * (T / ISA_T0) ** (ISA_G0 / (ISA_L * ISA_R_AIR))
  } else if (h <= 20_000) {
    layer = 'tropopause'
    const T11 = ISA_T0 - ISA_L * 11_000
    const p11 = ISA_P0 * (T11 / ISA_T0) ** (ISA_G0 / (ISA_L * ISA_R_AIR))
    T = T11
    p = p11 * Math.exp((-ISA_G0 * (h - 11_000)) / (ISA_R_AIR * T11))
  } else {
    layer = 'stratosphere'
    const T11 = ISA_T0 - ISA_L * 11_000
    const p11 = ISA_P0 * (T11 / ISA_T0) ** (ISA_G0 / (ISA_L * ISA_R_AIR))
    const p20 = p11 * Math.exp((-ISA_G0 * (20_000 - 11_000)) / (ISA_R_AIR * T11))
    // ISA 20-32 km: T increases at +1 K/km from 216.65 K
    T = 216.65 + 0.001 * (h - 20_000)
    p = p20 * (T / 216.65) ** (-ISA_G0 / (0.001 * ISA_R_AIR))
  }

  const rho = p / (ISA_R_AIR * T)
  const a = Math.sqrt(ISA_GAMMA * ISA_R_AIR * T)
  return { h, T, p, rho, a, layer }
}

/** Dynamic pressure q = ½ ρ v² [Pa]. */
export function dynamicPressure(rho: number, v: number): number {
  return 0.5 * rho * v * v
}

/** Mach number M = v / a. */
export function machNumber(v: number, aSound: number): number | null {
  if (!(aSound > 0) || !Number.isFinite(v)) return null
  return v / aSound
}
