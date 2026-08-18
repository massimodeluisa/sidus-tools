/**
 * Wave 11: B-plane targeting triad, QUEST/TRIAD, Herrick–Gibbs,
 * lunisolar secular rates, pump/crank flyby, Schweighart–Sedwick.
 */

import { EARTH_J2 } from './j2'
import { EARTH_MU, EARTH_RADIUS, MOON_MU } from './constants'
import { gravityAssistTurn, hyperbolicEccentricity } from './hyperbolic'
import { cwPropagate, type CwState } from './cw'
import { quatNormalize, quatToDcm, type Quat } from './wave10'
import { vadd, vcross, vdot, vnorm, vscale, vsub, vunit, type Vec3 } from './vector'

export { MOON_MU }

const Z_HAT: Vec3 = [0, 0, 1]

export type BPlaneTarget = {
  vInf: number
  e: number
  turn: number
  b: number
  rp: number
  sHat: Vec3
  tHat: Vec3
  rHat: Vec3
  bDotT: number
  bDotR: number
}

/** B-plane S,T,R from v∞, μ, rp and clock angle θ (from T toward R). */
export function bPlaneTarget(opts: {
  vInf: Vec3
  mu: number
  rp: number
  clock?: number
}): BPlaneTarget | null {
  const { vInf, mu, rp } = opts
  const clock = opts.clock ?? 0
  const v = vnorm(vInf)
  if (!(mu > 0) || !(rp > 0) || !(v > 0) || !Number.isFinite(clock)) return null
  const e = hyperbolicEccentricity(mu, rp, v)
  if (e == null || !(e > 1)) return null
  const turn = gravityAssistTurn(e)
  if (turn == null) return null
  const aAbs = mu / (v * v)
  const b = aAbs * Math.sqrt(e * e - 1)
  const sHat = vunit(vInf)
  let tHat = vunit(vcross(Z_HAT, sHat))
  if (vnorm(tHat) < 1e-12) tHat = vunit(vcross([1, 0, 0], sHat))
  if (vnorm(tHat) < 1e-12) return null
  const rHat = vunit(vcross(sHat, tHat))
  const bDotT = b * Math.cos(clock)
  const bDotR = b * Math.sin(clock)
  return { vInf: v, e, turn, b, rp, sHat, tHat, rHat, bDotT, bDotR }
}

export type AttitudeEstimate = {
  triad: Quat
  quest: Quat
  residualTriad: number
  residualQuest: number
}

function dcmFromTriad(w1: Vec3, w2: Vec3, v1: Vec3, v2: Vec3): number[][] | null {
  const tb1 = vunit(w1)
  const tb2 = vunit(vcross(w1, w2))
  if (vnorm(tb2) < 1e-12) return null
  const tb3 = vcross(tb1, tb2)
  const tr1 = vunit(v1)
  const tr2 = vunit(vcross(v1, v2))
  if (vnorm(tr2) < 1e-12) return null
  const tr3 = vcross(tr1, tr2)
  const Bt: Vec3[] = [tb1, tb2, tb3]
  const Rt: Vec3[] = [tr1, tr2, tr3]
  const A: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      A[i][j] = Bt[0][i] * Rt[0][j] + Bt[1][i] * Rt[1][j] + Bt[2][i] * Rt[2][j]
    }
  }
  return A
}

function dcmToQuat(A: number[][]): Quat | null {
  const t = A[0][0] + A[1][1] + A[2][2]
  let q: Quat
  if (t > 0) {
    const s = Math.sqrt(t + 1) * 2
    q = {
      w: 0.25 * s,
      x: (A[2][1] - A[1][2]) / s,
      y: (A[0][2] - A[2][0]) / s,
      z: (A[1][0] - A[0][1]) / s,
    }
  } else if (A[0][0] > A[1][1] && A[0][0] > A[2][2]) {
    const s = Math.sqrt(1 + A[0][0] - A[1][1] - A[2][2]) * 2
    q = {
      w: (A[2][1] - A[1][2]) / s,
      x: 0.25 * s,
      y: (A[0][1] + A[1][0]) / s,
      z: (A[0][2] + A[2][0]) / s,
    }
  } else if (A[1][1] > A[2][2]) {
    const s = Math.sqrt(1 + A[1][1] - A[0][0] - A[2][2]) * 2
    q = {
      w: (A[0][2] - A[2][0]) / s,
      x: (A[0][1] + A[1][0]) / s,
      y: 0.25 * s,
      z: (A[1][2] + A[2][1]) / s,
    }
  } else {
    const s = Math.sqrt(1 + A[2][2] - A[0][0] - A[1][1]) * 2
    q = {
      w: (A[1][0] - A[0][1]) / s,
      x: (A[0][2] + A[2][0]) / s,
      y: (A[1][2] + A[2][1]) / s,
      z: 0.25 * s,
    }
  }
  return quatNormalize(q)
}

function apply3(A: number[][], v: Vec3): Vec3 {
  return [
    A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2],
    A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2],
    A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2],
  ]
}

function residualAngle(A: number[][], w: Vec3, v: Vec3): number {
  const pred = apply3(A, vunit(v))
  const c = Math.min(1, Math.max(-1, vdot(vunit(w), pred)))
  return Math.acos(c)
}

function questQuat(w1: Vec3, w2: Vec3, v1: Vec3, v2: Vec3): Quat | null {
  const a1 = 0.5
  const a2 = 0.5
  const B = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  const pairs: [Vec3, Vec3, number][] = [
    [vunit(w1), vunit(v1), a1],
    [vunit(w2), vunit(v2), a2],
  ]
  for (const [w, v, a] of pairs) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) B[i][j] += a * w[i] * v[j]
    }
  }
  const sigma = B[0][0] + B[1][1] + B[2][2]
  const z: Vec3 = [B[1][2] - B[2][1], B[2][0] - B[0][2], B[0][1] - B[1][0]]
  const S = [
    [B[0][0] + B[0][0], B[0][1] + B[1][0], B[0][2] + B[2][0]],
    [B[1][0] + B[0][1], B[1][1] + B[1][1], B[1][2] + B[2][1]],
    [B[2][0] + B[0][2], B[2][1] + B[1][2], B[2][2] + B[2][2]],
  ]
  const K = [
    [sigma + 4, z[0], z[1], z[2]],
    [z[0], S[0][0] - sigma + 4, S[0][1], S[0][2]],
    [z[1], S[1][0], S[1][1] - sigma + 4, S[1][2]],
    [z[2], S[2][0], S[2][1], S[2][2] - sigma + 4],
  ]
  let qv = [1, 0, 0, 0]
  for (let n = 0; n < 80; n++) {
    const next = [0, 0, 0, 0]
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) next[i] += K[i][j] * qv[j]
    }
    const nn = Math.hypot(next[0], next[1], next[2], next[3])
    if (!(nn > 0)) return null
    qv = next.map((x) => x / nn)
  }
  return quatNormalize({ w: qv[0], x: qv[1], y: qv[2], z: qv[3] })
}

/** TRIAD + QUEST from two body/inertial unit-vector pairs. */
export function triadQuest(opts: {
  w1: Vec3
  w2: Vec3
  v1: Vec3
  v2: Vec3
}): AttitudeEstimate | null {
  const { w1, w2, v1, v2 } = opts
  if ([w1, w2, v1, v2].some((u) => vnorm(u) < 1e-12)) return null
  const A = dcmFromTriad(w1, w2, v1, v2)
  if (!A) return null
  const triad = dcmToQuat(A)
  const quest = questQuat(w1, w2, v1, v2)
  if (!triad || !quest) return null
  const Aq0 = quatToDcm(quest)
  if (!Aq0) return null
  let Aq = [
    [Aq0[0][0], Aq0[0][1], Aq0[0][2]],
    [Aq0[1][0], Aq0[1][1], Aq0[1][2]],
    [Aq0[2][0], Aq0[2][1], Aq0[2][2]],
  ]
  let qOut = quest
  let rQ = residualAngle(Aq, w1, v1)
  if (rQ > Math.PI / 2) {
    Aq = [
      [Aq[0][0], Aq[1][0], Aq[2][0]],
      [Aq[0][1], Aq[1][1], Aq[2][1]],
      [Aq[0][2], Aq[1][2], Aq[2][2]],
    ]
    qOut = { w: quest.w, x: -quest.x, y: -quest.y, z: -quest.z }
    rQ = residualAngle(Aq, w1, v1)
  }
  return {
    triad,
    quest: qOut,
    residualTriad: residualAngle(A, w1, v1),
    residualQuest: rQ,
  }
}

export type HerrickGibbs = {
  v2: Vec3
  r2n: number
  v2n: number
}

/** Herrick–Gibbs: three position samples → velocity at the middle epoch. */
export function herrickGibbs(opts: {
  r1: Vec3
  r2: Vec3
  r3: Vec3
  t1: number
  t2: number
  t3: number
  mu: number
}): HerrickGibbs | null {
  const { r1, r2, r3, t1, t2, t3, mu } = opts
  const dt21 = t2 - t1
  const dt32 = t3 - t2
  const dt31 = t3 - t1
  if (!(mu > 0) || !(dt21 > 0) || !(dt32 > 0) || !(dt31 > 0)) return null
  const r1n = vnorm(r1)
  const r2n = vnorm(r2)
  const r3n = vnorm(r3)
  if (!(r1n > 0) || !(r2n > 0) || !(r3n > 0)) return null
  const c1 = -dt32 * (1 / (dt21 * dt31) + mu / (12 * r1n ** 3))
  const c2 = (dt32 - dt21) * (1 / (dt21 * dt32) + mu / (12 * r2n ** 3))
  const c3 = dt21 * (1 / (dt32 * dt31) + mu / (12 * r3n ** 3))
  const v2 = vadd(vadd(vscale(r1, c1), vscale(r2, c2)), vscale(r3, c3))
  const v2n = vnorm(v2)
  if (!Number.isFinite(v2n) || !(v2n > 0)) return null
  return { v2, r2n, v2n }
}

/** Vallado: Herrick is for short arcs; Gibbs for well-separated coplanar samples. */
export const HERRICK_ARC_LIMIT_RAD = (5 * Math.PI) / 180

export type PositionArcs = {
  theta12: number
  theta23: number
  theta13: number
  recommend: 'herrick' | 'gibbs'
}

function angleBetween(a: Vec3, b: Vec3): number | null {
  const an = vnorm(a)
  const bn = vnorm(b)
  if (!(an > 0) || !(bn > 0)) return null
  const c = Math.min(1, Math.max(-1, vdot(a, b) / (an * bn)))
  return Math.acos(c)
}

/** Angles at the focus between three position samples, plus a method hint. */
export function positionArcs(r1: Vec3, r2: Vec3, r3: Vec3): PositionArcs | null {
  const theta12 = angleBetween(r1, r2)
  const theta23 = angleBetween(r2, r3)
  const theta13 = angleBetween(r1, r3)
  if (theta12 == null || theta23 == null || theta13 == null) return null
  const wide = Math.max(theta12, theta23) > HERRICK_ARC_LIMIT_RAD
  return { theta12, theta23, theta13, recommend: wide ? 'gibbs' : 'herrick' }
}

/**
 * Gibbs (Vallado Alg. 54): three coplanar positions → v₂.
 * Exact for a two-body conic; does not use the sample times.
 */
export function gibbs(opts: {
  r1: Vec3
  r2: Vec3
  r3: Vec3
  mu: number
}): HerrickGibbs | null {
  const { r1, r2, r3, mu } = opts
  if (!(mu > 0)) return null
  const r1n = vnorm(r1)
  const r2n = vnorm(r2)
  const r3n = vnorm(r3)
  if (!(r1n > 0) || !(r2n > 0) || !(r3n > 0)) return null
  const z23 = vcross(r2, r3)
  const z31 = vcross(r3, r1)
  const z12 = vcross(r1, r2)
  const N = vadd(vadd(vscale(z23, r1n), vscale(z31, r2n)), vscale(z12, r3n))
  const D = vadd(vadd(z12, z23), z31)
  const nMag = vnorm(N)
  const dMag = vnorm(D)
  if (!(nMag > 0) || !(dMag > 0)) return null
  if (vdot(N, D) <= 0) return null
  const S = vadd(
    vadd(vscale(r1, r2n - r3n), vscale(r2, r3n - r1n)),
    vscale(r3, r1n - r2n),
  )
  const Lg = Math.sqrt(mu / (nMag * dMag))
  if (!Number.isFinite(Lg) || !(Lg > 0)) return null
  const B = vcross(D, r2)
  const v2 = vadd(vscale(B, Lg / r2n), vscale(S, Lg))
  const v2n = vnorm(v2)
  if (!Number.isFinite(v2n) || !(v2n > 0)) return null
  return { v2, r2n, v2n }
}

export const MOON_SMA_M = 384_400_000

/** Moon / Sun teaching elements relative to Earth's equator (Cook-class). */
export const MOON_I3_RAD = (5.145 * Math.PI) / 180
export const MOON_E3 = 0.0549
export const SUN_I3_RAD = (23.439281 * Math.PI) / 180
export const SUN_E3 = 0.0167086

export type LunisolarRates = {
  nSat: number
  n3: number
  raanRate: number
  argpRate: number
  kozaiTheta: number
  argpPeriod: number | null
  p2: number
  e3Fac: number
  scale: number
}

/**
 * Doubly-averaged third-body rates (Cook/Vallado class).
 * Ω̇ = −(3/4)(n3²/n) (1−e²)^{−1/2} cos i · P₂(cos i₃) (1−e₃²)^{−3/2}
 * ω̇ = (3/8)(n3²/n) √(1−e²) (4 − 5 sin² i) · P₂(cos i₃) (1−e₃²)^{−3/2}
 * i₃ = e₃ = 0 recovers the circular equatorial perturber.
 */
export function lunisolarRates(opts: {
  a: number
  e: number
  iRad: number
  mu: number
  mu3: number
  d3: number
  i3?: number
  e3?: number
}): LunisolarRates | null {
  const { a, e, iRad, mu, mu3, d3 } = opts
  const i3 = opts.i3 ?? 0
  const e3 = opts.e3 ?? 0
  if (!(a > 0) || !(e >= 0) || e >= 1 || !(mu > 0) || !(mu3 > 0) || !(d3 > 0)) return null
  if (!Number.isFinite(iRad) || !Number.isFinite(i3) || !(e3 >= 0) || e3 >= 1) return null
  const nSat = Math.sqrt(mu / (a * a * a))
  const n3 = Math.sqrt(mu3 / (d3 * d3 * d3))
  const se = Math.sqrt(1 - e * e)
  if (!(se > 0) || !(nSat > 0)) return null
  const ci3 = Math.cos(i3)
  const p2 = 0.5 * (3 * ci3 * ci3 - 1)
  const e3Fac = (1 - e3 * e3) ** -1.5
  const scale = p2 * e3Fac
  if (!Number.isFinite(scale)) return null
  const k = ((n3 * n3) / nSat) * scale
  const si = Math.sin(iRad)
  const raanRate = -0.75 * k * (1 / se) * Math.cos(iRad)
  const argpRate = 0.375 * k * se * (4 - 5 * si * si)
  const kozaiTheta = se * Math.cos(iRad)
  const argpPeriod = Math.abs(argpRate) > 1e-20 ? (2 * Math.PI) / Math.abs(argpRate) : null
  return { nSat, n3, raanRate, argpRate, kozaiTheta, argpPeriod, p2, e3Fac, scale }
}

export type PumpCrank = {
  e: number
  turn: number
  vInfOut: Vec3
  vInfOutMag: number
  dvHelio: number
  energyGain: number
}

/**
 * Pump/crank gravity assist (Strange/Campagnola-class teaching model).
 * Planet heliocentric velocity along +X. Pump α is the angle of incoming v∞
 * from −X toward +Z. Crank κ rotates the turn axis about incoming v∞; the
 * outgoing v∞ is incoming v∞ rotated by the hyperbolic turn δ about that axis.
 */
export function pumpCrankFlyby(opts: {
  vInf: number
  mu: number
  rp: number
  pump: number
  crank: number
  vPlanet: number
}): PumpCrank | null {
  const { vInf, mu, rp, pump, crank, vPlanet } = opts
  if (!(vInf > 0) || !(mu > 0) || !(rp > 0) || !(vPlanet > 0)) return null
  if (![pump, crank].every(Number.isFinite)) return null
  const e = hyperbolicEccentricity(mu, rp, vInf)
  if (e == null || !(e > 1)) return null
  const turn = gravityAssistTurn(e)
  if (turn == null) return null
  const vin: Vec3 = [-vInf * Math.cos(pump), 0, vInf * Math.sin(pump)]
  const sHat = vunit(vin)
  let ref = vunit(vcross(sHat, [0, 1, 0]))
  if (vnorm(ref) < 1e-12) ref = vunit(vcross(sHat, [0, 0, 1]))
  if (vnorm(ref) < 1e-12) return null
  const turnAxis = rotateAbout(ref, sHat, crank)
  const vout = rotateAbout(vin, turnAxis, turn)
  const vInfOutMag = vnorm(vout)
  const vp: Vec3 = [vPlanet, 0, 0]
  const vinH = vadd(vp, vin)
  const voutH = vadd(vp, vout)
  const energyGain = 0.5 * (vdot(voutH, voutH) - vdot(vinH, vinH))
  const dvHelio = vnorm(vsub(voutH, vinH))
  return { e, turn, vInfOut: vout, vInfOutMag, dvHelio, energyGain }
}

function rotateAbout(v: Vec3, axisIn: Vec3, ang: number): Vec3 {
  const k = vunit(axisIn)
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const kxv = vcross(k, v)
  const kdv = vdot(k, v)
  return vadd(vadd(vscale(v, c), vscale(kxv, s)), vscale(k, kdv * (1 - c)))
}

export type SchweighartSedwick = {
  s: number
  nBar: number
  nZ: number
  state: CwState
  cw: CwState
}

/**
 * Schweighart–Sedwick (JGCD 2002) linearized J2 relative motion.
 * s = (3/8) J2 (R/a)² (1 + 3 cos 2i), c = √(1+s)
 * ẍ − 2 n c ẏ − (5c²−2) n² x = 0,  ÿ + 2 n c ẋ = 0,  z̈ + (3c²−2) n² z = 0
 */
export function schweighartSedwick(opts: {
  a: number
  iRad: number
  state0: CwState
  dt: number
  mu?: number
  j2?: number
  bodyR?: number
}): SchweighartSedwick | null {
  const mu = opts.mu ?? EARTH_MU
  const j2 = opts.j2 ?? EARTH_J2
  const bodyR = opts.bodyR ?? EARTH_RADIUS
  const { a, iRad, state0, dt } = opts
  if (!(a > 0) || !(mu > 0) || !Number.isFinite(iRad) || !Number.isFinite(dt)) return null
  const n = Math.sqrt(mu / (a * a * a))
  const s = (3 / 8) * j2 * (bodyR / a) ** 2 * (1 + 3 * Math.cos(2 * iRad))
  if (!Number.isFinite(s) || s <= -1 || s >= 1) return null
  const c = Math.sqrt(1 + s)
  const nBar = n * c
  const omega = n * Math.sqrt(1 - s)
  const nZ = n * Math.sqrt(3 * c * c - 2)
  if (!(omega > 0) || !(nZ > 0)) return null
  const cw = cwPropagate(n, state0, dt)
  if (!cw) return null
  const { x: x0, y: y0, z: z0, vx: vx0, vy: vy0, vz: vz0 } = state0
  const xp = (4 * c * c * x0 + (2 * c * vy0) / n) / (1 - s)
  const A = x0 - xp
  const B = vx0 / omega
  const wt = omega * dt
  const cwv = Math.cos(wt)
  const sw = Math.sin(wt)
  const x = A * cwv + B * sw + xp
  const vx = -A * omega * sw + B * omega * cwv
  const integ = (A / omega) * sw + (B / omega) * (1 - cwv) + (xp - x0) * dt
  const y = y0 + vy0 * dt - 2 * n * c * integ
  const vy = vy0 - 2 * n * c * (x - x0)
  const zt = nZ * dt
  const z = z0 * Math.cos(zt) + (vz0 / nZ) * Math.sin(zt)
  const vz = -z0 * nZ * Math.sin(zt) + vz0 * Math.cos(zt)
  if (![x, y, z, vx, vy, vz].every(Number.isFinite)) return null
  return { s, nBar, nZ, state: { x, y, z, vx, vy, vz }, cw }
}
