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

export type PassWindow = {
  aos: Date
  los: Date
  maxElDeg: number
  maxElAt: Date
  durationS: number
}

/**
 * Coarse next-pass search: sample elevation every `stepS` for `horizonH` hours.
 * Returns first AOS→LOS window above `minElDeg` (default 10°).
 */
export function findNextPass(opts: {
  satrec: SatRec
  observer: GeodeticDeg
  start: Date
  horizonH?: number
  stepS?: number
  minElDeg?: number
}): PassWindow | null {
  const horizonH = opts.horizonH ?? 24
  const stepS = opts.stepS ?? 30
  const minElRad = ((opts.minElDeg ?? 10) * Math.PI) / 180
  const t0 = opts.start.getTime()
  const tEnd = t0 + horizonH * 3600 * 1000

  let inPass = false
  let aos: Date | null = null
  let maxEl = -Infinity
  let maxElAt: Date | null = null
  let lastDate = opts.start

  for (let t = t0; t <= tEnd; t += stepS * 1000) {
    const date = new Date(t)
    lastDate = date
    const st = propagateEci(opts.satrec, date)
    if (!st) continue
    const look = lookAnglesFromEci(opts.observer, st.r, date)
    if (!look) continue
    const el = look.elevationRad

    if (!inPass && el >= minElRad) {
      inPass = true
      aos = date
      maxEl = el
      maxElAt = date
    } else if (inPass) {
      if (el > maxEl) {
        maxEl = el
        maxElAt = date
      }
      if (el < minElRad) {
        const los = date
        if (aos && maxElAt) {
          return {
            aos,
            los,
            maxElDeg: (maxEl * 180) / Math.PI,
            maxElAt,
            durationS: (los.getTime() - aos.getTime()) / 1000,
          }
        }
        inPass = false
        aos = null
      }
    }
  }

  // Pass still open at horizon end
  if (inPass && aos && maxElAt) {
    return {
      aos,
      los: lastDate,
      maxElDeg: (maxEl * 180) / Math.PI,
      maxElAt,
      durationS: (lastDate.getTime() - aos.getTime()) / 1000,
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
