import { C, G0 } from './constants'
import { ionThrusterEfficiency, ispFromExitVelocity } from './engines-ext'

/** DSN X-band coherent turnaround (downlink/uplink), Thornton & Border. */
export const DSN_TURNAROUND_X = 880 / 749

/** DSN Ka-band coherent turnaround from an X-band uplink. */
export const DSN_TURNAROUND_KA = 3344 / 749

/**
 * Two-way (round-trip) Doppler shift [Hz].
 * First-order: fd2 = 2 f0 vr / c. Same sign as `dopplerShiftHz`:
 * vr is positive when the source approaches the observer.
 * Not a transponder turnaround model.
 */
export function twoWayDopplerHz(f0: number, vRadial: number, c = C): number | null {
  if (!(f0 > 0) || !Number.isFinite(vRadial) || !(c > 0)) return null
  return (2 * f0 * vRadial) / c
}

/**
 * Range-rate error [m/s] from a constant fractional frequency offset:
 * Δρ̇ = c Δf/f  (Thornton & Border, DESCANSO vol. 1).
 */
export function rangeRateFromClockOffset(fracFreq: number, c = C): number | null {
  if (!Number.isFinite(fracFreq) || !(c > 0)) return null
  return c * fracFreq
}

/**
 * Two-way range-rate error [m/s] from the same fractional offset.
 * Δρ̇ = c Δf / (2 f), half the one-way clock mapping.
 */
export function twoWayRangeRateFromClockOffset(fracFreq: number, c = C): number | null {
  const oneWay = rangeRateFromClockOffset(fracFreq, c)
  if (oneWay == null) return null
  return oneWay / 2
}

/**
 * White-frequency-noise range-rate sigma [m/s] from Allan deviation:
 * σ_v = √2 c σ_y(τ)  when the count time is shorter than the RTLT
 * (Thornton & Border, DESCANSO vol. 1, hydrogen-maser white-FM band).
 */
export function allanRangeRateSigma(sigmaY: number, c = C): number | null {
  if (!(sigmaY > 0) || !(c > 0)) return null
  const sig = Math.SQRT2 * c * sigmaY
  return Number.isFinite(sig) ? sig : null
}

/**
 * Coherent array SNR gain for N identical antennas (Rogstad et al., DESCANSO vol. 5).
 * Signal voltages add, noise as √N, so SNR scales as N. gainDb = 10 log10(N).
 */
export function dsnArraySnrGain(n: number): { n: number; gainLin: number; gainDb: number } | null {
  if (!(n >= 1) || !Number.isFinite(n)) return null
  return { n, gainLin: n, gainDb: 10 * Math.log10(n) }
}

/**
 * Continuous-tangential spiral from circular orbit to E = 0.
 * Δv_spiral = v_circ. Impulsive escape from the same circle is (√2 − 1) v_circ.
 */
export function lowThrustEscapeSpiral(
  mu: number,
  r: number,
): { vCirc: number; dvSpiral: number; dvImpulsive: number } | null {
  if (!(mu > 0) || !(r > 0)) return null
  const vCirc = Math.sqrt(mu / r)
  if (!Number.isFinite(vCirc) || vCirc <= 0) return null
  return {
    vCirc,
    dvSpiral: vCirc,
    dvImpulsive: (Math.SQRT2 - 1) * vCirc,
  }
}

export type IonThrusterBudget = {
  eta: number
  ve: number
  isp: number
  alpha: number | null
}

/**
 * Ion-thruster figures from T, ṁ, P, and optional dry mass.
 * ve = T/ṁ, η = T²/(2 ṁ P), α = P/m_dry when dry mass is given.
 */
export function ionThrusterBudget(
  thrustN: number,
  mdot: number,
  powerW: number,
  dryMass?: number,
): IonThrusterBudget | null {
  const eta = ionThrusterEfficiency(thrustN, mdot, powerW)
  if (eta == null) return null
  const ve = thrustN / mdot
  const isp = ispFromExitVelocity(ve, G0)
  if (!(ve > 0) || isp == null) return null
  const alpha =
    dryMass != null && dryMass > 0 && Number.isFinite(dryMass) ? powerW / dryMass : null
  return { eta, ve, isp, alpha }
}
