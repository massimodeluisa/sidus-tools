/**
 * Thin wrappers around satellite.js (MIT): SGP4/SDP4 TLE propagation.
 * Positions from the library are in km; we expose SI (m, m/s) for the app.
 */

/* Use pure-JS surface (not package root): root re-exports WASM workers that
   crash Node serverless (Vercel /api) and Vite worker IIFE builds. */
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
  | { ok: true; satrec: SatRec; name: string; line1: string; line2: string }
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
1 25544U 98067A   26236.43525466  .00008197  00000+0  15348-3 0  9992
2 25544  51.6332 322.3014 0007699  78.6726 281.5127 15.49604681582335`

/** Validate the standard column-69 modulo-10 checksum on a 69-column TLE line. */
function hasValidTleChecksum(line: string): boolean {
  if (line.length !== 69 || !/^[0-9]$/.test(line[68])) return false
  let sum = 0
  for (const ch of line.slice(0, 68)) {
    if (ch >= '0' && ch <= '9') sum += Number(ch)
    else if (ch === '-') sum += 1
  }
  return sum % 10 === Number(line[68])
}

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
  if (l1.slice(2, 7) !== l2.slice(2, 7)) {
    return { ok: false, error: 'Invalid TLE (checksum or format).' }
  }
  if (!hasValidTleChecksum(l1)) {
    return { ok: false, error: 'Invalid TLE (checksum or format).' }
  }
  if (!hasValidTleChecksum(l2)) {
    return { ok: false, error: 'Invalid TLE (checksum or format).' }
  }

  try {
    const satrec = twoline2satrec(l1, l2)
    if (!satrec || (satrec as { error?: number }).error) {
      return { ok: false, error: 'Invalid TLE (checksum or format).' }
    }
    return { ok: true, satrec, name, line1: l1, line2: l2 }
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

/**
 * Greenwich mean sidereal time, radians.
 *
 * The angle between the inertial and Earth-fixed frames, exposed because a
 * caller that CACHES inertial geometry has to undo and redo exactly this
 * rotation rather than approximate it.
 */
export function gmstRad(date: Date): number {
  return gstime(date)
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
 * vector" in AU, i.e. the mean equator/equinox-of-date (MOD) frame, not
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
 * penumbra/umbra taper and Earth's oblateness; it is only a coarse
 * illumination-geometry filter (Vallado, "Fundamentals of Astrodynamics and
 * Applications", shadow-analysis class), not a precise eclipse solver or
 * an optical brightness model.
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
 * (a rotation by GMST, then `asin`/`atan2` on topocentric SEZ components:
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
 * Geometric solar-altitude cutoff for the civil-twilight part of the pass
 * lighting filter. It does not establish detectability: apparent magnitude,
 * sky conditions, and observer sensitivity are not modeled.
 */
export const CIVIL_TWILIGHT_RAD = (-6 * Math.PI) / 180

export type PassWindow = {
  aos: Date
  los: Date
  maxElDeg: number
  maxElAt: Date
  durationS: number
  /** True when a sample meets the coarse lighting-geometry test, not photometric visibility. */
  favorableLighting: boolean
  /** First sampled time meeting the lighting test, or null if none does. */
  favorableLightingAt: Date | null
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

/**
 * Refine a sampled local elevation maximum with a bounded golden-section
 * search. This is used only when three coarse samples are all below the mask
 * but the middle one is a local maximum: it can reveal a complete pass window
 * that a threshold-only coarse scan would otherwise skip.
 */
function refineHiddenElevationPeak(
  elevationAt: (ms: number) => number | null,
  leftMs: number,
  rightMs: number,
): { maxEl: number; maxElAtMs: number } {
  const ratio = (Math.sqrt(5) - 1) / 2
  let lo = leftMs
  let hi = rightMs
  let x1 = hi - ratio * (hi - lo)
  let x2 = lo + ratio * (hi - lo)
  let f1 = elevationAt(x1) ?? -Infinity
  let f2 = elevationAt(x2) ?? -Infinity

  // A one-millisecond bracket is below the UI's one-second crossing
  // resolution and prevents a narrow, near-tangent mask crossing from being
  // lost merely because no integer-second scan point landed inside it.
  while (hi - lo > 1) {
    if (f1 < f2) {
      lo = x1
      x1 = x2
      f1 = f2
      x2 = lo + ratio * (hi - lo)
      f2 = elevationAt(x2) ?? -Infinity
    } else {
      hi = x2
      x2 = x1
      f2 = f1
      x1 = hi - ratio * (hi - lo)
      f1 = elevationAt(x1) ?? -Infinity
    }
  }

  const candidates = [
    { ms: leftMs, el: elevationAt(leftMs) ?? -Infinity },
    { ms: rightMs, el: elevationAt(rightMs) ?? -Infinity },
    { ms: x1, el: f1 },
    { ms: x2, el: f2 },
    { ms: (lo + hi) / 2, el: elevationAt((lo + hi) / 2) ?? -Infinity },
  ]
  const best = candidates.reduce((candidateBest, candidate) =>
    candidate.el > candidateBest.el ? candidate : candidateBest,
  )
  return { maxEl: best.el, maxElAtMs: best.ms }
}

/** `PassWindow` fields computed by AOS/LOS/peak search, before lighting classification. */
type PassWindowCore = Omit<PassWindow, 'favorableLighting' | 'favorableLightingAt'>

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
 * Test only favorable lighting geometry: satellite outside a cylindrical
 * Earth-shadow approximation while the observer's Sun is below civil
 * twilight. This is not apparent-magnitude or naked-eye visibility. Samples
 * at `max(sampleS, 5)` s steps and returns the first qualifying sample.
 */
function classifyPassLightingGeometry(
  satrec: SatRec,
  observer: GeodeticDeg,
  aosMs: number,
  losMs: number,
  sampleS: number,
): { favorableLighting: boolean; favorableLightingAt: Date | null } {
  const stepMs = Math.max(sampleS, 5) * 1000
  for (let t = aosMs; t <= losMs; t += stepMs) {
    const date = new Date(t)
    const st = propagateEci(satrec, date)
    if (!st) continue
    if (isSatSunlitSi(st.r, date) && sunElevationRad(observer, date) < CIVIL_TWILIGHT_RAD) {
      return { favorableLighting: true, favorableLightingAt: date }
    }
  }
  return { favorableLighting: false, favorableLightingAt: null }
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
 * Every returned window carries a sampled lighting-geometry result
 * (`favorableLighting` / `favorableLightingAt`). It checks a coarse
 * cylindrical Earth-shadow model and observer solar altitude only; it does
 * not predict apparent magnitude or naked-eye detectability. With
 * `favorableLightingOnly: true`, passes without a qualifying sample are
 * skipped; returns `null` if none occurs before the horizon ends.
 */
export function findNextPass(opts: {
  satrec: SatRec
  observer: GeodeticDeg
  start: Date
  horizonH?: number
  stepS?: number
  minElDeg?: number
  refineS?: number
  favorableLightingOnly?: boolean
}): PassWindow | null {
  const horizonH = opts.horizonH ?? 24
  const stepS = opts.stepS ?? 30
  const minElRad = ((opts.minElDeg ?? 10) * Math.PI) / 180
  const t0 = opts.start.getTime()
  const tEnd = t0 + horizonH * 3600 * 1000
  const sampleS = opts.refineS ?? stepS
  const elevationAt = (ms: number) => elevationRadAtMs(opts.satrec, opts.observer, ms)

  let inPass = false
  let aosMs: number | null = null
  let aosBelowMs: number | null = null
  let maxEl = -Infinity
  let maxElAtMs: number | null = null
  let prevMs = t0
  let prevEl: number | null = null
  const stepMs = stepS * 1000
  let prevPrevMs: number | null = t0 - stepMs
  let prevPrevEl: number | null = elevationAt(prevPrevMs)
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
    const { favorableLighting, favorableLightingAt } = classifyPassLightingGeometry(
      opts.satrec,
      opts.observer,
      core.aos.getTime(),
      core.los.getTime(),
      sampleS,
    )
    return { ...core, favorableLighting, favorableLightingAt }
  }

  const buildHiddenWindow = (leftMs: number, rightMs: number): PassWindow | null => {
    const peak = refineHiddenElevationPeak(elevationAt, leftMs, rightMs)
    if (peak.maxEl < minElRad) return null

    const crossingRefineMs = (opts.refineS ?? stepS) * 1000
    const aosBracket = bisectMaskCrossing(
      elevationAt,
      minElRad,
      leftMs,
      peak.maxElAtMs,
      crossingRefineMs,
    )
    const losBracket = bisectMaskCrossing(
      elevationAt,
      minElRad,
      rightMs,
      peak.maxElAtMs,
      crossingRefineMs,
    )
    return buildWindow(
      aosBracket.aboveMs,
      aosBracket.belowMs,
      peak.maxEl,
      peak.maxElAtMs,
      losBracket.belowMs,
      losBracket.aboveMs,
    )
  }

  const sampleCount = Math.ceil((tEnd - t0) / stepMs) + 1
  for (let i = 0; i < sampleCount; i++) {
    const t = Math.min(t0 + i * stepMs, tEnd)
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
          if (!opts.favorableLightingOnly || win.favorableLighting) return win
          // Keep scanning when this pass has no favorable lighting sample.
        }
        inPass = false
        aosMs = null
        aosBelowMs = null
        maxEl = -Infinity
        maxElAtMs = null
      }
    }

    // If all three samples remain below the mask but the middle sample is a
    // local maximum, refine that interior peak. A short pass can rise above
    // the mask and fall back below entirely between two coarse samples, in
    // which case the normal AOS/LOS state machine never starts.
    if (
      !inPass &&
      prevPrevMs !== null &&
      prevPrevEl !== null &&
      prevEl !== null &&
      prevPrevEl < minElRad &&
      prevEl < minElRad &&
      el < minElRad &&
      prevEl >= prevPrevEl &&
      prevEl >= el
    ) {
      // The search starts at t0, so never let the optimization or AOS bracket
      // reach into the preceding, out-of-horizon sample used to identify a
      // local maximum exactly at the first sample.
      const win = buildHiddenWindow(Math.max(prevPrevMs, t0), t)
      if (win && (!opts.favorableLightingOnly || win.favorableLighting)) return win
    }

    if (prevEl !== null) {
      prevPrevMs = prevMs
      prevPrevEl = prevEl
    }
    prevMs = t
    prevEl = el
  }

  // A final partial cadence interval can contain a complete short pass even
  // though the regular grid never samples its right-hand endpoint. Include a
  // bounded look-ahead only to test whether the horizon endpoint is a local
  // maximum; all reported crossings remain inside the requested horizon.
  const endLookaheadEl = elevationAt(tEnd + stepMs)
  if (
    !inPass &&
    prevPrevMs !== null &&
    prevPrevEl !== null &&
    prevEl !== null &&
    prevPrevEl < minElRad &&
    prevEl < minElRad &&
    endLookaheadEl !== null &&
    endLookaheadEl < minElRad &&
    prevEl >= prevPrevEl &&
    prevEl >= endLookaheadEl
  ) {
    const win = buildHiddenWindow(Math.max(prevPrevMs, t0), tEnd)
    if (win && (!opts.favorableLightingOnly || win.favorableLighting)) return win
  }

  // Pass still open at horizon end
  if (inPass && aosMs !== null && aosBelowMs !== null && maxElAtMs !== null) {
    const win = buildWindow(aosMs, aosBelowMs, maxEl, maxElAtMs, lastMs, null)
    if (!opts.favorableLightingOnly || win.favorableLighting) return win
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
