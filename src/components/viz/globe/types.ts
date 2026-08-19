/**
 * Shared shapes for the MapLibre globe view. Kept free of React and
 * MapLibre imports so the pure geometry modules can use them too.
 */

/** One propagated position: ground point plus altitude and timestamp. */
export type GlobeTrackPoint = {
  lon: number
  lat: number
  altKm: number
  date: Date
}

/**
 * One rendered satellite. Multi-satellite shaped from day one: every
 * source, layer and GL buffer set is keyed by `id`, and no orbit-specific
 * knowledge lives in the component (the caller owns propagation).
 */
export type GlobeSatellite = {
  id: string
  label: string
  /** CSS color for trail, marker and elevated GL draw: `#rgb`, `#rrggbb`, `rgb()` or `rgba()`. */
  color: string
  /** Chronological trail samples. Empty or single-point trails simply draw nothing. */
  positions?: GlobeTrackPoint[]
  /** Samples up to this instant draw solid, later ones dashed. Defaults to the last sample. */
  splitAt?: Date
  /** Fade ramp window. Defaults to the first and last sample dates. */
  trailWindow?: { start: Date; end: Date }
  /** Marker position at the caller's current instant. Defaults to the sample at `splitAt`. */
  livePosition?: GlobeTrackPoint
  /**
   * Position provider for the per-frame follow chase. Without it, follow
   * falls back to interpolating `positions` (see resolveTrackPointAt).
   */
  positionAt?: (date: Date) => GlobeTrackPoint | null
}

/** Static surface marker: observer site, AOS/peak/now instants, launch site, … */
export type GlobeMarker = {
  id: string
  lat: number
  lon: number
  label: string
  color?: string
}

/** Observer site: drives the "Local" home button and gets its own marker. */
export type GlobeObserver = {
  lat: number
  lon: number
  label: string
  color?: string
}

/** Camera state reported back to the caller. */
export type GlobeView = {
  center: [number, number]
  zoom: number
  bearing: number
  pitch: number
}
