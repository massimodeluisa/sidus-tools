/**
 * One-way Doppler along an SGP4 pass.
 *
 * Range rate is positive when the satellite recedes:
 * dot(r_sat - r_obs, v_sat - v_obs) / |r_sat - r_obs|, with both states in
 * the same TEME frame `propagateEci` and `observerEciPosition` use.
 * Observer velocity is Earth rotation about that frame's z axis
 * (UTC treated as UT1, the same approximation as the rest of the SGP4 tools).
 * `dopplerShiftHz` takes the opposite sign, positive when the source approaches,
 * so the shift is `dopplerShiftHz(f0, -rangeRate)`.
 */

import type { SatRec } from 'satellite.js'
import { dopplerShiftHz } from './discovery-wave'
import { EARTH_ROTATION_RATE } from './power'
import {
  findNextPass,
  observerEciPosition,
  propagateEci,
  type GeodeticDeg,
} from './sgp4'
import { vdot, vnorm, vsub, type Vec3 } from './vector'

export type PassDopplerPoint = {
  at: Date
  /** Positive when the satellite recedes, m/s. */
  rangeRateMps: number
  /** One-way frequency shift, Hz. Positive when the satellite approaches. */
  shiftHz: number
}

export type PassDopplerPoints = {
  aos: PassDopplerPoint
  closest: PassDopplerPoint
  los: PassDopplerPoint
}

/** Inertial velocity of a ground site fixed to the rotating Earth, m/s. */
export function observerRotationVelocityEci(rObsM: Vec3, omegaRadS = EARTH_ROTATION_RATE): Vec3 {
  return [-omegaRadS * rObsM[1], omegaRadS * rObsM[0], 0]
}

/**
 * Slant-range rate at `date`, m/s. Positive when the range is growing.
 * Null when propagation fails or the range is zero.
 */
export function eciRangeRateMps(satrec: SatRec, observer: GeodeticDeg, date: Date): number | null {
  const sat = propagateEci(satrec, date)
  if (!sat) return null
  const rObs = observerEciPosition(observer, date)
  const rho = vsub(sat.r, rObs)
  const range = vnorm(rho)
  if (!(range > 0)) return null
  const vObs = observerRotationVelocityEci(rObs)
  const rate = vdot(rho, vsub(sat.v, vObs)) / range
  return Number.isFinite(rate) ? rate : null
}

function slantRangeM(satrec: SatRec, observer: GeodeticDeg, ms: number): number | null {
  const date = new Date(ms)
  const sat = propagateEci(satrec, date)
  if (!sat) return null
  const range = vnorm(vsub(sat.r, observerEciPosition(observer, date)))
  return range > 0 && Number.isFinite(range) ? range : null
}

/** Time of minimum slant range on [aos, los], to 1 s. */
function closestApproachAt(satrec: SatRec, observer: GeodeticDeg, aos: Date, los: Date): Date | null {
  const t0 = aos.getTime()
  const t1 = los.getTime()
  if (!(t1 >= t0)) return null
  const spanS = (t1 - t0) / 1000
  const coarseS = spanS > 3600 ? 30 : 1

  const bestIn = (fromMs: number, toMs: number, stepS: number): { ms: number; range: number } | null => {
    let bestMs = -1
    let bestRange = Infinity
    const stepMs = stepS * 1000
    for (let t = fromMs; t <= toMs; t += stepMs) {
      const range = slantRangeM(satrec, observer, t)
      if (range !== null && range < bestRange) {
        bestRange = range
        bestMs = t
      }
    }
    const endRange = slantRangeM(satrec, observer, toMs)
    if (endRange !== null && endRange < bestRange) {
      bestRange = endRange
      bestMs = toMs
    }
    if (!(bestRange < Infinity)) return null
    return { ms: bestMs, range: bestRange }
  }

  const coarse = bestIn(t0, t1, coarseS)
  if (!coarse) return null
  if (coarseS === 1) return new Date(coarse.ms)
  const fine = bestIn(
    Math.max(t0, coarse.ms - coarseS * 1000),
    Math.min(t1, coarse.ms + coarseS * 1000),
    1,
  )
  return new Date(fine?.ms ?? coarse.ms)
}

function dopplerPoint(
  satrec: SatRec,
  observer: GeodeticDeg,
  at: Date,
  f0: number,
): PassDopplerPoint | null {
  const rangeRateMps = eciRangeRateMps(satrec, observer, at)
  if (rangeRateMps === null) return null
  const shiftHz = dopplerShiftHz(f0, -rangeRateMps)
  if (shiftHz === null) return null
  return { at, rangeRateMps, shiftHz }
}

/**
 * Frequency shift at AOS, closest approach, and LOS of the next pass.
 * AOS and LOS are the mask crossings from `findNextPass` (10° unless
 * `minElDeg` is set). Returns null when no closed pass is found.
 */
export function passDopplerPoints(opts: {
  satrec: SatRec
  observer: GeodeticDeg
  f0: number
  start: Date
  horizonH?: number
  stepS?: number
  minElDeg?: number
  refineS?: number
}): PassDopplerPoints | null {
  if (!(opts.f0 > 0)) return null
  const pass = findNextPass({
    satrec: opts.satrec,
    observer: opts.observer,
    start: opts.start,
    horizonH: opts.horizonH,
    stepS: opts.stepS,
    minElDeg: opts.minElDeg,
    refineS: opts.refineS ?? 1,
  })
  if (!pass?.aosIsRise || !pass.losIsSet) return null
  const closestAt = closestApproachAt(opts.satrec, opts.observer, pass.aos, pass.los)
  if (!closestAt) return null
  const aos = dopplerPoint(opts.satrec, opts.observer, pass.aos, opts.f0)
  const closest = dopplerPoint(opts.satrec, opts.observer, closestAt, opts.f0)
  const los = dopplerPoint(opts.satrec, opts.observer, pass.los, opts.f0)
  if (!aos || !closest || !los) return null
  return { aos, closest, los }
}
