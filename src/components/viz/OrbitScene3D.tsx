/**
 * Educational 3D orbit scene (Canvas 2D).
 *
 * **Orthographic + uniform zoom**: circles stay circular when zooming.
 * Transfer geometry matches OrbitDiagram (Hohmann half-ellipse, bielliptic two legs).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { tooltipProps } from '@/components/shared/tooltip'
import { cn } from '@/lib/utils'

export type TransferArc = {
  /** Periapsis radius from focus [m] */
  rp: number
  /** Apoapsis radius from focus [m] */
  ra: number
  /** True-anomaly start/end [rad]; default full 0…2π */
  nu0?: number
  nu1?: number
  color?: string
  dash?: number[]
  width?: number
  /** Ghost full-ellipse guides are drawn but not flown by the craft. */
  ghost?: boolean
}

export type SceneTrack = {
  points: [number, number, number][]
  color?: string
  width?: number
  dash?: number[]
}

export type ScenePointMarker = {
  r: [number, number, number]
  label: string
  color?: string
}

export type OrbitScene3DProps = {
  bodyR: number
  /** Circular orbit radii [m] (closed rings) */
  radii?: number[]
  /**
   * Simple transfer ellipse (full or arc). Prefer `arcs` for multi-leg transfers.
   * @deprecated Prefer `arcs` for correct bielliptic / Hohmann legs
   */
  transfer?: { rp: number; ra: number; half?: boolean }
  /**
   * Explicit Kepler arcs about the focus (same model as OrbitDiagram).
   * Bielliptic: leg1 r1→rb (ν=0…π), leg2 rb→r2 (ν=π…2π) on ellipse with peri r2.
   */
  arcs?: TransferArc[]
  /**
   * Escape: parabola with periapsis at this radius [m] (e=1, energy 0).
   */
  escapePeriapsis?: number
  bodyColor?: string
  className?: string
  /**
   * Optional min-height [px] when the parent does not stretch.
   * Default: fill parent (`h-full` / flex-1): preferred inside PREVIEW cards.
   */
  height?: number
  showEscapeCircularRef?: boolean
  /**
   * Optional generic point tracks (e.g. ground track, trajectory) [m], drawn as
   * projected polylines in the same world scale as radii/arcs.
   */
  tracks?: SceneTrack[]
  /**
   * Optional labeled point markers [m], drawn as a small dot + text label.
   */
  pointMarkers?: ScenePointMarker[]
}

type Cam = { yaw: number; pitch: number; zoom: number }
type P3 = [number, number, number]

const CAM0: Cam = { yaw: 0.75, pitch: 0.55, zoom: 1 }
const ZOOM_MIN = 0.15
const ZOOM_MAX = 8

function clampZoom(z: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))
}

function project(
  x: number,
  y: number,
  z: number,
  cam: Cam,
  w: number,
  h: number,
  worldScale: number,
): { X: number; Y: number } {
  const cy = Math.cos(cam.yaw)
  const sy = Math.sin(cam.yaw)
  const cp = Math.cos(cam.pitch)
  const sp = Math.sin(cam.pitch)
  const x1 = x * cy - z * sy
  const z1 = x * sy + z * cy
  const y1 = y * cp - z1 * sp
  const s = worldScale * cam.zoom
  return { X: w / 2 + x1 * s, Y: h / 2 - y1 * s }
}

function ringPoints(r: number, n: number): P3[] {
  const pts: P3[] = []
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2
    pts.push([r * Math.cos(t), 0, r * Math.sin(t)])
  }
  return pts
}

/**
 * Kepler polar about focus: r = a(1−e²)/(1+e cos ν), peri on +x.
 * For classic transfers rp < ra, peri at ν=0, apo at ν=π.
 */
function keplerArcPoints(
  rp: number,
  ra: number,
  nu0: number,
  nu1: number,
  n: number,
): P3[] {
  if (!(rp > 0) || !(ra > rp)) return []
  const a = (rp + ra) / 2
  const e = (ra - rp) / (ra + rp)
  const pts: P3[] = []
  const steps = Math.max(8, n)
  for (let i = 0; i <= steps; i++) {
    const nu = nu0 + ((nu1 - nu0) * i) / steps
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu))
    if (!(r > 0) || !Number.isFinite(r)) continue
    pts.push([r * Math.cos(nu), 0, r * Math.sin(nu)])
  }
  return pts
}

function parabolaPoints(rp: number, n = 120, nuMax = 2.4): P3[] {
  const pts: P3[] = []
  for (let i = 0; i <= n; i++) {
    const nu = -nuMax + (2 * nuMax * i) / n
    const den = 1 + Math.cos(nu)
    if (den < 1e-4) continue
    const r = (2 * rp) / den
    if (!Number.isFinite(r) || r > rp * 12) continue
    pts.push([r * Math.cos(nu), 0, r * Math.sin(nu)])
  }
  return pts
}

function wheelZoomFactor(e: WheelEvent): number {
  let dy = e.deltaY
  if (e.deltaMode === 1) dy *= 16
  if (e.deltaMode === 2) dy *= 400
  dy = Math.max(-120, Math.min(120, dy))
  return Math.exp(-dy * 0.0022)
}

/** Build arcs from legacy transfer prop. */
function legacyTransferArcs(
  transfer?: { rp: number; ra: number; half?: boolean },
): TransferArc[] {
  if (!transfer || !(transfer.ra > transfer.rp) || !(transfer.rp > 0)) return []
  if (transfer.half) {
    // Hohmann burn-to-burn: peri → apo (ν = 0…π)
    return [
      {
        rp: transfer.rp,
        ra: transfer.ra,
        nu0: 0,
        nu1: Math.PI,
        color: 'rgba(196,122,90,0.95)',
        width: 2,
      },
    ]
  }
  return [
    {
      rp: transfer.rp,
      ra: transfer.ra,
      nu0: 0,
      nu1: 2 * Math.PI,
      color: 'rgba(196,122,90,0.95)',
      dash: [5, 4],
      width: 1.8,
    },
  ]
}

/**
 * Classic bielliptic about focus (matches OrbitDiagram):
 * - circles r1, r2, rb
 * - leg1: ellipse (r1, rb) ν=0…π  (r1 → rb): warn/gold
 * - leg2: ellipse (r2, rb) ν=π…2π (rb → r2), same apo ray: ok/green dashed
 * Ghost full ellipses help read the textbook ovals at high e.
 */
export function biellipticArcs(r1: number, r2: number, rb: number): TransferArc[] {
  if (!(r1 > 0) || !(r2 > 0) || !(rb > Math.max(r1, r2))) return []
  const rp1 = Math.min(r1, rb)
  const ra1 = Math.max(r1, rb)
  const rp2 = Math.min(r2, rb)
  const ra2 = Math.max(r2, rb)
  return [
    // Faint full ellipses (ghosts): not flown
    {
      rp: rp1,
      ra: ra1,
      nu0: 0,
      nu1: 2 * Math.PI,
      color: 'rgba(184,165,90,0.22)',
      width: 1,
      ghost: true,
    },
    {
      rp: rp2,
      ra: ra2,
      nu0: 0,
      nu1: 2 * Math.PI,
      color: 'rgba(107,143,113,0.2)',
      width: 1,
      ghost: true,
    },
    // Flown legs
    {
      rp: rp1,
      ra: ra1,
      nu0: 0,
      nu1: Math.PI,
      color: 'rgba(184,165,90,0.95)',
      width: 2.25,
    },
    {
      rp: rp2,
      ra: ra2,
      // Leg 2: apo (ν=π) → peri of second ellipse (ν=2π) when r2 < rb
      nu0: Math.PI,
      nu1: 2 * Math.PI,
      color: 'rgba(107,143,113,0.92)',
      dash: [8, 5],
      width: 2.05,
    },
  ]
}

export function hohmannArc(r1: number, r2: number): TransferArc[] {
  if (!(r1 > 0) || !(r2 > 0) || r1 === r2) return []
  const rp = Math.min(r1, r2)
  const ra = Math.max(r1, r2)
  // Half-ellipse peri→apo; if r1>r2 outbound is apo→peri
  if (r1 <= r2) {
    return [
      {
        rp,
        ra,
        nu0: 0,
        nu1: Math.PI,
        color: 'rgba(196,122,90,0.95)',
        width: 2.1,
      },
    ]
  }
  return [
    {
      rp,
      ra,
      nu0: Math.PI,
      nu1: 2 * Math.PI,
      color: 'rgba(196,122,90,0.95)',
      width: 2.1,
    },
  ]
}

export function OrbitScene3D({
  bodyR,
  radii = [],
  transfer,
  arcs,
  escapePeriapsis,
  bodyColor = '#7a9bb8',
  className,
  height,
  showEscapeCircularRef = true,
  tracks = [],
  pointMarkers = [],
}: OrbitScene3DProps) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cam, setCam] = useState<Cam>(CAM0)
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null)
  const camRef = useRef(cam)
  camRef.current = cam
  const t0 = useRef(performance.now())

  const resolvedArcs = useMemo(() => {
    if (arcs && arcs.length) return arcs
    return legacyTransferArcs(transfer)
  }, [arcs, transfer])

  const extent = useMemo(() => {
    const list = [bodyR * 1.15, ...radii]
    for (const a of resolvedArcs) {
      list.push(a.rp, a.ra)
    }
    if (escapePeriapsis != null && escapePeriapsis > 0) {
      list.push(escapePeriapsis, escapePeriapsis * 6)
    }
    for (const track of tracks) {
      for (const [x, y, z] of track.points) list.push(Math.hypot(x, y, z))
    }
    for (const marker of pointMarkers) {
      list.push(Math.hypot(marker.r[0], marker.r[1], marker.r[2]))
    }
    return Math.max(...list.filter((x) => Number.isFinite(x) && x > 0), 1)
  }, [bodyR, radii, resolvedArcs, escapePeriapsis, tracks, pointMarkers])

  const zoomBy = useCallback((factor: number) => {
    setCam((prev) => ({ ...prev, zoom: clampZoom(prev.zoom * factor) }))
  }, [])

  const resetCam = useCallback(() => {
    setCam({ ...CAM0 })
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const factor = wheelZoomFactor(e)
      setCam((prev) => ({ ...prev, zoom: clampZoom(prev.zoom * factor) }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    let raf = 0
    let alive = true

    const draw = () => {
      const ctx = c.getContext('2d')
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      const w = c.clientWidth
      const h = c.clientHeight
      if (w < 2 || h < 2) return
      if (c.width !== Math.floor(w * dpr) || c.height !== Math.floor(h * dpr)) {
        c.width = Math.floor(w * dpr)
        c.height = Math.floor(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const camNow = camRef.current
      const worldScale = (Math.min(w, h) * 0.42) / extent

      ctx.fillStyle = '#050506'
      ctx.fillRect(0, 0, w, h)

      const drawPath = (pts: P3[], color: string, width: number, dash?: number[]) => {
        if (pts.length < 2) return
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.setLineDash(dash ?? [])
        pts.forEach(([x, y, z], i) => {
          const p = project(x, y, z, camNow, w, h, worldScale)
          if (i === 0) ctx.moveTo(p.X, p.Y)
          else ctx.lineTo(p.X, p.Y)
        })
        ctx.stroke()
        ctx.setLineDash([])
      }

      drawPath(ringPoints(extent * 0.98, 64), 'rgba(255,255,255,0.04)', 1)

      const body = project(0, 0, 0, camNow, w, h, worldScale)
      const rPx = Math.max(4, bodyR * worldScale * camNow.zoom)
      const g = ctx.createRadialGradient(
        body.X - rPx * 0.35,
        body.Y - rPx * 0.35,
        rPx * 0.15,
        body.X,
        body.Y,
        rPx,
      )
      g.addColorStop(0, bodyColor)
      g.addColorStop(1, '#0a0a0c')
      ctx.beginPath()
      ctx.arc(body.X, body.Y, rPx, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Circular rings: style by index (r₁ signal-ish, r₂ ok, r_b muted dashed)
      const ringColors = [
        'rgba(196,200,206,0.95)', // r1
        'rgba(107,143,113,0.92)', // r2
        'rgba(115,115,115,0.75)', // rb / extra
      ]
      const ringDash: (number[] | undefined)[] = [undefined, undefined, [5, 5]]
      radii.forEach((r, i) => {
        if (!(r > 0)) return
        drawPath(
          ringPoints(r, 96),
          ringColors[Math.min(i, ringColors.length - 1)]!,
          i === 0 ? 1.9 : 1.5,
          ringDash[Math.min(i, ringDash.length - 1)],
        )
      })

      // Transfer arcs (Hohmann / bielliptic / custom): denser samples for high-e
      for (const arc of resolvedArcs) {
        const nu0 = arc.nu0 ?? 0
        const nu1 = arc.nu1 ?? Math.PI * 2
        const pts = keplerArcPoints(arc.rp, arc.ra, nu0, nu1, arc.ghost ? 96 : 160)
        drawPath(
          pts,
          arc.color ?? 'rgba(184,165,90,0.95)',
          arc.width ?? 1.9,
          arc.dash,
        )
      }

      // Escape parabola
      if (escapePeriapsis != null && escapePeriapsis > 0) {
        if (showEscapeCircularRef) {
          drawPath(ringPoints(escapePeriapsis, 96), 'rgba(122,155,184,0.45)', 1.2, [4, 4])
        }
        drawPath(parabolaPoints(escapePeriapsis, 140, 2.35), 'rgba(184,165,90,0.95)', 2)
        const peri = project(escapePeriapsis, 0, 0, camNow, w, h, worldScale)
        ctx.beginPath()
        ctx.arc(peri.X, peri.Y, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = '#f5f5f5'
        ctx.fill()
        const vTip = project(escapePeriapsis, 0, escapePeriapsis * 0.35, camNow, w, h, worldScale)
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(184,165,90,0.85)'
        ctx.lineWidth = 1.5
        ctx.moveTo(peri.X, peri.Y)
        ctx.lineTo(vTip.X, vTip.Y)
        ctx.stroke()
      } else if (resolvedArcs.some((a) => !a.ghost)) {
        // Craft follows flight legs only (skip ghost full ellipses)
        const allPts: P3[] = []
        for (const arc of resolvedArcs) {
          if (arc.ghost) continue
          const nu0 = arc.nu0 ?? 0
          const nu1 = arc.nu1 ?? Math.PI * 2
          allPts.push(...keplerArcPoints(arc.rp, arc.ra, nu0, nu1, 64))
        }
        // Burn markers: start of first flight leg + end of every flight leg
        const flight = resolvedArcs.filter((a) => !a.ghost)
        if (flight.length > 0) {
          const markAt = (rp: number, ra: number, nu: number): P3 | null => {
            const pts = keplerArcPoints(rp, ra, nu, nu, 8)
            return pts[0] ?? null
          }
          const marks: P3[] = []
          const first = flight[0]!
          const start = markAt(first.rp, first.ra, first.nu0 ?? 0)
          if (start) marks.push(start)
          for (const arc of flight) {
            const end = markAt(arc.rp, arc.ra, arc.nu1 ?? Math.PI * 2)
            if (end) marks.push(end)
          }
          for (const m of marks) {
            const p = project(m[0], m[1], m[2], camNow, w, h, worldScale)
            ctx.beginPath()
            ctx.arc(p.X, p.Y, 3, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(184,165,90,0.95)'
            ctx.fill()
            ctx.strokeStyle = '#050506'
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
        if (allPts.length > 1) {
          const t = ((performance.now() - t0.current) / 18000) % 1
          const idx = Math.min(allPts.length - 1, Math.floor(t * (allPts.length - 1)))
          const pt = allPts[idx]!
          const p = project(pt[0], pt[1], pt[2], camNow, w, h, worldScale)
          ctx.beginPath()
          ctx.arc(p.X, p.Y, 3.5, 0, Math.PI * 2)
          ctx.fillStyle = '#f5f5f5'
          ctx.fill()
        }
      } else if (radii[0]) {
        const t = ((performance.now() - t0.current) / 8000) % 1
        const ang = t * Math.PI * 2
        const sx = radii[0] * Math.cos(ang)
        const sz = radii[0] * Math.sin(ang)
        const p = project(sx, 0, sz, camNow, w, h, worldScale)
        ctx.beginPath()
        ctx.arc(p.X, p.Y, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = '#f5f5f5'
        ctx.fill()
      }

      // Occlusion for caller-supplied tracks/pointMarkers: a point is on the far
      // side of the body when its view-space depth (the rotation's third axis,
      // dropped by `project`) is negative, i.e. behind the origin along the
      // camera direction. Derived by extending `project`'s own yaw/pitch
      // rotation with its implicit (unreturned) depth component:
      //   viewZ = y·sin(pitch) + (x·sin(yaw) + z·cos(yaw))·cos(pitch)
      // A far-side point is occluded only if it also falls inside the body's
      // on-screen disk (near-side points are never occluded).
      const viewZOf = (x: number, y: number, z: number): number => {
        const z1 = x * Math.sin(camNow.yaw) + z * Math.cos(camNow.yaw)
        return y * Math.sin(camNow.pitch) + z1 * Math.cos(camNow.pitch)
      }
      const isOccluded = (x: number, y: number, z: number): boolean => {
        if (viewZOf(x, y, z) >= 0) return false
        const p = project(x, y, z, camNow, w, h, worldScale)
        return Math.hypot(p.X - body.X, p.Y - body.Y) < rPx
      }

      // Caller-supplied generic tracks (e.g. ground track, trajectory):
      // drawn segment-by-segment so occluded stretches dim independently.
      for (const track of tracks) {
        const pts = track.points
        if (pts.length < 2) continue
        const color = track.color ?? '#f5f5f5'
        ctx.strokeStyle = color
        ctx.lineWidth = track.width ?? 1.5
        ctx.setLineDash(track.dash ?? [])
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i]!
          const b = pts[i + 1]!
          ctx.globalAlpha = isOccluded(...a) || isOccluded(...b) ? 0.25 : 1
          const pa = project(a[0], a[1], a[2], camNow, w, h, worldScale)
          const pb = project(b[0], b[1], b[2], camNow, w, h, worldScale)
          ctx.beginPath()
          ctx.moveTo(pa.X, pa.Y)
          ctx.lineTo(pb.X, pb.Y)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        ctx.setLineDash([])
      }

      // Caller-supplied labeled point markers
      for (const marker of pointMarkers) {
        const color = marker.color ?? '#f5f5f5'
        ctx.globalAlpha = isOccluded(marker.r[0], marker.r[1], marker.r[2]) ? 0.25 : 1
        const p = project(marker.r[0], marker.r[1], marker.r[2], camNow, w, h, worldScale)
        ctx.beginPath()
        ctx.arc(p.X, p.Y, 3, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#050506'
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.strokeStyle = '#050506'
        ctx.lineWidth = 3
        ctx.strokeText(marker.label, p.X + 7, p.Y - 6)
        ctx.fillStyle = color
        ctx.fillText(marker.label, p.X + 7, p.Y - 6)
        ctx.globalAlpha = 1
      }
    }

    const tick = () => {
      if (!alive) return
      draw()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [
    bodyColor,
    bodyR,
    extent,
    radii,
    resolvedArcs,
    escapePeriapsis,
    showEscapeCircularRef,
    tracks,
    pointMarkers,
  ])

  const zoomPct = Math.round(cam.zoom * 100)

  return (
    <div
      className={cn(
        'relative h-full min-h-0 w-full flex-1 overflow-hidden border border-border bg-bg',
        className,
      )}
      style={height != null ? { minHeight: height } : undefined}
    >
      {/* Overlay chrome: shared pattern with OrbitDiagram (no full-width bar) */}
      <div className="pointer-events-none absolute right-1.5 top-1.5 z-10 flex items-center gap-1">
        <span className="rounded border border-border/80 bg-bg/80 px-1.5 py-0.5 font-mono text-[10px] tabular text-muted backdrop-blur-sm">
          {zoomPct}%
        </span>
        <div className="pointer-events-auto flex items-center gap-0.5 rounded border border-border/80 bg-bg/85 p-0.5 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            aria-label={t('common.zoom_in')}
            onClick={() => zoomBy(1.2)}
            {...tooltipProps(
              t('common.zoom_in'),
              'inline-flex size-6 items-center justify-center text-muted transition-colors hover:bg-surface hover:text-fg',
              'below-end',
            )}
          >
            <Plus size={13} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={t('common.zoom_out')}
            onClick={() => zoomBy(1 / 1.2)}
            {...tooltipProps(
              t('common.zoom_out'),
              'inline-flex size-6 items-center justify-center text-muted transition-colors hover:bg-surface hover:text-fg',
              'below-end',
            )}
          >
            <Minus size={13} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={t('common.reset_view')}
            onClick={resetCam}
            {...tooltipProps(
              t('common.reset_view'),
              'inline-flex size-6 items-center justify-center text-muted transition-colors hover:bg-surface hover:text-fg',
              'below-end',
            )}
          >
            <RotateCcw size={13} aria-hidden />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
          const c = camRef.current
          drag.current = { x: e.clientX, y: e.clientY, yaw: c.yaw, pitch: c.pitch }
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const dx = e.clientX - drag.current.x
          const dy = e.clientY - drag.current.y
          setCam({
            yaw: drag.current.yaw + dx * 0.01,
            pitch: Math.min(1.2, Math.max(0.08, drag.current.pitch + dy * 0.01)),
            zoom: camRef.current.zoom,
          })
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onDoubleClick={resetCam}
      />
    </div>
  )
}
