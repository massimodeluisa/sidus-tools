/** Hyperbolic excess, C3, and escape-class mission design (two-body, SI). */

import { escapeVelocity } from './orbital'

/**
 * Characteristic energy C3 = v_∞² [m²/s²].
 * Positive for hyperbolic departures; C3 = 0 is parabolic escape.
 */
export function characteristicEnergy(vInf: number): number {
  return vInf * vInf
}

/** v_∞ from C3 [m/s]. */
export function vInfinityFromC3(c3: number): number | null {
  if (!(c3 >= 0) || !Number.isFinite(c3)) return null
  return Math.sqrt(c3)
}

/**
 * Periapsis speed on a hyperbola: v_p = √(v_∞² + 2μ/r_p) = √(v_∞² + v_esc²).
 */
export function hyperbolicPeriapsisSpeed(mu: number, rp: number, vInf: number): number | null {
  if (!(mu > 0) || !(rp > 0) || !(vInf >= 0)) return null
  const vesc = escapeVelocity(mu, rp)
  return Math.sqrt(vInf * vInf + vesc * vesc)
}

/** Semi-major axis of hyperbola a = −μ / v_∞² (a < 0). */
export function hyperbolicSma(mu: number, vInf: number): number | null {
  if (!(mu > 0) || !(vInf > 0)) return null
  return -mu / (vInf * vInf)
}

/** Eccentricity e = 1 + r_p v_∞² / μ. */
export function hyperbolicEccentricity(mu: number, rp: number, vInf: number): number | null {
  if (!(mu > 0) || !(rp > 0) || !(vInf >= 0)) return null
  return 1 + (rp * vInf * vInf) / mu
}

/**
 * Turning angle δ (rad) for pure gravity assist (no thrust):
 * sin(δ/2) = 1/e  ⇒  δ = 2 arcsin(1/e).
 */
export function gravityAssistTurn(e: number): number | null {
  if (!(e > 1)) return null
  const s = 1 / e
  if (s > 1) return null
  return 2 * Math.asin(s)
}

/**
 * Δv to go from circular orbit at r to hyperbolic excess v_∞
 * (single impulsive burn): Δv = v_p − v_c.
 */
export function departureBurnFromCircular(
  mu: number,
  r: number,
  vInf: number,
): { vc: number; vp: number; dv: number; c3: number } | null {
  if (!(mu > 0) || !(r > 0) || !(vInf >= 0)) return null
  const vc = Math.sqrt(mu / r)
  const vp = hyperbolicPeriapsisSpeed(mu, r, vInf)
  if (vp == null) return null
  return { vc, vp, dv: vp - vc, c3: characteristicEnergy(vInf) }
}

/** Capture: opposite of departure (arrive on hyperbola, circularize at rp). */
export function captureBurnToCircular(
  mu: number,
  rp: number,
  vInf: number,
): { vc: number; vp: number; dv: number } | null {
  const d = departureBurnFromCircular(mu, rp, vInf)
  if (!d) return null
  return { vc: d.vc, vp: d.vp, dv: d.vp - d.vc }
}
