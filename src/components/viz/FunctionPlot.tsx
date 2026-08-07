/**
 * Function plot fills the parent card (1-col width, tall).
 * Zoom/pan adjusts the *data domain*: axes & ticks stay fixed in pixel space
 * and are recomputed for the visible window (not a CSS/SVG group transform).
 *
 * Layout shell (size observer) stays mounted even when there are no points,
 * so ResizeObserver never goes stale after expression edits.
 */

import { useId, useMemo } from 'react'
import { useElementSize } from './useElementSize'
import { useDataDomain, type DataDomain } from './useDataDomain'
import { VizControls } from './VizControls'

export type PlotPoint = { x: number; y: number }

type Props = {
  points: PlotPoint[]
  className?: string
  xLabel?: string
  yLabel?: string
  defaultHeight?: number
}

function fmtTick(n: number): string {
  if (!Number.isFinite(n)) return ': '
  if (Math.abs(n) < 1e-12) return '0'
  const a = Math.abs(n)
  if (a >= 1e4 || (a > 0 && a < 1e-3)) return n.toExponential(1)
  if (a >= 100) return n.toFixed(0)
  if (a >= 10) return n.toFixed(0)
  if (a >= 1) return n.toFixed(1)
  return n.toPrecision(3)
}

function buildSegments(
  pts: PlotPoint[],
  sx: (x: number) => number,
  sy: (y: number) => number,
  yMin: number,
  yMax: number,
): string[] {
  if (pts.length < 2) return []
  const dys: number[] = []
  for (let i = 1; i < pts.length; i++) {
    const dy = Math.abs(pts[i].y - pts[i - 1].y)
    if (Number.isFinite(dy)) dys.push(dy)
  }
  dys.sort((a, b) => a - b)
  const medianDy = dys.length ? dys[Math.floor(dys.length / 2)] : 1
  const ySpan = Math.max(yMax - yMin, 1e-12)
  const jumpThresh = Math.max(medianDy * 14, ySpan * 0.4)

  const segs: string[] = []
  let d = ''
  let open = false
  let prev: PlotPoint | null = null
  const flush = () => {
    if (open && d) segs.push(d)
    d = ''
    open = false
    prev = null
  }

  for (const p of pts) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      flush()
      continue
    }
    if (prev && Math.abs(p.y - prev.y) > jumpThresh) flush()
    const x = sx(p.x)
    const y = sy(p.y)
    if (!open) {
      d = `M${x.toFixed(2)},${y.toFixed(2)}`
      open = true
    } else {
      d += `L${x.toFixed(2)},${y.toFixed(2)}`
    }
    prev = p
  }
  flush()
  return segs
}

function niceTicks(min: number, max: number, count: number): number[] {
  if (!(max > min)) return [min]
  const span = max - min
  const raw = span / Math.max(1, count)
  const pow = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-12)))
  const err = raw / pow
  const step = (err >= 5 ? 5 : err >= 2 ? 2 : 1) * pow
  const start = Math.ceil((min - step * 1e-9) / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + step * 1e-9; v += step) {
    const t = Math.abs(v) < step * 1e-9 ? 0 : Number(v.toPrecision(12))
    ticks.push(t)
    if (ticks.length > 16) break
  }
  return ticks
}

function makeMaps(domain: DataDomain, ml: number, mt: number, plotW: number, plotH: number) {
  const dx = domain.xMax - domain.xMin || 1
  const dy = domain.yMax - domain.yMin || 1
  return {
    sx: (x: number) => ml + ((x - domain.xMin) / dx) * plotW,
    sy: (y: number) => mt + ((domain.yMax - y) / dy) * plotH,
  }
}

export function FunctionPlot({
  points,
  className = '',
  xLabel = 'x',
  yLabel = 'y',
  defaultHeight: _dh,
}: Props) {
  void _dh
  const uid = useId().replace(/:/g, '')
  const { ref, width, height, ready } = useElementSize<HTMLDivElement>(1, 1)

  const W = Math.max(120, Math.floor(width))
  const H = Math.max(100, Math.floor(height))

  const ML = Math.round(Math.min(56, Math.max(44, W * 0.12)))
  const MR = 14
  const MT = 18
  const MB = Math.round(Math.min(44, Math.max(32, H * 0.14)))
  const plotW = Math.max(20, W - ML - MR)
  const plotH = Math.max(20, H - MT - MB)

  const fullDomain = useMemo((): (DataDomain & { valid: PlotPoint[] }) | null => {
    const valid = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    if (valid.length < 2) return null
    let xMin = Infinity
    let xMax = -Infinity
    let yMin = Infinity
    let yMax = -Infinity
    for (const p of valid) {
      xMin = Math.min(xMin, p.x)
      xMax = Math.max(xMax, p.x)
      yMin = Math.min(yMin, p.y)
      yMax = Math.max(yMax, p.y)
    }
    if (xMax === xMin) {
      xMin -= 1
      xMax += 1
    }
    if (yMax === yMin) {
      yMin -= 1
      yMax += 1
    }
    const yPad = (yMax - yMin) * 0.08 || 0.1
    return {
      valid,
      xMin,
      xMax,
      yMin: yMin - yPad,
      yMax: yMax + yPad,
    }
  }, [points])

  const box = useMemo(
    () => ({ ml: ML, mt: MT, plotW, plotH }),
    [ML, MT, plotW, plotH],
  )

  const { svgRef, domain, scale, reset, zoomAbout, handlers } = useDataDomain(
    fullDomain,
    box,
    ready ? W : 300,
    ready ? H : 200,
  )

  const maps = useMemo(() => {
    if (!domain) return null
    return makeMaps(domain, ML, MT, plotW, plotH)
  }, [ML, MT, domain, plotH, plotW])

  const segments = useMemo(() => {
    if (!fullDomain || !maps || !domain) return []
    return buildSegments(fullDomain.valid, maps.sx, maps.sy, domain.yMin, domain.yMax)
  }, [domain, fullDomain, maps])

  const xTicks = domain ? niceTicks(domain.xMin, domain.xMax, Math.max(4, Math.round(W / 90))) : []
  const yTicks = domain ? niceTicks(domain.yMin, domain.yMax, Math.max(4, Math.round(H / 48))) : []
  const zeroX =
    domain && maps && domain.xMin < 0 && domain.xMax > 0 ? maps.sx(0) : null
  const zeroY =
    domain && maps && domain.yMin < 0 && domain.yMax > 0 ? maps.sy(0) : null

  const hasPlot = Boolean(fullDomain && domain && maps)

  return (
    <div className={`flex h-full min-h-0 w-full flex-1 flex-col ${className}`}>
      <VizControls
        variant="bar"
        onZoomIn={() => zoomAbout(1.2)}
        onZoomOut={() => zoomAbout(1 / 1.2)}
        onReset={reset}
        scaleLabel={`${(scale * 100).toFixed(0)}%`}
      />
      {/* Size observer shell: always mounted so RO never tracks a detached node */}
      <div ref={ref} className="relative min-h-0 w-full flex-1 bg-bg">
        {!hasPlot ? (
          <div className="flex h-full items-center justify-center font-mono text-sm text-muted">
            No plottable points
          </div>
        ) : ready && W > 40 && H > 40 && maps && domain ? (
          <svg
            ref={svgRef}
            data-viz="function-plot"
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height="100%"
            className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
            preserveAspectRatio="none"
            role="img"
            aria-label="Function plot"
            {...handlers}
          >
            <defs>
              <clipPath id={`plot-clip-${uid}`}>
                <rect x={ML} y={MT} width={plotW} height={plotH} />
              </clipPath>
            </defs>
            <rect width={W} height={H} fill="var(--color-bg)" />

            <text
              x={ML}
              y={13}
              fill="var(--color-subtle)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              {yLabel}
            </text>
            <text
              x={W - MR}
              y={H - 6}
              textAnchor="end"
              fill="var(--color-subtle)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              {xLabel}
            </text>

            {yTicks.map((y) => {
              const py = maps.sy(y)
              if (py < MT - 1 || py > MT + plotH + 1) return null
              return (
                <g key={`yt-${y}`}>
                  <line
                    x1={ML}
                    y1={py}
                    x2={W - MR}
                    y2={py}
                    stroke="var(--color-border)"
                    strokeWidth={1}
                  />
                  <text
                    x={ML - 6}
                    y={py + 3.5}
                    textAnchor="end"
                    fill="var(--color-subtle)"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                  >
                    {fmtTick(y)}
                  </text>
                </g>
              )
            })}
            {xTicks.map((x) => {
              const px = maps.sx(x)
              if (px < ML - 1 || px > ML + plotW + 1) return null
              return (
                <g key={`xt-${x}`}>
                  <line
                    x1={px}
                    y1={MT}
                    x2={px}
                    y2={H - MB}
                    stroke="var(--color-border)"
                    strokeWidth={1}
                  />
                  <text
                    x={px}
                    y={H - MB + 16}
                    textAnchor="middle"
                    fill="var(--color-subtle)"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                  >
                    {fmtTick(x)}
                  </text>
                </g>
              )
            })}

            {zeroX != null && zeroX >= ML && zeroX <= ML + plotW ? (
              <line
                x1={zeroX}
                y1={MT}
                x2={zeroX}
                y2={H - MB}
                stroke="var(--color-border-strong)"
                strokeWidth={1.15}
              />
            ) : null}
            {zeroY != null && zeroY >= MT && zeroY <= MT + plotH ? (
              <line
                x1={ML}
                y1={zeroY}
                x2={W - MR}
                y2={zeroY}
                stroke="var(--color-border-strong)"
                strokeWidth={1.15}
              />
            ) : null}

            <rect
              x={ML}
              y={MT}
              width={plotW}
              height={plotH}
              fill="none"
              stroke="var(--color-border-strong)"
              strokeWidth={1}
            />

            <g clipPath={`url(#plot-clip-${uid})`}>
              {segments.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="var(--color-signal)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
            </g>
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[11px] text-subtle">
            …
          </div>
        )}
      </div>
    </div>
  )
}
