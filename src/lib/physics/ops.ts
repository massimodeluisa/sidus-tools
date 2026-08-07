/**
 * Ops / mission-analysis helpers (educational, pure SI).
 * Heat flux, budgets, coelliptic drift, LOS, Oberth, horizon, beamwidth.
 */

import { EARTH_MU, EARTH_RADIUS } from './constants'
import { circularOrbitVelocity, orbitalPeriod, visViva } from './orbital'

/** Sum Δv phases (ignore non-finite). */
export function deltaVBudget(phases: number[]): { total: number; count: number } | null {
  const ok = phases.filter((d) => Number.isFinite(d) && d >= 0)
  if (!ok.length) return null
  return { total: ok.reduce((a, b) => a + b, 0), count: ok.length }
}

/**
 * Sutton-Graves stagnation-point convective heat flux [W/m²]:
 * q̇ = k √(ρ / R_n) · v³
 * Earth k ≈ 1.83e-4 kg^0.5 / m  (SI consistent educational constant).
 */
export const SUTTON_GRAVES_K_EARTH = 1.83e-4

export function suttonGravesHeatFlux(
  rho: number,
  v: number,
  noseRadius: number,
  k = SUTTON_GRAVES_K_EARTH,
): number | null {
  if (!(rho > 0) || !(v > 0) || !(noseRadius > 0) || !(k > 0)) return null
  return k * Math.sqrt(rho / noseRadius) * v * v * v
}

/**
 * Coelliptic relative mean motion (circular, first-order):
 * n_rel ≈ −(3/2) n (Δa / a)  [rad/s]
 * Time to gain phase Δθ: t = Δθ / |n_rel|
 */
export function coellipticDrift(
  mu: number,
  a: number,
  deltaA: number,
): { n: number; nRel: number; periodRel: number | null } | null {
  if (!(mu > 0) || !(a > 0) || !Number.isFinite(deltaA) || deltaA === 0) return null
  const n = Math.sqrt(mu / (a * a * a))
  const nRel = -1.5 * n * (deltaA / a)
  const periodRel = Math.abs(nRel) > 0 ? (2 * Math.PI) / Math.abs(nRel) : null
  return { n, nRel, periodRel }
}

/** Time [s] to accumulate phase gain |Δθ| [rad] under constant n_rel. */
export function timeForPhaseGain(nRel: number, deltaThetaRad: number): number | null {
  if (!(Math.abs(nRel) > 0) || !(Math.abs(deltaThetaRad) > 0)) return null
  return Math.abs(deltaThetaRad) / Math.abs(nRel)
}

/**
 * LOS range and range-rate from relative position/velocity (any frame):
 * ρ = |r|,  ρ̇ = (r · v) / ρ
 */
export function losRangeRate(
  r: [number, number, number],
  v: [number, number, number],
): { range: number; rangeRate: number } | null {
  const [x, y, z] = r
  const range = Math.hypot(x, y, z)
  if (!(range > 0)) return null
  const rangeRate = (x * v[0] + y * v[1] + z * v[2]) / range
  return { range, rangeRate }
}

/**
 * Oberth energy gain for impulsive Δv at speed v:
 * Δε = v·Δv + ½ Δv²  (specific mechanical energy).
 */
export function oberthEnergyGain(v: number, dv: number): number | null {
  if (!Number.isFinite(v) || !Number.isFinite(dv)) return null
  return v * dv + 0.5 * dv * dv
}

/**
 * Compare same Δv at peri vs apo of ellipse (Oberth demonstration):
 * returns Δε and equivalent “free” advantage at peri.
 */
export function oberthCompare(
  mu: number,
  a: number,
  e: number,
  dv: number,
): { vp: number; va: number; dEp: number; dEa: number; advantage: number } | null {
  if (!(a > 0) || e < 0 || e >= 1 || !(dv > 0)) return null
  const rp = a * (1 - e)
  const ra = a * (1 + e)
  const vp = visViva(mu, rp, a)
  const va = visViva(mu, ra, a)
  const dEp = oberthEnergyGain(vp, dv)!
  const dEa = oberthEnergyGain(va, dv)!
  return { vp, va, dEp, dEa, advantage: dEp - dEa }
}

/**
 * Grazing radio horizon slant range from altitude h (spherical Earth, no refraction):
 * d = √( (R+h)² − R² ) = √(2 R h + h²)
 */
export function horizonSlantRange(h: number, bodyR = EARTH_RADIUS): number | null {
  if (!(h >= 0) || !(bodyR > 0)) return null
  return Math.sqrt(2 * bodyR * h + h * h)
}

/**
 * Approximate half-power beamwidth [rad]: θ ≈ k λ / D
 * with k ≈ 70° → 70·π/180 for many parabolic dishes (educational).
 */
export function antennaBeamwidth(freqHz: number, diameterM: number, kDeg = 70): number | null {
  if (!(freqHz > 0) || !(diameterM > 0) || !(kDeg > 0)) return null
  const c = 299_792_458
  const lambda = c / freqHz
  return ((kDeg * Math.PI) / 180) * (lambda / diameterM)
}

/**
 * Deorbit: impulsive lower periapsis from circular orbit at r.
 * Transfer ellipse: ra = r, rp = R + h_p → a, Δv = v_c − v_a(ellipse at ra).
 */
export function deorbitBurn(
  mu: number,
  rCirc: number,
  rp: number,
): { a: number; dv: number; vc: number; vApo: number; tofHalf: number } | null {
  if (!(mu > 0) || !(rCirc > rp) || !(rp > 0)) return null
  const a = (rCirc + rp) / 2
  const vc = circularOrbitVelocity(mu, rCirc)
  const vApo = Math.sqrt(mu * (2 / rCirc - 1 / a))
  const tofHalf = Math.PI * Math.sqrt((a * a * a) / mu)
  return { a, dv: vc - vApo, vc, vApo, tofHalf }
}

/**
 * Entry interface speed after deorbit (at periapsis of deorbit ellipse).
 */
export function entryInterfaceSpeed(mu: number, rCirc: number, rp: number): number | null {
  if (!(mu > 0) || !(rCirc > rp) || !(rp > 0)) return null
  const a = (rCirc + rp) / 2
  return Math.sqrt(mu * (2 / rp - 1 / a))
}

/** Mean motion [rad/s] and period for circular altitude. */
export function meanMotionFromAltitude(
  h: number,
  mu = EARTH_MU,
  bodyR = EARTH_RADIUS,
): { a: number; n: number; period: number; v: number } | null {
  if (!(h >= 0) || !(mu > 0)) return null
  const a = bodyR + h
  const n = Math.sqrt(mu / (a * a * a))
  return { a, n, period: orbitalPeriod(mu, a), v: circularOrbitVelocity(mu, a) }
}

/**
 * Invert multi-stage: given equal stages N, total Δv, Isp, structural fraction ε,
 * educational ideal equal-stage mass ratio (rocket equation per stage).
 * ve = Isp g0; Δv_stage = Δv/N; m0/mf = exp(Δv_stage/ve).
 */
export function equalStageMassRatio(
  totalDv: number,
  nStages: number,
  ispS: number,
  g0 = 9.80665,
): { dvStage: number; massRatio: number; ve: number } | null {
  if (!(totalDv > 0) || !(nStages >= 1) || !(ispS > 0)) return null
  const ve = ispS * g0
  const dvStage = totalDv / nStages
  return { dvStage, massRatio: Math.exp(dvStage / ve), ve }
}
