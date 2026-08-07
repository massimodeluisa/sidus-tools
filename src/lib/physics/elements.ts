/**
 * Classical orbital elements ↔ Cartesian state (two-body).
 * Algorithms follow Vallado / Curtis (independent reimplementation). SI units.
 */

import { vcross, vdot, vnorm, type Vec3 } from './vector'

const TWO_PI = 2 * Math.PI
const EPS = 1e-12

export type ClassicalElements = {
  /** Semi-major axis (m); negative for hyperbola */
  a: number
  /** Eccentricity */
  e: number
  /** Inclination (rad) */
  i: number
  /** RAAN Ω (rad) */
  raan: number
  /** Argument of periapsis ω (rad) */
  argp: number
  /** True anomaly ν (rad) */
  nu: number
  /** Specific angular momentum magnitude */
  h: number
  /** Specific energy (J/kg) */
  energy: number
}

function wrap0_2pi(x: number): number {
  let a = x % TWO_PI
  if (a < 0) a += TWO_PI
  return a
}

function clampAcos(x: number): number {
  return Math.acos(Math.min(1, Math.max(-1, x)))
}

/** r, v → classical orbital elements (equatorial frame). */
export function rvToElements(r: Vec3, v: Vec3, mu: number): ClassicalElements | null {
  const rmag = vnorm(r)
  const vmag = vnorm(v)
  if (!(rmag > 0) || !(vmag > 0) || !(mu > 0)) return null

  const hvec = vcross(r, v)
  const h = vnorm(hvec)
  if (!(h > EPS)) return null

  const nvec = vcross([0, 0, 1], hvec)
  const n = vnorm(nvec)

  const v2 = vmag * vmag
  const rdotv = vdot(r, v)
  // e = ((v² − μ/r) r − (r·v) v) / μ
  const evec: Vec3 = [
    ((v2 - mu / rmag) * r[0] - rdotv * v[0]) / mu,
    ((v2 - mu / rmag) * r[1] - rdotv * v[1]) / mu,
    ((v2 - mu / rmag) * r[2] - rdotv * v[2]) / mu,
  ]
  const e = vnorm(evec)

  const energy = v2 / 2 - mu / rmag
  let a: number
  if (Math.abs(e - 1) < 1e-10) {
    a = Infinity
  } else {
    a = -mu / (2 * energy)
  }

  const i = clampAcos(hvec[2] / h)

  let raan = 0
  if (n > EPS) {
    raan = clampAcos(nvec[0] / n)
    if (nvec[1] < 0) raan = TWO_PI - raan
  }

  let argp = 0
  if (n > EPS && e > EPS) {
    argp = clampAcos(vdot(nvec, evec) / (n * e))
    if (evec[2] < 0) argp = TWO_PI - argp
  } else if (e > EPS) {
    // equatorial: use longitude of periapsis from e_x
    argp = Math.atan2(evec[1], evec[0])
    if (argp < 0) argp += TWO_PI
  }

  let nu = 0
  if (e > EPS) {
    nu = clampAcos(vdot(evec, r) / (e * rmag))
    if (rdotv < 0) nu = TWO_PI - nu
  } else {
    // circular: true longitude from position
    if (n > EPS) {
      nu = clampAcos(vdot(nvec, r) / (n * rmag))
      if (r[2] < 0) nu = TWO_PI - nu
    } else {
      nu = Math.atan2(r[1], r[0])
      if (nu < 0) nu += TWO_PI
    }
  }

  return {
    a: Number.isFinite(a) ? a : Infinity,
    e,
    i,
    raan: wrap0_2pi(raan),
    argp: wrap0_2pi(argp),
    nu: wrap0_2pi(nu),
    h,
    energy,
  }
}

/** Classical elements → r, v in the same equatorial frame. */
export function elementsToRv(
  el: Pick<ClassicalElements, 'a' | 'e' | 'i' | 'raan' | 'argp' | 'nu'>,
  mu: number,
): { r: Vec3; v: Vec3 } | null {
  const { a, e, i, raan, argp, nu } = el
  if (!(mu > 0) || e < 0) return null
  if (e >= 1 && !(a < 0)) {
    // hyperbola needs a < 0; allow a > 0 with e>=1 only if we interpret |a|
  }

  let p: number
  if (Math.abs(e - 1) < 1e-12) {
    // parabola needs p separately: reject without p
    return null
  }
  p = a * (1 - e * e)
  if (!(p > 0) && e < 1) return null
  if (e >= 1) {
    // hyperbolic: a < 0, p = a(1-e²) > 0
    p = Math.abs(a) * (e * e - 1)
  }

  const cnu = Math.cos(nu)
  const snu = Math.sin(nu)
  const denom = 1 + e * cnu
  if (Math.abs(denom) < EPS) return null

  const r_pqw: Vec3 = [(p * cnu) / denom, (p * snu) / denom, 0]
  const sqrtMuP = Math.sqrt(mu / p)
  const v_pqw: Vec3 = [-sqrtMuP * snu, sqrtMuP * (e + cnu), 0]

  // R3(-Ω) R1(-i) R3(-ω)
  const cO = Math.cos(raan)
  const sO = Math.sin(raan)
  const co = Math.cos(argp)
  const so = Math.sin(argp)
  const ci = Math.cos(i)
  const si = Math.sin(i)

  const R = [
    [cO * co - sO * so * ci, -cO * so - sO * co * ci, sO * si],
    [sO * co + cO * so * ci, -sO * so + cO * co * ci, -cO * si],
    [so * si, co * si, ci],
  ] as const

  const r: Vec3 = [
    R[0][0] * r_pqw[0] + R[0][1] * r_pqw[1] + R[0][2] * r_pqw[2],
    R[1][0] * r_pqw[0] + R[1][1] * r_pqw[1] + R[1][2] * r_pqw[2],
    R[2][0] * r_pqw[0] + R[2][1] * r_pqw[1] + R[2][2] * r_pqw[2],
  ]
  const v: Vec3 = [
    R[0][0] * v_pqw[0] + R[0][1] * v_pqw[1] + R[0][2] * v_pqw[2],
    R[1][0] * v_pqw[0] + R[1][1] * v_pqw[1] + R[1][2] * v_pqw[2],
    R[2][0] * v_pqw[0] + R[2][1] * v_pqw[1] + R[2][2] * v_pqw[2],
  ]

  return { r, v }
}

export function deg(rad: number): number {
  return (rad * 180) / Math.PI
}

export function rad(deg: number): number {
  return (deg * Math.PI) / 180
}
