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
  jday,
  sunPos,
} from '../vendor/satellite-js-pure'
import type { SatRec } from 'satellite.js'
import type { Vec3 } from './vector'
import { vdot, vnorm, vscale, vsub, vunit } from './vector'
import { AU, EARTH_RADIUS } from './constants'

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

/**
 * Sun position in ECI (m) at `date`.
 *
 * Wraps vendor `sunPos` (Vallado low-precision solar ephemeris, valid
 * 1950-2050, ~0.01 deg accuracy). Read from `node_modules/satellite.js/dist/sun.js`:
 * it takes a Julian date and returns a "geocentric equatorial position
 * vector" in AU, i.e. the mean equator/equinox-of-date (MOD) frame — not
 * exactly the TEME frame SGP4 propagation uses. The MOD/TEME difference is
 * arcseconds to sub-degree, far below the whole-degree accuracy this
 * pass-visibility classifier needs, so both are treated as the same ECI
 * frame here (standard practice for this class of low-precision spotting
 * tool; see Vallado, "Fundamentals of Astrodynamics and Applications").
 */
export function sunEciSi(date: Date): Vec3 {
  const { rsun } = sunPos(jday(date))
  return [rsun.x * AU, rsun.y * AU, rsun.z * AU]
}

/**
 * Cylindrical Earth-shadow model: the satellite is sunlit unless it sits on
 * the night side of the terminator plane (its component along the anti-sun
 * axis is positive) AND its perpendicular distance from the Earth-sun axis
 * is inside a constant-radius (Earth-radius) shadow cylinder. This ignores
 * penumbra/umbra taper and Earth's oblateness; it is the standard coarse
 * model used for naked-eye ISS-spotting predictions (Vallado, "Fundamentals
 * of Astrodynamics and Applications", shadow-analysis class), not a precise
 * eclipse solver.
 */
export function isSatSunlitSi(rSatM: Vec3, date: Date): boolean {
  const sHat = vunit(sunEciSi(date))
  const alongSun = vdot(rSatM, sHat)
  const alongAntiSun = -alongSun
  const perpM = vsub(rSatM, vscale(sHat, alongSun))
  const perpDistM = vnorm(perpM)
  const inShadow = alongAntiSun > 0 && perpDistM < EARTH_RADIUS
  return !inShadow
}

/**
 * Elevation (rad) of the Sun above the observer's local horizon at `date`.
 *
 * Reuses `lookAnglesFromEci` with `sunEciSi`: its ECI→ECEF→look-angle chain
 * (a rotation by GMST, then `asin`/`atan2` on topocentric SEZ components —
 * see `ecfToLookAngles` in `node_modules/satellite.js/dist/transforms.js`)
 * makes no near-Earth assumption, so it is equally valid at solar range.
 */
export function sunElevationRad(observer: GeodeticDeg, date: Date): number {
  const rSunM = sunEciSi(date)
  const look = lookAnglesFromEci(observer, rSunM, date)
  // Unreachable: ecfToLookAngles never returns a falsy value (see above).
  if (!look) throw new Error('sunElevationRad: lookAnglesFromEci unexpectedly failed')
  return look.elevationRad
}

/**
 * Naked-eye visibility threshold: sun elevation below which the observer's
 * sky is dark enough for satellite spotting. Civil twilight (-6 deg) is the
 * standard criterion used by ISS-spotting tools (e.g. Heavens-Above, NASA
 * "Spot The Station").
 */
export const CIVIL_DARKNESS_RAD = (-6 * Math.PI) / 180

export type PassWindow = {
  aos: Date
  los: Date
  maxElDeg: number
  maxElAt: Date
  durationS: number
  visible: boolean
  visibleAt: Date | null
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

/** `PassWindow` fields computed by AOS/LOS/peak search, before visibility classification. */
type PassWindowCore = Omit<PassWindow, 'visible' | 'visibleAt'>

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
): PassWindowCore {
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
 * Classify a pass window's naked-eye visibility: sunlit satellite seen
 * against a dark sky (observer's sun below civil twilight). Standard
 * ISS-spotting criterion (Heavens-Above / NASA "Spot The Station").
 * Samples the window at `max(sampleS, 5)` s steps and returns the first
 * qualifying sample, if any.
 */
function classifyPassVisibility(
  satrec: SatRec,
  observer: GeodeticDeg,
  aosMs: number,
  losMs: number,
  sampleS: number,
): { visible: boolean; visibleAt: Date | null } {
  const stepMs = Math.max(sampleS, 5) * 1000
  for (let t = aosMs; t <= losMs; t += stepMs) {
    const date = new Date(t)
    const st = propagateEci(satrec, date)
    if (!st) continue
    if (isSatSunlitSi(st.r, date) && sunElevationRad(observer, date) < CIVIL_DARKNESS_RAD) {
      return { visible: true, visibleAt: date }
    }
  }
  return { visible: false, visibleAt: null }
}

/**
 * Coarse next-pass search: sample elevation every `stepS` for `horizonH` hours.
 * Returns first AOS→LOS window above `minElDeg` (default 10°).
 *
 * With `refineS` set, AOS/LOS are bisected down to `refineS` resolution on
 * the coarse-scan bracket, and the peak is refined by sampling its two
 * neighboring `stepS` intervals at `refineS` resolution. Omit `refineS` for
 * the original quantized-to-`stepS` behavior.
 *
 * Every returned window carries a naked-eye `visible`/`visibleAt`
 * classification (see `classifyPassVisibility`). With `visibleOnly: true`,
 * non-visible passes are skipped and the scan continues to the next one;
 * returns `null` if no visible pass occurs before the horizon ends.
 */
export function findNextPass(opts: {
  satrec: SatRec
  observer: GeodeticDeg
  start: Date
  horizonH?: number
  stepS?: number
  minElDeg?: number
  refineS?: number
  visibleOnly?: boolean
}): PassWindow | null {
  const horizonH = opts.horizonH ?? 24
  const stepS = opts.stepS ?? 30
  const minElRad = ((opts.minElDeg ?? 10) * Math.PI) / 180
  const t0 = opts.start.getTime()
  const tEnd = t0 + horizonH * 3600 * 1000
  const sampleS = opts.refineS ?? stepS

  let inPass = false
  let aosMs: number | null = null
  let aosBelowMs: number | null = null
  let maxEl = -Infinity
  let maxElAtMs: number | null = null
  let prevMs = t0
  let lastMs = t0

  const buildWindow = (
    curAosMs: number,
    curAosBelowMs: number,
    curMaxEl: number,
    curMaxElAtMs: number,
    losMs: number,
    losAboveMs: number | null,
  ): PassWindow => {
    const core: PassWindowCore =
      opts.refineS !== undefined
        ? refinePassWindow(opts.satrec, opts.observer, minElRad, stepS, opts.refineS, {
            aosMs: curAosMs,
            aosBelowMs: curAosBelowMs,
            losMs,
            losAboveMs,
            maxEl: curMaxEl,
            maxElAtMs: curMaxElAtMs,
          })
        : {
            aos: new Date(curAosMs),
            los: new Date(losMs),
            maxElDeg: (curMaxEl * 180) / Math.PI,
            maxElAt: new Date(curMaxElAtMs),
            durationS: (losMs - curAosMs) / 1000,
          }
    const { visible, visibleAt } = classifyPassVisibility(
      opts.satrec,
      opts.observer,
      core.aos.getTime(),
      core.los.getTime(),
      sampleS,
    )
    return { ...core, visible, visibleAt }
  }

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
          const win = buildWindow(aosMs, aosBelowMs, maxEl, maxElAtMs, losMs, losAboveMs)
          if (!opts.visibleOnly || win.visible) return win
          // visibleOnly and this pass wasn't visible: keep scanning for the next one.
        }
        inPass = false
        aosMs = null
        aosBelowMs = null
        maxEl = -Infinity
        maxElAtMs = null
      }
    }
    prevMs = t
  }

  // Pass still open at horizon end
  if (inPass && aosMs !== null && aosBelowMs !== null && maxElAtMs !== null) {
    const win = buildWindow(aosMs, aosBelowMs, maxEl, maxElAtMs, lastMs, null)
    if (!opts.visibleOnly || win.visible) return win
    return null
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
