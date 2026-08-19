/**
 * WebGL custom layer drawing every satellite's orbit polyline and marker at
 * its real altitude (r = R + altKm) under `projection: 'globe'`.
 *
 * Implemented against MapLibre's actual shipped GLSL for exactly this
 * scenario (v5.24, src/shaders/glsl/_projection_globe.vertex.glsl) and its
 * official "Add a simple custom layer on a globe" example:
 *   - vertex x/y come from MercatorCoordinate.fromLngLat(...) (tile-space
 *     mercator position in range 0..1, NOT raw lng/lat)
 *   - elevation is a separate scalar in real meters (not mercator z units),
 *     confirmed from the shader source: `elevatedPos = spherePos * (1.0 +
 *     elevation / GLOBE_RADIUS)`, GLOBE_RADIUS = 6371008.8 (meters)
 *   - the injected `projectTileFor3D(vec2 posInTile, float elevation)`
 *     (renderingMode '3d', preserving Z for correct depth compositing) does
 *     the mercator to globe warp using MapLibre's own current camera matrix
 *     (args.defaultProjectionData.mainMatrix), so nothing here assumes
 *     pitch 0: the full camera transform is supplied every frame the same
 *     way it is for every built-in layer.
 *
 * The past half is one continuous line strip; the future half is drawn as
 * disconnected fixed-screen-length dashes (see buildDashedLineSegments).
 * The marker is a single gl.POINTS vertex (gl_PointSize set in the same
 * vertex shader, harmless for line draws since it is only read in POINTS
 * mode), masked circular in the fragment shader via gl_PointCoord. Fade is
 * a 4th per-vertex attribute (a_alpha) computed in JS from fadeAlphaAt(),
 * multiplied into the fragment alpha: exact regardless of antimeridian
 * splits, unlike the 2D line-gradient approximation.
 */

import {
  MercatorCoordinate,
  type CustomLayerInterface,
  type CustomRenderMethodInput,
  type Map as MapLibreMap,
  type ProjectionData,
} from 'maplibre-gl'
import type { Rgba } from './color'
import {
  buildDashedLineSegments,
  DASH_REBUILD_ZOOM_HYSTERESIS,
  DASH_SCREEN_TARGET_PX,
  fadeAlphaAt,
  GAP_SCREEN_TARGET_PX,
  groundResolutionMetersPerPixel,
  shouldRebuildDashLength,
} from './track'
import type { GlobeTrackPoint } from './types'

export const ALTITUDE_LAYER_ID = 'sidus-orbit-altitude'

/**
 * Staged narration of shader/upload/render stages into the on-screen error
 * box. Real failures (compile/link failures, render() exceptions, MapLibre
 * error events) always report regardless of this flag; only the routine
 * stage-by-stage logging is gated and throttled, so it can be left on
 * without flooding the box at 60 Hz.
 */
const ALTITUDE_LAYER_DEBUG: boolean = false

export type AltitudeTrailInput = {
  id: string
  colorRgba: Rgba
  past: GlobeTrackPoint[]
  future: GlobeTrackPoint[]
  windowStart: Date
  windowEnd: Date
}

export type AltitudeLayer = CustomLayerInterface & {
  setTrail(input: AltitudeTrailInput): void
  setPoint(id: string, colorRgba: Rgba, point: GlobeTrackPoint): void
  dropSatellite(id: string): void
  /** Re-target the meters-per-dash figure when zoom has drifted (hysteresis). */
  refreshDashLengths(force: boolean): void
  livePointOf(id: string): GlobeTrackPoint | null
  isAttached(): boolean
  /** Projection state of the last drawn frame, for the elevated label overlay. */
  lastProjectionData(): ProjectionData | null
  lastVariantName(): string | null
}

type ShaderEntry = {
  program: WebGLProgram
  aPos: number
  aElevation: number
  aAlpha: number
}

type SatelliteState = {
  colorRgba: Rgba
  buffers: { past: WebGLBuffer; future: WebGLBuffer; point: WebGLBuffer } | null
  pastCount: number
  futureCount: number
  hasPoint: boolean
  pendingLines: Omit<AltitudeTrailInput, 'id' | 'colorRgba'> | null
  pendingPoint: GlobeTrackPoint | null
  /** Kept after upload so the label overlay can re-project it every repaint. */
  livePoint: GlobeTrackPoint | null
  dashLengthMeters: number | null
  gapLengthMeters: number | null
  lastDashZoomBuild: number | null
}

type GlContext = WebGLRenderingContext | WebGL2RenderingContext

/**
 * Elevation encoding is VARIANT DEPENDENT, confirmed from the real shader
 * source and not assumed. Under globe
 * (src/shaders/glsl/_projection_globe.vertex.glsl) projectTileFor3D divides
 * elevation by GLOBE_RADIUS to get a fractional sphere-scale factor, so raw
 * meters is correct. Under mercator
 * (src/shaders/glsl/_projection_mercator.vertex.glsl):
 *   vec4 projectTileWithElevation(vec2 posInTile, float elevation) {
 *       return u_projection_matrix * vec4(posInTile, elevation, 1.0);
 *   }
 *   vec4 projectTileFor3D(vec2 posInTile, float elevation) {
 *       return projectTileWithElevation(posInTile, elevation);
 *   }
 * Elevation is used DIRECTLY as a Z coordinate in the same conformal
 * mercator-unit space as posInTile.x/.y (world range 0..1), not meters.
 * Feeding raw meters (about 420000 for the ISS) into that would be off by
 * roughly 7 orders of magnitude (1 meter is only about 2.5e-8 to 4e-8
 * mercator units depending on latitude), so the mercator variant converts
 * through MercatorCoordinate's own meterInMercatorCoordinateUnits().
 */
function toVertex(
  p: GlobeTrackPoint,
  alpha: number,
  useMercatorElevationUnits: boolean,
): [number, number, number, number] {
  const merc = MercatorCoordinate.fromLngLat({ lng: p.lon, lat: p.lat })
  const elevationMeters = p.altKm * 1000
  const elevation = useMercatorElevationUnits
    ? elevationMeters * merc.meterInMercatorCoordinateUnits()
    : elevationMeters
  return [merc.x, merc.y, elevation, alpha]
}

function flattenVerts(verts: [number, number, number, number][]): Float32Array {
  const arr = new Float32Array(verts.length * 4)
  verts.forEach((v, i) => arr.set(v, i * 4))
  return arr
}

function emptySatellite(colorRgba: Rgba): SatelliteState {
  return {
    colorRgba,
    buffers: null,
    pastCount: 0,
    futureCount: 0,
    hasPoint: false,
    pendingLines: null,
    pendingPoint: null,
    livePoint: null,
    dashLengthMeters: null,
    gapLengthMeters: null,
    lastDashZoomBuild: null,
  }
}

export function createAltitudeLayer(options: {
  map: MapLibreMap
  /** Genuine failures: always surfaced. */
  onError: (label: string, err: unknown) => void
  /** Called at the end of every drawn frame, for the elevated label overlay. */
  onFrame: () => void
}): AltitudeLayer {
  const { map, onError, onFrame } = options
  /*
   * Attribute locations are cached PER SHADER VARIANT (not as single shared
   * fields): globe rendering can internally switch shader variant
   * (isRenderingGlobe / the projectionTransition morph toward mercator at
   * high zoom), and a naive single aPos etc. would keep whichever variant's
   * locations were queried LAST, silently binding the wrong attribute slot
   * if MapLibre later switches back to an earlier-compiled variant.
   */
  const shaderMap = new Map<string, ShaderEntry>()
  const satellites = new Map<string, SatelliteState>()
  const debugStageLastLog: Record<string, number> = {}

  let attached = false
  let projectionData: ProjectionData | null = null
  let variantName: string | null = null

  /** Max one message per second per stage, so follow mode cannot flood the box. */
  function logDebugStage(stageKey: string, message: string): void {
    if (!ALTITUDE_LAYER_DEBUG) return
    const now = Date.now()
    if (now - (debugStageLastLog[stageKey] ?? 0) < 1000) return
    debugStageLastLog[stageKey] = now
    onError(`[altitude:${stageKey}]`, message)
  }

  function refreshDashLength(sat: SatelliteState, force: boolean): void {
    const currentZoom = map.getZoom()
    if (!shouldRebuildDashLength(currentZoom, sat.lastDashZoomBuild, DASH_REBUILD_ZOOM_HYSTERESIS, force)) {
      return
    }
    const lat = sat.livePoint?.lat ?? sat.pendingLines?.future[0]?.lat ?? 0
    const metersPerPixel = groundResolutionMetersPerPixel(currentZoom, lat)
    sat.dashLengthMeters = DASH_SCREEN_TARGET_PX * metersPerPixel
    sat.gapLengthMeters = GAP_SCREEN_TARGET_PX * metersPerPixel
    sat.lastDashZoomBuild = currentZoom
    logDebugStage(
      'dash-length',
      `rebuilt zoom=${currentZoom.toFixed(2)} lat=${lat.toFixed(2)} dashM=${sat.dashLengthMeters.toFixed(0)} gapM=${sat.gapLengthMeters.toFixed(0)}`,
    )
  }

  function getShader(gl: GlContext, shaderDescription: CustomRenderMethodInput['shaderData']): ShaderEntry {
    const cached = shaderMap.get(shaderDescription.variantName)
    if (cached) return cached

    const vertexSource = `#version 300 es
    ${shaderDescription.vertexShaderPrelude}
    ${shaderDescription.define}

    in vec2 a_pos;
    in float a_elevation;
    in float a_alpha;
    out float v_alpha;

    void main() {
        gl_Position = projectTileFor3D(a_pos, a_elevation);
        gl_PointSize = 6.0;
        v_alpha = a_alpha;
    }`

    /*
     * GLSL ES fragment shaders have NO default float precision (vertex
     * shaders default to highp, which is why vertex compilation always
     * succeeded here). Without an explicit `precision mediump float;` the
     * v_alpha / u_is_point float declarations fail to compile
     * ("No precision specified for (float)"), the program never links, and
     * every attribute location comes back -1, so the layer draws NOTHING.
     * The precision declaration must stay the very first statement after
     * #version: this fragment shader gets no MapLibre-injected prelude,
     * unlike the vertex shader above, so nothing can end up ahead of it.
     */
    const fragmentSource = `#version 300 es
    precision mediump float;
    in float v_alpha;
    uniform float u_is_point;
    uniform vec4 u_color;
    out highp vec4 fragColor;
    void main() {
        if (u_is_point > 0.5 && length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
        fragColor = vec4(u_color.rgb, u_color.a * v_alpha);
    }`

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexSource)
    gl.compileShader(vertexShader)
    const vertexOk = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)
    if (!vertexOk) {
      onError('Altitude layer vertex shader COMPILE FAILED', gl.getShaderInfoLog(vertexShader) || '(no info log)')
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentSource)
    gl.compileShader(fragmentShader)
    const fragmentOk = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)
    if (!fragmentOk) {
      onError('Altitude layer fragment shader COMPILE FAILED', gl.getShaderInfoLog(fragmentShader) || '(no info log)')
    }

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    const linkOk = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!linkOk) {
      onError('Altitude layer program LINK FAILED', gl.getProgramInfoLog(program) || '(no info log)')
    }

    const entry: ShaderEntry = {
      program,
      aPos: gl.getAttribLocation(program, 'a_pos'),
      aElevation: gl.getAttribLocation(program, 'a_elevation'),
      aAlpha: gl.getAttribLocation(program, 'a_alpha'),
    }
    /* -1 on any of these is the smoking gun for a compile/link failure (or a
       name mismatch) even if compile/link somehow reported OK. */
    logDebugStage(
      'shader',
      `variant="${shaderDescription.variantName}" vertexCompile=${vertexOk} fragmentCompile=${fragmentOk} link=${linkOk} aPos=${entry.aPos} aElevation=${entry.aElevation} aAlpha=${entry.aAlpha}`,
    )
    shaderMap.set(shaderDescription.variantName, entry)
    return entry
  }

  function uploadPending(gl: GlContext, sat: SatelliteState, useMercatorElevationUnits: boolean): void {
    if (!sat.pendingLines && !sat.pendingPoint) return
    if (!sat.buffers) {
      sat.buffers = { past: gl.createBuffer()!, future: gl.createBuffer()!, point: gl.createBuffer()! }
    }

    if (sat.pendingLines) {
      const { past, future, windowStart, windowEnd } = sat.pendingLines
      sat.pendingLines = null

      const pastVerts = past.map((p) =>
        toVertex(p, fadeAlphaAt(p.date, windowStart, windowEnd), useMercatorElevationUnits),
      )

      /* Dash length in meters comes from the hysteresis-throttled cache, not
         recomputed on every update: the geometry walk below still runs every
         time so the pattern tracks the moving solid/dashed split point, it
         just uses whatever length is currently valid. */
      if (sat.dashLengthMeters === null) refreshDashLength(sat, true)
      const dashSegments = buildDashedLineSegments(
        future,
        sat.dashLengthMeters ?? 0,
        sat.gapLengthMeters ?? 0,
      )
      const futureSegmentVerts: [number, number, number, number][] = []
      for (const [a, b] of dashSegments) {
        futureSegmentVerts.push(
          toVertex(a, fadeAlphaAt(a.date, windowStart, windowEnd), useMercatorElevationUnits),
          toVertex(b, fadeAlphaAt(b.date, windowStart, windowEnd), useMercatorElevationUnits),
        )
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, sat.buffers.past)
      gl.bufferData(gl.ARRAY_BUFFER, flattenVerts(pastVerts), gl.DYNAMIC_DRAW)
      sat.pastCount = pastVerts.length

      gl.bindBuffer(gl.ARRAY_BUFFER, sat.buffers.future)
      gl.bufferData(gl.ARRAY_BUFFER, flattenVerts(futureSegmentVerts), gl.DYNAMIC_DRAW)
      sat.futureCount = futureSegmentVerts.length

      logDebugStage(
        'uploadLines',
        `uploaded pastCount=${sat.pastCount} futureCount=${sat.futureCount} mercatorElevationUnits=${useMercatorElevationUnits}`,
      )
    }

    if (sat.pendingPoint) {
      const point = sat.pendingPoint
      sat.pendingPoint = null
      gl.bindBuffer(gl.ARRAY_BUFFER, sat.buffers.point)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        flattenVerts([toVertex(point, 1, useMercatorElevationUnits)]),
        gl.DYNAMIC_DRAW,
      )
      sat.hasPoint = true
      logDebugStage('uploadPoint', 'uploaded point buffer (1 vertex)')
    }
  }

  const layer: AltitudeLayer = {
    id: ALTITUDE_LAYER_ID,
    type: 'custom',
    renderingMode: '3d',

    onAdd(_map, _gl) {
      attached = true
      for (const sat of satellites.values()) {
        /* Buffers are recreated lazily in render(): a re-added layer may run
           on a new GL context, so any handle from a previous attach is stale. */
        sat.buffers = null
        sat.pastCount = 0
        sat.futureCount = 0
        sat.hasPoint = false
        refreshDashLength(sat, true)
      }
      shaderMap.clear()
      map.triggerRepaint()
    },

    onRemove(_map, gl) {
      attached = false
      for (const sat of satellites.values()) {
        if (sat.buffers) {
          gl.deleteBuffer(sat.buffers.past)
          gl.deleteBuffer(sat.buffers.future)
          gl.deleteBuffer(sat.buffers.point)
          sat.buffers = null
        }
        sat.pastCount = 0
        sat.futureCount = 0
        sat.hasPoint = false
      }
      for (const shader of shaderMap.values()) gl.deleteProgram(shader.program)
      shaderMap.clear()
      projectionData = null
      variantName = null
    },

    /*
     * setTrail()/setPoint() are called from React effects and from the
     * follow rAF loop: they only store plain JS data, they NEVER touch the
     * GL context. The actual gl.bindBuffer/gl.bufferData upload happens
     * inside render(), on the next frame MapLibre itself draws this layer
     * (dirty-flag pattern).
     *
     * Binding buffers from outside render() desyncs MapLibre's own cache of
     * "currently bound buffer": a later MapLibre-internal draw call (for ANY
     * layer, not just this one) can then skip re-binding and use the wrong
     * buffer, glitching the whole map and not only this layer. Every GL
     * mutation therefore stays inside render().
     */
    setTrail(input) {
      let sat = satellites.get(input.id)
      if (!sat) {
        sat = emptySatellite(input.colorRgba)
        satellites.set(input.id, sat)
      }
      sat.colorRgba = input.colorRgba
      sat.pendingLines = {
        past: input.past,
        future: input.future,
        windowStart: input.windowStart,
        windowEnd: input.windowEnd,
      }
      logDebugStage('setTrail', `pending pastPts=${input.past.length} futurePts=${input.future.length}`)
      /* Every path that sets pending data also asks for a redraw, so nothing
         depends on some other code path happening to repaint this frame. */
      map.triggerRepaint()
    },

    setPoint(id, colorRgba, point) {
      let sat = satellites.get(id)
      if (!sat) {
        sat = emptySatellite(colorRgba)
        satellites.set(id, sat)
      }
      sat.colorRgba = colorRgba
      sat.pendingPoint = point
      sat.livePoint = point
      map.triggerRepaint()
    },

    dropSatellite(id) {
      satellites.delete(id)
      map.triggerRepaint()
    },

    refreshDashLengths(force) {
      for (const sat of satellites.values()) refreshDashLength(sat, force)
    },

    livePointOf(id) {
      return satellites.get(id)?.livePoint ?? null
    },

    isAttached() {
      return attached
    },

    lastProjectionData() {
      return projectionData
    },

    lastVariantName() {
      return variantName
    },

    render(gl, args) {
      try {
        /* Exact strings from the real source (src/geo/projection/
           mercator_projection.ts: MercatorShaderVariantKey = 'mercator';
           vertical_perspective_projection.ts:
           VerticalPerspectiveShaderVariantKey = 'globe', the variant globe
           projection actually renders with). Elevation encoding must match
           whichever variant is ACTIVE for this draw call (see toVertex), so
           args.shaderData.variantName is authoritative straight from
           MapLibre rather than our own guess. */
        const useMercatorElevationUnits = args.shaderData.variantName === 'mercator'
        /* Captured for the elevated label overlay: defaultProjectionData is
           only ever handed to a custom layer inside render(), there is no
           top-level accessor for it. */
        projectionData = args.defaultProjectionData
        variantName = args.shaderData.variantName

        const shader = getShader(gl, args.shaderData)
        gl.useProgram(shader.program)
        gl.uniformMatrix4fv(
          gl.getUniformLocation(shader.program, 'u_projection_fallback_matrix'),
          false,
          args.defaultProjectionData.fallbackMatrix,
        )
        gl.uniformMatrix4fv(
          gl.getUniformLocation(shader.program, 'u_projection_matrix'),
          false,
          args.defaultProjectionData.mainMatrix,
        )
        gl.uniform4f(
          gl.getUniformLocation(shader.program, 'u_projection_tile_mercator_coords'),
          ...args.defaultProjectionData.tileMercatorCoords,
        )
        gl.uniform4f(
          gl.getUniformLocation(shader.program, 'u_projection_clipping_plane'),
          ...args.defaultProjectionData.clippingPlane,
        )
        gl.uniform1f(
          gl.getUniformLocation(shader.program, 'u_projection_transition'),
          args.defaultProjectionData.projectionTransition,
        )
        const uIsPoint = gl.getUniformLocation(shader.program, 'u_is_point')
        const uColor = gl.getUniformLocation(shader.program, 'u_color')

        const bindAttribs = (buffer: WebGLBuffer) => {
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
          gl.enableVertexAttribArray(shader.aPos)
          gl.vertexAttribPointer(shader.aPos, 2, gl.FLOAT, false, 16, 0)
          gl.enableVertexAttribArray(shader.aElevation)
          gl.vertexAttribPointer(shader.aElevation, 1, gl.FLOAT, false, 16, 8)
          gl.enableVertexAttribArray(shader.aAlpha)
          gl.vertexAttribPointer(shader.aAlpha, 1, gl.FLOAT, false, 16, 12)
        }

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        for (const sat of satellites.values()) {
          uploadPending(gl, sat, useMercatorElevationUnits)
          if (!sat.buffers) continue
          gl.uniform4f(uColor, ...sat.colorRgba)

          if (sat.pastCount > 0) {
            bindAttribs(sat.buffers.past)
            gl.uniform1f(uIsPoint, 0)
            gl.drawArrays(gl.LINE_STRIP, 0, sat.pastCount)
          }

          if (sat.futureCount > 0) {
            bindAttribs(sat.buffers.future)
            gl.uniform1f(uIsPoint, 0)
            gl.drawArrays(gl.LINES, 0, sat.futureCount)
          }

          if (sat.hasPoint) {
            bindAttribs(sat.buffers.point)
            gl.uniform1f(uIsPoint, 1)
            gl.drawArrays(gl.POINTS, 0, 1)
          }

          logDebugStage(
            'render',
            `variant="${args.shaderData.variantName}" pastCount=${sat.pastCount} futureCount=${sat.futureCount} aPos=${shader.aPos} aElevation=${shader.aElevation} aAlpha=${shader.aAlpha}`,
          )
        }

        /* Attribute-array state is global to the shared GL context, not per
           program: leaving these enabled can leak into whatever MapLibre (or
           another custom layer) draws next if that draw does not rebind the
           same slots itself. Restore a clean slate before returning. */
        gl.disableVertexAttribArray(shader.aPos)
        gl.disableVertexAttribArray(shader.aElevation)
        gl.disableVertexAttribArray(shader.aAlpha)

        /* Reposition the HTML labels on every repaint (drag/rotate/zoom
           included) and not only at the caller's data cadence, otherwise the
           elevated dot drawn here from the freshest matrix and the label
           visibly detach while dragging. */
        onFrame()
      } catch (err) {
        onError('Altitude layer render() exception', err)
      }
    },
  }

  return layer
}
