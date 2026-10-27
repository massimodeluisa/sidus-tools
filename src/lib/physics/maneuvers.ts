/** Extra impulsive maneuvers (two-body, SI). */

import { hohmannTransfer, planeChangeDeltaV, visViva, circularOrbitVelocity } from './orbital'

/**
 * Combined Hohmann + plane change.
 * Burn 1 is the Hohmann departure magnitude. Burn 2 is circularize plus the
 * full plane change at the destination radius r2: apoapsis when raising,
 * periapsis when lowering.
 * Δv2 = √(v_t² + v2² − 2 v_t v2 cos Δi)
 */
export function hohmannWithPlaneChange(
  mu: number,
  r1: number,
  r2: number,
  deltaIRad: number,
): {
  hohmann: ReturnType<typeof hohmannTransfer>
  dvPlaneAtR1: number
  dvCombined: number
  dv1: number
  dv2: number
  savings: number
} | null {
  if (!(mu > 0) || !(r1 > 0) || !(r2 > 0) || !Number.isFinite(deltaIRad)) return null
  const h = hohmannTransfer(mu, r1, r2)
  const v1 = Math.sqrt(mu / r1)
  const v2 = Math.sqrt(mu / r2)
  const a = (r1 + r2) / 2
  const vApo = Math.sqrt(mu * (2 / r2 - 1 / a))
  const di = Math.abs(deltaIRad)
  const dvPlaneAtR1 = planeChangeDeltaV(v1, di)
  // Burn 1: pure Hohmann departure
  const dv1 = h.dv1
  // Burn 2: combined circularize + plane change at the destination radius r2.
  const cos = Math.cos(di)
  const dv2 = Math.sqrt(Math.max(0, vApo * vApo + v2 * v2 - 2 * vApo * v2 * cos))
  const dvCombined = dv1 + dv2
  const sequential = h.dvTotal + dvPlaneAtR1
  return {
    hohmann: h,
    dvPlaneAtR1,
    dvCombined,
    dv1,
    dv2,
    savings: sequential - dvCombined,
  }
}

/**
 * Circularize at periapsis or apoapsis of an ellipse:
 * Δv = |v_aps − v_circ(r_aps)|.
 */
export function circularizeBurn(
  mu: number,
  a: number,
  e: number,
  at: 'peri' | 'apo',
): { r: number; vEll: number; vCirc: number; dv: number } | null {
  if (
    !Number.isFinite(mu) || !(mu > 0) ||
    !Number.isFinite(a) || !(a > 0) ||
    !Number.isFinite(e) || e < 0 || e >= 1 ||
    (at !== 'peri' && at !== 'apo')
  ) return null
  const rp = a * (1 - e)
  const ra = a * (1 + e)
  const r = at === 'peri' ? rp : ra
  if (!Number.isFinite(r) || !(r > 0)) return null
  const vEll = visViva(mu, r, a)
  const vCirc = circularOrbitVelocity(mu, r)
  const dv = Math.abs(vEll - vCirc)
  if (!Number.isFinite(vEll) || !(vEll > 0) || !Number.isFinite(vCirc) || !(vCirc > 0) || !Number.isFinite(dv)) {
    return null
  }
  return { r, vEll, vCirc, dv }
}

/** GEO radius for body: a such that T = sidereal day (Earth default 86164.0905 s). */
export function geoRadius(mu: number, periodS = 86164.0905): number | null {
  if (!(mu > 0) || !(periodS > 0)) return null
  return Math.cbrt((mu * periodS * periodS) / (4 * Math.PI * Math.PI))
}

/**
 * Gauss planetary: circular orbit, tangential Δv → Δa:
 * Δa ≈ 2 a Δv / v   (first-order).
 */
export function deltaAFromTangentialDv(a: number, v: number, dv: number): number | null {
  if (!(a > 0) || !(v > 0) || !Number.isFinite(dv)) return null
  return (2 * a * dv) / v
}

/** Inverse: Δv for desired Δa on circular orbit. */
export function tangentialDvFromDeltaA(a: number, v: number, da: number): number | null {
  if (!(a > 0) || !(v > 0) || !Number.isFinite(da)) return null
  return (v * da) / (2 * a)
}

/**
 * Compare plane-change cost at circular r vs at apo of ellipse with same periapsis r_p and apo r_a.
 * Δv(r) = 2 v(r) sin(Δi/2).
 */
export function planeChangeAtApsides(
  mu: number,
  rp: number,
  ra: number,
  deltaIRad: number,
): { dvPeri: number; dvApo: number; ratio: number } | null {
  if (!(mu > 0) || !(rp > 0) || !(ra > rp) || !Number.isFinite(deltaIRad)) return null
  const a = (rp + ra) / 2
  const vp = visViva(mu, rp, a)
  const va = visViva(mu, ra, a)
  if (!Number.isFinite(vp) || !(vp > 0) || !Number.isFinite(va) || !(va > 0)) return null
  const di = Math.abs(deltaIRad)
  const dvPeri = planeChangeDeltaV(vp, di)
  const dvApo = planeChangeDeltaV(va, di)
  if (!Number.isFinite(dvPeri) || !Number.isFinite(dvApo)) return null
  // At zero included angle both burns vanish; the finite limit is v_apo/v_peri.
  const ratio = dvPeri === 0 ? va / vp : dvApo / dvPeri
  if (!Number.isFinite(ratio)) return null
  return { dvPeri, dvApo, ratio }
}
