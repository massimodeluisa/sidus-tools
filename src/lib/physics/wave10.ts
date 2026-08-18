/**
 * Wave 10: HEO class orbits, J2/J3 frozen e, T/W, Planck, EIRP/G/T,
 * aerospace 3-2-1 attitude, Earth–Mars porkchop sketch, conjunction Pc.
 */

import { AU, C, EARTH_MU, EARTH_RADIUS, G0, SUN_MU } from './constants'
import { EARTH_J2 } from './j2'
import { lambertSolve } from './lambert'
import { vnorm, vsub, type Vec3 } from './vector'

/** Earth sidereal day (IAU, s). Molniya = ½, Tundra = 1. */
export const EARTH_SIDEREAL_DAY_S = 86164.0905

/** EGM96-class unnormalised J3. */
export const EARTH_J3 = -2.5326564853324e-6

export const PLANCK_H = 6.62607015e-34
export const BOLTZMANN_K = 1.380649e-23

export const MARS_SMA_M = 1.523679 * AU
export const EARTH_HELIO_L0 = (100.46435 * Math.PI) / 180
export const MARS_HELIO_L0 = (355.45332 * Math.PI) / 180
/** J2000.0 TT ≈ 2000-01-01 12:00:00 UTC (educational epoch). */
export const J2000_UNIX_S = 946_728_000

export type HeoClass = 'molniya' | 'tundra'

export function criticalInclinationRad(): number {
  return Math.acos(Math.sqrt(1 / 5))
}

export function heoPeriodS(kind: HeoClass): number {
  return kind === 'tundra' ? EARTH_SIDEREAL_DAY_S : EARTH_SIDEREAL_DAY_S / 2
}

export function smaFromPeriod(mu: number, periodS: number): number | null {
  if (!(mu > 0) || !(periodS > 0)) return null
  const a = Math.cbrt((mu * periodS * periodS) / (4 * Math.PI * Math.PI))
  return Number.isFinite(a) && a > 0 ? a : null
}

/** Kepler: ν → M (rad), elliptic. */
export function trueAnomalyToMean(nu: number, e: number): number | null {
  if (!(e >= 0) || e >= 1 || !Number.isFinite(nu)) return null
  const s = Math.sqrt((1 - e) / (1 + e))
  const E = 2 * Math.atan2(s * Math.sin(nu / 2), Math.cos(nu / 2))
  return E - e * Math.sin(E)
}

export type HeoOrbit = {
  kind: HeoClass
  inclination: number
  period: number
  a: number
  rp: number
  ra: number
  e: number
  dwell: number
}

/**
 * Molniya / Tundra from perigee altitude.
 * Inclination is the J2-critical value so ω̇ vanishes (apogee dwell stays in latitude).
 * Dwell is time with |ν − π| ≤ dwellHalfAngle (default 30°).
 */
export function heoOrbitFromPerigee(opts: {
  kind: HeoClass
  perigeeAlt: number
  dwellHalfAngle?: number
  mu?: number
  bodyR?: number
  retrograde?: boolean
}): HeoOrbit | null {
  const mu = opts.mu ?? EARTH_MU
  const R = opts.bodyR ?? EARTH_RADIUS
  if (!(opts.perigeeAlt >= 0) || !(R > 0)) return null
  const T = heoPeriodS(opts.kind)
  const a = smaFromPeriod(mu, T)
  if (a == null) return null
  const rp = R + opts.perigeeAlt
  if (!(rp > 0) || !(rp < a)) return null
  const ra = 2 * a - rp
  if (!(ra > rp)) return null
  const e = (ra - rp) / (ra + rp)
  if (!(e > 0) || e >= 1) return null
  const i0 = criticalInclinationRad()
  const i = opts.retrograde ? Math.PI - i0 : i0
  const delta = opts.dwellHalfAngle ?? Math.PI / 6
  if (!(delta > 0) || delta >= Math.PI) return null
  const n = (2 * Math.PI) / T
  const M1 = trueAnomalyToMean(Math.PI - delta, e)
  if (M1 == null) return null
  const t1 = (((M1 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / n
  const dwell = Math.max(0, Math.min(T, T - 2 * t1))
  return { kind: opts.kind, inclination: i, period: T, a, rp, ra, e, dwell }
}

/**
 * First-order J2+J3 frozen eccentricity (ω = ±90°):
 * e ≈ −(J3 /(2 J2)) (R / a) sin i
 */
export function frozenEccentricityJ2J3(
  a: number,
  iRad: number,
  j2 = EARTH_J2,
  j3 = EARTH_J3,
  bodyR = EARTH_RADIUS,
): number | null {
  if (!(a > 0) || !(bodyR > 0) || !Number.isFinite(iRad)) return null
  if (!(Math.abs(j2) > 0)) return null
  const e = -((j3 / (2 * j2)) * (bodyR / a) * Math.sin(iRad))
  if (!Number.isFinite(e) || e <= 0 || e >= 1) return null
  return e
}

export function thrustToWeight(force: number, mass: number, g0 = G0): number | null {
  if (!(force > 0) || !(mass > 0) || !(g0 > 0)) return null
  const r = force / (mass * g0)
  return Number.isFinite(r) ? r : null
}

/** Planck B_λ(λ, T) [W / (m²·sr·m)]. */
export function planckSpectralRadiance(lambdaM: number, tempK: number): number | null {
  if (!(lambdaM > 0) || !(tempK > 0)) return null
  const x = (PLANCK_H * C) / (lambdaM * BOLTZMANN_K * tempK)
  if (!Number.isFinite(x) || x <= 0) return null
  if (x > 700) return 0
  const num = (2 * PLANCK_H * C * C) / lambdaM ** 5
  const B = num / (Math.exp(x) - 1)
  return Number.isFinite(B) && B >= 0 ? B : null
}

export function eirpLinear(pt: number, gainLin: number): number | null {
  if (!(pt > 0) || !(gainLin > 0)) return null
  const p = pt * gainLin
  return Number.isFinite(p) ? p : null
}

export function eirpDbW(pt: number, gainLin: number): number | null {
  const p = eirpLinear(pt, gainLin)
  if (p == null) return null
  return 10 * Math.log10(p)
}

export function figureOfMeritGT(gainLin: number, tSys: number): number | null {
  if (!(gainLin > 0) || !(tSys > 0)) return null
  const g = gainLin / tSys
  return Number.isFinite(g) ? g : null
}

export function figureOfMeritGTDb(gainLin: number, tSys: number): number | null {
  const g = figureOfMeritGT(gainLin, tSys)
  if (g == null) return null
  return 10 * Math.log10(g)
}

export type Quat = { w: number; x: number; y: number; z: number }
export type Dcm = [[number, number, number], [number, number, number], [number, number, number]]
export type Euler321 = { yaw: number; pitch: number; roll: number }

export function quatNormalize(q: Quat): Quat | null {
  const n = Math.hypot(q.w, q.x, q.y, q.z)
  if (!(n > 0)) return null
  return { w: q.w / n, x: q.x / n, y: q.y / n, z: q.z / n }
}

/** Active rotation matrix from a unit quaternion (Hamilton, scalar-first). */
export function quatToDcm(qIn: Quat): Dcm | null {
  const q = quatNormalize(qIn)
  if (!q) return null
  const { w, x, y, z } = q
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
    [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
    [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)],
  ]
}

export function applyDcm(m: Dcm, v: Vec3): Vec3 {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ]
}

/** Intrinsic 3-2-1 (yaw–pitch–roll) to quaternion. */
export function euler321ToQuat(yaw: number, pitch: number, roll: number): Quat | null {
  if (![yaw, pitch, roll].every(Number.isFinite)) return null
  const cy = Math.cos(yaw / 2)
  const sy = Math.sin(yaw / 2)
  const cp = Math.cos(pitch / 2)
  const sp = Math.sin(pitch / 2)
  const cr = Math.cos(roll / 2)
  const sr = Math.sin(roll / 2)
  return {
    w: cr * cp * cy + sr * sp * sy,
    x: sr * cp * cy - cr * sp * sy,
    y: cr * sp * cy + sr * cp * sy,
    z: cr * cp * sy - sr * sp * cy,
  }
}

export function quatToEuler321(qIn: Quat): Euler321 | null {
  const m = quatToDcm(qIn)
  if (!m) return null
  const pitch = Math.asin(Math.min(1, Math.max(-1, -m[2][0])))
  const yaw = Math.atan2(m[1][0], m[0][0])
  const roll = Math.atan2(m[2][1], m[2][2])
  return { yaw, pitch, roll }
}

export type HelioState = { r: Vec3; v: Vec3; L: number }

export function heliocentricCircularState(
  a: number,
  L0: number,
  tUnix: number,
  mu = SUN_MU,
): HelioState | null {
  if (!(a > 0) || !(mu > 0) || !Number.isFinite(tUnix) || !Number.isFinite(L0)) return null
  const n = Math.sqrt(mu / (a * a * a))
  const L = L0 + n * (tUnix - J2000_UNIX_S)
  const c = Math.cos(L)
  const s = Math.sin(L)
  const r: Vec3 = [a * c, a * s, 0]
  const v: Vec3 = [(-n * a) * s, n * a * c, 0]
  return { r, v, L }
}

export type PorkchopCell = {
  tDep: number
  tArr: number
  tof: number
  c3: number
  dvDep: number
  dvArr: number
  dvTot: number
  v1: Vec3
}

export function porkchopTransfer(
  tDep: number,
  tArr: number,
  mu = SUN_MU,
): PorkchopCell | null {
  const tof = tArr - tDep
  if (!(tof > 0)) return null
  const earth = heliocentricCircularState(AU, EARTH_HELIO_L0, tDep, mu)
  const mars = heliocentricCircularState(MARS_SMA_M, MARS_HELIO_L0, tArr, mu)
  if (!earth || !mars) return null
  let sol = lambertSolve(mu, earth.r, mars.r, tof, true)
  if (!sol) sol = lambertSolve(mu, earth.r, mars.r, tof, false)
  if (!sol) return null
  const dvDep = vnorm(vsub(sol.v1, earth.v))
  const dvArr = vnorm(vsub(sol.v2, mars.v))
  if (!Number.isFinite(dvDep) || !Number.isFinite(dvArr)) return null
  return {
    tDep,
    tArr,
    tof,
    c3: dvDep * dvDep,
    dvDep,
    dvArr,
    dvTot: dvDep + dvArr,
    v1: sol.v1,
  }
}

export type PorkchopGrid = {
  cells: PorkchopCell[]
  bestDv: PorkchopCell | null
  bestC3: PorkchopCell | null
}

export function porkchopEarthMarsGrid(opts: {
  depStart: number
  depCount: number
  depStep: number
  tofMin: number
  tofCount: number
  tofStep: number
}): PorkchopGrid | null {
  const { depStart, depCount, depStep, tofMin, tofCount, tofStep } = opts
  if (
    !(depCount >= 2) ||
    !(tofCount >= 2) ||
    !(depStep > 0) ||
    !(tofStep > 0) ||
    !(tofMin > 0)
  ) {
    return null
  }
  const cells: PorkchopCell[] = []
  for (let i = 0; i < depCount; i++) {
    const tDep = depStart + i * depStep
    for (let j = 0; j < tofCount; j++) {
      const tof = tofMin + j * tofStep
      const cell = porkchopTransfer(tDep, tDep + tof)
      if (cell) cells.push(cell)
    }
  }
  if (cells.length < 2) return null
  let bestDv = cells[0]
  let bestC3 = cells[0]
  for (const c of cells) {
    if (c.dvTot < bestDv.dvTot) bestDv = c
    if (c.c3 < bestC3.c3) bestC3 = c
  }
  return { cells, bestDv, bestC3 }
}

/**
 * Educational 2-D Chan / Alfriend-class Pc.
 * Miss along the encounter-plane x-axis; circular combined hard-body.
 * Pc = exp(−ξ²/2) (1 − exp(−R² / (2 σx σy)))
 */
export function conjunctionPc2d(
  missM: number,
  sigmaX: number,
  sigmaY: number,
  radiusM: number,
): number | null {
  if (!(missM >= 0) || !(sigmaX > 0) || !(sigmaY > 0) || !(radiusM > 0)) return null
  const xi2 = (missM * missM) / (sigmaX * sigmaX)
  const u = (radiusM * radiusM) / (sigmaX * sigmaY)
  const pc = Math.exp(-xi2 / 2) * (1 - Math.exp(-u / 2))
  if (!Number.isFinite(pc)) return null
  return Math.min(1, Math.max(0, pc))
}

/**
 * Foster 1992 educational 2-D Pc: Gaussian integral over the hard-body disk
 * in the encounter plane (miss along +x, ym = 0). Polar midpoint quadrature.
 */
export function conjunctionPcFoster(
  missM: number,
  sigmaX: number,
  sigmaY: number,
  radiusM: number,
): number | null {
  if (!(missM >= 0) || !(sigmaX > 0) || !(sigmaY > 0) || !(radiusM > 0)) return null
  const nRho = 80
  const nPhi = 160
  const dRho = radiusM / nRho
  const dPhi = (2 * Math.PI) / nPhi
  const invSx = 1 / sigmaX
  const invSy = 1 / sigmaY
  const norm = 1 / (2 * Math.PI * sigmaX * sigmaY)
  let acc = 0
  for (let i = 0; i < nRho; i++) {
    const rho = (i + 0.5) * dRho
    const wRho = rho * dRho
    for (let j = 0; j < nPhi; j++) {
      const phi = (j + 0.5) * dPhi
      const x = rho * Math.cos(phi)
      const y = rho * Math.sin(phi)
      const dx = (x - missM) * invSx
      const dy = y * invSy
      acc += wRho * Math.exp(-0.5 * (dx * dx + dy * dy))
    }
  }
  const pc = norm * acc * dPhi
  if (!Number.isFinite(pc)) return null
  return Math.min(1, Math.max(0, pc))
}

export type ConjunctionPcReport = {
  chan: number
  foster: number
  rOverSigma: number
  chanOk: boolean
}

/** Chan + Foster side by side. Chan is a first-order stand-in when R ≪ σ. */
export function conjunctionPcReport(
  missM: number,
  sigmaX: number,
  sigmaY: number,
  radiusM: number,
): ConjunctionPcReport | null {
  const chan = conjunctionPc2d(missM, sigmaX, sigmaY, radiusM)
  const foster = conjunctionPcFoster(missM, sigmaX, sigmaY, radiusM)
  if (chan == null || foster == null) return null
  const rOverSigma = radiusM / Math.min(sigmaX, sigmaY)
  return { chan, foster, rOverSigma, chanOk: rOverSigma < 0.8 }
}
