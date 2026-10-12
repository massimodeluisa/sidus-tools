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

import '@/lib/maplibre-worker'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AttributionControl,
  Map as MapLibreMap,
  MercatorCoordinate,
  type GeoJSONSource,
  type LngLatLike,
} from 'maplibre-gl'
import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'
import type { CustomLayerInterface, CustomRenderMethodInput, ProjectionData } from 'maplibre-gl'
import { ALTITUDE_LAYER_ID, createAltitudeLayer, type AltitudeLayer, type AltitudeTrailInput } from './globe/altitude-layer'
import {
  centerForElevatedTarget,
  elevatedCenterLeadRad,
  followZoomCeiling,
  globeScreenRadiusPx,
  latCompensatedZoom,
  skyAimCamera,
  followPitchDeg,
  frameSatelliteCamera,
  wrapLngDeg,
} from './globe/camera'
import { cssRgbaWithAlpha, parseCssRgba } from './globe/color'
import {
  armSwarmTrace,
  createSwarmLayer,
  readSwarmTrace,
  SWARM_LAYER_ID,
  type SwarmLayer,
} from './globe/swarm-layer'
import {
  createSwarmTrailLayer,
  SWARM_TRAIL_LAYER_ID,
  type SwarmTrailLayer,
} from './globe/swarm-trail-layer'
import {
  createSwarmPickIndex,
  lonLatOfMercator,
  nearestCandidateSegment,
  SWARM_PICK_RADIUS_PX,
  type SwarmPickIndex,
} from './globe/swarm-pick'
import { pickNearestTrail, type TrailPolyline } from './globe/trail-pick'
import { keyframeProgress, SWARM_FLOATS_PER_SATELLITE } from './globe/swarm'
import { pointOwnershipOf, trailOwnershipOf } from './globe/swarm-ownership'
import { gmstRad } from '@/lib/physics'
import { GLOBE_RADIUS_M } from './globe/track'
import { GLOBE_FLOOR_ZOOM, viewScale, type ViewScale } from './globe/scale'
import { spinDirection } from '@/components/tools/orbital-view/sky-math'
import {
  CTRL_BTN_CLASS,
  CTRL_BTN_WIDE_CLASS,
  CTRL_PANEL_CLASS,
  GlobeScaleReadout,
  HoldButton,
  isTypingTarget,
  KeyTip,
  TrailProgress,
  TrailSlider,
} from './globe/controls-ui'
import { ChromeHost, ChromePanel, type OrbitalChromeSheet } from './globe/chrome-overlay'
import { drawGlobeAxes } from './globe/draw-axes'
import { GLOBE_POIS, grokipediaUrl, type GlobePoi } from './globe/pois'
import {
  refineSkyPath,
  refineTrailHalf,
  TRAIL_REFINE_BUDGET,
  type RefinedSkyPath,
} from './globe/sky-refine'
import { projectElevatedToScreen } from './globe/projection'
import {
  buildBaseStyle,
  DEFAULT_MARKER_COLOR,
  EMPTY_FEATURE_COLLECTION,
  MARKERS_FIRST_LAYER_ID,
  MARKERS_SOURCE_ID,
  NIGHT_SOURCE_ID,
  SATELLITE_MARKER_LAYER_IDS,
  SUN_DISK_COLOR,
  SUN_GLOW_RGB,
  trailFadeGradients,
  trailLayerIds,
  trailLayerSpecs,
  trailSourceIds,
  trailIsDashed,
  trailWeightFor,
  paintedTrailWeight,
} from './globe/style'
import { daylightBands } from './globe/terminator'
import {
  drawDashedPath,
  drawDot,
  drawPhasedDisk,
  distanceToPolylinePx,
  PLANET_MIN_DOT_PX,
  screenPhase,
  SKY_HOVER_DIAMETER_PX,
  SKY_HOVER_EASE,
  SKY_PATH_HOVER_PX,
  SKY_PATH_REFINE_BUDGET,
  sunwardProbeDirection,
  type SkyBody,
} from './globe/celestial'
import {
  forwardComponent,
  SKY_FORWARD_EPSILON,
  angularSizeToPixels,
  isDirectionOccludedByGlobe,
  isPointOccludedByGlobe,
  projectDirectionToScreen,
  sphereDirection,
  SUN_ANGULAR_DIAMETER_DEG,
  SUN_GLOW_SCALE,
  sunBillboardBackground,
} from './globe/sun'
import {
  buildTrailGeojsonPair,
  composeBearingDeg,
  computeBearingDeg,
  smoothFollowHeading,
  fadeProgressFraction,
  resolveTrackPointAt,
  splitTrackAt,
} from './globe/track'
import type { GlobeMarker, GlobeObserver, GlobeSatellite, GlobeTrackPoint, GlobeView } from './globe/types'

const INITIAL_CENTER: [number, number] = [0, 20]
const INITIAL_ZOOM = 1.5
const MAX_PITCH = 80
/** MapLibre's own default zoom ceiling, the limit for the follow pose too. */
const MAX_ZOOM = 22

/** Native MapLibre camera writers must not run while follow owns the pose. */
function setFollowNativeHandlers(map: MapLibreMap, following: boolean) {
  const action = following ? 'disable' : 'enable'
  map.dragPan[action]()
  map.dragRotate[action]()
  map.scrollZoom[action]()
  map.touchZoomRotate[action]()
  map.touchPitch[action]()
  map.doubleClickZoom[action]()
  map.boxZoom[action]()
}
/** MapLibre's default vertical field of view, for the frame before the first render. */
const DEFAULT_FOV_RAD = (36.87 * Math.PI) / 180
/** Eased camera flights: aiming at a body, and the chip route between scenes. */
const CAMERA_FLIGHT_MS = 1100
/** Fill-rate cap for high-density screens; see the map constructor. */
const MAX_DEVICE_PIXEL_RATIO = 2

/** Point diameter for the mass swarm, before the device pixel ratio. */
const SWARM_DEFAULT_POINT_PX = 2.5
/** Wheel delta to zoom levels while following, matched to MapLibre's own feel. */
const FOLLOW_WHEEL_ZOOM_FACTOR = 1 / 250
/** Zoom levels per +/- press: half a level, so key repeat compounds it like the wheel. */
const KEY_ZOOM_STEP = 0.5
/** Widest globe zoom; below this the view hands over to the solar scene. */
export const GLOBE_MIN_ZOOM = GLOBE_FLOOR_ZOOM
/** Zoom slack for "sitting on the floor": the wheel leaves a fractional remainder. */
const FLOOR_EXIT_EPSILON = 0.02
/**
 * Wheel notches at the floor before the view is handed over. The floor is the
 * widest framing of the globe and worth sitting in, so leaving it takes a
 * deliberate push rather than the one notch that arrives there.
 */
const FLOOR_EXIT_NOTCHES = 8
/**
 * Pointer distance at which a satellite marker claims the tooltip. Wider than
 * the 6 px dot it is drawn as, because the dot is small and moving.
 */
const SATELLITE_HOVER_PX = 12
/** Chase zoom for follow mode: closer than a whole-hemisphere view, still with context. */
const FOLLOW_ZOOM = 7.5
const HEADING_LOOKAHEAD_MS = 30_000
/** Same dx/dy to bearing/pitch sensitivity for ALT-drag and follow look-around. */
const LOOK_SENSITIVITY = 0.3
const ALT_WHEEL_PITCH_FACTOR = 0.2

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
 * The chase is therefore ground-centered, and the entry shot pulls the zoom
 * back as altitude increases so the elevated track has headroom at a steep
 * pitch. A framing preference, kept as named constants so it stays easy to
 * retune on sight; the hard limit is the zoom ceiling further down.
 *
 * ---
 *
 * Centring the elevated dot while following.
 *
 * MapLibre centres on GROUND coordinates, but with the altitude layer on the
 * dot the user sees is drawn 400+ km up, and that elevated point projects away
 * from the ground point beneath it: measured 41 px at pitch 20 and 290 px at
 * pitch 80, always along screen Y, which is why the camera looked like it
 * trailed the satellite. The camera therefore aims PAST the satellite, at the
 * ground its centre ray reaches after passing through it.
 *
 * How far past is solved exactly, per frame, for the pose the user is holding:
 * see elevatedCenterLeadRad in globe/camera.ts. There is no feedback loop and
 * no gain, so a tilt or a turn cannot leave a one-frame error behind, which is
 * what a cross-frame correction showed as a small jump on every pose change.
 *
 * The zoom ceiling is the one thing tilt really does cost. The aiming ray only
 * reaches the ground while the camera is farther from Earth's centre than the
 * satellite is, and the camera's height above the centre point goes with
 * cos(pitch), so a steep tilt has to be paid for with a wider shot. Tilt itself
 * is never refused.
 */
const ALTITUDE_ZOOM_PULLBACK_PER_KM = 1 / 400
const ALTITUDE_ZOOM_MAX_PULLBACK = 1.5



function altitudeChaseZoom(altKm: number): number {
  return Math.max(
    FOLLOW_ZOOM - ALTITUDE_ZOOM_MAX_PULLBACK,
    Math.min(FOLLOW_ZOOM, FOLLOW_ZOOM - altKm * ALTITUDE_ZOOM_PULLBACK_PER_KM),
  )
}


/**
 * A track sample projected exactly as it is DRAWN, limb included.
 *
 * `elevated` mirrors the altitude toggle: with it on the sample goes through
 * the elevated chain the custom layer uses, with it off it lies on the ground
 * like the style-layer line does. The occlusion test is separate because the
 * projection alone keeps a point on the far side of the planet, which would let
 * the pointer catch a trail hidden behind it.
 */
function projectTrackPoint(
  point: GlobeTrackPoint,
  projection: ProjectionData,
  width: number,
  height: number,
  variant: string | null,
  elevated: boolean,
): { x: number; y: number } | null {
  const elevationM = elevated ? point.altKm * 1000 : 0
  if (variant !== 'mercator') {
    const unit = sphereDirection(point.lon, point.lat)
    const scale = 1 + elevationM / GLOBE_RADIUS_M
    if (
      isPointOccludedByGlobe(
        [unit[0] * scale, unit[1] * scale, unit[2] * scale],
        projection.clippingPlane,
      )
    ) {
      return null
    }
  }
  return projectElevatedToScreen(point.lon, point.lat, elevationM, projection, width, height, variant)
}

const SUN_PROBE_LAYER_ID = 'sidus-sun-probe'

/**
 * Per-frame tap on MapLibre's camera state. `defaultProjectionData` and the
 * live field of view are only handed to a custom layer inside render(), and
 * the altitude layer is added and removed by its toggle, so the sun needs its
 * own always-present layer. It issues NO GL calls at all, which is why every
 * sealed constraint of the drawing layer (precision header, render()-only
 * mutations, attribute state restore) is preserved here by construction.
 */
function createSunProbeLayer(onFrame: (args: CustomRenderMethodInput) => void): CustomLayerInterface {
  return {
    id: SUN_PROBE_LAYER_ID,
    type: 'custom',
    renderingMode: '2d',
    render(_gl, args) {
      onFrame(args)
    },
  }
}

type MarkerFeature = {
  type: 'Feature'
  properties: { kind: 'satellite' | 'static'; label: string; color: string }
  geometry: { type: 'Point'; coordinates: [number, number] }
}

type Props = {
  satellites: GlobeSatellite[]
  /**
   * Resample satellites that provide `positionAt` on a short interval inside
   * this view, so a live marker does not require the parent to re-render.
   */
  tickLive?: boolean
  observer?: GlobeObserver
  /** Extra surface markers: AOS / peak / now instants, sites, … */
  markers?: GlobeMarker[]
  /** Subsolar point [deg]. Omit to skip night shading. */
  subsolar?: { latDeg: number; lonDeg: number }
  /**
   * Moon and planets to draw as billboards with their apparent paths. The
   * caller owns the ephemeris and the visibility gate: whatever is in this
   * array is drawn, both billboard and path, and nothing else is.
   */
  skyBodies?: SkyBody[]
  /**
   * Draw the Sun billboard. The day/night shading is NOT affected: that is the
   * globe being lit, not an overlay. When `skyBodies` carries a sun entry the
   * billboard rides ITS direction, so the disk can never drift off its own
   * drawn path; without one it falls back to `subsolar`.
   */
  showSun?: boolean
  /**
   * Rows for the hover tooltip on a sky path. The caller computes them from the
   * physics at the display instant; this component only positions the box.
   */
  skyTooltipFor?: (bodyId: string) => { title: string; rows: [string, string][] } | null
  /** Same contract for a satellite, keyed by catalogue number. */
  satelliteTooltipFor?: (catnr: string) => {
    title: string
    rows: [string, string][]
    href?: string
    linkLabel?: string
  } | null
  /** Sun-body-Earth angle of the Moon [rad], for its drawn phase. */
  moonPhaseAngleRad?: number
  /**
   * Wheel zoom-out while already at the minimum zoom. The argument is the
   * planet's current on-screen radius in CSS pixels, so a wider scene can open
   * at the same apparent size. Without this the wheel simply stops at the
   * floor, which is the behaviour every other caller gets.
   */
  onZoomOutPastFloor?: (planetRadiusPx: number) => void
  /**
   * A packed keyframe pair for the point swarm (see globe/swarm.ts). Present
   * means "draw the swarm"; null or absent removes the layer entirely, so the
   * mass path costs nothing when nobody asked for it.
   */
  swarmKeyframe?: {
    packed: Float32Array
    count: number
    epochMs: number
    spanMs: number
    /** Packed slot to satellite index. Slot k is satrec k. */
    indices: Uint32Array
  } | null
  /** Colour of the swarm points. */
  swarmColor?: string
  /**
   * One batch of the population's trails, as the worker finishes it. Batches
   * accumulate in the layer, so the trails appear progressively rather than all
   * at once; a new `version` is what marks an arrival.
   */
  swarmTrailBatch?: {
    packed: Float32Array
    startIndex: number
    count: number
    /** True when this replaces a trajectory already drawn, rather than adding one. */
    refresh: boolean
    version: number
  } | null
  /** Satellites the trail buffer is sized for. Zero removes the trail layer. */
  swarmTrailCount?: number
  /**
   * Catalogue numbers in the order the worker loaded them, so a picked segment
   * or dot can be named. Index into this IS the swarm's own satellite index.
   */
  swarmIds?: string[]
  /**
   * The satellite under the pointer, from ANY source: its marker, its
   * individually drawn trail, or the swarm. One callback on purpose, so the
   * list and the tooltip cannot end up describing different satellites.
   */
  onSatelliteHover?: (catnr: string | null) => void
  /**
   * The sky body under the pointer, by billboard or by its drawn path. The
   * counterpart of `onSatelliteHover`, and reported for the same reason: the
   * thing the pointer is on has a row somewhere else on the page, and a view
   * that names it in a tooltip while its row sits unmarked is two answers to
   * one question.
   */
  onSkyBodyHover?: (bodyId: string | null) => void
  /** A click landed on a satellite, by marker or by trail, or on nothing. */
  onSatellitePick?: (catnr: string | null) => void
  /** Asks the host to request geolocation; the observer prop carries the answer. */
  onRequestMyLocation?: () => void
  /** The satellite drawn saturated and labelled: the pin, or the hover. */
  identifiedSatelliteId?: string | null
  /** Multipliers on the trail baselines, from the appearance control. */
  swarmTrailBaseWidthPx?: number
  swarmTrailBaseAlpha?: number
  swarmTrailWidth?: number
  swarmTrailOpacity?: number
  /** Narrows the trails to the identified satellite alone. */
  swarmTrailOnlySelected?: boolean
  /** Why All trails were refused; empty when the last request succeeded. */
  trailScopeNotice?: string
  /**
   * How much of the population has a trail yet, 0..1, or null when there is
   * nothing to wait for. The trails converge over about a minute, and a view
   * that fills in silently for that long reads as a view that is broken.
   */
  swarmTrailProgress?: number | null
  /** Set by the trail appearance control. Absent hides the control entirely. */
  onTrailAppearanceChange?: (next: {
    width: number
    opacity: number
    onlySelected: boolean
  }) => void
  /**
   * Draw a name beside every satellite marker. False leaves the labels to the
   * caller's own rules (a follow target, a hovered entry), because past a few
   * dozen the names overlap into a smear rather than identifying anything.
   */
  showSatelliteLabels?: boolean
  /** Point diameter in CSS pixels. */
  swarmPointSizePx?: number
  /** Opening zoom. Defaults to the standard whole-Earth view. */
  initialZoom?: number
  /** Opening centre `[lng, lat]`. Defaults to a slightly north-of-equator view. */
  initialCenter?: [number, number]
  /** With `initialZoom` set, ease on from there to the standard view on arrival. */
  easeToDefaultOnOpen?: boolean
  /**
   * Bumping this flies the view out to the zoom floor and then hands off, so a
   * button can take the same route the wheel does.
   */
  flyToFloorNonce?: number
  /**
   * Aim the camera at a direction in the world frame, eased. A new object means
   * a new request, so the same body can be aimed at twice.
   */
  aimAt?: { direction: [number, number, number] } | null
  /**
   * One-shot fly that frames a satellite. A new `nonce` asks again, so clicking
   * the same row twice still flies. High orbits (ARKTIKA-M, GEO) zoom out far
   * enough that a marker drawn outside the globe stays on screen.
   */
  frameTarget?: {
    lon: number
    lat: number
    altKm: number
    nonce: number
  } | null
  /** Satellite the follow control chases. Defaults to the first one. */
  followTargetId?: string | null
  /** Initial state of the altitude toggle; the control owns it afterwards. */
  showAltitude?: boolean
  onFollowChange?: (following: boolean, satelliteId: string | null) => void
  onAltitudeChange?: (on: boolean) => void
  /** Camera state after a settled move. Not fired while following. */
  onViewChange?: (view: GlobeView) => void
  cameraLng?: number
  cameraLat?: number
  cameraZoom?: number
  cameraPitch?: number
  cameraBearing?: number
  /** Restore follow from a shared link. */
  followWanted?: boolean
  onResetView?: () => void
  /** Caption above the attribution bar. Already translated by the caller. */
  caption?: string
  title?: string
  /**
   * Minimum height in CSS pixels. Required in any layout that does not give
   * this component a definite height: every child here is absolutely
   * positioned, so without a floor the root collapses to zero and MapLibre
   * gets a zero-height container (a blank view, with no error to report).
   */
  height?: number
  className?: string
  /**
   * Hides the built-in control chrome for an embedded, unattended view: the
   * camera/view/trail panel column and the info button. The MapLibre
   * AttributionControl and the caption stay, since those are legal, not
   * chrome. Also skips the window keydown/keyup camera-shortcut listeners,
   * which belong to a page that owns the keyboard; an embed sharing the
   * page with other content must not capture its arrow keys. Defaults to
   * true (the tool's own full chrome).
   */
  chrome?: boolean
  /**
   * Collapse CAMERA / VIEW / TRAJECTORIES into bottom sheets.
   * The parent owns the dock that opens them.
   */
  compactChrome?: boolean
  /** Which compact sheet is open; ignored unless `compactChrome`. */
  chromeSheet?: Extract<OrbitalChromeSheet, 'camera' | 'view' | 'trails'> | null
  onChromeSheetClose?: () => void
  /**
   * Attract-mode rotation: degrees of longitude per second around Earth's
   * polar axis (the map centre's longitude, north kept up). Omit for none.
   */
  autoRotateDegPerS?: number
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

function applySwarmPointOwnership(
  layer: SwarmLayer,
  keyframe: { count: number; indices: Uint32Array },
  identified: string | null | undefined,
  swarmIds: readonly string[] | undefined,
  satellites: readonly GlobeSatellite[],
  hiddenSlotRef: { current: number | null },
): void {
  const { highlight, hidden } = pointOwnershipOf(identified, swarmIds, keyframe, satellites)
  layer.setHighlightSlot(highlight)
  layer.setHiddenSlot(hidden)
  hiddenSlotRef.current = hidden
}

function applySwarmTrailOwnership(
  layer: { setHighlight(i: number | null): void; setHiddenIndex(i: number | null): void },
  identified: string | null | undefined,
  swarmIds: readonly string[] | undefined,
  satellites: readonly GlobeSatellite[],
  hiddenIndexRef: { current: number | null },
): void {
  const { highlight, hidden } = trailOwnershipOf(identified, swarmIds, satellites)
  layer.setHighlight(highlight)
  layer.setHiddenIndex(hidden)
  hiddenIndexRef.current = hidden
}

const closeChromeSheetNoop = () => {}

export function GlobeMap(props: Props) {
  const { t } = useTranslation()
  const { satellites, observer, markers, subsolar, caption, title, height, className } = props
  const { aimAt, flyToFloorNonce } = props
  const chrome = props.chrome ?? true
  const compactChrome = chrome && (props.compactChrome ?? false)
  const closeChromeSheet = props.onChromeSheetClose ?? closeChromeSheetNoop

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const layerRef = useRef<AltitudeLayer | null>(null)
  const labelElRef = useRef(new Map<string, HTMLDivElement | null>())
  const sunElRef = useRef<HTMLDivElement | null>(null)
  const skyCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const swarmLayerRef = useRef<SwarmLayer | null>(null)
  const swarmTrailLayerRef = useRef<SwarmTrailLayer | null>(null)
  /** Population the trail buffer was last sized for; reset only when it changes. */
  const trailLayerCountRef = useRef(0)
  /** Last reported answer to "is every enabled sky body out of sight". */

  /** CPU mirror of the drawn trails, indexed for picking. */
  const swarmPickRef = useRef<SwarmPickIndex>(createSwarmPickIndex())
  /** Cost of the last swarm pick, for the debug reader. */
  const swarmPickCostRef = useRef({ candidates: 0, projections: 0, ms: 0 })
  /** Packed swarm slot already drawn by the full-treatment marker. */
  const swarmHiddenSlotRef = useRef<number | null>(null)
  /** Satrec index whose swarm trail the full-treatment path already owns. */
  const swarmHiddenIndexRef = useRef<number | null>(null)
  /** Last satellite identity reported, from any source, so only changes are sent. */
  const hoverIdentityRef = useRef<string | null>(null)
  /** Per-body refined path samples, kept across frames (directions, not pixels). */
  const refinedPathsRef = useRef(new Map<string, RefinedSkyPath>())
  /** Last drawn screen polyline per body, for pointer hit-testing. */
  const hoverPathsRef = useRef(new Map<string, ({ x: number; y: number } | null)[]>())
  /** True while MapLibre is moving the camera, so hover cannot fight a drag. */
  const mapMovingRef = useRef(false)
  /** Drawn marker position per satellite, kept even when its label is hidden. */
  const satScreenRef = useRef(new Map<string, { x: number; y: number }>())
  /** Which path the pointer is on, and where the pointer is. */
  const hoverRef = useRef<{ bodyId: string | null; x: number; y: number }>({
    bodyId: null,
    x: 0,
    y: 0,
  })
  /** Eased hover radius per body, in pixels. */
  const hoverGrowRef = useRef(new Map<string, number>())
  const sunFrameRef = useRef<CustomRenderMethodInput | null>(null)
  const labelPosRef = useRef(new Map<string, { x: number; y: number }>())
  const knownSatIdsRef = useRef(new Set<string>())
  const trailSignatureRef = useRef(new Map<string, string>())
  const trailPaintKeyRef = useRef(new Map<string, string>())
  const altitudeDataRef = useRef(new Map<string, AltitudeTrailInput>())
  const livePositionRef = useRef(new Map<string, GlobeTrackPoint>())
  const followRafRef = useRef<number | null>(null)
  /**
   * The pose the USER owns while following. Every input path writes here and
   * nothing writes the camera directly, so the per-frame compose step is the
   * single place the camera is set.
   */
  const followPoseRef = useRef({ bearingOffsetDeg: 0, pitchDeg: MAX_PITCH, zoom: FOLLOW_ZOOM })
  /** Smoothed motion heading, so a one-frame azimuth flip cannot yaw the chase. */
  const followHeadingRef = useRef<number | null>(null)
  const followActiveRef = useRef(false)
  /** Deliberate wheel notches accumulated at the zoom floor (see FLOOR_EXIT_NOTCHES). */
  const floorNotchesRef = useRef(0)
  /**
   * Screen-refined trail geometry per satellite, keyed by the source signature
   * so a new trail starts from the raw samples again. `settled` stops the sweep
   * once every chord is short enough at the current camera.
   */
  const refinedTrailRef = useRef(
    new Map<string, { key: string; past: GlobeTrackPoint[]; future: GlobeTrackPoint[]; settled: boolean }>(),
  )
  /** Which satellite the next frame examines: one per frame, round robin. */
  const refineCursorRef = useRef(0)
  /** Non-null only while the debug facility is on: what the sky draw produced. */
  const skyDebugRef = useRef<
    | {
        id: string
        atMs: number
        angularDiameterDeg: number
        truePx: number
        drawnPx: number
        screen: { x: number; y: number } | null
        direction: [number, number, number]
      }[]
    | null
  >(null)

  /* Dev-only, and only when the URL asks: Earth's drawn radius, which every
     scale measurement on this view is expressed against. Dead code in a
     production build, where import.meta.env.DEV is a literal false. */
  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (new URLSearchParams(window.location.search).get('debug') !== 'proj') return
    void import('@/lib/debug-projection').then((mod) => {
      mod.registerDebugProjection({
        globeTrails: () => {
          const map = mapRef.current
          const layer = layerRef.current
          const projection = layer?.lastProjectionData()
          if (!map || !layer || !projection) return []
          const canvas = map.getCanvas()
          const variant = layer.lastVariantName()
          const at = (pt: GlobeTrackPoint) =>
            projectElevatedToScreen(pt.lon, pt.lat, pt.altKm * 1000, projection, canvas.clientWidth, canvas.clientHeight, variant)
          const sat = propsRef.current.satellites
          return [...refinedTrailRef.current.entries()].map(([id, entry]) => {
            const positionAt = sat.find((s) => s.id === id)?.positionAt
            let worst = 0
            let worstSagitta = 0
            for (const half of [entry.past, entry.future]) {
              for (let i = 1; i < half.length; i++) {
                if (Math.abs(half[i].lon - half[i - 1].lon) > 180) continue
                const a = at(half[i - 1])
                const b = at(half[i])
                if (!a || !b) continue
                worst = Math.max(worst, Math.hypot(b.x - a.x, b.y - a.y))
                /* How far the drawn straight line sits from where the
                   satellite really was: the acceptance metric. */
                if (!positionAt) continue
                const midMs = (half[i - 1].date.getTime() + half[i].date.getTime()) / 2
                const truth = positionAt(new Date(midMs))
                const t = truth && at(truth)
                if (!t) continue
                worstSagitta = Math.max(
                  worstSagitta,
                  Math.hypot(t.x - (a.x + b.x) / 2, t.y - (a.y + b.y) / 2),
                )
              }
            }
            return {
              id,
              points: entry.past.length + entry.future.length,
              maxChordPx: +worst.toFixed(2),
              maxSagittaPx: +worstSagitta.toFixed(3),
              settled: entry.settled,
            }
          })
        },
        swarmTrace: () => {
          armSwarmTrace()
          return readSwarmTrace()
        },
        globeLayers: () => {
          const map = mapRef.current
          if (!map) {
            return { swarm: false, trails: 0, labels: 0, swarmTrails: false, swarmTrailsFilled: 0 }
          }
          /* getLayer, not getStyle(): a custom layer is not part of the
             serialised style, so it is invisible to the latter. */
          const ids = map.getStyle().layers.map((l) => l.id)
          let labels = 0
          for (const el of labelElRef.current.values()) {
            if (el && el.style.display !== 'none') labels++
          }
          return {
            swarm: !!map.getLayer(SWARM_LAYER_ID),
            trails: ids.filter((id) => id.startsWith('trail-')).length,
            labels,
            swarmTrails: !!map.getLayer(SWARM_TRAIL_LAYER_ID),
            swarmTrailsFilled: swarmTrailLayerRef.current?.filled() ?? 0,
          }
        },
        globeSwarmDots: (step: number) => {
          const map = mapRef.current
          const trailLayer = swarmTrailLayerRef.current
          const projection =
            trailLayer?.lastProjectionData() ?? layerRef.current?.lastProjectionData()
          const variant =
            trailLayer?.lastVariantName() ?? layerRef.current?.lastVariantName() ?? null
          const keyframe = propsRef.current.swarmKeyframe
          const ids = propsRef.current.swarmIds
          if (!map || !projection || !keyframe || !ids) return []
          const canvas = map.getCanvas()
          const progress = keyframeProgress(Date.now(), keyframe.epochMs, keyframe.spanMs)
          const out: { id: string; index: number; screen: { x: number; y: number } }[] = []
          for (let i = 0; i < keyframe.count; i += Math.max(1, step)) {
            const satellite = keyframe.indices[i]
            if (satellite >= ids.length) continue
            const at = i * SWARM_FLOATS_PER_SATELLITE
            const mercX = keyframe.packed[at] + progress * keyframe.packed[at + 3]
            if (!Number.isFinite(mercX)) continue
            const mercY = keyframe.packed[at + 1] + progress * keyframe.packed[at + 4]
            const elevation = keyframe.packed[at + 2] + progress * keyframe.packed[at + 5]
            const { lonDeg: lon, latDeg: lat } = lonLatOfMercator(mercX, mercY)
            const unit = sphereDirection(lon, lat)
            const scale = 1 + elevation / GLOBE_RADIUS_M
            if (
              variant !== 'mercator' &&
              isPointOccludedByGlobe(
                [unit[0] * scale, unit[1] * scale, unit[2] * scale],
                projection.clippingPlane,
              )
            ) {
              continue
            }
            const screen = projectElevatedToScreen(
              lon,
              lat,
              altitudeOnRef.current ? elevation : 0,
              projection,
              canvas.clientWidth,
              canvas.clientHeight,
              variant,
            )
            if (screen) out.push({ id: ids[satellite], index: satellite, screen })
          }
          return out
        },
        globeSwarmPick: (x: number, y: number) => {
          const id = pickSatelliteAt(x, y)
          return { id, ...swarmPickCostRef.current, occupancy: swarmPickRef.current.occupancy() }
        },
        globeSkyDirectionAt: (id: string, timeMs: number) => {
          const body = propsRef.current.skyBodies?.find((b) => b.id === id)
          return body ? body.directionAt(timeMs) : null
        },
        globeSkyBodies: () => {
          if (!skyDebugRef.current) skyDebugRef.current = []
          return skyDebugRef.current.map((row) => ({ ...row }))
        },
        globeCamera: () => {
          const map = mapRef.current
          const frame = sunFrameRef.current
          if (!map || !frame) return null
          const canvas = map.getCanvas()
          const center = map.getCenter()
          return {
            fovRad: frame.fov,
            widthPx: canvas.clientWidth,
            heightPx: canvas.clientHeight,
            centerLon: center.lng,
            centerLat: center.lat,
            bearingDeg: map.getBearing(),
            pitchDeg: map.getPitch(),
            zoom: map.getZoom(),
          }
        },
        globeSatellites: () => {
          const map = mapRef.current
          const layer = layerRef.current
          const projection = layer?.lastProjectionData()
          if (!map || !layer || !projection) return []
          const canvas = map.getCanvas()
          const variant = layer.lastVariantName()
          const atMs = Date.now()
          return propsRef.current.satellites.flatMap((sat) => {
            const point = layer.livePointOf(sat.id)
            if (!point) return []
            return [{
              id: sat.id,
              atMs,
              lon: point.lon,
              lat: point.lat,
              altKm: point.altKm,
              screen: projectElevatedToScreen(point.lon, point.lat, point.altKm * 1000, projection, canvas.clientWidth, canvas.clientHeight, variant),
            }]
          })
        },
        globeProject: (lonDeg: number, latDeg: number, altKm: number) => {
          const map = mapRef.current
          const layer = layerRef.current
          const projection = layer?.lastProjectionData()
          if (!map || !layer || !projection) return null
          const canvas = map.getCanvas()
          return projectElevatedToScreen(
            lonDeg,
            latDeg,
            altKm * 1000,
            projection,
            canvas.clientWidth,
            canvas.clientHeight,
            layer.lastVariantName(),
          )
        },
        globeCenter: () => {
          const map = mapRef.current
          if (!map) return null
          const canvas = map.getCanvas()
          return { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 }
        },
        globeRadiusPx: () => {
          const frame = sunFrameRef.current
          const map = mapRef.current
          if (!frame || !map) return null
          return globeScreenRadiusPx(
            frame.defaultProjectionData.clippingPlane,
            frame.fov,
            map.getCanvas().clientHeight,
          )
        },
      })
    })
  }, [])
  /** The altitude setting to restore when follow ends; follow forces it on. */
  const altitudeBeforeFollowRef = useRef(false)
  /** The scale the viewer was browsing at before the chase took the camera. */
  const zoomBeforeFollowRef = useRef(INITIAL_ZOOM)
  const altitudeOnRef = useRef(props.showAltitude ?? false)
  const propsRef = useRef(props)
  propsRef.current = props
  /* panBy/rotateBearingBy/tiltBy/zoomByKey are useCallback values defined
     further down the component, after the keydown listener that has to call
     them: capturing them there directly would read the const before its own
     initialiser runs. Reading them off a ref updated on every render, the
     same escape hatch as propsRef above, sidesteps the ordering instead of
     moving the callbacks. */
  const keyControlsRef = useRef<{
    panBy: (dLatSign: number, dLonSign: number) => void
    rotateBearingBy: (sign: number) => void
    tiltBy: (sign: number) => void
    zoomByKey: (sign: 1 | -1) => void
  } | null>(null)

  const [ready, setReady] = useState(false)
  /**
   * The map instance whose style finished loading, which is what the style
   * mutations have to be gated on. `ready` alone is not enough, and the gap is
   * a real crash: on a hot reload React runs the whole effect chain in one
   * commit, so the mount effect tears the old map down and creates a new one
   * while every later effect still sees the stale `ready === true`, and an
   * addSource against a style that is still loading throws "Style is not done
   * loading". Comparing INSTANCES is exact where `isStyleLoaded()` is not:
   * that one also reports false while sources merely have updates in flight,
   * which with markers ticking at 10 Hz was most of the time, and the guard
   * built on it silently starved the trail and altitude effects.
   */
  const readyMapRef = useRef<MapLibreMap | null>(null)
  const [followActive, setFollowActive] = useState(false)
  const [altitudeOn, setAltitudeOn] = useState(props.showAltitude ?? false)
  /**
   * Live TRAJECTORIES multipliers. The URL is written on slider *release*,
   * not on every tick: each tick was a history.replace that GTM treated as a
   * page view. The globe still follows the drag; only the address bar waits.
   */
  const [liveTrailWidth, setLiveTrailWidth] = useState(props.swarmTrailWidth ?? 1)
  const [liveTrailOpacity, setLiveTrailOpacity] = useState(props.swarmTrailOpacity ?? 1)
  const [errors, setErrors] = useState<string[]>([])
  /** Hover state that the DOM needs; the canvas reads the ref instead. */
  const [hoverBodyId, setHoverBodyId] = useState<string | null>(null)
  const [hoverSatelliteId, setHoverSatelliteId] = useState<string | null>(null)
  const [hoverPoint, setHoverPoint] = useState({ x: 0, y: 0 })
  /** The hover box itself, so a pointer walking onto its link is not a miss. */
  const hoverTooltipRef = useRef<HTMLDivElement | null>(null)
  /**
   * Zoom, and what it means as a length. Read from the map on every move
   * rather than derived from a prop: the wheel, the chase and the fly-to all
   * write the camera directly, so the map is the only thing that knows.
   */
  const [cameraScale, setCameraScale] = useState<{ zoom: number; scale: ViewScale } | null>(null)
  /**
   * The site last flown to. It stays a marker on the ground with the classic
   * hover-style tooltip anchored to it, until dismissed or replaced: a flight
   * that leaves no trace of where it landed reads as the camera getting lost.
   */
  const [activePoi, setActivePoi] = useState<GlobePoi | null>(null)
  const [poiScreen, setPoiScreen] = useState<{ x: number; y: number } | null>(null)
  /** The about card: the methodology and controls text, shown on demand. */
  const [infoOpen, setInfoOpen] = useState(false)
  const activePoiRef = useRef<GlobePoi | null>(null)
  activePoiRef.current = activePoi

  const setAltitude = useCallback(
    (on: boolean) => {
      setAltitudeOn(on)
      altitudeOnRef.current = on
      propsRef.current.onAltitudeChange?.(on)
    },
    [],
  )

  useEffect(() => {
    setLiveTrailWidth(props.swarmTrailWidth ?? 1)
    setLiveTrailOpacity(props.swarmTrailOpacity ?? 1)
  }, [props.swarmTrailWidth, props.swarmTrailOpacity])

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
      /* The altitude layer already draws this marker at r = R + h. A second
         GeoJSON circle at the same lat/lon is the unlabeled duplicate on
         the ground when that visibility hide misses a frame. */
      if (altitudeOnRef.current) continue
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
    if (activePoiRef.current) {
      features.push(
        markerFeature(activePoiRef.current.lon, activePoiRef.current.lat, {
          kind: 'static',
          label: activePoiRef.current.label,
          color: DEFAULT_MARKER_COLOR,
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
   * One satellite per frame: project its trail with the camera that just drew,
   * split the chords that are still too long, and hand the result back to the
   * layer. Bounded work per frame regardless of how many trails are up, and it
   * stops entirely once everything on screen is short enough.
   */
  const refineTrails = useCallback(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer || !altitudeOnRef.current) return
    const projection = layer.lastProjectionData()
    if (!projection) return
    const sats = propsRef.current.satellites
    if (sats.length === 0) return
    let sat = sats[0]
    let entry = refinedTrailRef.current.get(sat.id)
    for (let n = 0; n < sats.length; n++) {
      sat = sats[refineCursorRef.current++ % sats.length]
      entry = refinedTrailRef.current.get(sat.id)
      if (entry && !entry.settled && sat.positionAt) break
      entry = undefined
    }
    if (!entry || !sat.positionAt) return
    const canvas = map.getCanvas()
    const variant = layer.lastVariantName()
    const project = (point: GlobeTrackPoint) =>
      projectElevatedToScreen(
        point.lon,
        point.lat,
        point.altKm * 1000,
        projection,
        canvas.clientWidth,
        canvas.clientHeight,
        variant,
      )
    const positionAt = sat.positionAt
    const used =
      refineTrailHalf(entry.past, positionAt, project, TRAIL_REFINE_BUDGET) +
      refineTrailHalf(entry.future, positionAt, project, TRAIL_REFINE_BUDGET)
    if (used === 0) {
      entry.settled = true
      return
    }
    const stored = altitudeDataRef.current.get(sat.id)
    if (!stored) return
    const refreshed = { ...stored, past: entry.past, future: entry.future }
    altitudeDataRef.current.set(sat.id, refreshed)
    layer.setTrail(refreshed)
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
      /* Recorded before the label gate: hover needs the marker position at
         every tier, and above the named tier there is no label to read it from. */
      if (projection && point) {
        const at = projectElevatedToScreen(
          point.lon,
          point.lat,
          point.altKm * 1000,
          projection,
          canvas.clientWidth,
          canvas.clientHeight,
          layer.lastVariantName(),
        )
        if (at) satScreenRef.current.set(sat.id, at)
        else satScreenRef.current.delete(sat.id)
      }
      /* The identified satellite keeps its name whatever the tier says: being
         told which one you are pointing at is the whole point of the pick. */
      const identified = sat.id === propsRef.current.identifiedSatelliteId
      if (propsRef.current.showSatelliteLabels === false && !identified) {
        el.style.display = 'none'
        labelPosRef.current.delete(sat.id)
        continue
      }
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

  /**
   * The satellite under the pointer, from anything that is drawn: an
   * individually drawn trail, a swarm dot, or a swarm trail. Markers are
   * answered by the caller before this runs, since they are already projected.
   *
   * Every pass ends in an EXACT screen-space test, so elevation and the globe's
   * limb are respected rather than approximated. The swarm trail pass is the
   * one that needs help, because a million segments cannot each be projected
   * per frame: the grid in swarmPick.ts narrows them to the handful near the
   * pointer first. That grid is a prune only; every candidate it returns is
   * still projected properly before it can win.
   */
  const pickSatelliteAt = useCallback((x: number, y: number): string | null => {
    const map = mapRef.current
    const ids = propsRef.current.swarmIds
    /*
     * The camera comes from the SUN PROBE, which is added once at load and
     * issues no GL calls, so it reports every frame whatever else is on the
     * map. The altitude layer was the original source and is added and removed
     * by its own toggle, which left picking dead for every session with
     * altitude switched off; the swarm layers only exist at the dots tier.
     */
    const frame = sunFrameRef.current
    const projection = frame?.defaultProjectionData ?? layerRef.current?.lastProjectionData()
    const variant = frame?.shaderData.variantName ?? layerRef.current?.lastVariantName() ?? null
    if (!map || !projection) return null
    const started = performance.now()
    const canvas = map.getCanvas()
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const elevationOn = altitudeOnRef.current

    /**
     * Stored mercator to screen, matching the drawn chain including the
     * elevation and the globe's own limb. The occlusion test is separate
     * because the projection alone keeps a point on the far side, which would
     * let the pointer catch a trail hidden behind the planet.
     */
    const project = (mercatorX: number, mercatorY: number, elevationM: number) => {
      const { lonDeg: lon, latDeg: lat } = lonLatOfMercator(mercatorX, mercatorY)
      const elevation = elevationOn ? elevationM : 0
      if (variant !== 'mercator') {
        const unit = sphereDirection(lon, lat)
        const scale = 1 + elevation / GLOBE_RADIUS_M
        const occluded = isPointOccludedByGlobe(
          [unit[0] * scale, unit[1] * scale, unit[2] * scale],
          projection.clippingPlane,
        )
        if (occluded) return null
      }
      return projectElevatedToScreen(lon, lat, elevation, projection, width, height, variant)
    }

    let best: { id: string; distance: number } | null = null
    let projections = 0

    /*
     * The INDIVIDUALLY drawn satellites' trails, which are the ones on screen
     * below the swarm tier. Each sample goes through the same chain it is drawn
     * with: elevated while the altitude toggle is on, flat on the ground while
     * it is off. Getting that wrong would miss by the whole elevation offset,
     * which at GPS altitude is most of the frame.
     */
    const drawnTrails: TrailPolyline[] = []
    for (const sat of propsRef.current.satellites) {
      const refined = refinedTrailRef.current.get(sat.id)
      const points = refined ? [...refined.past, ...refined.future] : (sat.positions ?? [])
      if (points.length < 2) continue
      const screen = points.map((point) =>
        projectTrackPoint(point, projection, width, height, variant, elevationOn),
      )
      projections += points.length
      drawnTrails.push({ id: sat.id, screen })
    }
    const trailHit = pickNearestTrail(drawnTrails, x, y)
    if (trailHit) best = { id: trailHit.id, distance: trailHit.distancePx }

    /* Dots first: they are what the eye aims at, and a dot sitting on its own
       trail should identify itself rather than the line under it. */
    const keyframe = propsRef.current.swarmKeyframe
    if (keyframe && keyframe.count > 0 && ids) {
      const progress = keyframeProgress(Date.now(), keyframe.epochMs, keyframe.spanMs)
      for (let i = 0; i < keyframe.count; i++) {
        if (swarmHiddenSlotRef.current !== null && i === swarmHiddenSlotRef.current) continue
        const satellite = keyframe.indices[i]
        if (satellite >= ids.length) continue
        if (swarmHiddenIndexRef.current !== null && satellite === swarmHiddenIndexRef.current) continue
        const at = i * SWARM_FLOATS_PER_SATELLITE
        const px = keyframe.packed[at] + progress * keyframe.packed[at + 3]
        if (!Number.isFinite(px)) continue
        const py = keyframe.packed[at + 1] + progress * keyframe.packed[at + 4]
        const elevation = keyframe.packed[at + 2] + progress * keyframe.packed[at + 5]
        const screen = project(px, py, elevation)
        projections++
        if (!screen) continue
        const distance = Math.hypot(screen.x - x, screen.y - y)
        if (distance > SWARM_PICK_RADIUS_PX) continue
        if (!best || distance < best.distance) best = { id: ids[satellite], distance }
      }
    }

    /* Trails, pruned by the grid. Store, shader and screen all share the
       Earth-fixed frame now, so the unprojected pointer looks the grid up
       directly and the candidate segments project as stored. */
    const index = swarmPickRef.current
    let candidates = 0
    if (index.filled() > 0 && ids) {
      const ground = map.unproject([x, y])
      if (Number.isFinite(ground.lng) && Number.isFinite(ground.lat)) {
        const merc = MercatorCoordinate.fromLngLat({ lng: ground.lng, lat: ground.lat })
        const found = index.candidatesAt(merc.x, merc.y)
        candidates = found.length
        const nearest = nearestCandidateSegment(index, found, x, y, project)
        projections += nearest?.projections ?? found.length * 2
        if (
          nearest &&
          nearest.satellite < ids.length &&
          nearest.satellite !== swarmHiddenIndexRef.current
        ) {
          if (!best || nearest.distancePx < best.distance) {
            best = { id: ids[nearest.satellite], distance: nearest.distancePx }
          }
        }
      }
    }

    swarmPickCostRef.current = {
      candidates,
      projections,
      ms: +(performance.now() - started).toFixed(3),
    }
    return best?.id ?? null
  }, [])

  /**
   * True sun direction for the billboard. A sun entry in `skyBodies` wins over
   * the subsolar point: that entry is the same geocentric chain its drawn path
   * comes from, whereas the subsolar point carries the ellipsoid's flattening
   * correction (up to 0.19 deg, several pixels here) because it exists to light
   * the ground, not to aim at the sky.
   */
  const sunDirectionNow = useCallback((): [number, number, number] | null => {
    const current = propsRef.current
    if (current.showSun === false) return null
    const body = current.skyBodies?.find((candidate) => candidate.id === 'sun')
    /* The stored direction is inertial; the billboard lives on screen, so it
       gets this frame's sidereal turn here. The subsolar fallback is already
       Earth-fixed and takes none. */
    if (body) return spinDirection(body.direction, -gmstRad(new Date()))
    if (!current.subsolar) return null
    return sphereDirection(current.subsolar.lonDeg, current.subsolar.latDeg)
  }, [])

  /**
   * Places the Sun billboard at the vanishing point of the true sun direction
   * and sizes it from its real angular diameter and the live camera FOV, so
   * the disk is as small on screen as it is in the sky.
   */
  const updateSunOverlay = useCallback(() => {
    const map = mapRef.current
    const el = sunElRef.current
    const frame = sunFrameRef.current
    const direction = sunDirectionNow()
    if (!map || !el) return
    if (!frame || !direction) {
      el.style.display = 'none'
      return
    }

    if (isDirectionOccludedByGlobe(direction, frame.defaultProjectionData.clippingPlane)) {
      el.style.display = 'none'
      return
    }

    const canvas = map.getCanvas()
    const screen = projectDirectionToScreen(
      direction,
      frame.defaultProjectionData.mainMatrix,
      canvas.clientWidth,
      canvas.clientHeight,
    )
    if (!screen) {
      el.style.display = 'none'
      return
    }

    const diskPx = angularSizeToPixels(SUN_ANGULAR_DIAMETER_DEG, frame.fov, canvas.clientHeight)
    const boxPx = diskPx * SUN_GLOW_SCALE
    el.style.display = 'block'
    el.style.width = `${boxPx}px`
    el.style.height = `${boxPx}px`
    el.style.transform = `translate(${screen.x - boxPx / 2}px, ${screen.y - boxPx / 2}px)`
  }, [sunDirectionNow])

  /**
   * Refined copy of a body's path: the caller's samples plus whatever midpoints
   * the screen has asked for since. Reset when the caller replaces the path.
   */
  const refinedPathOf = useCallback((body: SkyBody): RefinedSkyPath => {
    const signature = `${body.pathParams[0]}:${body.pathParams[body.pathParams.length - 1]}:${body.path.length}`
    const existing = refinedPathsRef.current.get(body.id)
    if (existing && existing.signature === signature) return existing
    const fresh: RefinedSkyPath = {
      signature,
      directions: body.path.slice(),
      params: body.pathParams.slice(),
    }
    refinedPathsRef.current.set(body.id, fresh)
    return fresh
  }, [])

  /**
   * Draws the Moon, the planets and their apparent paths on an overlay canvas,
   * from the same per-frame camera the Sun billboard uses.
   *
   * A direction at infinity may only be projected while it is comfortably in
   * front of the camera. As the forward component approaches zero the
   * vanishing point runs to infinity, and past zero it mirrors to the far side
   * of the screen, so a polyline joining samples across that boundary draws a
   * straight slash through the view. Samples failing the gate are dropped and
   * the polyline SPLITS there; the crossing segment is never interpolated. The
   * same applies to the globe-occlusion test, per segment. A full-sky path is
   * therefore mostly absent at any instant, which is correct: only the arc in
   * front of the camera exists on screen.
   */
  const drawSkyBodies = useCallback(() => {
    const map = mapRef.current
    const canvas = skyCanvasRef.current
    const frame = sunFrameRef.current
    if (!map || !canvas) return
    const bodies = propsRef.current.skyBodies ?? []

    const mapCanvas = map.getCanvas()
    const width = mapCanvas.clientWidth
    const height = mapCanvas.clientHeight
    const dpr = window.devicePixelRatio || 1
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    if (!frame) return

    /*
     * Earth's own two axes: the axle the planet turns on and the one a compass
     * answers to, about eleven degrees apart. Drawn FIRST, so a sky path
     * crossing them reads as being in front, which it is, and drawn before
     * the sky-body gate below, because they belong to the globe rather than to
     * the sky: emptying the body list must not take the planet's axis with it.
     */
    drawGlobeAxes(
      ctx,
      frame.defaultProjectionData,
      width,
      height,
      frame.shaderData.variantName,
    )
    if (bodies.length === 0) return

    const projection = frame.defaultProjectionData
    /* Two gates, both of which break the polyline rather than interpolate.
       The forward test rejects the mirrored projections behind the camera; the
       off-frame test rejects samples that pass it but still land far outside
       the viewport, since joining two such samples on opposite sides would
       draw a straight slash across the visible frame. */
    const offFrameLimitX = width * 1.5
    const offFrameLimitY = height * 1.5
    /* Every direction that reaches this pass is INERTIAL, and this is the one
       place they become Earth-fixed: one sidereal angle, read per frame, spent
       at the projection boundary so paths, markers, the Moon's phase probe,
       the hover polylines and the off-screen census all turn together. Spent
       anywhere earlier, the sky freezes between ephemeris ticks and teleports
       several pixels on each one. */
    const spin = -gmstRad(new Date())
    const project = (inertial: [number, number, number]) => {
      const direction = spinDirection(inertial, spin)
      if (forwardComponent(direction, projection.clippingPlane) <= SKY_FORWARD_EPSILON) return null
      const screen = projectDirectionToScreen(direction, projection.mainMatrix, width, height)
      if (!screen) return null
      if (
        Math.abs(screen.x - width / 2) > offFrameLimitX ||
        Math.abs(screen.y - height / 2) > offFrameLimitY
      ) {
        return null
      }
      return screen
    }
    const visible = (inertial: [number, number, number]) => {
      if (isDirectionOccludedByGlobe(spinDirection(inertial, spin), projection.clippingPlane)) {
        return null
      }
      return project(inertial)
    }

    const sunDirection = sunDirectionNow()

    /* Refine, then draw. The refined samples are DIRECTIONS, which do not
       depend on the camera, so the work survives every pan and zoom; only the
       decision about which segments still need splitting is re-made here. */
    let splitBudget = SKY_PATH_REFINE_BUDGET
    const hovered = hoverRef.current.bodyId
    for (const body of bodies) {
      const refined = refinedPathOf(body)
      const screen = refined.directions.map(visible)
      // The hovered path brightens, so the pointer says which one it caught.
      drawDashedPath(ctx, screen, body.color, body.id === hovered ? 0.95 : 0.55)
      if (splitBudget > 0) splitBudget -= refineSkyPath(body, refined, screen, splitBudget)
      hoverPathsRef.current.set(body.id, screen)
    }

    /* Hover grow, eased per frame toward the target size. Kept here rather than
       in React state because it changes every frame and only the canvas cares. */
    for (const body of bodies) {
      const target = body.id === hovered ? SKY_HOVER_DIAMETER_PX / 2 : 0
      const current = hoverGrowRef.current.get(body.id) ?? 0
      const next = current + (target - current) * SKY_HOVER_EASE
      hoverGrowRef.current.set(body.id, Math.abs(next - target) < 0.05 ? target : next)
    }

    if (skyDebugRef.current) skyDebugRef.current = []
    for (const body of bodies) {
      const screen = visible(body.direction)
      const truePx = angularSizeToPixels(
        (body.angularDiameterRad * 180) / Math.PI,
        frame.fov,
        height,
      )
      if (skyDebugRef.current) {
        const grownNow = hoverGrowRef.current.get(body.id) ?? 0
        const drawnRadius =
          body.id === 'moon'
            ? Math.max(truePx / 2, 1, grownNow)
            : Math.max(truePx / 2, PLANET_MIN_DOT_PX / 2, grownNow)
        skyDebugRef.current.push({
          id: body.id,
          atMs: Date.now(),
          angularDiameterDeg: (body.angularDiameterRad * 180) / Math.PI,
          truePx,
          drawnPx: body.id === 'sun' ? truePx : drawnRadius * 2,
          screen: screen ? { x: screen.x, y: screen.y } : null,
          direction: body.direction,
        })
      }
      // The Sun's own disk is the DOM billboard, sized from the live FOV.
      if (body.id === 'sun') continue
      if (!screen) continue
      /* Hover size wins over the true one while it is bigger: a declared
         affordance, on top of the caption's existing note that markers are
         drawn above true size. The Moon keeps its phase, just larger. */
      const grown = hoverGrowRef.current.get(body.id) ?? 0
      if (body.id === 'moon') {
        const radius = Math.max(truePx / 2, 1, grown)
        const glow = ctx.createRadialGradient(
          screen.x,
          screen.y,
          radius,
          screen.x,
          screen.y,
          radius * 2.4,
        )
        glow.addColorStop(0, 'rgba(220, 220, 220, 0.22)')
        glow.addColorStop(1, 'rgba(220, 220, 220, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(screen.x, screen.y, radius * 2.4, 0, Math.PI * 2)
        ctx.fill()
        /* Both probe inputs must live in ONE frame. sunDirectionNow is already
           Earth-fixed for the billboard, so the Moon's stored direction is
           spun to match; the probe result then goes through project(), which
           spins its input, so it is spun BACK first. Clumsy, and still better
           than a second projection path that skips the spin. */
        const probeFixed = sunDirection
          ? sunwardProbeDirection(spinDirection(body.direction, spin), sunDirection)
          : null
        const probe = probeFixed ? spinDirection(probeFixed, -spin) : null
        drawPhasedDisk(
          ctx,
          screen,
          radius,
          body.color,
          screenPhase(
            screen,
            probe ? project(probe) : null,
            propsRef.current.moonPhaseAngleRad ?? 0,
            radius,
          ),
        )
      } else {
        // Sub-pixel at truth, so planets draw at a declared minimum dot.
        drawDot(ctx, screen, Math.max(truePx / 2, PLANET_MIN_DOT_PX / 2, grown), body.color)
      }
    }
  }, [sunDirectionNow, refinedPathOf])

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

  /* --- Map creation: once per mount. Prop changes flow through the effects
     below, never through a rebuild. */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = new MapLibreMap({
      container,
      style: buildBaseStyle(),
      center:
        propsRef.current.cameraLng != null && propsRef.current.cameraLat != null
          ? [propsRef.current.cameraLng, propsRef.current.cameraLat]
          : (propsRef.current.initialCenter ?? INITIAL_CENTER),
      pitch: propsRef.current.cameraPitch ?? 0,
      bearing: propsRef.current.cameraBearing ?? 0,
      /*
       * Fill rate, not resolution, is what limits this view on a phone: a
       * dpr-3 iPhone asks the GPU for nine times the pixels of a dpr-1 screen
       * for a globe whose detail is vector lines and point sprites. Capping at
       * 2 keeps the text crisp and roughly halves the shaded area on those
       * devices. Desktop screens are dpr 1 or 2 and are unaffected.
       */
      pixelRatio: Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO),
      zoom: propsRef.current.cameraZoom ?? propsRef.current.initialZoom ?? INITIAL_ZOOM,
      maxPitch: MAX_PITCH,
      /* Default minZoom is 0. Negative values zoom out past the whole-Earth
         view; -4 is 16× linear / 256× area versus zoom 0, the zoom at which
         the view hands over to the solar scene. */
      minZoom: GLOBE_MIN_ZOOM,
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
      /* MapLibre's own keyboard pan moves the centre by SCREEN pixels, which
         on a globe drifts latitude and bearing on a horizontal pan and
         changes the apparent scale on a vertical one (zoom is mercator scale
         AT the centre latitude). The bindings are reimplemented below as pure
         globe rotations. */
      keyboard: false,
      /* Attract-mode is a continuous camera move. The default 300 ms tile
         crossfade restarts on every camera write and reads as the globe
         flashing. Zero keeps the already-resident mesh. */
      fadeDuration: propsRef.current.autoRotateDegPerS ? 0 : 300,
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
      onFrame: () => {
        updateLabelOverlays()
        refineTrails()
      },
    })
    layerRef.current = layer

    map.on('error', (e) => logError('MapLibre error event', e.error ?? e))
    const sunProbe = createSunProbeLayer((args) => {
      sunFrameRef.current = args
      updateSunOverlay()
      drawSkyBodies()
    })

    map.on('load', () => {
      /* Defensive re-assert of the style-level projection, matching the
         official MapLibre globe example's own pattern. */
      map.setProjection({ type: 'globe' })
      /* And re-assert the opening zoom with it. The constructor's zoom is
         constrained before the globe projection is in force, which quietly
         raises anything near the floor (measured: a requested -2 became -0.09,
         with the map reporting minZoom -2 the whole time). Setting it again
         here sticks, because by now the globe transform owns the constraint. */
      const opening = propsRef.current.initialZoom
      if (opening != null && Math.abs(map.getZoom() - opening) > 0.001) map.setZoom(opening)
      if (!map.getLayer(SUN_PROBE_LAYER_ID)) map.addLayer(sunProbe)
      readyMapRef.current = map
      setReady(true)
    })
    /* Dashes are a SCREEN length, so the pattern has to be re-walked while the
       zoom is changing and not only once it settles. 'zoom' does fire
       continuously mid-gesture, which is affordable only because
       shouldRebuildDashLength gates the work behind a half-level of
       hysteresis; 'zoomend' then makes the final figure exact. */
    map.on('movestart', () => {
      mapMovingRef.current = true
    })
    map.on('moveend', () => {
      mapMovingRef.current = false
    })
    map.on('zoom', () => {
      layer.refreshDashLengths(false)
      /* Chords are a screen measure, so a new zoom reopens the question. */
      for (const entry of refinedTrailRef.current.values()) entry.settled = false
    })
    map.on('zoomend', () => layer.refreshDashLengths(true))
    map.on('moveend', () => {
      if (followActiveRef.current) return
      if (propsRef.current.autoRotateDegPerS) return
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
      readyMapRef.current = null
      layerRef.current = null
      knownSatIdsRef.current.clear()
      trailSignatureRef.current.clear()
      trailPaintKeyRef.current.clear()
      labelPosRef.current.clear()
      setReady(false)
      map.remove()
    }
  }, [logError, updateLabelOverlays, updateSunOverlay, drawSkyBodies])

  // --- Follow mode -------------------------------------------------------
  /** Moves the user-owned pose. The per-frame compose step does the rest. */
  const nudgeFollowPose = useCallback(
    (change: { bearingDeg?: number; pitchDeg?: number; zoomFactor?: number }) => {
      const pose = followPoseRef.current
      if (change.bearingDeg) pose.bearingOffsetDeg += change.bearingDeg
      if (change.pitchDeg) {
        pose.pitchDeg = Math.max(0, Math.min(MAX_PITCH, pose.pitchDeg + change.pitchDeg))
      }
      if (change.zoomFactor) {
        pose.zoom = Math.max(GLOBE_MIN_ZOOM, Math.min(MAX_ZOOM, pose.zoom + change.zoomFactor))
      }
    },
    [],
  )

  const stopFollowLoop = useCallback(() => {
    if (followRafRef.current !== null) {
      cancelAnimationFrame(followRafRef.current)
      followRafRef.current = null
    }
  }, [])

  /**
   * Leaves follow, and hands the camera back to the PLANET.
   *
   * Follow does not merely disable the map's own gestures: it anchors the view
   * on a point 400 km up, leans it to MAX_PITCH and turns it to the orbit's
   * heading, and the centre it writes is offset from the ground track by the
   * elevation lead. Simply switching the loop off left every one of those in
   * place, so the first pan afterwards swung around a point in orbit and the
   * globe slid sideways out of frame. Levelling out is therefore part of
   * leaving, not a courtesy: pitch and bearing go back to zero and the centre
   * goes back to the ground below the satellite, which is what makes the
   * planet's centre the thing the camera turns about again.
   *
   * `restoreCamera: false` is for the callers that leave follow only to drive
   * the camera themselves in the same breath (aim at a body, fly to the floor,
   * jump to a named place); two easings racing would fight over the pose.
   */
  const exitFollow = useCallback(
    (options: { restoreCamera?: boolean } = {}) => {
      const map = mapRef.current
      const wasFollowing = followActiveRef.current
      followActiveRef.current = false
      followHeadingRef.current = null
      setFollowActive(false)
      stopFollowLoop()
      if (!map) return
      setFollowNativeHandlers(map, false)
      if (!altitudeBeforeFollowRef.current) setAltitude(false)
      if (wasFollowing && (options.restoreCamera ?? true)) {
        /* The satellite's own ground point, NOT map.getCenter(): during follow
           the centre is pushed back along the bearing by the elevation lead,
           so levelling out around it would leave the thing that was being
           chased off to one side. Falling back to the centre only covers the
           case where the target vanished, which is the one exit where there is
           no ground point to speak of. */
        const centre = map.getCenter()
        const live = followTargetId ? livePositionRef.current.get(followTargetId) : undefined
        map.easeTo({
          center: live ? [live.lon, live.lat] : [centre.lng, centre.lat],
          bearing: 0,
          pitch: 0,
          zoom: Math.min(map.getZoom(), zoomBeforeFollowRef.current),
          duration: CAMERA_FLIGHT_MS,
        })
      }
      propsRef.current.onFollowChange?.(false, null)
    },
    [stopFollowLoop, setAltitude, followTargetId],
  )

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
      const rawHeading = ahead ? computeBearingDeg(point, ahead) : map.getBearing()
      const heading = smoothFollowHeading(followHeadingRef, rawHeading)
      const pose = followPoseRef.current
      const bearing = composeBearingDeg(heading, pose.bearingOffsetDeg)

      /* The pose the user asked for, then the zoom the geometry allows for it.
         The cap only ever lowers the zoom; tilting back down raises it again
         and the wheel can climb back to it. */
      const cap = followZoomCeiling({
        pitchDeg: pose.pitchDeg,
        altitudeM: altitudeOnRef.current ? point.altKm * 1000 : 0,
        fovRad: sunFrameRef.current?.fov ?? DEFAULT_FOV_RAD,
        canvasCssHeight: map.getCanvas().clientHeight,
        centerLatDeg: point.lat,
      })
      const zoom = Math.max(
        GLOBE_MIN_ZOOM,
        Math.min(pose.zoom, Number.isFinite(cap) ? cap : pose.zoom),
      )

      /* Solved for THIS pose, in THIS frame: no cross-frame convergence, so a
         tilt or a turn cannot leave a one-frame error behind as a visible
         jump. With the altitude layer off the drawn dot IS the ground point,
         so the lead is zero and the centre is the satellite itself. */
      const lead = altitudeOnRef.current
        ? elevatedCenterLeadRad(pose.pitchDeg, point.altKm * 1000)
        : 0
      const center = centerForElevatedTarget(point.lon, point.lat, bearing, lead)

      /* ONE camera write per frame, carrying pose, centre and zoom together.
         Every input path feeds the pose above instead of touching the map, so
         nothing can land between this write and the next render. */
      map.jumpTo({ center: [center.lonDeg, center.latDeg], bearing, pitch: pose.pitchDeg, zoom })

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

    /* Follow is an altitude mode now: the chase exists to carry the POV along
       the orbit, and the orbit is what the altitude layer draws. The user's own
       setting is put back on exit. */
    altitudeBeforeFollowRef.current = altitudeOnRef.current
    zoomBeforeFollowRef.current = map.getZoom()
    if (!altitudeOnRef.current) setAltitude(true)
    followActiveRef.current = true
    followHeadingRef.current = null
    /* The entry pitch scales down with the orbit: LEO gets the leaning chase,
       a navigation or geosynchronous bird is followed straight down, where
       the elevated-centre lead is zero and the geometry stays a camera. */
    const entryPitch = followPitchDeg(point.altKm * 1000, MAX_PITCH)
    followPoseRef.current = {
      bearingOffsetDeg: 0,
      pitchDeg: entryPitch,
      zoom: altitudeOnRef.current ? altitudeChaseZoom(point.altKm) : FOLLOW_ZOOM,
    }
    setFollowActive(true)
    /* Every native camera handler is off for the whole session: pan, rotate
       and wheel zoom all write the camera directly, and during follow the
       per-frame compose step is the only writer. Touch zoom/pitch too: they
       would fight the jumpTo loop so pinches felt like they did nothing. */
    setFollowNativeHandlers(map, true)

    /*
     * The entry easing has to land on the pose the chase loop will hold, or
     * the loop's first jumpTo undoes the last frame of the easing as a visible
     * snap. Two of the three parts were wrong: the centre is NOT the ground
     * point but the ground point pushed back by the elevation lead, so a
     * target 400 km up sits at the canvas centre rather than above it; and the
     * zoom is capped by what the pitch and that altitude allow. Both are
     * solved here from the same functions the loop solves them from.
     */
    const ahead = positionOf(sat, new Date(now.getTime() + HEADING_LOOKAHEAD_MS))
    const bearing = ahead ? computeBearingDeg(point, ahead) : map.getBearing()
    const lead = altitudeOnRef.current
      ? elevatedCenterLeadRad(entryPitch, point.altKm * 1000)
      : 0
    const entry = centerForElevatedTarget(point.lon, point.lat, bearing, lead)
    const cap = followZoomCeiling({
      pitchDeg: entryPitch,
      altitudeM: altitudeOnRef.current ? point.altKm * 1000 : 0,
      fovRad: sunFrameRef.current?.fov ?? DEFAULT_FOV_RAD,
      canvasCssHeight: map.getCanvas().clientHeight,
      centerLatDeg: point.lat,
    })
    followPoseRef.current.zoom = Math.max(
      GLOBE_MIN_ZOOM,
      Math.min(followPoseRef.current.zoom, Number.isFinite(cap) ? cap : followPoseRef.current.zoom),
    )
    map.easeTo({
      center: [entry.lonDeg, entry.latDeg],
      pitch: entryPitch,
      zoom: followPoseRef.current.zoom,
      bearing,
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

  useEffect(() => {
    if (!ready) return
    if (props.followWanted) {
      if (!followActiveRef.current) enterFollow()
      return
    }
    if (followActiveRef.current) exitFollow({ restoreCamera: false })
  }, [ready, props.followWanted, enterFollow, exitFollow, props.followTargetId, props.satellites.length])

  useEffect(() => {
    if (!ready || followActive) return
    if (props.cameraZoom == null || props.cameraLng == null || props.cameraLat == null) return
    const map = mapRef.current
    if (!map) return
    const centre = map.getCenter()
    const same =
      Math.abs(centre.lng - props.cameraLng) < 1e-3 &&
      Math.abs(centre.lat - props.cameraLat) < 1e-3 &&
      Math.abs(map.getZoom() - props.cameraZoom) < 0.02 &&
      Math.abs(map.getPitch() - (props.cameraPitch ?? 0)) < 0.5 &&
      Math.abs(map.getBearing() - (props.cameraBearing ?? 0)) < 0.5
    if (same) return
    map.jumpTo({
      center: [props.cameraLng, props.cameraLat],
      zoom: props.cameraZoom,
      pitch: props.cameraPitch ?? 0,
      bearing: props.cameraBearing ?? 0,
    })
  }, [
    ready,
    followActive,
    props.cameraLng,
    props.cameraLat,
    props.cameraZoom,
    props.cameraPitch,
    props.cameraBearing,
  ])

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
    /** At most one swarm pick per frame; the latest pointer wins. */
    let swarmPickFrame = 0
    let swarmPickAt = { x: 0, y: 0 }
    /** Where the press landed, so a drag is not mistaken for a click. */
    let pressAt: { x: number; y: number } | null = null

    const stopAltDrag = () => {
      if (!altDragging) return
      altDragging = false
      map.dragPan.enable()
      map.dragRotate.enable()
    }

    /* Arrows pan the globe (ArrowRight rotates the view eastward, matching
       the map-keys convention and the CAMERA panel's own buttons); SHIFT
       with them turns and tilts instead, and plus/minus zoom. Routed through
       the same panBy / rotateBearingBy / tiltBy / zoomByKey the on-screen
       buttons call, not through MapLibre's disabled KeyboardHandler, so a
       globe rotation is exactly what a press produces. */
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'c' || e.key === 'C') && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (isTypingTarget(e.target)) return
        toggleFollow()
        return
      }
      if (e.key === 'Alt' && !altHeld) {
        altHeld = true
        // Follow already keeps scrollZoom off for the whole session.
        if (!followActiveRef.current) map.scrollZoom.disable()
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (!e.key.startsWith('Arrow') && !'+=-_'.includes(e.key)) return
      const controls = keyControlsRef.current
      if (!controls) return
      if (isTypingTarget(e.target)) return
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) controls.rotateBearingBy(1)
          else controls.panBy(0, 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) controls.rotateBearingBy(-1)
          else controls.panBy(0, -1)
          break
        case 'ArrowUp':
          e.preventDefault()
          if (e.shiftKey) controls.tiltBy(1)
          else controls.panBy(1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          if (e.shiftKey) controls.tiltBy(-1)
          else controls.panBy(-1, 0)
          break
        case '+':
        case '=':
          e.preventDefault()
          controls.zoomByKey(1)
          break
        case '-':
        case '_':
          e.preventDefault()
          controls.zoomByKey(-1)
          break
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'Alt' || !altHeld) return
      altHeld = false
      if (!followActiveRef.current) map.scrollZoom.enable()
    }

    const onWheel = (e: WheelEvent) => {
      if (e.altKey) {
        e.preventDefault()
        const delta = e.deltaY * ALT_WHEEL_PITCH_FACTOR
        if (followActiveRef.current) nudgeFollowPose({ pitchDeg: delta })
        else map.jumpTo({ pitch: Math.max(0, Math.min(MAX_PITCH, map.getPitch() + delta)) })
        return
      }
      if (followActiveRef.current) {
        /* MapLibre's own wheel handler is off during follow, so zoom is a pose
           change like tilt and bearing: it lands in the same single camera
           write, already clamped by the tilt-coupled ceiling. */
        e.preventDefault()
        nudgeFollowPose({ zoomFactor: -e.deltaY * FOLLOW_WHEEL_ZOOM_FACTOR })
        return
      }
      /* Already as wide as MapLibre goes and still being asked for wider:
         the caller may hand the view to a scene that has no such floor.
         deltaY > 0 is zoom out in every delta mode, since only the sign is
         read here. */
      if (e.deltaY <= 0 || map.getZoom() > GLOBE_MIN_ZOOM + FLOOR_EXIT_EPSILON) {
        /* Any notch that is not a request to go wider at the floor resets the
           buffer: leaving has to be one deliberate push, not an accumulation. */
        floorNotchesRef.current = 0
        return
      }
      const frame = sunFrameRef.current
      const handoff = propsRef.current.onZoomOutPastFloor
      if (!frame || !handoff) return
      /*
       * The floor is a place people want to sit, not only a place to leave
       * from: the widest view of the globe is reached by the same gesture that
       * would carry them out of it. Asking for a few more deliberate notches
       * makes the widest framing usable without the scene changing underfoot.
       */
      e.preventDefault()
      floorNotchesRef.current += 1
      if (floorNotchesRef.current < FLOOR_EXIT_NOTCHES) return
      floorNotchesRef.current = 0
      /* Measured under whatever pitch the camera currently holds, unlike the
         chip's flight-out path below, which eases to pitch 0 first: this
         radius can therefore exceed the pitch-0 radius and record a return
         scale beyond what the solar scene's own zoom range can reach, which
         is why that side clamps the return threshold to its reachable range. */
      const radiusPx = globeScreenRadiusPx(
        frame.defaultProjectionData.clippingPlane,
        frame.fov,
        map.getCanvas().clientHeight,
      )
      if (radiusPx === null) return
      handoff(radiusPx)
    }

    const followPointers = new Map<number, { x: number; y: number }>()
    let pinchStartDist = 0
    let pinchStartZoom = 0

    const endFollowPointer = (pointerId: number) => {
      followPointers.delete(pointerId)
      if (followPointers.size < 2) pinchStartDist = 0
      if (followPointers.size === 0) lookDragging = false
      else if (followPointers.size === 1) {
        const remaining = followPointers.values().next().value
        if (remaining) {
          lookDragging = true
          lookLastX = remaining.x
          lookLastY = remaining.y
        }
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      pressAt = { x: e.clientX, y: e.clientY }
      if (followActiveRef.current) {
        try {
          canvas.setPointerCapture(e.pointerId)
        } catch {
          /* Capture can throw if the pointer is already gone. */
        }
        followPointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (followPointers.size >= 2) {
          lookDragging = false
          const pts = [...followPointers.values()]
          pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
          pinchStartZoom = followPoseRef.current.zoom
        } else {
          lookDragging = true
          lookLastX = e.clientX
          lookLastY = e.clientY
        }
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
      if (followActiveRef.current && followPointers.has(e.pointerId)) {
        followPointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (followPointers.size >= 2 && pinchStartDist > 0) {
          const pts = [...followPointers.values()]
          const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
          const ratio = dist / pinchStartDist
          followPoseRef.current.zoom = Math.max(
            GLOBE_MIN_ZOOM,
            Math.min(MAX_ZOOM, pinchStartZoom + Math.log2(Math.max(1e-6, ratio))),
          )
          return
        }
      }
      if (lookDragging) {
        if (!followActiveRef.current) {
          lookDragging = false
          return
        }
        const dx = e.clientX - lookLastX
        const dy = e.clientY - lookLastY
        lookLastX = e.clientX
        lookLastY = e.clientY
        /* Both axes go to the pose, never to the map. The loop recomputes the
           whole camera from the pose on the next frame, so a direct write here
           would be overwritten a frame later: that mismatch is what made every
           tilt and turn during follow snap. */
        nudgeFollowPose({
          bearingDeg: dx * LOOK_SENSITIVITY,
          pitchDeg: -dy * LOOK_SENSITIVITY,
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
      if (followActiveRef.current) {
        nudgeFollowPose({ bearingDeg: dx * LOOK_SENSITIVITY, pitchDeg: -dy * LOOK_SENSITIVITY })
        return
      }
      map.jumpTo({
        bearing: map.getBearing() + dx * LOOK_SENSITIVITY,
        pitch: Math.max(0, Math.min(MAX_PITCH, map.getPitch() - dy * LOOK_SENSITIVITY)),
      })
    }

    const pointerOnTooltip = (e: PointerEvent) => {
      const tooltipEl = hoverTooltipRef.current
      if (!tooltipEl) return false
      if (tooltipEl.contains(e.target as Node)) return true
      const box = tooltipEl.getBoundingClientRect()
      return (
        e.clientX >= box.left &&
        e.clientX <= box.right &&
        e.clientY >= box.top &&
        e.clientY <= box.bottom
      )
    }

    const clearHover = () => {
      if (hoverRef.current.bodyId !== null) {
        hoverRef.current = { bodyId: null, x: hoverRef.current.x, y: hoverRef.current.y }
        setHoverBodyId(null)
        propsRef.current.onSkyBodyHover?.(null)
      }
      if (hoverIdentityRef.current !== null) {
        hoverIdentityRef.current = null
        setHoverSatelliteId(null)
        propsRef.current.onSatelliteHover?.(null)
      }
    }

    const claimSatellite = (id: string, x: number, y: number) => {
      if (hoverIdentityRef.current !== id) {
        hoverIdentityRef.current = id
        setHoverSatelliteId(id)
        propsRef.current.onSatelliteHover?.(id)
      }
      if (hoverRef.current.bodyId !== null) {
        hoverRef.current = { bodyId: null, x, y }
        setHoverBodyId(null)
        propsRef.current.onSkyBodyHover?.(null)
      }
      setHoverPoint({ x, y })
    }

    const claimSky = (id: string, x: number, y: number) => {
      if (hoverRef.current.bodyId !== id) {
        hoverRef.current = { bodyId: id, x, y }
        setHoverBodyId(id)
        propsRef.current.onSkyBodyHover?.(id)
      }
      if (hoverIdentityRef.current !== null) {
        hoverIdentityRef.current = null
        setHoverSatelliteId(null)
        propsRef.current.onSatelliteHover?.(null)
      }
      setHoverPoint({ x, y })
    }

    /* Sticky tooltip: stays until a click outside it or another feature. */
    const onHoverMove = (e: PointerEvent) => {
      if (pointerOnTooltip(e)) return
      if (lookDragging || altDragging || followActiveRef.current) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
      if (!inside) return

      let nearestSat: { id: string; distance: number } | null = null
      for (const [id, at] of satScreenRef.current) {
        const distance = Math.hypot(at.x - x, at.y - y)
        if (distance > SATELLITE_HOVER_PX) continue
        if (!nearestSat || distance < nearestSat.distance) nearestSat = { id, distance }
      }
      if (nearestSat) {
        const at = satScreenRef.current.get(nearestSat.id)
        claimSatellite(nearestSat.id, at?.x ?? x, at?.y ?? y)
        return
      }
      /* Satellites first. Sky is claimed only if the sat pick misses. */
      swarmPickAt = { x, y }
      if (swarmPickFrame !== 0) return
      swarmPickFrame = requestAnimationFrame(() => {
        swarmPickFrame = 0
        const px = swarmPickAt.x
        const py = swarmPickAt.y
        const id = pickSatelliteAt(px, py)
        if (id) {
          const at = satScreenRef.current.get(id)
          claimSatellite(id, at?.x ?? px, at?.y ?? py)
          return
        }
        let best: { id: string; distance: number } | null = null
        for (const [pathId, points] of hoverPathsRef.current) {
          const distance = distanceToPolylinePx(points, px, py)
          if (distance > SKY_PATH_HOVER_PX) continue
          if (!best || distance < best.distance) best = { id: pathId, distance }
        }
        if (best) claimSky(best.id, px, py)
      })
    }

    const onOutsidePointerDown = (e: PointerEvent) => {
      if (!hoverIdentityRef.current && hoverRef.current.bodyId === null) return
      if (pointerOnTooltip(e)) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const onCanvas = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
      if (onCanvas) {
        for (const at of satScreenRef.current.values()) {
          if (Math.hypot(at.x - x, at.y - y) <= SATELLITE_HOVER_PX) return
        }
        if (pickSatelliteAt(x, y)) return
        for (const points of hoverPathsRef.current.values()) {
          if (distanceToPolylinePx(points, x, y) <= SKY_PATH_HOVER_PX) return
        }
      }
      clearHover()
    }

    const onPointerUp = (e: PointerEvent) => {
      if (canvas.hasPointerCapture?.(e.pointerId)) {
        try {
          canvas.releasePointerCapture(e.pointerId)
        } catch {
          /* already released */
        }
      }
      endFollowPointer(e.pointerId)
      stopAltDrag()
    }

    /* A click PINS what it lands on, and clicking nothing clears the pin. Only
       a press that did not travel counts: a drag is a camera gesture and must
       not change the selection when it happens to end on a trail. */
    const onCanvasClick = (e: MouseEvent) => {
      const from = pressAt
      pressAt = null
      if (!from || Math.hypot(e.clientX - from.x, e.clientY - from.y) > 4) return
      if (followActiveRef.current) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      let hit: string | null = null
      for (const [id, at] of satScreenRef.current) {
        if (Math.hypot(at.x - x, at.y - y) <= SATELLITE_HOVER_PX) {
          hit = id
          break
        }
      }
      propsRef.current.onSatellitePick?.(hit ?? pickSatelliteAt(x, y))
    }

    const onBlur = () => {
      if (altHeld) {
        altHeld = false
        if (!followActiveRef.current) map.scrollZoom.enable()
      }
      followPointers.clear()
      pinchStartDist = 0
      lookDragging = false
      stopAltDrag()
    }

    const onTouchMoveLock = (e: TouchEvent) => {
      e.preventDefault()
    }

    /* Camera shortcuts are the tool page's own keyboard: an embed sharing
       the page with other content must not steal its arrow keys. */
    if (chrome) {
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointermove', onHoverMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('pointerdown', onOutsidePointerDown, true)
    window.addEventListener('blur', onBlur)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('click', onCanvasClick)
    /* Safari still needs a non-passive touchmove to refuse rubber-band scroll
       when the finger is on the globe; Chrome honours touch-action: none. */
    canvas.addEventListener('touchmove', onTouchMoveLock, { passive: false })

    return () => {
      if (chrome) {
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
      }
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointermove', onHoverMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('pointerdown', onOutsidePointerDown, true)
      window.removeEventListener('blur', onBlur)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('click', onCanvasClick)
      canvas.removeEventListener('touchmove', onTouchMoveLock)
      if (swarmPickFrame !== 0) cancelAnimationFrame(swarmPickFrame)
    }
  }, [ready, toggleFollow, pickSatelliteAt, chrome])

  /*
   * Attract-mode auto-rotation around Earth's polar axis.
   *
   * Longitude of the map centre, with north kept up: the poles stay put and
   * the planet turns underneath. Bearing rotation was tried and spun the
   * view around the camera instead. jumpTo every frame was also tried and
   * retessellated the globe mesh against the trail layer. easeTo interpolates
   * inside MapLibre's own render loop, so tiles and custom layers share a
   * transform. 90° chunks keep the short-arc interpolator on the eastward
   * step; wrapping 180→270 as 180→−90 would otherwise take the long way.
   */
  useEffect(() => {
    const rate = props.autoRotateDegPerS
    if (!ready || !rate || followActive) return
    const map = mapRef.current
    if (!map) return
    const chunkDeg = 90
    const durationMs = (chunkDeg / Math.abs(rate)) * 1000
    const deltaDeg = Math.sign(rate) * chunkDeg
    let generation = 0
    let onEnd: (() => void) | null = null
    const run = () => {
      const my = ++generation
      if (onEnd) map.off('moveend', onEnd)
      onEnd = () => {
        if (my !== generation) return
        run()
      }
      const center = map.getCenter()
      map.easeTo({
        center: [wrapLngDeg(center.lng + deltaDeg), center.lat],
        bearing: 0,
        pitch: 0,
        duration: durationMs,
        easing: (t) => t,
        essential: true,
      })
      map.once('moveend', onEnd)
    }
    run()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        generation += 1
        if (onEnd) map.off('moveend', onEnd)
        onEnd = null
        map.stop()
        return
      }
      run()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      generation += 1
      if (onEnd) map.off('moveend', onEnd)
      map.stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ready, props.autoRotateDegPerS, followActive])

  /*
   * The scale readout. `move` covers every camera write MapLibre knows about,
   * including the ones the follow loop makes with jumpTo, so this needs no
   * clock of its own.
   */
  useEffect(() => {
    if (!ready) return
    /* jumpTo in attract-mode is a move+moveend every frame. Writing React
       state on those events re-renders the map sixty times a second and the
       globe hitchs. The scale strip and site tooltip are chrome-only. */
    if (!chrome) return
    const map = mapRef.current
    if (!map) return
    const read = () => {
      const canvas = map.getCanvas()
      const centre = map.getCenter()
      setCameraScale({
        zoom: map.getZoom(),
        scale: viewScale(
          map.getZoom(),
          MercatorCoordinate.fromLngLat({ lng: centre.lng, lat: centre.lat }).meterInMercatorCoordinateUnits(),
          canvas.clientWidth,
        ),
      })
      /* The site tooltip is anchored to the GROUND, so the plain projection
         serves it; it hides with its marker when the planet turns it away. */
      const poi = activePoiRef.current
      if (!poi) {
        setPoiScreen(null)
        return
      }
      const frame = sunFrameRef.current
      const hidden =
        frame != null &&
        isPointOccludedByGlobe(
          sphereDirection(poi.lon, poi.lat),
          frame.defaultProjectionData.clippingPlane,
        )
      if (hidden) {
        setPoiScreen(null)
        return
      }
      const at = map.project([poi.lon, poi.lat])
      setPoiScreen({ x: at.x, y: at.y })
    }
    read()
    syncMarkers()
    map.on('move', read)
    map.on('resize', read)
    return () => {
      map.off('move', read)
      map.off('resize', read)
    }
  }, [ready, activePoi, syncMarkers, chrome])

  // --- Satellite sources, layers and data --------------------------------
  useEffect(() => {
    if (!ready) return
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer || map !== readyMapRef.current) return

    /* Trails thin and dim as the population grows: with a crowd on screen the
       lines are context, not the subject. The identified satellite is the
       subject: same dashed future and weight as a lone ISS, then the
       TRAJECTORIES sliders on top. */
    const crowdWeight = trailWeightFor(satellites.length)
    const identifiedId = props.identifiedSatelliteId
    const onlySelected = props.swarmTrailOnlySelected ?? false
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
      const subject = identifiedId != null && sat.id === identifiedId
      const baseWeight = subject ? trailWeightFor(1) : crowdWeight
      const weight = paintedTrailWeight(
        subject ? 1 : satellites.length,
        liveTrailWidth,
        liveTrailOpacity,
      )
      const dashed = trailIsDashed(baseWeight)
      const paintKey = `${sat.color}|${fadeFraction}|${weight.widthPx}|${weight.alpha}|${dashed}`

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
        for (const spec of trailLayerSpecs(sat.id, sat.color, fadeFraction, weight, dashed)) {
          map.addLayer(spec, MARKERS_FIRST_LAYER_ID)
        }
        trailPaintKeyRef.current.set(sat.id, paintKey)
      } else if (trailPaintKeyRef.current.get(sat.id) !== paintKey) {
        const [solidFade, solidBody, dashedBody, dashedFade] = trailLayerIds(sat.id)
        const gradients = trailFadeGradients(sat.color, fadeFraction, weight.alpha)
        const bodyColor = weight.alpha >= 1 ? sat.color : cssRgbaWithAlpha(sat.color, weight.alpha)
        map.setPaintProperty(solidFade, 'line-gradient', gradients.solid)
        map.setPaintProperty(dashedFade, 'line-gradient', gradients.dashed)
        map.setPaintProperty(solidBody, 'line-color', bodyColor)
        map.setPaintProperty(dashedBody, 'line-color', bodyColor)
        const dash: [number, number] = dashed ? [2, 2] : [1, 0]
        map.setPaintProperty(dashedBody, 'line-dasharray', dash)
        map.setPaintProperty(dashedFade, 'line-dasharray', dash)
        for (const id of trailLayerIds(sat.id)) {
          map.setPaintProperty(id, 'line-width', weight.widthPx)
        }
        trailPaintKeyRef.current.set(sat.id, paintKey)
      }

      const hideTrail = onlySelected && sat.id !== identifiedId
      for (const id of trailLayerIds(sat.id)) {
        if (map.getLayer(id)) {
          map.setLayoutProperty(
            id,
            'visibility',
            hideTrail || altitudeOnRef.current ? 'none' : 'visible',
          )
        }
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
        /* A satellite can LOSE its track while staying on screen: in the
           crowd tiers only the identified one carries positions, and the
           identity moves with the pointer. The geojson above already emptied,
           but the altitude layer keeps whatever it was last given, so without
           this the old trail would go on being drawn as a ghost under the
           newly identified one. dropSatellite takes the marker with it;
           setPoint below puts it straight back. */
        if (!trailWindow && altitudeDataRef.current.has(sat.id)) {
          altitudeDataRef.current.delete(sat.id)
          layer.dropSatellite(sat.id)
          refinedTrailRef.current.delete(sat.id)
        }
        if (trailWindow && !hideTrail) {
          const trail: AltitudeTrailInput = {
            id: sat.id,
            colorRgba: parseCssRgba(sat.color),
            past,
            future,
            windowStart: trailWindow.start,
            windowEnd: trailWindow.end,
            dashed,
          }
          altitudeDataRef.current.set(sat.id, trail)
          layer.setTrail(trail)
          /* A new trail starts from the raw samples: the refinement is about
             the camera, and last frame's extra points were for a camera that
             may no longer be pointing here. */
          refinedTrailRef.current.set(sat.id, {
            key: signature,
            past: [...past],
            future: [...future],
            settled: false,
          })
        }
        layer.refreshDashLengths(false)
      }

      if (hideTrail && altitudeDataRef.current.has(sat.id)) {
        layer.setTrail({
          id: sat.id,
          colorRgba: parseCssRgba(sat.color),
          past: [],
          future: [],
          windowStart: new Date(0),
          windowEnd: new Date(0),
          dashed: false,
        })
        altitudeDataRef.current.delete(sat.id)
        refinedTrailRef.current.delete(sat.id)
      } else if (!hideTrail && trailWindow && !altitudeDataRef.current.has(sat.id)) {
        const trail: AltitudeTrailInput = {
          id: sat.id,
          colorRgba: parseCssRgba(sat.color),
          past,
          future,
          windowStart: trailWindow.start,
          windowEnd: trailWindow.end,
          dashed,
        }
        altitudeDataRef.current.set(sat.id, trail)
        layer.setTrail(trail)
        refinedTrailRef.current.set(sat.id, {
          key: signature,
          past: [...past],
          future: [...future],
          settled: false,
        })
      }

      /* While following, the per-frame loop owns the live position and must
         not be fought by the caller's slower cadence. A live tick likewise
         samples `positionAt` here instead of a parent clock. */
      if (!followActiveRef.current) {
        const sampled =
          propsRef.current.tickLive && sat.positionAt ? sat.positionAt(new Date()) : null
        const live = sampled ?? sat.livePosition ?? positionOf(sat, splitAt)
        if (live) {
          livePositionRef.current.set(sat.id, live)
          layer.setPoint(sat.id, parseCssRgba(sat.color), live)
        } else {
          livePositionRef.current.delete(sat.id)
          if (!altitudeDataRef.current.has(sat.id)) layer.dropSatellite(sat.id)
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
      refinedTrailRef.current.delete(id)
      altitudeDataRef.current.delete(id)
      livePositionRef.current.delete(id)
      trailSignatureRef.current.delete(id)
      trailPaintKeyRef.current.delete(id)
      labelPosRef.current.delete(id)
    }
    knownSatIdsRef.current = present

    syncMarkers()
    updateLabelOverlays()
  }, [
    ready,
    satellites,
    props.tickLive,
    observer,
    markers,
    syncMarkers,
    updateLabelOverlays,
    liveTrailWidth,
    liveTrailOpacity,
    props.identifiedSatelliteId,
    props.swarmTrailOnlySelected,
  ])

  /* Live marker. The parent passes `positionAt` and stays still; this interval
     moves the dot. Follow already samples every frame, so it keeps that path. */
  useEffect(() => {
    if (!ready || !props.tickLive) return
    const tick = () => {
      if (followActiveRef.current) return
      const layer = layerRef.current
      const map = mapRef.current
      if (!layer || !map) return
      const now = new Date()
      let moved = false
      for (const sat of propsRef.current.satellites) {
        if (!sat.positionAt) continue
        const point = sat.positionAt(now)
        if (!point) continue
        livePositionRef.current.set(sat.id, point)
        layer.setPoint(sat.id, parseCssRgba(sat.color), point)
        moved = true
      }
      if (!moved) return
      syncMarkers()
      updateLabelOverlays()
      map.triggerRepaint()
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [ready, props.tickLive, syncMarkers, updateLabelOverlays])

  /* --- Twilight bands -----------------------------------------------------
     Rounded to 0.01 deg (about 2.4 s of the subsolar point's 0.25 deg/min
     motion) so a caller ticking at 10 Hz does not re-tile the bands on every
     tick. The caller owns which instant this is: live now for the orbital
     view, the marked instant for a pass prediction. */
  const nightLat = subsolar ? Math.round(subsolar.latDeg * 100) / 100 : null
  const nightLon = subsolar ? Math.round(subsolar.lonDeg * 100) / 100 : null
  useEffect(() => {
    if (!ready) return
    const source = mapRef.current?.getSource(NIGHT_SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return
    source.setData(
      nightLat === null || nightLon === null
        ? EMPTY_FEATURE_COLLECTION
        : daylightBands(nightLat, nightLon),
    )
    // The billboard rides the same instant as the bands.
    updateSunOverlay()
  }, [ready, nightLat, nightLon, updateSunOverlay])

  // --- Camera flights: aim at a sky body, or out to the floor -------------
  /**
   * Aiming at a direction moves the CENTRE as well as the bearing and pitch:
   * the centre ray can never look above the local horizon, so bringing a body
   * overhead down to the canvas centre means turning the planet (see
   * skyAimCamera). Follow owns the camera, so it steps aside first.
   */
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !aimAt) return
    /* This effect eases the camera itself in the next statement, so follow is
       asked to step aside WITHOUT levelling out: two easings would fight. */
    if (followActiveRef.current) exitFollow({ restoreCamera: false })
    const center = map.getCenter()
    const aim = skyAimCamera(aimAt.direction, center.lng, center.lat)
    if (!aim) return
    map.easeTo({
      center: [aim.lonDeg, aim.latDeg],
      bearing: aim.bearingDeg,
      pitch: aim.pitchDeg,
      duration: CAMERA_FLIGHT_MS,
    })
  }, [ready, aimAt, exitFollow])

  const handledFrameNonceRef = useRef(0)
  /**
   * List / globe pin: turn the planet under the satellite, then stop.
   * Follow, if on, steps aside first: this click is a look, not a chase.
   */
  useEffect(() => {
    const map = mapRef.current
    const target = props.frameTarget
    if (!ready || !map || !target) return
    if (handledFrameNonceRef.current === target.nonce) return
    handledFrameNonceRef.current = target.nonce
    if (followActiveRef.current) exitFollow({ restoreCamera: false })
    const high = target.altKm > 200
    const elevated = altitudeOnRef.current || high
    if (high && !altitudeOnRef.current) setAltitude(true)
    const pose = frameSatelliteCamera({
      lonDeg: target.lon,
      latDeg: target.lat,
      altitudeM: target.altKm * 1000,
      elevated,
      fovRad: sunFrameRef.current?.fov ?? DEFAULT_FOV_RAD,
      canvasCssHeight: map.getCanvas().clientHeight,
    })
    map.easeTo({
      center: [pose.lonDeg, pose.latDeg],
      bearing: pose.bearingDeg,
      pitch: pose.pitchDeg,
      zoom: Math.max(GLOBE_MIN_ZOOM, Math.min(MAX_ZOOM, pose.zoom)),
      duration: CAMERA_FLIGHT_MS,
    })
  }, [ready, props.frameTarget, setAltitude, exitFollow])

  /* The scene chips fly the same route the wheel takes, rather than cutting:
     out to the floor, then over to the wider scene at the matching scale.
     The ref starts at whatever the nonce already is, so only a CHANGE after
     mount counts: coming back from the wider scene remounts this component with
     the nonce still raised, and re-firing there would bounce straight out
     again, forever. */
  const handledFlyOutRef = useRef(props.flyToFloorNonce ?? 0)
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !flyToFloorNonce) return
    if (handledFlyOutRef.current === flyToFloorNonce) return
    handledFlyOutRef.current = flyToFloorNonce
    if (followActiveRef.current) exitFollow({ restoreCamera: false })
    map.easeTo({ zoom: GLOBE_MIN_ZOOM, pitch: 0, duration: CAMERA_FLIGHT_MS })
    map.once('moveend', () => {
      const frame = sunFrameRef.current
      const handoff = propsRef.current.onZoomOutPastFloor
      if (!frame || !handoff) return
      const radiusPx = globeScreenRadiusPx(
        frame.defaultProjectionData.clippingPlane,
        frame.fov,
        map.getCanvas().clientHeight,
      )
      if (radiusPx !== null) handoff(radiusPx)
    })
  }, [ready, flyToFloorNonce, exitFollow])

  /* Arriving from the wider scene: open at the matching scale so the frames
     line up, then fly in to the view this page normally shows. */
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !propsRef.current.easeToDefaultOnOpen) return
    map.easeTo({ zoom: INITIAL_ZOOM, duration: CAMERA_FLIGHT_MS })
  }, [ready])

  // --- Point swarm ---------------------------------------------------------
  /*
   * The swarm is its own layer and its own animation clock. The keyframes come
   * from the caller (a worker, off the main thread); all this does is hand them
   * to the GPU and keep asking MapLibre to repaint, because a custom layer that
   * animates from a uniform has nothing else to tell the map it changed.
   */
  useEffect(() => {
    if (!ready) return
    const map = mapRef.current
    if (!map || map !== readyMapRef.current) return
    const keyframe = props.swarmKeyframe
    if (!keyframe || keyframe.count === 0) {
      if (swarmLayerRef.current?.isAttached() && map.getLayer(SWARM_LAYER_ID)) {
        map.removeLayer(SWARM_LAYER_ID)
      }
      swarmLayerRef.current = null
      return
    }
    if (!swarmLayerRef.current) swarmLayerRef.current = createSwarmLayer({ onError: logError })
    const layer = swarmLayerRef.current
    layer.setPointSize(
      (props.swarmPointSizePx ?? SWARM_DEFAULT_POINT_PX) * (compactChrome ? 1.65 : 1),
    )
    layer.setAlpha(0.9)
    /* One rule for altitude across the whole view: with the toggle off the
       swarm lies on the surface exactly as the trails do. */
    layer.setElevationEnabled(altitudeOnRef.current)
    layer.setKeyframe(keyframe.packed, keyframe.count, keyframe.epochMs, keyframe.spanMs)
    applySwarmPointOwnership(
      layer,
      keyframe,
      propsRef.current.identifiedSatelliteId,
      propsRef.current.swarmIds,
      propsRef.current.satellites,
      swarmHiddenSlotRef,
    )
    if (!map.getLayer(SWARM_LAYER_ID)) map.addLayer(layer)
    map.triggerRepaint()
  }, [ready, props.swarmKeyframe, props.swarmPointSizePx, altitudeOn, compactChrome, logError])

  /*
   * The identified satellite's own MARKER, enlarged and saturated: without
   * it the selected satellite is one 2.5 px dot among ten thousand identical
   * ones, a bright trajectory on screen with no way to tell which speck it
   * belongs to.
   *
   * Its own effect rather than the keyframe one above, because it changes on
   * every hover and setKeyframe re-uploads the whole population. The slot is
   * looked up per keyframe because a satellite the propagator could not place
   * compacts the buffer, so slot is not satellite.
   */
  useEffect(() => {
    const layer = swarmLayerRef.current
    const keyframe = props.swarmKeyframe
    if (!ready || !layer || !keyframe) return
    applySwarmPointOwnership(
      layer,
      keyframe,
      props.identifiedSatelliteId,
      props.swarmIds,
      props.satellites,
      swarmHiddenSlotRef,
    )
    mapRef.current?.triggerRepaint()
  }, [ready, props.swarmKeyframe, props.identifiedSatelliteId, props.swarmIds, props.satellites])

  // --- Swarm trails --------------------------------------------------------
  /*
   * The population's trails, in one line draw underneath the dots. The layer is
   * sized once for the whole population and filled batch by batch as the worker
   * finishes them, so this effect only has to react to the count changing.
   */
  useEffect(() => {
    if (!ready) return
    const map = mapRef.current
    if (!map || map !== readyMapRef.current) return
    const count = props.swarmTrailCount ?? 0
    if (count === 0) {
      if (swarmTrailLayerRef.current?.isAttached() && map.getLayer(SWARM_TRAIL_LAYER_ID)) {
        map.removeLayer(SWARM_TRAIL_LAYER_ID)
      }
      swarmTrailLayerRef.current = null
      swarmPickRef.current.reset(0)
      trailLayerCountRef.current = 0
      return
    }
    if (!swarmTrailLayerRef.current) {
      swarmTrailLayerRef.current = createSwarmTrailLayer({ onError: logError })
      /*
       * A new layer starts on its own defaults, and the effect that owns
       * appearance below reacts to the APPEARANCE changing, not to a layer
       * being born. Reloading a population of the same size therefore left a
       * fresh layer holding defaults nobody chose, and since elevation is one
       * of them, the trails could go back up to orbital altitude while the
       * dots stayed on the surface, which reads as the trails having come from
       * somewhere else entirely. The dots never showed it because their own
       * effect re-states elevation on every keyframe.
       */
      swarmTrailLayerRef.current.setAppearance(
        propsRef.current.swarmTrailBaseWidthPx ?? 1,
        propsRef.current.swarmTrailBaseAlpha ?? 1,
        propsRef.current.swarmTrailWidth ?? 1,
        propsRef.current.swarmTrailOpacity ?? 1,
      )
      swarmTrailLayerRef.current.setElevationEnabled(altitudeOnRef.current)
      swarmTrailLayerRef.current.setOnlyHighlighted(
        propsRef.current.swarmTrailOnlySelected ?? false,
      )
      applySwarmTrailOwnership(
        swarmTrailLayerRef.current,
        propsRef.current.identifiedSatelliteId,
        propsRef.current.swarmIds,
        propsRef.current.satellites,
        swarmHiddenIndexRef,
      )
    }
    /* Below the dots, so a marker is never hidden by the lines it belongs to. */
    if (!map.getLayer(SWARM_TRAIL_LAYER_ID)) {
      map.addLayer(
        swarmTrailLayerRef.current,
        map.getLayer(SWARM_LAYER_ID) ? SWARM_LAYER_ID : undefined,
      )
    }
    /* reset() zeros the drawn prefix. Re-running this effect at the same
       count (a parent render, a logError identity change) would flash the
       trails off and wait for the next worker batch. */
    if (trailLayerCountRef.current !== count) {
      swarmTrailLayerRef.current.reset(count)
      swarmPickRef.current.reset(count)
      trailLayerCountRef.current = count
    }
    map.triggerRepaint()
  }, [ready, props.swarmTrailCount, logError])

  useEffect(() => {
    const layer = swarmTrailLayerRef.current
    const batch = props.swarmTrailBatch
    if (!ready || !layer || !batch) return
    layer.setBatch(batch.packed, batch.startIndex, batch.count)
    /* The same batch into the CPU mirror. It has to happen here rather than in
       the layer, because the layer hands its arrays to the GPU and forgets
       them, while picking needs them for as long as they are drawn. A satellite
       already indexed this generation is not pushed again: the grid stays
       bounded even when only-selected refresh never completes a population. */
    swarmPickRef.current.addBatch(batch.packed, batch.startIndex, batch.count)
    mapRef.current?.triggerRepaint()
  }, [ready, props.swarmTrailBatch])

  useEffect(() => {
    const layer = swarmTrailLayerRef.current
    if (!ready || !layer) return
    layer.setAppearance(
      props.swarmTrailBaseWidthPx ?? 1,
      props.swarmTrailBaseAlpha ?? 1,
      liveTrailWidth,
      liveTrailOpacity,
    )
    layer.setElevationEnabled(altitudeOn)
    layer.setOnlyHighlighted(props.swarmTrailOnlySelected ?? false)
    applySwarmTrailOwnership(
      layer,
      props.identifiedSatelliteId,
      props.swarmIds,
      props.satellites,
      swarmHiddenIndexRef,
    )
    mapRef.current?.triggerRepaint()
  }, [
    ready,
    props.swarmTrailBaseWidthPx,
    props.swarmTrailBaseAlpha,
    liveTrailWidth,
    liveTrailOpacity,
    props.swarmTrailOnlySelected,
    props.identifiedSatelliteId,
    props.swarmIds,
    props.satellites,
    altitudeOn,
  ])

  /*
   * The sky's own clock. The sun probe redraws the sky on every map repaint,
   * but with no swarm and no gesture nothing requests one: the planet sweeps
   * a quarter of a degree of sky per minute and nobody would draw it. One
   * repaint per second keeps the sweep visible, about an eighth of a pixel
   * per tick at the default view, well under perception, for one uniform
   * write and a probe pass, which is as cheap as animation gets.
   */
  useEffect(() => {
    if (!ready || (props.skyBodies?.length ?? 0) === 0) return
    const map = mapRef.current
    if (!map) return
    const timer = window.setInterval(() => map.triggerRepaint(), 1000)
    return () => window.clearInterval(timer)
  }, [ready, props.skyBodies])

  /* One repaint request per frame while the swarm is up: the positions change
     inside the shader, so nothing else would mark the map dirty. */
  useEffect(() => {
    if (!ready || !props.swarmKeyframe) return
    const map = mapRef.current
    if (!map) return
    let raf = 0
    const tick = () => {
      map.triggerRepaint()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ready, props.swarmKeyframe])

  // --- Altitude toggle ----------------------------------------------------
  useEffect(() => {
    if (!ready) return
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer || map !== readyMapRef.current) return
    altitudeOnRef.current = altitudeOn

    /* Satellites added later get this same visibility when their layers are
       created, so this effect does not need to re-run on every data tick. */
    const onlySelected = propsRef.current.swarmTrailOnlySelected ?? false
    const identified = propsRef.current.identifiedSatelliteId
    for (const sat of propsRef.current.satellites) {
      const hideTrail = onlySelected && sat.id !== identified
      for (const id of trailLayerIds(sat.id)) {
        if (map.getLayer(id)) {
          map.setLayoutProperty(
            id,
            'visibility',
            altitudeOn || hideTrail ? 'none' : 'visible',
          )
        }
      }
    }
    for (const id of SATELLITE_MARKER_LAYER_IDS) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', altitudeOn ? 'none' : 'visible')
    }

    if (altitudeOn) {
      if (!map.getLayer(ALTITUDE_LAYER_ID)) map.addLayer(layer)
      pushAltitudeData()
      /* The follow loop re-caps the zoom on its next frame; the tilt itself
         stays exactly where the user left it. */
    } else {
      if (map.getLayer(ALTITUDE_LAYER_ID)) map.removeLayer(ALTITUDE_LAYER_ID)
      /* Nothing elevated left to centre, so the tilt-coupled zoom cap goes
         with it and the whole zoom range is available again. */
      map.setMaxZoom(null)
      /* Do not wait for the next frame to hide a stale overlay position. */
      for (const el of labelElRef.current.values()) {
        if (el) el.style.display = 'none'
      }
      labelPosRef.current.clear()
    }
    syncMarkers()
  }, [ready, altitudeOn, pushAltitudeData, syncMarkers])

  useEffect(() => {
    const layer = layerRef.current
    if (!ready || !layer) return
    layer.setAppearance(liveTrailWidth, liveTrailOpacity)
    layer.setMarkerSize(compactChrome ? 10 : 6)
  }, [ready, liveTrailWidth, liveTrailOpacity, compactChrome])

  // --- Controls -----------------------------------------------------------
  const rotationStepDeg = useCallback(() => {
    const map = mapRef.current
    if (!map) return 5
    return Math.max(0.5, Math.min(15, 40 / Math.pow(2, map.getZoom())))
  }, [])

  const panBy = useCallback(
    (dLatSign: number, dLonSign: number) => {
      const map = mapRef.current
      // The chase owns the centre; a pan would be undone on the next frame.
      if (!map || followActiveRef.current) return
      const step = rotationStepDeg()
      const center = map.getCenter()
      const nextLat = Math.max(-85, Math.min(85, center.lat + dLatSign * step))
      const nextZoom = Math.max(
        map.getMinZoom(),
        Math.min(map.getMaxZoom(), latCompensatedZoom(map.getZoom(), center.lat, nextLat)),
      )
      map.easeTo({ center: [center.lng + dLonSign * step, nextLat], zoom: nextZoom, duration: 150 })
    },
    [rotationStepDeg],
  )

  /* Mirrors the wheel's own two zoom paths (see onWheel above) so a key press
     feels like a notch of the same wheel: an easeTo outside follow, MapLibre
     clamping the target zoom on its own, and a pose nudge inside follow using
     the same FOLLOW_WHEEL_ZOOM_FACTOR the wheel already scales by. */
  const zoomByKey = useCallback(
    (sign: 1 | -1) => {
      const map = mapRef.current
      if (!map) return
      if (followActiveRef.current) {
        nudgeFollowPose({ zoomFactor: sign * 100 * FOLLOW_WHEEL_ZOOM_FACTOR })
        return
      }
      map.easeTo({ zoom: map.getZoom() + sign * KEY_ZOOM_STEP, duration: 150 })
    },
    [nudgeFollowPose],
  )

  /* Both controls feed the pose while following, exactly like the drag and
     wheel paths: an easeTo there would animate the camera behind the loop's
     back and be overwritten mid-animation. */
  const rotateBearingBy = useCallback(
    (sign: number) => {
      const map = mapRef.current
      if (!map) return
      if (followActiveRef.current) nudgeFollowPose({ bearingDeg: sign * 15 })
      else {
        /* jumpTo, not easeTo: on globe, easeTo also interpolates the centre
           (setLocationAtPoint), so Turn would pan the planet. Hold-repeat
           at 120 ms would also kill a 150 ms ease mid-flight. */
        map.jumpTo({ bearing: map.getBearing() + sign * 15 })
      }
    },
    [nudgeFollowPose],
  )

  const tiltBy = useCallback(
    (sign: number) => {
      const map = mapRef.current
      if (!map) return
      if (followActiveRef.current) {
        nudgeFollowPose({ pitchDeg: sign * 10 })
        return
      }
      map.jumpTo({
        pitch: Math.max(0, Math.min(MAX_PITCH, map.getPitch() + sign * 10)),
      })
    },
    [nudgeFollowPose],
  )
  keyControlsRef.current = { panBy, rotateBearingBy, tiltBy, zoomByKey }

  const homeTo = useCallback(
    (center: LngLatLike, zoom: number) => {
      const map = mapRef.current
      if (!map) return
      if (followActiveRef.current) exitFollow({ restoreCamera: false })
      map.easeTo({ center, bearing: 0, pitch: 0, zoom, duration: 1500 })
    },
    [exitFollow],
  )

  const copyErrors = useCallback(() => {
    void navigator.clipboard?.writeText(errors.join('\n')).catch(() => {})
  }, [errors])

  /* A satellite under the pointer wins over a sky path behind it: it is the
     nearer thing and the one the pointer was almost certainly aiming at. */
  const skyTooltip: {
    title: string
    rows: [string, string][]
    href?: string
    linkLabel?: string
  } | null = hoverSatelliteId
    ? (props.satelliteTooltipFor?.(hoverSatelliteId) ?? null)
    : hoverBodyId
      ? (props.skyTooltipFor?.(hoverBodyId) ?? null)
      : null

  const identifiedTooltip = props.identifiedSatelliteId
    ? (props.satelliteTooltipFor?.(props.identifiedSatelliteId) ?? null)
    : null

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
      style={height != null ? { minHeight: height } : undefined}
      data-viz="globe-map"
    >
      {/*
        h-full/w-full are load-bearing, not redundant with inset-0: MapLibre
        adds its own `maplibregl-map` class here, and maplibre-gl.css sets
        `.maplibregl-map { position: relative }`. That rule and Tailwind's
        `.absolute` have equal specificity, so whichever stylesheet lands last
        wins. When MapLibre wins, inset-0 no longer sizes the box and the
        container collapses to height 0, clipping the canvas to a black strip.
        Sizing it explicitly makes the container fill the root either way.
      */}
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full touch-none"
        role="img"
        aria-label={title ?? t('fields.title_pass_globe')}
      />

      {/* Sky overlay: Moon, planets and their apparent paths. */}
      <canvas
        ref={skyCanvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[1]"
      />

      {/* Sticky hover tooltip: stays until a click outside it or another feature. */}
      {skyTooltip && !compactChrome ? (
        <div
          ref={hoverTooltipRef}
          className="pointer-events-auto absolute z-20 w-max max-w-[15rem] border border-border bg-bg/92 px-2 py-1.5 backdrop-blur-sm"
          style={{
            left: hoverPoint.x + (hoverPoint.x > (containerRef.current?.clientWidth ?? 0) - 200 ? -196 : 14),
            top: hoverPoint.y + (hoverPoint.y > (containerRef.current?.clientHeight ?? 0) - 130 ? -126 : 12),
          }}
        >
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-fg">
            {skyTooltip.title}
          </p>
          {skyTooltip.rows.map(([label, value]) => (
            <p key={label} className="flex justify-between gap-3 font-mono text-[10px] text-subtle">
              <span className="text-muted">{label}</span>
              <span className="tabular">{value}</span>
            </p>
          ))}
          {skyTooltip.href && skyTooltip.linkLabel ? (
            <a
              href={skyTooltip.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block font-mono text-[10px] text-signal underline-offset-2 transition-colors hover:text-fg hover:underline"
            >
              {skyTooltip.linkLabel} ↗
            </a>
          ) : null}
        </div>
      ) : null}

      {/*
        The site tooltip: the same box the satellites get, anchored to the
        marker the flight just planted. Pointer events are ON, unlike the
        hover tooltips, because this one carries a link; it leaves with the
        close button or the next site, and hides with its marker whenever the
        planet turns it away.
      */}
      {activePoi && poiScreen ? (
        <div
          className="absolute z-20 w-max max-w-[16rem] border border-border bg-bg/92 px-2 py-1.5 backdrop-blur-sm"
          style={{
            left: poiScreen.x + (poiScreen.x > (containerRef.current?.clientWidth ?? 0) - 220 ? -216 : 14),
            top: poiScreen.y + (poiScreen.y > (containerRef.current?.clientHeight ?? 0) - 120 ? -116 : 12),
          }}
        >
          <div className="mb-1 flex items-start justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg">
              {activePoi.label}
            </p>
            <button
              type="button"
              aria-label={t('fields.globe_error_dismiss')}
              className="font-mono text-[10px] leading-none text-muted transition-colors hover:text-warn"
              onClick={() => setActivePoi(null)}
            >
              ×
            </button>
          </div>
          <p className="flex justify-between gap-3 font-mono text-[10px] text-subtle">
            <span className="text-muted">{t('fields.latitude')}</span>
            <span className="tabular">{activePoi.lat.toFixed(4)}°</span>
          </p>
          <p className="flex justify-between gap-3 font-mono text-[10px] text-subtle">
            <span className="text-muted">{t('fields.longitude')}</span>
            <span className="tabular">{activePoi.lon.toFixed(4)}°</span>
          </p>
          <a
            href={grokipediaUrl(activePoi)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block font-mono text-[10px] text-signal underline-offset-2 transition-colors hover:text-fg hover:underline"
          >
            {t('fields.globe_grokipedia')} ↗
          </a>
        </div>
      ) : null}

      {/* Sun billboard: a disk at its true angular size in the true sun
          direction, hidden when the globe covers it. */}
      <div
        ref={sunElRef}
        role="img"
        aria-label={t('fields.marker_sun')}
        className="pointer-events-none absolute left-0 top-0 z-[1] hidden rounded-full"
        style={{ background: sunBillboardBackground(SUN_DISK_COLOR, SUN_GLOW_RGB) }}
      />

      {satellites.map((sat) => (
        <div
          key={sat.id}
          ref={labelRefSetter(sat.id)}
          className="pointer-events-none absolute left-0 top-0 z-[1] hidden font-mono text-[11px] text-fg [text-shadow:0_0_3px_var(--color-bg),0_0_3px_var(--color-bg)]"
        >
          {sat.label}
        </div>
      ))}

      {chrome ? (
        <div
          className={cn(
            'absolute z-[2]',
            compactChrome
              ? 'left-[max(0.75rem,var(--safe-left))] bottom-[calc(4.25rem+var(--safe-bottom))]'
              : 'bottom-8 left-4',
          )}
        >
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={infoOpen}
            title={t('fields.globe_info_title')}
            aria-label={t('fields.globe_info_title')}
            className={cn(
              'pointer-events-auto relative z-[3] flex shrink-0 items-center justify-center rounded-full border bg-surface/80 font-mono leading-none transition-colors',
              compactChrome ? 'h-8 w-8 text-[12px]' : 'h-6 w-6 text-[11px]',
              compactChrome && identifiedTooltip
                ? 'border-warn text-warn hover:border-warn hover:text-fg'
                : 'border-border text-muted hover:border-warn hover:text-fg',
            )}
            onClick={() => setInfoOpen((open) => !open)}
          >
            <span className="pointer-events-none" aria-hidden>
              i
            </span>
          </button>
        </div>
      ) : null}

      {infoOpen ? (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-bg/60 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={t('fields.globe_info_title')}
          onClick={() => setInfoOpen(false)}
        >
          <div
            className="mx-4 flex w-full max-w-md flex-col gap-2 border border-border bg-bg/95 px-4 py-3 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg">
                {t('fields.globe_info_title')}
              </p>
              <button
                type="button"
                aria-label={t('fields.globe_error_dismiss')}
                className="font-mono text-[12px] leading-none text-muted transition-colors hover:text-warn"
                onClick={() => setInfoOpen(false)}
              >
                ×
              </button>
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-subtle">{hint}</p>
            <p className="font-mono text-[11px] leading-relaxed text-subtle">
              {t('fields.globe_not_tracking')}
            </p>
            {caption ? (
              <p className="font-mono text-[11px] leading-relaxed text-subtle">{caption}</p>
            ) : null}
            {identifiedTooltip ? (
              <div className="flex flex-col gap-1 border-t border-border pt-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  {t('fields.globe_info_selected')}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg">
                  {identifiedTooltip.title}
                </p>
                {identifiedTooltip.rows.map(([label, value]) => (
                  <p
                    key={label}
                    className="flex justify-between gap-3 font-mono text-[11px] text-subtle"
                  >
                    <span className="text-muted">{label}</span>
                    <span className="tabular">{value}</span>
                  </p>
                ))}
                {identifiedTooltip.href && identifiedTooltip.linkLabel ? (
                  <a
                    href={identifiedTooltip.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block font-mono text-[10px] text-signal underline-offset-2 transition-colors hover:text-fg hover:underline"
                  >
                    {identifiedTooltip.linkLabel} ↗
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/*
        One column, three panels and one action, in the order a viewer reaches
        for them: move the camera, then decide what the globe carries, then
        dress the trails, then hand the camera to a satellite.
      */}
      {chrome && compactChrome && cameraScale ? (
        <div className="pointer-events-none absolute right-4 bottom-20 z-[2] hidden md:block lg:hidden">
          <div className={cn(CTRL_PANEL_CLASS, 'pointer-events-auto')}>
            <GlobeScaleReadout zoom={cameraScale.zoom} scale={cameraScale.scale} />
          </div>
        </div>
      ) : null}

      {chrome ? (
      <ChromeHost compact={compactChrome}>
        {!compactChrome && cameraScale ? (
          <div className={CTRL_PANEL_CLASS}>
            <GlobeScaleReadout zoom={cameraScale.zoom} scale={cameraScale.scale} />
          </div>
        ) : null}
        <ChromePanel
          compact={compactChrome}
          open={props.chromeSheet === 'camera'}
          title={t('fields.globe_camera')}
          onClose={closeChromeSheet}
          bodyClassName="flex justify-center"
        >
          {/*
            The keys are this component's own, not MapLibre's KeyboardHandler:
            its screen-space pan drifts the bearing on a horizontal press and
            drifts the mercator scale on a vertical one, both wrong for a
            globe. The bound set is unchanged though: arrows pan, SHIFT with
            them turns and tilts, and plus and minus zoom.
          */}
          <div
            className={cn(
              'flex items-start gap-2',
              compactChrome && 'w-full justify-center [&_button]:h-10 [&_button]:w-10',
            )}
          >
            <KeyTip label={t('fields.kbd_rotate')} keys={['↑', '↓', '←', '→']}>
              <div className="grid grid-cols-3 grid-rows-3 gap-[3px]">
                <HoldButton
                  onTrigger={() => panBy(1, 0)}
                  title={t('fields.globe_pan_north')}
                  className={cn(CTRL_BTN_CLASS, 'col-start-2 row-start-1')}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span>▲</span>
                    <span className="text-[7px] text-muted">↑</span>
                  </span>
                </HoldButton>
                <HoldButton
                  onTrigger={() => panBy(0, -1)}
                  title={t('fields.globe_pan_west')}
                  className={cn(CTRL_BTN_CLASS, 'col-start-1 row-start-2')}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span>◀</span>
                    <span className="text-[7px] text-muted">←</span>
                  </span>
                </HoldButton>
                <HoldButton
                  onTrigger={() => panBy(0, 1)}
                  title={t('fields.globe_pan_east')}
                  className={cn(CTRL_BTN_CLASS, 'col-start-3 row-start-2')}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span>▶</span>
                    <span className="text-[7px] text-muted">→</span>
                  </span>
                </HoldButton>
                <HoldButton
                  onTrigger={() => panBy(-1, 0)}
                  title={t('fields.globe_pan_south')}
                  className={cn(CTRL_BTN_CLASS, 'col-start-2 row-start-3')}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span>▼</span>
                    <span className="text-[7px] text-muted">↓</span>
                  </span>
                </HoldButton>
              </div>
            </KeyTip>
            {/* Orientation and zoom: three flex rows rather than one grid,
                so the bearing pair, the tilt pair and the zoom pair can each
                carry their own KeyTip. The fixed button size makes the stack
                the same height as the pan pad beside it. */}
            <div className="flex flex-col gap-[3px]">
              <KeyTip label={t('fields.kbd_turn_tilt')} keys={['Shift', '←/→']}>
                <div className="flex gap-[3px]">
                  <HoldButton
                    onTrigger={() => rotateBearingBy(-1)}
                    title={t('fields.globe_bearing_left')}
                    className={CTRL_BTN_CLASS}
                  >
                    <span className="flex flex-col items-center leading-none">
                      <span>↺</span>
                      <span className="text-[7px] text-muted">⇧←</span>
                    </span>
                  </HoldButton>
                  <HoldButton
                    onTrigger={() => rotateBearingBy(1)}
                    title={t('fields.globe_bearing_right')}
                    className={CTRL_BTN_CLASS}
                  >
                    <span className="flex flex-col items-center leading-none">
                      <span>↻</span>
                      <span className="text-[7px] text-muted">⇧→</span>
                    </span>
                  </HoldButton>
                </div>
              </KeyTip>
              <KeyTip label={t('fields.kbd_turn_tilt')} keys={['Shift', '↑/↓']}>
                <div className="flex gap-[3px]">
                  <HoldButton
                    onTrigger={() => tiltBy(1)}
                    title={t('fields.globe_tilt_up')}
                    className={CTRL_BTN_CLASS}
                  >
                    <span className="flex flex-col items-center leading-none">
                      <span>⇑</span>
                      <span className="text-[7px] text-muted">⇧↑</span>
                    </span>
                  </HoldButton>
                  <HoldButton
                    onTrigger={() => tiltBy(-1)}
                    title={t('fields.globe_tilt_down')}
                    className={CTRL_BTN_CLASS}
                  >
                    <span className="flex flex-col items-center leading-none">
                      <span>⇓</span>
                      <span className="text-[7px] text-muted">⇧↓</span>
                    </span>
                  </HoldButton>
                </div>
              </KeyTip>
              <KeyTip label={t('fields.kbd_zoom')} keys={['+', '−']}>
                <div className="flex gap-[3px]">
                  <HoldButton
                    onTrigger={() => zoomByKey(1)}
                    title={t('fields.globe_zoom_in')}
                    className={CTRL_BTN_CLASS}
                  >
                    +
                  </HoldButton>
                  <HoldButton
                    onTrigger={() => zoomByKey(-1)}
                    title={t('fields.globe_zoom_out')}
                    className={CTRL_BTN_CLASS}
                  >
                    −
                  </HoldButton>
                </div>
              </KeyTip>
            </div>
          </div>
        </ChromePanel>

        {/*
          The VIEW panel: where to send the camera, and the two per-satellite
          modes. Zoom and the scale bar sit above CAMERA on desktop/tablet;
          on the phone they stay here because there is no persistent pad.
        */}
        <ChromePanel
          compact={compactChrome}
          open={props.chromeSheet === 'view'}
          title={t('fields.globe_view_panel')}
          onClose={closeChromeSheet}
        >
          {compactChrome && cameraScale ? (
            <div className="md:hidden">
              <GlobeScaleReadout zoom={cameraScale.zoom} scale={cameraScale.scale} />
            </div>
          ) : null}

          {/* Named places live with the camera: they ARE camera moves. The
              sites are a dropdown because a dozen buttons is a panel, and one
              button that only knows Starbase was a bookmark pretending to be
              a feature. */}
          <div className="flex gap-[3px] max-lg:gap-2">
            <select
              value=""
              aria-label={t('fields.globe_pois')}
              title={t('fields.globe_pois_hint')}
              className="h-7 min-w-0 flex-1 cursor-pointer rounded border border-border bg-fg/[0.03] px-1.5 font-mono text-[11px] text-fg transition-colors hover:border-warn max-lg:h-10"
              onChange={(e) => {
                const poi = GLOBE_POIS.find((candidate) => candidate.id === e.target.value)
                if (poi) {
                  setActivePoi(poi)
                  homeTo([poi.lon, poi.lat], poi.zoom)
                }
                e.currentTarget.blur()
              }}
            >
              <option value="" disabled>
                {t('fields.globe_pois')}
              </option>
              {GLOBE_POIS.map((poi) => (
                <option key={poi.id} value={poi.id}>
                  {poi.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={cn(CTRL_BTN_CLASS, 'w-9 max-lg:h-10 max-lg:w-10')}
              title={t('fields.use_my_location')}
              aria-label={t('fields.use_my_location')}
              onClick={(e) => {
                /* With a position already granted this is a flight; without
                   one it is the permission request, and the flight is the
                   next press. Asking and flying in one click would move the
                   camera on a permission dialog's timing, not the user's. */
                if (observer) homeTo([observer.lon, observer.lat], 6)
                else propsRef.current.onRequestMyLocation?.()
                e.currentTarget.blur()
              }}
            >
              <MapPin aria-hidden className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* The two per-satellite modes: they follow the camera's subject
              rather than move the camera, which is why they close this panel
              instead of living in the movement one. */}
          <div
            className="flex items-center gap-[3px] max-lg:flex-col max-lg:items-stretch max-lg:gap-2"
            title={t('fields.globe_altitude_hint')}
          >
            <label className="flex h-7 cursor-pointer items-center gap-1.5 whitespace-nowrap px-2 font-mono text-[11px] text-fg max-lg:h-10">
              <input
                type="checkbox"
                checked={altitudeOn}
                disabled={followActive}
                onChange={(e) => setAltitude(e.target.checked)}
                className="cursor-pointer accent-warn disabled:cursor-not-allowed"
              />
              {t('fields.globe_altitude')}
            </label>
            {followTargetId ? (
              // The wrapping div carries the flex-1 that used to sit on the
              // button itself: KeyTip's own wrapper shrinks to its content by
              // default, and flex-col + stretch here is what hands that width
              // back down to the button.
              <div className="flex flex-1 flex-col">
                <KeyTip label={t('fields.kbd_follow')} keys={['C']}>
                  <button
                    type="button"
                    aria-pressed={followActive}
                    title={t('fields.globe_follow_hint', { label: followTargetLabel })}
                    className={cn(
                      CTRL_BTN_WIDE_CLASS,
                      'flex-1 max-lg:h-10',
                      followActive && 'border-warn bg-warn/25 text-warn',
                    )}
                    onClick={(e) => {
                      toggleFollow()
                      e.currentTarget.blur()
                    }}
                  >
                    {t('fields.globe_follow')}
                    <span className="ml-1.5 text-[9px] text-muted">C</span>
                  </button>
                </KeyTip>
              </div>
            ) : null}
          </div>
          {props.onResetView ? (
            <button
              type="button"
              className={cn(CTRL_BTN_WIDE_CLASS, 'max-lg:h-10')}
              onClick={(e) => {
                propsRef.current.onResetView?.()
                e.currentTarget.blur()
              }}
            >
              {t('fields.globe_reset_all')}
            </button>
          ) : null}
        </ChromePanel>

        {/* Trails to dress: the swarm, or the full-treatment tracks. Hidden
            only when nothing is on the globe to style. */}
        {props.onTrailAppearanceChange &&
        ((props.swarmTrailCount ?? 0) > 0 || satellites.length > 0) ? (
          <ChromePanel
            compact={compactChrome}
            open={props.chromeSheet === 'trails'}
            title={t('fields.globe_trail_style')}
            onClose={closeChromeSheet}
          >
            {/*
              Scope first: it decides whether the two sliders under it are
              dressing a crowd or a single orbit.
            */}
            <KeyTip label={t('fields.kbd_trails')} keys={['T']}>
              <div
                className="flex w-full gap-[3px] max-lg:gap-2"
                role="radiogroup"
                aria-label={t('fields.globe_trail_style')}
                title={t('fields.globe_trail_scope_hint')}
              >
                {[false, true].map((onlySelected) => (
                  <button
                    key={String(onlySelected)}
                    type="button"
                    role="radio"
                    aria-checked={(props.swarmTrailOnlySelected ?? false) === onlySelected}
                    className={cn(
                      CTRL_BTN_WIDE_CLASS,
                      'flex-1 max-lg:h-10',
                      (props.swarmTrailOnlySelected ?? false) === onlySelected &&
                        'border-warn bg-warn/25 text-warn',
                    )}
                    onClick={(e) => {
                      props.onTrailAppearanceChange?.({
                        width: liveTrailWidth,
                        opacity: liveTrailOpacity,
                        onlySelected,
                      })
                      e.currentTarget.blur()
                    }}
                  >
                    {onlySelected
                      ? t('fields.globe_trail_scope_selected')
                      : t('fields.globe_trail_scope_all')}
                  </button>
                ))}
              </div>
            </KeyTip>
            {props.trailScopeNotice ? (
              <p className="font-mono text-[10px] leading-relaxed text-warn">
                {props.trailScopeNotice}
              </p>
            ) : null}
            <TrailSlider
              label={t('fields.globe_trail_opacity')}
              value={liveTrailOpacity}
              onChange={setLiveTrailOpacity}
              onCommit={(opacity) =>
                props.onTrailAppearanceChange?.({
                  width: liveTrailWidth,
                  opacity,
                  onlySelected: props.swarmTrailOnlySelected ?? false,
                })
              }
            />
            <TrailSlider
              label={t('fields.globe_trail_width')}
              value={liveTrailWidth}
              onChange={setLiveTrailWidth}
              onCommit={(width) =>
                props.onTrailAppearanceChange?.({
                  width,
                  opacity: liveTrailOpacity,
                  onlySelected: props.swarmTrailOnlySelected ?? false,
                })
              }
            />
            <TrailProgress value={props.swarmTrailProgress ?? null} />
          </ChromePanel>
        ) : null}

      </ChromeHost>
      ) : null}

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
