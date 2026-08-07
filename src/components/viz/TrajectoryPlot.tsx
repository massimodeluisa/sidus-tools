/**
 * Trajectory plot: ECI/trajectory points in a **uniform** XY projection.
 * Body radius is drawn to the same scale as the path (engineering-correct).
 */

import { useId, useMemo } from 'react'
import { useElementSize } from './useElementSize'
import { useVizViewport } from './useVizViewport'
import { VizControls } from './VizControls'
import type { Vec3 } from '@/lib/physics'

type Props = {
  points: Vec3[]
  markers?: { r: Vec3; label: string }[]
  /** Central body radius [m]: drawn to scale. Omit for no body disk. */
  bodyR?: number
  className?: string
  defaultHeight?: number
  title?: string
  /** Shown under controls (e.g. "ECI · XY projection"). */
  subtitle?: string
}

export function TrajectoryPlot({
  points,
  markers = [],
  bodyR = 0,
  className = '',
  defaultHeight: _dh,
  title = 'trajectory',
  subtitle = 'ECI · XY plane (z ignored) · uniform scale',
}: Props) {
  void _dh
  const uid = useId().replace(/:/g, '')
  const { ref, width, height, ready } = useElementSize<HTMLDivElement>(1, 1)
  const S = Math.max(120, Math.floor(Math.min(width || 300, height || 300)))
  const { svgRef, vp, transform, reset, zoomAbout, handlers } = useVizViewport(S, S)

  const geom = useMemo(() => {
    const cx = S / 2
    const cy = S / 2
    const pad = S * 0.1
    const half = S / 2 - pad

    const xy = points
      .map((p) => ({ x: p[0], y: p[1] }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    const extras = markers
      .map((m) => ({ x: m.r[0], y: m.r[1] }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    const all = [...xy, ...extras]

    let maxR = bodyR > 0 ? bodyR : 1
    for (const p of all) maxR = Math.max(maxR, Math.hypot(p.x, p.y))
    if (!(maxR > 0)) maxR = 1

    const k = half / maxR
    // Physics +y up → SVG −y
    const toPx = (x: number, y: number) => ({
      x: cx + x * k,
      y: cy - y * k,
    })

    const pathD = xy
      .map((p, i) => {
        const q = toPx(p.x, p.y)
        return `${i === 0 ? 'M' : 'L'}${q.x.toFixed(2)},${q.y.toFixed(2)}`
      })
      .join(' ')

    return {
      pathD,
      markers: markers.map((m) => {
        const q = toPx(m.r[0], m.r[1])
        return { x: q.x, y: q.y, label: m.label }
      }),
      bodyPx: bodyR > 0 ? Math.max(3, bodyR * k) : 0,
      cx,
      cy,
      maxR,
    }
  }, [S, bodyR, markers, points])

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
            data-viz="trajectory"
            viewBox={`0 0 ${S} ${S}`}
            width="100%"
            height="100%"
            className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={title}
            {...handlers}
          >
            <defs>
              <radialGradient id={`tg-${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-fg)" stopOpacity="0.05" />
                <stop offset="70%" stopColor="var(--color-fg)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={S} height={S} fill="var(--color-bg)" />
            <g transform={transform}>
              <circle
                cx={geom.cx}
                cy={geom.cy}
                r={S * 0.42}
                fill={`url(#tg-${uid})`}
              />
              {geom.bodyPx > 0 ? (
                <circle
                  cx={geom.cx}
                  cy={geom.cy}
                  r={geom.bodyPx}
                  fill="var(--color-surface-hover)"
                  stroke="var(--color-fg)"
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>Central body (to scale)</title>
                </circle>
              ) : (
                <circle
                  cx={geom.cx}
                  cy={geom.cy}
                  r={3}
                  fill="var(--color-fg)"
                />
              )}
              {geom.pathD ? (
                <path
                  d={geom.pathD}
                  fill="none"
                  stroke="var(--color-signal)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
              {geom.markers.map((m) => (
                <g key={m.label}>
                  <circle cx={m.x} cy={m.y} r={4} fill="var(--color-fg)" />
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
