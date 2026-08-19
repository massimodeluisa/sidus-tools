/**
 * Pure trail geometry for the globe view: date-line splitting, the
 * body/fade GeoJSON pair, screen-targeted dashing, fade ramps and the
 * follow-mode bearing math. No React, no MapLibre, no physics imports.
 */

import type { GlobeTrackPoint } from './types'

const DEG = Math.PI / 180

/**
 * Same constant MapLibre's own globe vertex shader uses
 * (src/shaders/glsl/_projection_globe.vertex.glsl, `#define GLOBE_RADIUS
 * 6371008.8`). The elevated label overlay replicates that shader's
 * elevation math on the CPU, so it must use the identical radius, and the
 * ground-resolution formula below reuses it as the one Earth radius here.
 */
export const GLOBE_RADIUS_M = 6371008.8

/** Alpha ramps in over the first FADE_MINUTES of the trail window and out over the last. */
export const FADE_MINUTES = 8

export type LonLat = [number, number]

export type TrailFeatureCollection = {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    properties: { future: boolean }
    geometry: { type: 'MultiLineString'; coordinates: LonLat[][] }
  }[]
}

/**
 * Split a chronological [lng, lat] point list at every date-line jump
 * (|delta lon| > 180 deg). Same rule as splitAtDateLine() in
 * src/components/viz/WorldMap.tsx, including keeping a trailing
 * single-point segment.
 */
export function splitAtDateLine(points: LonLat[]): LonLat[][] {
  const segments: LonLat[][] = []
  let current: LonLat[] = []
  for (const p of points) {
    const prev = current[current.length - 1]
    if (prev && Math.abs(p[0] - prev[0]) > 180) {
      segments.push(current)
      current = []
    }
    current.push(p)
  }
  if (current.length > 0) segments.push(current)
  return segments
}

/**
 * GeoJSON LineStrings require >= 2 positions (unlike WorldMap's SVG
 * polylines), so the defensive length filter is applied here, at the point
 * of building the MultiLineString actually fed to MapLibre, and not inside
 * splitAtDateLine() itself, which stays a faithful port.
 */
export function toMultiLineString(points: GlobeTrackPoint[]): LonLat[][] {
  const coords: LonLat[] = points.map((p) => [p.lon, p.lat])
  return splitAtDateLine(coords).filter((seg) => seg.length > 1)
}

/**
 * MapLibre's line-progress/line-gradient resets to 0..1 independently for
 * EVERY sub-line of a MultiLineString (confirmed against the real
 * maplibre-gl-js source, src/data/bucket/line_bucket.ts: addFeature() loops
 * `for (const line of geometry)` calling addLine(), and addLine() resets
 * `this.distance = 0` at the start of each sub-line). A single
 * line-gradient expression therefore cannot selectively fade "only the
 * first sub-line" of one feature: every sub-line would restart its own
 * fade. So the fade target segment (oldest tail of the past trail, or
 * furthest tip of the future trail) is split out into its OWN feature,
 * rendered by its OWN layer with line-gradient, while every other segment
 * goes on a separate flat full-opacity layer.
 */
export function extractFadeAndBody(
  segments: LonLat[][],
  which: 'first' | 'last',
): { fade: LonLat[][]; body: LonLat[][] } {
  if (segments.length === 0) return { fade: [], body: [] }
  if (which === 'first') return { fade: [segments[0]], body: segments.slice(1) }
  return { fade: [segments[segments.length - 1]], body: segments.slice(0, -1) }
}

/**
 * Two separate FeatureCollections, one per GeoJSON SOURCE (not just per
 * layer): "body" (full opacity, dasharray-bearing on the future half) and
 * "fade" (line-gradient-bearing). Only the fade source needs
 * `lineMetrics: true` (line-gradient requires it); keeping the body source
 * off that flag avoids the documented dasharray-scale distortion that real
 * MapLibre source confirms lineMetrics:true GeoJSON sources have
 * (src/data/bucket/line_bucket.ts: lineClips-based scaledDistance
 * realignment), which previously applied to the dashed body layer too
 * since it shared the SAME (lineMetrics:true) source as the gradient
 * layers despite never using line-progress itself. `fade` is not a feature
 * property (each source only ever holds one kind), so layer filters only
 * need to distinguish future from past.
 */
export function buildTrailGeojsonPair(
  past: GlobeTrackPoint[],
  future: GlobeTrackPoint[],
): { body: TrailFeatureCollection; fade: TrailFeatureCollection } {
  const pastSplit = extractFadeAndBody(toMultiLineString(past), 'first')
  const futureSplit = extractFadeAndBody(toMultiLineString(future), 'last')
  const collection = (
    pastCoords: LonLat[][],
    futureCoords: LonLat[][],
  ): TrailFeatureCollection => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { future: false },
        geometry: { type: 'MultiLineString', coordinates: pastCoords },
      },
      {
        type: 'Feature',
        properties: { future: true },
        geometry: { type: 'MultiLineString', coordinates: futureCoords },
      },
    ],
  })
  return {
    body: collection(pastSplit.body, futureSplit.body),
    fade: collection(pastSplit.fade, futureSplit.fade),
  }
}

/**
 * Index of the first sample at or after `at`; everything before it is
 * already flown (solid), everything from it onward is not yet flown
 * (dashed). Past and future share the boundary sample so the two halves
 * connect with no visible gap. Falls back to the last index once `at` has
 * run past the whole window.
 */
export function splitTrackAt(
  track: GlobeTrackPoint[],
  at: Date,
): { past: GlobeTrackPoint[]; future: GlobeTrackPoint[]; splitIndex: number } {
  if (track.length === 0) return { past: [], future: [], splitIndex: -1 }
  let splitIndex = track.findIndex((p) => p.date.getTime() >= at.getTime())
  if (splitIndex === -1) splitIndex = track.length - 1
  return {
    past: track.slice(0, splitIndex + 1),
    future: track.slice(splitIndex),
    splitIndex,
  }
}

/**
 * Alpha ramps 0 to 1 over the first FADE_MINUTES of the window and 1 to 0
 * over the last FADE_MINUTES; 1 everywhere else. Time based (not progress
 * based) and used only by the 3D custom layer, so it stays exact
 * regardless of antimeridian splits, unlike the 2D line-gradient
 * approximation.
 */
export function fadeAlphaAt(date: Date, windowStart: Date, windowEnd: Date): number {
  const msFromStart = date.getTime() - windowStart.getTime()
  const msFromEnd = windowEnd.getTime() - date.getTime()
  const distMs = Math.min(msFromStart, msFromEnd)
  return Math.max(0, Math.min(1, distMs / (FADE_MINUTES * 60000)))
}

/**
 * Fade transition as a fraction of each fade segment's own length: an
 * approximation of "the first/last FADE_MINUTES", since line-gradient
 * works in normalized progress (0..1 per sub-line) and not in real time,
 * and each sub-line's own duration varies tick to tick. Sized against the
 * half window (past or future half) so it reads consistently with the 3D
 * layer's exact time-based fade. Accepted approximation, noted here.
 */
export function fadeProgressFraction(halfWindowMinutes: number): number {
  if (!(halfWindowMinutes > 0)) return 0.3
  return Math.min(0.3, FADE_MINUTES / halfWindowMinutes)
}

/**
 * Standard forward-azimuth (initial great-circle bearing) formula in
 * degrees, normalized to [0, 360). Used for the follow-mode camera heading.
 */
export function computeBearingDeg(
  from: { lon: number; lat: number },
  to: { lon: number; lat: number },
): number {
  const lat1 = from.lat * DEG
  const lat2 = to.lat * DEG
  const dLon = (to.lon - from.lon) * DEG
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  return ((Math.atan2(y, x) / DEG) + 360) % 360
}

/**
 * Final camera bearing while following = motion heading + how far the user
 * has dragged to look around, wrapped into [0, 360). The offset itself is
 * an unbounded accumulator (same as MapLibre's own bearing, which does not
 * require normalization either); only the composed result needs wrapping.
 */
export function composeBearingDeg(headingDeg: number, offsetDeg: number): number {
  return (((headingDeg + offsetDeg) % 360) + 360) % 360
}

/*
 * Zoom-adaptive dashing for the elevated (future) trail.
 *
 * Segmenting the dashed half by raw sample pairs would give each dash a
 * FIXED real-world length, so its on-screen size grows directly with zoom
 * ("dashes become enormous" at high zoom). This instead targets a fixed
 * ON-SCREEN dash/gap size by deriving the dash length in meters from the
 * current ground resolution and re-walking the polyline into fixed-length
 * runs.
 *
 * Ground resolution is the standard Web Mercator meters-per-pixel at a
 * given zoom/latitude: metersPerPixel = cos(lat) * 2*pi*R / (TILE_SIZE_PX *
 * 2^zoom). TILE_SIZE_PX is MapLibre's OWN internal tile size (512, not the
 * classic OSM/Bing 256 px convention), confirmed from the real source,
 * src/geo/transform_helper.ts: `this._tileSize = 512; // constant` and
 * `worldSize = tileSize * zoomScale(zoom)`. Using 256 would make the
 * computed on-screen dash about 2x the target figures below (still zoom
 * stable, just the wrong absolute size).
 */
export const TILE_SIZE_PX = 512
export const DASH_SCREEN_TARGET_PX = 12
export const GAP_SCREEN_TARGET_PX = 8
/**
 * Rebuild the dash-length TARGET only when zoom has drifted more than this
 * many levels since the last build. The geometry itself still re-walks on
 * every data update to track motion; only the meters-per-dash figure it
 * uses is throttled.
 */
export const DASH_REBUILD_ZOOM_HYSTERESIS = 0.5

export function groundResolutionMetersPerPixel(zoom: number, latDeg: number): number {
  return (Math.cos(latDeg * DEG) * 2 * Math.PI * GLOBE_RADIUS_M) / (TILE_SIZE_PX * Math.pow(2, zoom))
}

/** Pure decision half of the hysteresis rule, separate from the map-reading refresh. */
export function shouldRebuildDashLength(
  currentZoom: number,
  lastBuildZoom: number | null,
  hysteresis: number,
  force: boolean,
): boolean {
  if (force || lastBuildZoom === null) return true
  return Math.abs(currentZoom - lastBuildZoom) > hysteresis
}

/**
 * Great-circle distance in meters (haversine). Adjacent track samples are
 * only a few hundred km apart, so this is accurate enough for walking
 * cumulative distance to place dash/gap boundaries; not meant for
 * long-range geodesy.
 */
export function haversineMeters(
  a: { lon: number; lat: number },
  b: { lon: number; lat: number },
): number {
  const lat1 = a.lat * DEG
  const lat2 = b.lat * DEG
  const dLat = (b.lat - a.lat) * DEG
  const dLon = (b.lon - a.lon) * DEG
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  return 2 * GLOBE_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Linear interpolation between two track points at fraction t in [0,1].
 * INVARIANT: must never be called across an antimeridian-crossing edge
 * (|b.lon - a.lon| > 180). It interpolates raw, unwrapped longitude
 * degrees, so a naive call across the date line (e.g. a.lon=179,
 * b.lon=-179) produces a wildly wrong point that sweeps the long way
 * around the globe instead of the true short path (reported as
 * broken/zigzagging lines, reproduced and root-caused in the
 * zoom-adaptive-dashing round). buildDashedLineSegments() enforces this by
 * construction: it detects a crossing edge and skips calling this function
 * on it entirely, rather than trying to compute the crossing point.
 */
export function lerpTrackPoint(a: GlobeTrackPoint, b: GlobeTrackPoint, t: number): GlobeTrackPoint {
  return {
    lon: a.lon + (b.lon - a.lon) * t,
    lat: a.lat + (b.lat - a.lat) * t,
    altKm: a.altKm + (b.altKm - a.altKm) * t,
    date: new Date(a.date.getTime() + (b.date.getTime() - a.date.getTime()) * t),
  }
}

/**
 * Walks an ordered point list and cuts it into alternating dash/gap runs of
 * fixed METER length, returning only the "on" (dash-visible) runs as
 * [startPoint, endPoint] pairs ready for GL_LINES. The pattern always
 * starts "on" so a dash begins right at the solid/dashed split point.
 * ANTIMERIDIAN: an edge with |b.lon - a.lon| > 180 crosses the date line.
 * Rather than computing the exact crossing point (rejected: the two
 * endpoint vertices would still sit on opposite sides of the wrap, so even
 * a correctly interpolated point would not fix the RENDERED segment; only
 * never emitting a segment across the crossing does), such an edge is
 * skipped entirely. The in-progress dash ends naturally at its start
 * point, that edge is never drawn as part of the dash pattern, and the
 * pattern restarts with fresh phase on the far side. This matches the flat
 * 2D layers' splitAtDateLine, which also breaks between samples instead of
 * computing a crossing point. Accepted cost: one imperceptible
 * pattern-phase restart plus at most one undrawn dashed edge at the date
 * line, invisible at the zooms this renders at.
 */
export function buildDashedLineSegments(
  points: GlobeTrackPoint[],
  dashLengthMeters: number,
  gapLengthMeters: number,
): [GlobeTrackPoint, GlobeTrackPoint][] {
  const segments: [GlobeTrackPoint, GlobeTrackPoint][] = []
  if (points.length < 2 || !(dashLengthMeters > 0) || !(gapLengthMeters > 0)) return segments

  let on = true
  let patternRemaining = dashLengthMeters

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]

    if (Math.abs(b.lon - a.lon) > 180) {
      on = true
      patternRemaining = dashLengthMeters
      continue
    }

    let edgeStart = a
    let edgeRemaining = haversineMeters(a, b)

    while (edgeRemaining > 0) {
      if (edgeRemaining < patternRemaining) {
        if (on) segments.push([edgeStart, b])
        patternRemaining -= edgeRemaining
        edgeRemaining = 0
      } else {
        const t = patternRemaining / edgeRemaining
        const boundary = lerpTrackPoint(edgeStart, b, t)
        if (on) segments.push([edgeStart, boundary])
        edgeRemaining -= patternRemaining
        edgeStart = boundary
        on = !on
        patternRemaining = on ? dashLengthMeters : gapLengthMeters
      }
    }
  }

  return segments
}

/**
 * Position at `date` from sampled positions alone, for callers that do not
 * supply a per-frame position provider. Interpolates between the bracketing
 * samples, except across a date-line edge where lerpTrackPoint must not be
 * used (see its invariant): there the nearer sample is returned instead.
 */
export function resolveTrackPointAt(
  points: GlobeTrackPoint[],
  date: Date,
): GlobeTrackPoint | null {
  if (points.length === 0) return null
  const ms = date.getTime()
  if (ms <= points[0].date.getTime()) return points[0]
  const last = points[points.length - 1]
  if (ms >= last.date.getTime()) return last
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (ms > b.date.getTime()) continue
    const span = b.date.getTime() - a.date.getTime()
    const t = span > 0 ? (ms - a.date.getTime()) / span : 0
    if (Math.abs(b.lon - a.lon) > 180) return t < 0.5 ? a : b
    return lerpTrackPoint(a, b, t)
  }
  return last
}
