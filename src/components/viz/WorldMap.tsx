/**
 * World map: equirectangular ground-track view with a day/night terminator.
 * Pure presentational (no physics imports): callers pass already-computed
 * lat/lon degrees for tracks, markers, and the subsolar point.
 */

import { useMemo } from 'react'
import { useElementSize } from './useElementSize'
import { useVizViewport } from './useVizViewport'
import { VizControls } from './VizControls'

const MAP_W = 720
const MAP_H = 360
const DEG = Math.PI / 180

export type WorldMapTrack = {
  points: { lat: number; lon: number }[]
  color?: string
  width?: number
  dash?: number[]
}

export type WorldMapMarker = {
  lat: number
  lon: number
  label: string
  color?: string
}

type Props = {
  tracks?: WorldMapTrack[]
  markers?: WorldMapMarker[]
  /** Subsolar point [deg]: drives the night-hemisphere shading. */
  subsolarLat: number
  subsolarLon: number
  className?: string
  title?: string
  /** Shown under controls (e.g. "Equirectangular · night shading"). */
  subtitle?: string
}

function toPx(lat: number, lon: number): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * MAP_W,
    y: ((90 - lat) / 180) * MAP_H,
  }
}

/** 30 deg graticule (fixed: independent of props, built once). */
const GRATICULE_STEP_DEG = 30
const graticule: { x1: number; y1: number; x2: number; y2: number }[] = (() => {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (let lon = -180; lon <= 180; lon += GRATICULE_STEP_DEG) {
    const x = toPx(0, lon).x
    lines.push({ x1: x, y1: 0, x2: x, y2: MAP_H })
  }
  for (let lat = -90; lat <= 90; lat += GRATICULE_STEP_DEG) {
    const y = toPx(lat, 0).y
    lines.push({ x1: 0, y1: y, x2: MAP_W, y2: y })
  }
  return lines
})()

/**
 * Terminator boundary latitude [deg] at `lonDeg` for a subsolar point
 * (standard spherical formula: sin(lat)sin(latS) + cos(lat)cos(latS)cos(Δlon) = 0,
 * solved for lat). `Math.atan` gives the unique root in (-90, 90) deg for a
 * fixed meridian half; IEEE-754 division by a signed zero saturates to ±90
 * deg, which correctly limits to the equinox case (subsolar latitude 0)
 * without a separate branch.
 */
function terminatorBoundaryLatDeg(lonDeg: number, subLatDeg: number, subLonDeg: number): number {
  const latS = subLatDeg * DEG
  const dLon = (lonDeg - subLonDeg) * DEG
  const sz = Math.sin(latS)
  const a = Math.cos(latS) * Math.cos(dLon)
  if (sz === 0 && a === 0) return 0
  return Math.atan(-a / sz) / DEG
}

/** Split a lat/lon polyline at every date-line jump (|Δlon| > 180 deg). */
function splitAtDateLine(
  points: { lat: number; lon: number }[],
): { lat: number; lon: number }[][] {
  const segments: { lat: number; lon: number }[][] = []
  let current: { lat: number; lon: number }[] = []
  for (const p of points) {
    const prev = current[current.length - 1]
    if (prev && Math.abs(p.lon - prev.lon) > 180) {
      segments.push(current)
      current = []
    }
    current.push(p)
  }
  if (current.length > 0) segments.push(current)
  return segments
}

function pathFrom(pts: { x: number; y: number }[]): string {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}

export function WorldMap({
  tracks = [],
  markers = [],
  subsolarLat,
  subsolarLon,
  className = '',
  title = 'world map',
  subtitle = 'Equirectangular · night shading at the marked instant',
}: Props) {
  const { ref, ready } = useElementSize<HTMLDivElement>(1, 1)
  const { svgRef, vp, transform, reset, zoomAbout, handlers } = useVizViewport(MAP_W, MAP_H)

  const nightPolygonPoints = useMemo(() => {
    // Night hemisphere is south of the boundary curve when the subsolar
    // point is north of (or on) the equator, north of it otherwise: the
    // pole opposite the subsolar hemisphere is always in darkness.
    const southAnchored = Math.sin(subsolarLat * DEG) >= 0
    const edgeLat = southAnchored ? -90 : 90
    const steps = 180
    const pts: { x: number; y: number }[] = [toPx(edgeLat, -180)]
    for (let i = 0; i <= steps; i++) {
      const lon = -180 + (360 * i) / steps
      pts.push(toPx(terminatorBoundaryLatDeg(lon, subsolarLat, subsolarLon), lon))
    }
    pts.push(toPx(edgeLat, 180))
    return pathFrom(pts)
  }, [subsolarLat, subsolarLon])

  const trackLayers = useMemo(
    () =>
      tracks.map((track) => ({
        color: track.color ?? 'var(--color-signal)',
        width: track.width ?? 2,
        dash: track.dash,
        segments: splitAtDateLine(track.points).map((seg) => seg.map((p) => toPx(p.lat, p.lon))),
      })),
    [tracks],
  )

  const markerLayers = useMemo(
    () =>
      markers.map((m) => ({
        ...toPx(m.lat, m.lon),
        label: m.label,
        color: m.color ?? 'var(--color-fg)',
      })),
    [markers],
  )

  return (
    <div className={`flex h-full min-h-0 w-full flex-1 flex-col ${className}`}>
      <VizControls
        variant="bar"
        onZoomIn={() => zoomAbout(1.2)}
        onZoomOut={() => zoomAbout(1 / 1.2)}
        onReset={reset}
        scaleLabel={`${(vp.scale * 100).toFixed(0)}%`}
        hint={`Scroll zoom · drag pan · ${subtitle}`}
      />
      <div ref={ref} className="relative min-h-0 w-full flex-1 bg-bg">
        {ready ? (
          <svg
            ref={svgRef}
            data-viz="world-map"
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            width="100%"
            height="100%"
            className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={title}
            {...handlers}
          >
            <rect width={MAP_W} height={MAP_H} fill="var(--color-bg)" />
            <g transform={transform}>
              <polygon
                points={nightPolygonPoints}
                fill="var(--color-fg)"
                fillOpacity={0.12}
                stroke="none"
              />
              {graticule.map((l, i) => (
                <line
                  key={i}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke="var(--color-border)"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <rect
                x={0}
                y={0}
                width={MAP_W}
                height={MAP_H}
                fill="none"
                stroke="var(--color-fg)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              {trackLayers.map((t, ti) =>
                t.segments.map((seg, si) => (
                  <polyline
                    key={`${ti}-${si}`}
                    points={pathFrom(seg)}
                    fill="none"
                    stroke={t.color}
                    strokeWidth={t.width}
                    strokeDasharray={t.dash?.join(' ')}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                )),
              )}
              {markerLayers.map((m, i) => (
                <g key={`${m.label}-${i}`}>
                  <circle cx={m.x} cy={m.y} r={4} fill={m.color} />
                  <text
                    x={m.x + 6}
                    y={m.y - 6}
                    fill="var(--color-muted)"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                  >
                    {m.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        ) : null}
      </div>
    </div>
  )
}
