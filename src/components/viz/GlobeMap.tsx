/**
 * MapLibre GL globe view: vector-tile planet, satellite ground trails with a
 * solid past / dashed future split, an optional true-altitude WebGL layer,
 * night shading, and a flight-sim follow mode.
 *
 * The component knows nothing about any specific satellite: callers pass
 * propagated positions (or a position provider for the per-frame chase) and
 * own all physics. Every source, layer and GL buffer set is keyed by
 * satellite id, so a second satellite is data, not new code.
 */

import 'maplibre-gl/dist/maplibre-gl.css'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AttributionControl,
  Map as MapLibreMap,
  type GeoJSONSource,
  type LngLatLike,
} from 'maplibre-gl'
import { cn } from '@/lib/utils'
import { ALTITUDE_LAYER_ID, createAltitudeLayer, type AltitudeLayer, type AltitudeTrailInput } from './globe/altitudeLayer'
import { parseCssRgba } from './globe/color'
import { projectElevatedToScreen } from './globe/projection'
import {
  buildBaseStyle,
  DEFAULT_MARKER_COLOR,
  EMPTY_FEATURE_COLLECTION,
  MARKERS_FIRST_LAYER_ID,
  MARKERS_SOURCE_ID,
  NIGHT_SOURCE_ID,
  SATELLITE_MARKER_LAYER_IDS,
  trailFadeGradients,
  trailLayerIds,
  trailLayerSpecs,
  trailSourceIds,
} from './globe/style'
import { nightPolygon } from './globe/terminator'
import {
  buildTrailGeojsonPair,
  composeBearingDeg,
  computeBearingDeg,
  fadeProgressFraction,
  resolveTrackPointAt,
  splitTrackAt,
} from './globe/track'
import type { GlobeMarker, GlobeObserver, GlobeSatellite, GlobeTrackPoint, GlobeView } from './globe/types'

const INITIAL_CENTER: [number, number] = [0, 20]
const INITIAL_ZOOM = 1.5
const MAX_PITCH = 80
/** Chase zoom for follow mode: closer than a whole-hemisphere view, still with context. */
const FOLLOW_ZOOM = 7.5
const HEADING_LOOKAHEAD_MS = 30_000
/** Same dx/dy to bearing/pitch sensitivity for ALT-drag and follow look-around. */
const LOOK_SENSITIVITY = 0.3
const ALT_WHEEL_PITCH_FACTOR = 0.2
const STARBASE_POINT: [number, number] = [-97.156, 25.9972]
const HOLD_REPEAT_DELAY_MS = 350
const HOLD_REPEAT_INTERVAL_MS = 120

/*
 * Follow-at-altitude camera pullback.
 *
 * A true 3D chase camera behind the satellite would need MapLibre's
 * FreeCameraOptions/setFreeCameraOptions API, confirmed ABSENT from
 * MapLibre GL JS entirely (grepped the real Camera class source for v5.24.0
 * and v6.4.1 for FreeCamera/setFreeCameraOptions/lookAtPoint: zero matches
 * in either, and none on the official Map API docs page). It is a Mapbox GL
 * JS-only API that MapLibre has never implemented, in any projection.
 * Related upstream limit: GlobeTransform ignores center elevation entirely
 * (MercatorTransform uses it explicitly, GlobeTransform never does), and a
 * mercator-projection workaround was tried and rejected because a
 * constant-altitude orbit on a flat world reads as a self-intersecting
 * floating sinusoid. Follow therefore stays globe ground-centered.
 *
 * Fallback: keep the ground-centered chase but pull the zoom back as
 * altitude increases, so the elevated track has headroom to stay in frame at
 * a steep pitch. Pitch is not raised further: MAX_PITCH is already the
 * view-wide ceiling used by the tilt controls and ALT gestures. Heuristic,
 * kept as named constants so it stays easy to retune on sight.
 */
const ALTITUDE_ZOOM_PULLBACK_PER_KM = 1 / 400
const ALTITUDE_ZOOM_MAX_PULLBACK = 1.5

function altitudeChaseZoom(altKm: number): number {
  return Math.max(
    FOLLOW_ZOOM - ALTITUDE_ZOOM_MAX_PULLBACK,
    Math.min(FOLLOW_ZOOM, FOLLOW_ZOOM - altKm * ALTITUDE_ZOOM_PULLBACK_PER_KM),
  )
}

type MarkerFeature = {
  type: 'Feature'
  properties: { kind: 'satellite' | 'static'; label: string; color: string }
  geometry: { type: 'Point'; coordinates: [number, number] }
}

type Props = {
  satellites: GlobeSatellite[]
  observer?: GlobeObserver
  /** Extra surface markers: AOS / peak / now instants, sites, … */
  markers?: GlobeMarker[]
  /** Subsolar point [deg]. Omit to skip night shading. */
  subsolar?: { latDeg: number; lonDeg: number }
  /** Satellite the follow control chases. Defaults to the first one. */
  followTargetId?: string | null
  /** Initial state of the altitude toggle; the control owns it afterwards. */
  showAltitude?: boolean
  onFollowChange?: (following: boolean, satelliteId: string | null) => void
  onAltitudeChange?: (on: boolean) => void
  /** Camera state after a settled move. Not fired while following. */
  onViewChange?: (view: GlobeView) => void
  /** Caption above the attribution bar. Already translated by the caller. */
  caption?: string
  title?: string
  className?: string
}

function markerFeature(
  lon: number,
  lat: number,
  properties: MarkerFeature['properties'],
): MarkerFeature {
  return { type: 'Feature', properties, geometry: { type: 'Point', coordinates: [lon, lat] } }
}

/** Position from the caller's provider, falling back to the sampled trail. */
function positionOf(sat: GlobeSatellite, date: Date): GlobeTrackPoint | null {
  return sat.positionAt?.(date) ?? resolveTrackPointAt(sat.positions ?? [], date)
}

function trailWindowOf(sat: GlobeSatellite): { start: Date; end: Date } | null {
  if (sat.trailWindow) return sat.trailWindow
  const points = sat.positions ?? []
  if (points.length === 0) return null
  return { start: points[0].date, end: points[points.length - 1].date }
}

/** Hold-to-repeat control: fires once on press, then repeats until release. */
function HoldButton({
  onTrigger,
  title,
  className,
  children,
}: {
  onTrigger: () => void
  title: string
  className?: string
  children: ReactNode
}) {
  const timeoutRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => stop, [stop])

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={className}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        onTrigger()
        timeoutRef.current = window.setTimeout(() => {
          intervalRef.current = window.setInterval(onTrigger, HOLD_REPEAT_INTERVAL_MS)
        }, HOLD_REPEAT_DELAY_MS)
      }}
      onPointerUp={(e) => {
        stop()
        e.currentTarget.blur()
      }}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      {children}
    </button>
  )
}

const CTRL_GROUP_CLASS = 'flex gap-[3px] rounded-md border border-border bg-surface/80 p-1'
const CTRL_BTN_CLASS =
  'flex h-7 w-7 items-center justify-center rounded border border-border bg-fg/[0.03] font-mono text-[13px] leading-none text-fg transition-colors hover:border-warn active:bg-warn/25'
const CTRL_BTN_WIDE_CLASS =
  'flex h-7 items-center justify-center rounded border border-border bg-fg/[0.03] px-2.5 font-mono text-[11px] leading-none text-fg transition-colors hover:border-warn active:bg-warn/25'

export function GlobeMap(props: Props) {
  const { t } = useTranslation()
  const { satellites, observer, markers, subsolar, caption, title, className } = props

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const layerRef = useRef<AltitudeLayer | null>(null)
  const labelElRef = useRef(new Map<string, HTMLDivElement | null>())
  const labelPosRef = useRef(new Map<string, { x: number; y: number }>())
  const knownSatIdsRef = useRef(new Set<string>())
  const trailSignatureRef = useRef(new Map<string, string>())
  const trailPaintKeyRef = useRef(new Map<string, string>())
  const altitudeDataRef = useRef(new Map<string, AltitudeTrailInput>())
  const livePositionRef = useRef(new Map<string, GlobeTrackPoint>())
  const followRafRef = useRef<number | null>(null)
  const followBearingOffsetRef = useRef(0)
  const followActiveRef = useRef(false)
  const altitudeOnRef = useRef(props.showAltitude ?? false)
  const propsRef = useRef(props)
  propsRef.current = props

  const [ready, setReady] = useState(false)
  const [followActive, setFollowActive] = useState(false)
  const [altitudeOn, setAltitudeOn] = useState(props.showAltitude ?? false)
  const [errors, setErrors] = useState<string[]>([])

  const logError = useCallback((label: string, err: unknown) => {
    const time = new Date().toISOString().slice(11, 23)
    const detail = err instanceof Error ? (err.stack ?? err.message) : String(err)
    setErrors((prev) => [...prev, `[${time}] ${label}: ${detail}`].slice(-50))
  }, [])

  const followTargetId = props.followTargetId ?? satellites[0]?.id ?? null
  const followTargetLabel =
    satellites.find((s) => s.id === followTargetId)?.label ?? t('fields.globe_follow')

  /** Marker source: satellite live dots plus observer and instant markers. */
  const syncMarkers = useCallback(() => {
    const map = mapRef.current
    const source = map?.getSource(MARKERS_SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return
    const current = propsRef.current
    const features: MarkerFeature[] = []
    for (const sat of current.satellites) {
      const point = livePositionRef.current.get(sat.id)
      if (!point) continue
      features.push(
        markerFeature(point.lon, point.lat, {
          kind: 'satellite',
          label: sat.label,
          color: sat.color,
        }),
      )
    }
    if (current.observer) {
      features.push(
        markerFeature(current.observer.lon, current.observer.lat, {
          kind: 'static',
          label: current.observer.label,
          color: current.observer.color ?? DEFAULT_MARKER_COLOR,
        }),
      )
    }
    for (const marker of current.markers ?? []) {
      features.push(
        markerFeature(marker.lon, marker.lat, {
          kind: 'static',
          label: marker.label,
          color: marker.color ?? DEFAULT_MARKER_COLOR,
        }),
      )
    }
    source.setData({ type: 'FeatureCollection', features })
  }, [])

  /**
   * Positions the elevated HTML labels. Called from inside the altitude
   * layer's render(), so labels track the same matrix the elevated dots are
   * drawn with on every repaint, not just at the caller's data cadence.
   */
  const updateLabelOverlays = useCallback(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    const projection = layer.lastProjectionData()
    const canvas = map.getCanvas()
    for (const sat of propsRef.current.satellites) {
      const el = labelElRef.current.get(sat.id)
      if (!el) continue
      const point = layer.livePointOf(sat.id)
      const screen =
        altitudeOnRef.current && projection && point
          ? projectElevatedToScreen(
              point.lon,
              point.lat,
              point.altKm * 1000,
              projection,
              canvas.clientWidth,
              canvas.clientHeight,
              layer.lastVariantName(),
            )
          : null
      if (!screen) {
        el.style.display = 'none'
        labelPosRef.current.delete(sat.id)
        continue
      }
      el.style.display = 'block'
      const last = labelPosRef.current.get(sat.id)
      /* Sub-pixel write guard: the two call sites (repaint and data update)
         are both idempotent, so neither fights the other. */
      if (last && Math.abs(screen.x - last.x) < 0.5 && Math.abs(screen.y - last.y) < 0.5) continue
      el.style.transform = `translate(${screen.x + 6}px, ${screen.y - 14}px)`
      labelPosRef.current.set(sat.id, screen)
    }
  }, [])

  /** Re-push stored trails and live points, e.g. after the layer is re-added. */
  const pushAltitudeData = useCallback(() => {
    const layer = layerRef.current
    if (!layer) return
    for (const sat of propsRef.current.satellites) {
      const trail = altitudeDataRef.current.get(sat.id)
      if (trail) layer.setTrail(trail)
      const point = livePositionRef.current.get(sat.id)
      if (point) layer.setPoint(sat.id, parseCssRgba(sat.color), point)
    }
  }, [])

  // --- Map creation: once per mount. Prop changes flow through the effects
  // below, never through a rebuild.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = new MapLibreMap({
      container,
      style: buildBaseStyle(),
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      maxPitch: MAX_PITCH,
      /* centerClampedToGround defaults to true and, per its own doc comment,
         "the elevation of the center point will automatically be set to the
         terrain elevation (or zero if terrain is not enabled)". There is no
         terrain here, so the default would silently reset any manual
         elevation to 0 every frame. */
      centerClampedToGround: false,
      /* The Map constructor adds its OWN implicit AttributionControl unless
         this is false (src/ui/map.ts: `if (resolvedOptions.attributionControl)
         this.addControl(new AttributionControl(...))`). Leaving it default
         renders two stacked attribution bars alongside the explicit control
         added below. */
      attributionControl: false,
    })
    mapRef.current = map

    /* customAttribution supplements (does not replace) what the control
       pulls from active sources, so the OpenStreetMap/OpenFreeMap credit and
       MapLibre's own default credit text combine into one compact line. */
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: '<a href="https://maplibre.org/" target="_blank">MapLibre</a>',
      }),
      'bottom-left',
    )

    const layer = createAltitudeLayer({
      map,
      onError: logError,
      onFrame: updateLabelOverlays,
    })
    layerRef.current = layer

    map.on('error', (e) => logError('MapLibre error event', e.error ?? e))
    map.on('load', () => {
      /* Defensive re-assert of the style-level projection, matching the
         official MapLibre globe example's own pattern. */
      map.setProjection({ type: 'globe' })
      setReady(true)
    })
    /* A settled zoom re-targets the elevated dash length without waiting for
       the next data update ('zoom' would fire continuously mid-gesture). */
    map.on('zoomend', () => layer.refreshDashLengths(false))
    map.on('moveend', () => {
      if (followActiveRef.current) return
      const center = map.getCenter()
      propsRef.current.onViewChange?.({
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      })
    })

    return () => {
      if (followRafRef.current !== null) cancelAnimationFrame(followRafRef.current)
      followRafRef.current = null
      followActiveRef.current = false
      mapRef.current = null
      layerRef.current = null
      knownSatIdsRef.current.clear()
      trailSignatureRef.current.clear()
      trailPaintKeyRef.current.clear()
      labelPosRef.current.clear()
      setReady(false)
      map.remove()
    }
  }, [logError, updateLabelOverlays])

  // --- Follow mode -------------------------------------------------------
  const stopFollowLoop = useCallback(() => {
    if (followRafRef.current !== null) {
      cancelAnimationFrame(followRafRef.current)
      followRafRef.current = null
    }
  }, [])

  const exitFollow = useCallback(() => {
    const map = mapRef.current
    followActiveRef.current = false
    setFollowActive(false)
    stopFollowLoop()
    if (!map) return
    map.dragPan.enable()
    map.dragRotate.enable()
    /* Restore default cursor-anchored zoom. enable() is a no-op while
       scrollZoom is already enabled (`if (this.isEnabled()) return;` in the
       real handler source), and it stays enabled throughout follow, so the
       disable() first is what makes the options take effect. */
    map.scrollZoom.disable()
    map.scrollZoom.enable()
    propsRef.current.onFollowChange?.(false, null)
  }, [stopFollowLoop])

  const followFrame = useCallback(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    const current = propsRef.current
    const targetId = current.followTargetId ?? current.satellites[0]?.id ?? null
    const sat = current.satellites.find((s) => s.id === targetId)
    if (!sat) {
      exitFollow()
      return
    }
    const now = new Date()
    const point = positionOf(sat, now)
    if (point) {
      const ahead = positionOf(sat, new Date(now.getTime() + HEADING_LOOKAHEAD_MS))
      const heading = ahead ? computeBearingDeg(point, ahead) : map.getBearing()
      /* Ground-centered chase: center and bearing only. Zoom and pitch stay
         user-free after their one-time entry default, so wheel zoom and tilt
         are never overwritten mid-follow. jumpTo, not easeTo, so no easing
         animation fights the per-frame updates. */
      map.jumpTo({
        center: [point.lon, point.lat],
        bearing: composeBearingDeg(heading, followBearingOffsetRef.current),
      })
      livePositionRef.current.set(sat.id, point)
      syncMarkers()
      layer.setPoint(sat.id, parseCssRgba(sat.color), point)
      updateLabelOverlays()
      map.triggerRepaint()
    }
    followRafRef.current = requestAnimationFrame(followFrame)
  }, [exitFollow, syncMarkers, updateLabelOverlays])

  const enterFollow = useCallback(() => {
    const map = mapRef.current
    const current = propsRef.current
    const targetId = current.followTargetId ?? current.satellites[0]?.id ?? null
    const sat = current.satellites.find((s) => s.id === targetId)
    if (!map || !sat) return
    const now = new Date()
    const point = positionOf(sat, now)
    if (!point) return

    followActiveRef.current = true
    followBearingOffsetRef.current = 0
    setFollowActive(true)
    /* Pan is locked while following: the POV is carried along the orbit, not
       user-panned. dragRotate is off too, since bearing and pitch come from
       the dedicated look-around drag handler below. Both are restored on
       exit. */
    map.dragPan.disable()
    map.dragRotate.disable()
    /* Wheel zoom must zoom about the followed satellite. Since every frame
       re-centers on it, around-center IS around-satellite (the real handler
       recomputes its around point from the CURRENT center on every scroll
       event when _aroundCenter is set). enable() no-ops while already
       enabled, so disable() must precede it for the option to take effect. */
    map.scrollZoom.disable()
    map.scrollZoom.enable({ around: 'center' })

    const ahead = positionOf(sat, new Date(now.getTime() + HEADING_LOOKAHEAD_MS))
    map.easeTo({
      center: [point.lon, point.lat],
      pitch: MAX_PITCH,
      zoom: altitudeOnRef.current ? altitudeChaseZoom(point.altKm) : FOLLOW_ZOOM,
      bearing: ahead ? computeBearingDeg(point, ahead) : map.getBearing(),
      duration: 1000,
    })
    /* The per-frame loop starts only once the entry transition has settled,
       so the easing and the jumpTo chase never fight each other. */
    map.once('moveend', () => {
      if (followActiveRef.current && followRafRef.current === null) {
        followRafRef.current = requestAnimationFrame(followFrame)
      }
    })
    propsRef.current.onFollowChange?.(true, sat.id)
  }, [followFrame])

  const toggleFollow = useCallback(() => {
    if (followActiveRef.current) exitFollow()
    else enterFollow()
  }, [enterFollow, exitFollow])

  // --- Keyboard, wheel and drag gestures ---------------------------------
  useEffect(() => {
    if (!ready) return
    const map = mapRef.current
    if (!map) return
    const canvas = map.getCanvas()

    let altHeld = false
    let altDragging = false
    let altDragLastX = 0
    let altDragLastY = 0
    let lookDragging = false
    let lookLastX = 0
    let lookLastY = 0

    const stopAltDrag = () => {
      if (!altDragging) return
      altDragging = false
      map.dragPan.enable()
      map.dragRotate.enable()
    }

    /* The globe shares the page with tool inputs, so the F shortcut must
       ignore keystrokes aimed at a field. */
    const isTypingTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false
      return (
        target.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      )
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'F') && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (isTypingTarget(e.target)) return
        toggleFollow()
        return
      }
      if (e.key === 'Alt' && !altHeld) {
        altHeld = true
        map.scrollZoom.disable()
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'Alt' || !altHeld) return
      altHeld = false
      /* Restoring scrollZoom must re-specify `{ around: 'center' }` while
         following: enable(options) only reads options when transitioning
         from disabled to enabled, and a bare enable() silently drops back to
         cursor-anchored zoom for the rest of the follow session. */
      map.scrollZoom.enable(followActiveRef.current ? { around: 'center' } : undefined)
    }

    const onWheel = (e: WheelEvent) => {
      if (!e.altKey) return
      e.preventDefault()
      const nextPitch = Math.max(
        0,
        Math.min(MAX_PITCH, map.getPitch() + e.deltaY * ALT_WHEEL_PITCH_FACTOR),
      )
      map.jumpTo({ pitch: nextPitch })
    }

    const onPointerDown = (e: PointerEvent) => {
      if (followActiveRef.current) {
        /* While following, ANY plain drag looks around: dragPan/dragRotate
           are already disabled for the whole session, so there is no native
           handler left to conflict with. */
        lookDragging = true
        lookLastX = e.clientX
        lookLastY = e.clientY
        e.preventDefault()
        return
      }
      if (!e.altKey) return
      altDragging = true
      altDragLastX = e.clientX
      altDragLastY = e.clientY
      map.dragPan.disable()
      map.dragRotate.disable()
      e.preventDefault()
    }

    const onPointerMove = (e: PointerEvent) => {
      if (lookDragging) {
        if (!followActiveRef.current) {
          lookDragging = false
          return
        }
        const dx = e.clientX - lookLastX
        const dy = e.clientY - lookLastY
        lookLastX = e.clientX
        lookLastY = e.clientY
        /* Bearing goes through the offset accumulator, not straight to the
           map: the per-frame loop recomputes bearing from heading + offset
           and would overwrite a direct write on its very next tick. Pitch is
           never touched by the loop, so it is written directly. */
        followBearingOffsetRef.current += dx * LOOK_SENSITIVITY
        map.jumpTo({
          pitch: Math.max(0, Math.min(MAX_PITCH, map.getPitch() - dy * LOOK_SENSITIVITY)),
        })
        return
      }
      if (!altDragging) return
      if (!e.altKey) {
        stopAltDrag() // Alt released mid-gesture: stop cleanly, do not fight the pointer
        return
      }
      const dx = e.clientX - altDragLastX
      const dy = e.clientY - altDragLastY
      altDragLastX = e.clientX
      altDragLastY = e.clientY
      map.jumpTo({
        bearing: map.getBearing() + dx * LOOK_SENSITIVITY,
        pitch: Math.max(0, Math.min(MAX_PITCH, map.getPitch() - dy * LOOK_SENSITIVITY)),
      })
    }

    const onPointerUp = () => {
      lookDragging = false
      stopAltDrag()
    }

    const onBlur = () => {
      if (altHeld) {
        altHeld = false
        map.scrollZoom.enable(followActiveRef.current ? { around: 'center' } : undefined)
      }
      lookDragging = false
      stopAltDrag()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('blur', onBlur)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('blur', onBlur)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [ready, toggleFollow])

  // --- Satellite sources, layers and data --------------------------------
  useEffect(() => {
    if (!ready) return
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    const present = new Set<string>()
    for (const sat of satellites) {
      present.add(sat.id)
      const sources = trailSourceIds(sat.id)
      const points = sat.positions ?? []
      const trailWindow = trailWindowOf(sat)
      const halfWindowMinutes = trailWindow
        ? (trailWindow.end.getTime() - trailWindow.start.getTime()) / 2 / 60000
        : 0
      const fadeFraction = fadeProgressFraction(halfWindowMinutes)
      const paintKey = `${sat.color}|${fadeFraction}`

      if (!map.getSource(sources.body)) {
        map.addSource(sources.body, { type: 'geojson', data: EMPTY_FEATURE_COLLECTION })
        /* Only the fade source sets lineMetrics: line-gradient requires it,
           and keeping it off the body source avoids the dasharray-scale
           distortion lineMetrics:true imposes on dashed lines. */
        map.addSource(sources.fade, {
          type: 'geojson',
          lineMetrics: true,
          data: EMPTY_FEATURE_COLLECTION,
        })
        for (const spec of trailLayerSpecs(sat.id, sat.color, fadeFraction)) {
          map.addLayer(spec, MARKERS_FIRST_LAYER_ID)
        }
        trailPaintKeyRef.current.set(sat.id, paintKey)
        if (altitudeOnRef.current) {
          for (const id of trailLayerIds(sat.id)) map.setLayoutProperty(id, 'visibility', 'none')
        }
      } else if (trailPaintKeyRef.current.get(sat.id) !== paintKey) {
        const [solidFade, solidBody, dashedBody, dashedFade] = trailLayerIds(sat.id)
        const gradients = trailFadeGradients(sat.color, fadeFraction)
        map.setPaintProperty(solidFade, 'line-gradient', gradients.solid)
        map.setPaintProperty(dashedFade, 'line-gradient', gradients.dashed)
        map.setPaintProperty(solidBody, 'line-color', sat.color)
        map.setPaintProperty(dashedBody, 'line-color', sat.color)
        trailPaintKeyRef.current.set(sat.id, paintKey)
      }

      const splitAt = sat.splitAt ?? points[points.length - 1]?.date ?? new Date()
      const { past, future, splitIndex } = splitTrackAt(points, splitAt)
      /* The geojson only changes when the split moves to another sample, so
         a caller ticking its marker at 10 Hz does not re-tile the trail on
         every tick. */
      const signature = `${points.length}|${points[0]?.date.getTime() ?? 0}|${points[points.length - 1]?.date.getTime() ?? 0}|${splitIndex}`
      if (trailSignatureRef.current.get(sat.id) !== signature) {
        trailSignatureRef.current.set(sat.id, signature)
        const pair = buildTrailGeojsonPair(past, future)
        ;(map.getSource(sources.body) as GeoJSONSource | undefined)?.setData(pair.body)
        ;(map.getSource(sources.fade) as GeoJSONSource | undefined)?.setData(pair.fade)
        if (trailWindow) {
          const trail: AltitudeTrailInput = {
            id: sat.id,
            colorRgba: parseCssRgba(sat.color),
            past,
            future,
            windowStart: trailWindow.start,
            windowEnd: trailWindow.end,
          }
          altitudeDataRef.current.set(sat.id, trail)
          layer.setTrail(trail)
        }
        layer.refreshDashLengths(false)
      }

      /* While following, the per-frame loop owns the live position and must
         not be fought by the caller's slower cadence. */
      if (!followActiveRef.current) {
        const live = sat.livePosition ?? positionOf(sat, splitAt)
        if (live) {
          livePositionRef.current.set(sat.id, live)
          layer.setPoint(sat.id, parseCssRgba(sat.color), live)
        }
      }
    }

    for (const id of knownSatIdsRef.current) {
      if (present.has(id)) continue
      for (const layerId of trailLayerIds(id)) {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
      }
      const sources = trailSourceIds(id)
      if (map.getSource(sources.body)) map.removeSource(sources.body)
      if (map.getSource(sources.fade)) map.removeSource(sources.fade)
      layer.dropSatellite(id)
      altitudeDataRef.current.delete(id)
      livePositionRef.current.delete(id)
      trailSignatureRef.current.delete(id)
      trailPaintKeyRef.current.delete(id)
      labelPosRef.current.delete(id)
    }
    knownSatIdsRef.current = present

    syncMarkers()
    updateLabelOverlays()
  }, [ready, satellites, observer, markers, syncMarkers, updateLabelOverlays])

  // --- Night terminator ---------------------------------------------------
  // Rounded to 0.01 deg (about 40 s of the subsolar point's motion) so a
  // caller ticking at 10 Hz does not re-tile the polygon on every tick.
  const nightLat = subsolar ? Math.round(subsolar.latDeg * 100) / 100 : null
  const nightLon = subsolar ? Math.round(subsolar.lonDeg * 100) / 100 : null
  useEffect(() => {
    if (!ready) return
    const source = mapRef.current?.getSource(NIGHT_SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return
    source.setData(
      nightLat === null || nightLon === null
        ? EMPTY_FEATURE_COLLECTION
        : nightPolygon(nightLat, nightLon),
    )
  }, [ready, nightLat, nightLon])

  // --- Altitude toggle ----------------------------------------------------
  useEffect(() => {
    if (!ready) return
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    altitudeOnRef.current = altitudeOn

    /* Satellites added later get this same visibility when their layers are
       created, so this effect does not need to re-run on every data tick. */
    const hidden = propsRef.current.satellites
      .flatMap((sat) => trailLayerIds(sat.id))
      .concat(SATELLITE_MARKER_LAYER_IDS)
    for (const id of hidden) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', altitudeOn ? 'none' : 'visible')
    }

    if (altitudeOn) {
      if (!map.getLayer(ALTITUDE_LAYER_ID)) map.addLayer(layer)
      pushAltitudeData()
    } else {
      if (map.getLayer(ALTITUDE_LAYER_ID)) map.removeLayer(ALTITUDE_LAYER_ID)
      /* Do not wait for the next frame to hide a stale overlay position. */
      for (const el of labelElRef.current.values()) {
        if (el) el.style.display = 'none'
      }
      labelPosRef.current.clear()
    }
  }, [ready, altitudeOn, pushAltitudeData])

  // --- Controls -----------------------------------------------------------
  const rotationStepDeg = useCallback(() => {
    const map = mapRef.current
    if (!map) return 5
    return Math.max(0.5, Math.min(15, 40 / Math.pow(2, map.getZoom())))
  }, [])

  const panBy = useCallback(
    (dLatSign: number, dLonSign: number) => {
      const map = mapRef.current
      if (!map) return
      const step = rotationStepDeg()
      const center = map.getCenter()
      const nextLat = Math.max(-85, Math.min(85, center.lat + dLatSign * step))
      map.easeTo({ center: [center.lng + dLonSign * step, nextLat], duration: 150 })
    },
    [rotationStepDeg],
  )

  const rotateBearingBy = useCallback((sign: number) => {
    const map = mapRef.current
    if (!map) return
    map.easeTo({ bearing: map.getBearing() + sign * 15, duration: 150 })
  }, [])

  const tiltBy = useCallback((sign: number) => {
    const map = mapRef.current
    if (!map) return
    map.easeTo({
      pitch: Math.max(0, Math.min(MAX_PITCH, map.getPitch() + sign * 10)),
      duration: 150,
    })
  }, [])

  const homeTo = useCallback(
    (center: LngLatLike, zoom: number) => {
      const map = mapRef.current
      if (!map) return
      if (followActiveRef.current) exitFollow()
      map.easeTo({ center, bearing: 0, pitch: 0, zoom, duration: 1500 })
    },
    [exitFollow],
  )

  const setAltitude = useCallback(
    (on: boolean) => {
      setAltitudeOn(on)
      altitudeOnRef.current = on
      propsRef.current.onAltitudeChange?.(on)
    },
    [],
  )

  const copyErrors = useCallback(() => {
    void navigator.clipboard?.writeText(errors.join('\n')).catch(() => {})
  }, [errors])

  const hint = followActive ? t('fields.globe_hint_following') : t('fields.globe_hint')
  /* One stable ref callback per satellite id: a fresh closure per render
     would make React detach and reattach every label element on every tick. */
  const labelRefSetters = useRef(new Map<string, (el: HTMLDivElement | null) => void>())
  const labelRefSetter = useCallback((id: string) => {
    const existing = labelRefSetters.current.get(id)
    if (existing) return existing
    const setter = (el: HTMLDivElement | null) => {
      labelElRef.current.set(id, el)
    }
    labelRefSetters.current.set(id, setter)
    return setter
  }, [])

  return (
    <div
      className={cn('relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-bg', className)}
      data-viz="globe-map"
    >
      <div ref={containerRef} className="absolute inset-0" role="img" aria-label={title ?? t('fields.title_pass_globe')} />

      {satellites.map((sat) => (
        <div
          key={sat.id}
          ref={labelRefSetter(sat.id)}
          className="pointer-events-none absolute left-0 top-0 z-[1] hidden font-mono text-[11px] text-fg [text-shadow:0_0_3px_var(--color-bg),0_0_3px_var(--color-bg)]"
        >
          {sat.label}
        </div>
      ))}

      <p className="pointer-events-none absolute left-4 top-3 z-[2] font-mono text-[10px] leading-relaxed text-subtle">
        {hint}
      </p>

      {caption ? (
        <p className="pointer-events-none absolute bottom-8 left-4 z-[2] font-mono text-[10px] leading-relaxed text-subtle">
          {caption}
        </p>
      ) : null}

      <div className="absolute bottom-4 right-4 z-[2] flex flex-col items-end gap-2">
        <div
          className="grid grid-cols-3 grid-rows-3 gap-[3px] rounded-md border border-border bg-surface/80 p-1"
          title={t('fields.globe_pan')}
        >
          <HoldButton
            onTrigger={() => panBy(1, 0)}
            title={t('fields.globe_pan_north')}
            className={cn(CTRL_BTN_CLASS, 'col-start-2 row-start-1')}
          >
            ▲
          </HoldButton>
          <HoldButton
            onTrigger={() => panBy(0, -1)}
            title={t('fields.globe_pan_west')}
            className={cn(CTRL_BTN_CLASS, 'col-start-1 row-start-2')}
          >
            ◀
          </HoldButton>
          <HoldButton
            onTrigger={() => panBy(0, 1)}
            title={t('fields.globe_pan_east')}
            className={cn(CTRL_BTN_CLASS, 'col-start-3 row-start-2')}
          >
            ▶
          </HoldButton>
          <HoldButton
            onTrigger={() => panBy(-1, 0)}
            title={t('fields.globe_pan_south')}
            className={cn(CTRL_BTN_CLASS, 'col-start-2 row-start-3')}
          >
            ▼
          </HoldButton>
        </div>

        <div className={CTRL_GROUP_CLASS} title={t('fields.globe_bearing')}>
          <HoldButton
            onTrigger={() => rotateBearingBy(-1)}
            title={t('fields.globe_bearing_left')}
            className={CTRL_BTN_CLASS}
          >
            ↺
          </HoldButton>
          <HoldButton
            onTrigger={() => rotateBearingBy(1)}
            title={t('fields.globe_bearing_right')}
            className={CTRL_BTN_CLASS}
          >
            ↻
          </HoldButton>
        </div>

        <div className={CTRL_GROUP_CLASS} title={t('fields.globe_tilt')}>
          <HoldButton
            onTrigger={() => tiltBy(1)}
            title={t('fields.globe_tilt_up')}
            className={CTRL_BTN_CLASS}
          >
            ⇑
          </HoldButton>
          <HoldButton
            onTrigger={() => tiltBy(-1)}
            title={t('fields.globe_tilt_down')}
            className={CTRL_BTN_CLASS}
          >
            ⇓
          </HoldButton>
        </div>

        <div className={CTRL_GROUP_CLASS}>
          <button
            type="button"
            className={CTRL_BTN_WIDE_CLASS}
            title={t('fields.globe_home_starbase_hint')}
            onClick={(e) => {
              homeTo(STARBASE_POINT, 4)
              e.currentTarget.blur()
            }}
          >
            {t('fields.globe_home_starbase')}
          </button>
          {observer ? (
            <button
              type="button"
              className={CTRL_BTN_WIDE_CLASS}
              title={t('fields.globe_home_local_hint')}
              onClick={(e) => {
                homeTo([observer.lon, observer.lat], 6)
                e.currentTarget.blur()
              }}
            >
              {t('fields.globe_home_local')}
            </button>
          ) : null}
        </div>

        <div className={CTRL_GROUP_CLASS} title={t('fields.globe_altitude_hint')}>
          <label className="flex h-7 cursor-pointer items-center gap-1.5 whitespace-nowrap px-2 font-mono text-[11px] text-fg">
            <input
              type="checkbox"
              checked={altitudeOn}
              onChange={(e) => setAltitude(e.target.checked)}
              className="cursor-pointer accent-warn"
            />
            {t('fields.globe_altitude')}
          </label>
        </div>

        {followTargetId ? (
          <button
            type="button"
            aria-pressed={followActive}
            title={t('fields.globe_follow_hint', { label: followTargetLabel })}
            className={cn(
              CTRL_BTN_WIDE_CLASS,
              'border-border bg-surface/80',
              followActive && 'border-warn bg-warn/25 text-warn',
            )}
            onClick={(e) => {
              toggleFollow()
              e.currentTarget.blur()
            }}
          >
            {t('fields.globe_follow')}
          </button>
        ) : null}
      </div>

      {errors.length > 0 ? (
        <div className="absolute right-0 top-0 z-[3] flex max-h-[60%] w-[26rem] max-w-[90%] flex-col border border-danger/60 bg-danger/20 font-mono text-[11px] leading-relaxed text-fg">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-danger/40 px-2.5 py-1.5">
            <span>{t('fields.globe_error_log', { n: errors.length })}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={copyErrors}
                className="rounded border border-danger/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-fg transition-colors hover:bg-danger/30"
              >
                {t('fields.globe_error_copy')}
              </button>
              <button
                type="button"
                onClick={() => setErrors([])}
                className="rounded border border-danger/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-fg transition-colors hover:bg-danger/30"
              >
                {t('fields.globe_error_dismiss')}
              </button>
            </div>
          </div>
          <div className="overflow-y-auto whitespace-pre-wrap px-3 py-2">
            {errors.map((entry, i) => (
              <p key={i} className="border-t border-danger/30 pt-1.5 first:border-t-0 first:pt-0">
                {entry}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
