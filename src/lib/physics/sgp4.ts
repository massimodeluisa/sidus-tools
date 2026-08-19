/**
 * Thin wrappers around satellite.js (MIT): SGP4/SDP4 TLE propagation.
 * Positions from the library are in km; we expose SI (m, m/s) for the app.
 */

// Use pure-JS surface (not package root): root re-exports WASM workers that
// crash Node serverless (Vercel /api) and Vite worker IIFE builds.
import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  eciToEcf,
  ecfToLookAngles,
  degreesLat,
  degreesLong,
  degreesToRadians,
  geodeticToEcf,
  ecfToEci,
} from '../vendor/satellite-js-pure'
import type { SatRec } from 'satellite.js'
import type { Vec3 } from './vector'

export type TleParseResult =
  | { ok: true; satrec: SatRec; name: string }
  | { ok: false; error: string }

export type EciStateSi = {
  r: Vec3 // m
  v: Vec3 // m/s
  date: Date
}

export type GeodeticDeg = {
  latDeg: number
  lonDeg: number
  heightM: number
}

export type LookAnglesSi = {
  azimuthRad: number
  elevationRad: number
  rangeM: number
}

/**
 * Default demo TLE: ISS-like elements for offline demos.
 * Epoch is illustrative (not a live CelesTrak pull). Prefer pasting current TLEs.
 * SGP4 output is TEME-class; ECEF/look-angle conversion is an engineering approximation.
 */
export const SAMPLE_ISS_TLE = `ISS (ZARYA)
1 25544U 98067A   25220.50000000  .00014500  00000-0  26520-3 0  9992
2 25544  51.6400  80.1234 0004123  95.4321  12.3456 15.50200000250000`

/** Parse 2- or 3-line TLE text (optional name line). */
export function parseTle(text: string): TleParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length < 2) {
    return { ok: false, error: 'Need at least two TLE lines (line 1 and line 2).' }
  }

  let name = 'SAT'
  let l1: string
  let l2: string
  if (lines.length >= 3 && !lines[0].startsWith('1 ')) {
    name = lines[0].slice(0, 24)
    l1 = lines[1]
    l2 = lines[2]
  } else {
    l1 = lines[0]
    l2 = lines[1]
  }

  if (!l1.startsWith('1 ') || !l2.startsWith('2 ')) {
    return { ok: false, error: 'TLE lines must start with "1 " and "2 ".' }
  }

  try {
    const satrec = twoline2satrec(l1, l2)
    if (!satrec || (satrec as { error?: number }).error) {
      return { ok: false, error: 'Invalid TLE (checksum or format).' }
    }
    return { ok: true, satrec, name }
  } catch {
    return { ok: false, error: 'Failed to parse TLE.' }
  }
}

/** Propagate satrec to Date → ECI state in SI. */
export function propagateEci(satrec: SatRec, date: Date): EciStateSi | null {
  const pv = propagate(satrec, date)
  if (!pv) return null
  const pos = pv.position
  const vel = pv.velocity
  // satellite.js v5 can return boolean `true` for bad states
  if (!pos || !vel || typeof pos === 'boolean' || typeof vel === 'boolean') return null
  const { x, y, z } = pos
  const { x: vx, y: vy, z: vz } = vel
  if (![x, y, z, vx, vy, vz].every(Number.isFinite)) return null
  return {
    r: [x * 1000, y * 1000, z * 1000],
    v: [vx * 1000, vy * 1000, vz * 1000],
    date,
  }
}

/** ECI (m) → ECEF/ECF position (m) at `date`. */
export function eciSiToEcefSi(rM: Vec3, date: Date): Vec3 {
  const gmst = gstime(date)
  const eciKm = { x: rM[0] / 1000, y: rM[1] / 1000, z: rM[2] / 1000 }
  const ecf = eciToEcf(eciKm, gmst)
  return [ecf.x * 1000, ecf.y * 1000, ecf.z * 1000]
}

/** ECI (m) → geodetic lat/lon (deg) and height (m). */
export function eciSiToGeodetic(rM: Vec3, date: Date): GeodeticDeg | null {
  const gmst = gstime(date)
  const eciKm = { x: rM[0] / 1000, y: rM[1] / 1000, z: rM[2] / 1000 }
  const g = eciToGeodetic(eciKm, gmst)
  if (!g) return null
  return {
    latDeg: degreesLat(g.latitude),
    lonDeg: degreesLong(g.longitude),
    heightM: g.height * 1000,
  }
}

/**
 * Topocentric look angles from an observer (geodetic deg, height m)
 * to a satellite ECI state (m) at `date`.
 */
export function lookAnglesFromEci(
  observer: GeodeticDeg,
  rM: Vec3,
  date: Date,
): LookAnglesSi | null {
  const gmst = gstime(date)
  const obs = {
    longitude: degreesToRadians(observer.lonDeg),
    latitude: degreesToRadians(observer.latDeg),
    height: observer.heightM / 1000,
  }
  const satEciKm = { x: rM[0] / 1000, y: rM[1] / 1000, z: rM[2] / 1000 }
  const satEcf = eciToEcf(satEciKm, gmst)
  const look = ecfToLookAngles(obs, satEcf)
  if (!look) return null
  return {
    azimuthRad: look.azimuth,
    elevationRad: look.elevation,
    rangeM: look.rangeSat * 1000,
  }
}

/**
 * Topocentric SEZ (south, east, zenith) components of the range vector from
 * an observer (geodetic deg, height m) to a satellite ECEF/ECF position (m).
 *
 * Standard ECEF → SEZ topocentric-horizon rotation: rotate the observer to
 * satellite ECEF delta by the observer's geodetic latitude and longitude
 * (Vallado, "Fundamentals of Astrodynamics and Applications", 4th ed.,
 * Sec. 4.4, Algorithm 27 RAZEL). Matches the rotation the vendor
 * `ecfToLookAngles` uses internally.
 */
export function topocentricSezSi(
  observer: GeodeticDeg,
  satEcefM: Vec3,
): { southM: number; eastM: number; zenithM: number } {
  const obsEcf = geodeticToEcf({
    longitude: degreesToRadians(observer.lonDeg),
    latitude: degreesToRadians(observer.latDeg),
    height: observer.heightM / 1000,
  })
  const rx = satEcefM[0] - obsEcf.x * 1000
  const ry = satEcefM[1] - obsEcf.y * 1000
  const rz = satEcefM[2] - obsEcf.z * 1000

  const lat = degreesToRadians(observer.latDeg)
  const lon = degreesToRadians(observer.lonDeg)
  const sinLat = Math.sin(lat)
  const cosLat = Math.cos(lat)
  const sinLon = Math.sin(lon)
  const cosLon = Math.cos(lon)

  return {
    southM: sinLat * cosLon * rx + sinLat * sinLon * ry - cosLat * rz,
    eastM: -sinLon * rx + cosLon * ry,
    zenithM: cosLat * cosLon * rx + cosLat * sinLon * ry + sinLat * rz,
  }
}

/** Observer geodetic (deg, height m) → ECI position (m) at `date`. */
export function observerEciPosition(observer: GeodeticDeg, date: Date): Vec3 {
  const gmst = gstime(date)
  const obsEcf = geodeticToEcf({
    longitude: degreesToRadians(observer.lonDeg),
    latitude: degreesToRadians(observer.latDeg),
    height: observer.heightM / 1000,
  })
  const eci = ecfToEci(obsEcf, gmst)
  return [eci.x * 1000, eci.y * 1000, eci.z * 1000]
}

export type PassWindow = {
  aos: Date
  los: Date
  maxElDeg: number
  maxElAt: Date
  durationS: number
}

/** Elevation (rad) at `ms` (epoch millis), or null if propagation/look-angle fails. */
function elevationRadAtMs(satrec: SatRec, observer: GeodeticDeg, ms: number): number | null {
  const date = new Date(ms)
  const st = propagateEci(satrec, date)
  if (!st) return null
  const look = lookAnglesFromEci(observer, st.r, date)
  return look ? look.elevationRad : null
}

/**
 * Bisect an elevation-vs-mask crossing down to `refineMs` bracket width.
 * `belowMs` must have elevation < minEl, `aboveMs` elevation >= minEl; their
 * chronological order does not matter (AOS is a rising edge, LOS a falling
 * one), only which side of the mask each currently sits on. A failed
 * elevation sample is treated as "below" so bisection still converges.
 */
function bisectMaskCrossing(
  elevationAt: (ms: number) => number | null,
  minElRad: number,
  belowMs: number,
  aboveMs: number,
  refineMs: number,
): { belowMs: number; aboveMs: number } {
  let lo = belowMs
  let hi = aboveMs
  while (Math.abs(hi - lo) > refineMs) {
    const mid = (lo + hi) / 2
    const el = elevationAt(mid)
    if (el !== null && el >= minElRad) {
      hi = mid
    } else {
      lo = mid
    }
  }
  return { belowMs: lo, aboveMs: hi }
}

/**
 * Refine a coarse elevation peak by sampling its two neighboring `stepMs`
 * intervals at `refineMs` resolution and taking the max. No golden-section
 * search: the coarse peak already brackets the true maximum within one
 * step on either side, so a fine linear scan of that window is sufficient.
 */
function refineElevationPeak(
  elevationAt: (ms: number) => number | null,
  peakMs: number,
  stepMs: number,
  refineMs: number,
): { maxEl: number; maxElAtMs: number } {
  let bestEl = -Infinity
  let bestMs = peakMs
  for (let t = peakMs - stepMs; t <= peakMs + stepMs; t += refineMs) {
    const el = elevationAt(t)
    if (el !== null && el > bestEl) {
      bestEl = el
      bestMs = t
    }
  }
  return { maxEl: bestEl, maxElAtMs: bestMs }
}

/** Refine a coarsely-detected pass window's AOS/LOS/peak to `refineS` resolution. */
function refinePassWindow(
  satrec: SatRec,
  observer: GeodeticDeg,
  minElRad: number,
  stepS: number,
  refineS: number,
  coarse: {
    aosMs: number
    aosBelowMs: number
    losMs: number
    losAboveMs: number | null // null: pass still open at horizon end, LOS not refined
    maxEl: number
    maxElAtMs: number
  },
): PassWindow {
  const refineMs = refineS * 1000
  const elevationAt = (ms: number) => elevationRadAtMs(satrec, observer, ms)

  const aosMs = bisectMaskCrossing(elevationAt, minElRad, coarse.aosBelowMs, coarse.aosMs, refineMs).aboveMs

  const losMs =
    coarse.losAboveMs !== null
      ? bisectMaskCrossing(elevationAt, minElRad, coarse.losMs, coarse.losAboveMs, refineMs).belowMs
      : coarse.losMs

  const peak = refineElevationPeak(elevationAt, coarse.maxElAtMs, stepS * 1000, refineMs)
  const maxEl = peak.maxEl > coarse.maxEl ? peak.maxEl : coarse.maxEl
  const maxElAtMs = peak.maxEl > coarse.maxEl ? peak.maxElAtMs : coarse.maxElAtMs

  return {
    aos: new Date(aosMs),
    los: new Date(losMs),
    maxElDeg: (maxEl * 180) / Math.PI,
    maxElAt: new Date(maxElAtMs),
    durationS: (losMs - aosMs) / 1000,
  }
}

/**
 * Coarse next-pass search: sample elevation every `stepS` for `horizonH` hours.
 * Returns first AOS→LOS window above `minElDeg` (default 10°).
 *
 * With `refineS` set, AOS/LOS are bisected down to `refineS` resolution on
 * the coarse-scan bracket, and the peak is refined by sampling its two
 * neighboring `stepS` intervals at `refineS` resolution. Omit `refineS` for
 * the original quantized-to-`stepS` behavior.
 */
export function findNextPass(opts: {
  satrec: SatRec
  observer: GeodeticDeg
  start: Date
  horizonH?: number
  stepS?: number
  minElDeg?: number
  refineS?: number
}): PassWindow | null {
  const horizonH = opts.horizonH ?? 24
  const stepS = opts.stepS ?? 30
  const minElRad = ((opts.minElDeg ?? 10) * Math.PI) / 180
  const t0 = opts.start.getTime()
  const tEnd = t0 + horizonH * 3600 * 1000

  let inPass = false
  let aosMs: number | null = null
  let aosBelowMs: number | null = null
  let maxEl = -Infinity
  let maxElAtMs: number | null = null
  let prevMs = t0
  let lastMs = t0

  for (let t = t0; t <= tEnd; t += stepS * 1000) {
    const date = new Date(t)
    lastMs = t
    const st = propagateEci(opts.satrec, date)
    if (!st) continue
    const look = lookAnglesFromEci(opts.observer, st.r, date)
    if (!look) continue
    const el = look.elevationRad

    if (!inPass && el >= minElRad) {
      inPass = true
      aosMs = t
      aosBelowMs = prevMs
      maxEl = el
      maxElAtMs = t
    } else if (inPass) {
      if (el > maxEl) {
        maxEl = el
        maxElAtMs = t
      }
      if (el < minElRad) {
        const losAboveMs = prevMs
        const losMs = t
        if (aosMs !== null && aosBelowMs !== null && maxElAtMs !== null) {
          if (opts.refineS !== undefined) {
            return refinePassWindow(opts.satrec, opts.observer, minElRad, stepS, opts.refineS, {
              aosMs,
              aosBelowMs,
              losMs,
              losAboveMs,
              maxEl,
              maxElAtMs,
            })
          }
          return {
            aos: new Date(aosMs),
            los: new Date(losMs),
            maxElDeg: (maxEl * 180) / Math.PI,
            maxElAt: new Date(maxElAtMs),
            durationS: (losMs - aosMs) / 1000,
          }
        }
        inPass = false
        aosMs = null
        aosBelowMs = null
      }
    }
    prevMs = t
  }

  // Pass still open at horizon end
  if (inPass && aosMs !== null && aosBelowMs !== null && maxElAtMs !== null) {
    if (opts.refineS !== undefined) {
      return refinePassWindow(opts.satrec, opts.observer, minElRad, stepS, opts.refineS, {
        aosMs,
        aosBelowMs,
        losMs: lastMs,
        losAboveMs: null,
        maxEl,
        maxElAtMs,
      })
    }
    return {
      aos: new Date(aosMs),
      los: new Date(lastMs),
      maxElDeg: (maxEl * 180) / Math.PI,
      maxElAt: new Date(maxElAtMs),
      durationS: (lastMs - aosMs) / 1000,
    }
  }
  return null
}

/** Sample ground track (lat/lon deg) over a time span. */
export function groundTrack(
  satrec: SatRec,
  start: Date,
  durationS: number,
  samples: number,
): { lat: number; lon: number; t: number }[] {
  const n = Math.max(2, Math.floor(samples))
  const out: { lat: number; lon: number; t: number }[] = []
  for (let i = 0; i < n; i++) {
    const t = (durationS * i) / (n - 1)
    const date = new Date(start.getTime() + t * 1000)
    const st = propagateEci(satrec, date)
    if (!st) continue
    const g = eciSiToGeodetic(st.r, date)
    if (!g) continue
    out.push({ lat: g.latDeg, lon: g.lonDeg, t })
  }
  return out
}
