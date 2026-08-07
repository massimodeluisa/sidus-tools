import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type DataDomain = {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export type PlotBox = {
  ml: number
  mt: number
  plotW: number
  plotH: number
}

const MIN_ZOOM = 0.25
const MAX_ZOOM = 64

function spans(d: DataDomain) {
  return {
    x: Math.max(d.xMax - d.xMin, 1e-15),
    y: Math.max(d.yMax - d.yMin, 1e-15),
  }
}

function domainKey(d: DataDomain | null): string {
  if (!d) return ''
  return `${d.xMin}|${d.xMax}|${d.yMin}|${d.yMax}`
}

function clampWindow(win: DataDomain, full: DataDomain): DataDomain {
  const fs = spans(full)
  const minSpanX = fs.x / MAX_ZOOM
  const minSpanY = fs.y / MAX_ZOOM
  const maxSpanX = fs.x / MIN_ZOOM
  const maxSpanY = fs.y / MIN_ZOOM

  const xSpan = Math.min(maxSpanX, Math.max(minSpanX, win.xMax - win.xMin))
  const ySpan = Math.min(maxSpanY, Math.max(minSpanY, win.yMax - win.yMin))

  const cx = (win.xMin + win.xMax) / 2
  const cy = (win.yMin + win.yMax) / 2
  return {
    xMin: cx - xSpan / 2,
    xMax: cx + xSpan / 2,
    yMin: cy - ySpan / 2,
    yMax: cy + ySpan / 2,
  }
}

/**
 * Scientific plot viewport: zoom/pan in *data* space.
 * Axes stay fixed in pixel space; only the visible domain changes.
 */
export function useDataDomain(full: DataDomain | null, box: PlotBox, viewW: number, viewH: number) {
  const [window, setWindow] = useState<DataDomain | null>(null)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement | null>(null)
  const fullRef = useRef(full)
  const boxRef = useRef(box)
  const windowRef = useRef(window)
  fullRef.current = full
  boxRef.current = box
  windowRef.current = window

  // Reset zoom/pan *synchronously* when the data domain changes (avoids one-frame stale window).
  const fullKey = domainKey(full)
  const [seenKey, setSeenKey] = useState(fullKey)
  if (fullKey !== seenKey) {
    setSeenKey(fullKey)
    if (window !== null) setWindow(null)
  }

  const domain = (fullKey === seenKey ? window : null) ?? full

  const scale = useMemo(() => {
    if (!full || !domain) return 1
    const fs = spans(full)
    const ws = spans(domain)
    return Math.sqrt((fs.x / ws.x) * (fs.y / ws.y))
  }, [domain, full])

  const clientToData = useCallback(
    (clientX: number, clientY: number, d: DataDomain): { x: number; y: number } => {
      const svg = svgRef.current
      const b = boxRef.current
      if (!svg) {
        return { x: (d.xMin + d.xMax) / 2, y: (d.yMin + d.yMax) / 2 }
      }
      const rect = svg.getBoundingClientRect()
      const px = ((clientX - rect.left) / Math.max(1, rect.width)) * viewW
      const py = ((clientY - rect.top) / Math.max(1, rect.height)) * viewH
      const sp = spans(d)
      const x = d.xMin + ((px - b.ml) / Math.max(1, b.plotW)) * sp.x
      const y = d.yMax - ((py - b.mt) / Math.max(1, b.plotH)) * sp.y
      return { x, y }
    },
    [viewH, viewW],
  )

  const reset = useCallback(() => setWindow(null), [])

  const zoomAbout = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      const f = fullRef.current
      if (!f) return
      const prev = windowRef.current ?? f

      const shrink = 1 / factor
      let focusX: number
      let focusY: number
      if (clientX != null && clientY != null) {
        const p = clientToData(clientX, clientY, prev)
        focusX = p.x
        focusY = p.y
      } else {
        const b = boxRef.current
        const svg = svgRef.current
        if (svg) {
          const rect = svg.getBoundingClientRect()
          const cx = rect.left + ((b.ml + b.plotW / 2) / viewW) * rect.width
          const cy = rect.top + ((b.mt + b.plotH / 2) / viewH) * rect.height
          const p = clientToData(cx, cy, prev)
          focusX = p.x
          focusY = p.y
        } else {
          focusX = (prev.xMin + prev.xMax) / 2
          focusY = (prev.yMin + prev.yMax) / 2
        }
      }

      const sp = spans(prev)
      const nx = sp.x * shrink
      const ny = sp.y * shrink
      const rx = (focusX - prev.xMin) / sp.x
      const ry = (focusY - prev.yMin) / sp.y
      const next = clampWindow(
        {
          xMin: focusX - rx * nx,
          xMax: focusX + (1 - rx) * nx,
          yMin: focusY - ry * ny,
          yMax: focusY + (1 - ry) * ny,
        },
        f,
      )
      setWindow(next)
    },
    [clientToData, viewH, viewW],
  )

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const factor = e.deltaY > 0 ? 1 / 1.14 : 1.14
      zoomAbout(factor, e.clientX, e.clientY)
    },
    [zoomAbout],
  )

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !svgRef.current) return
      const f = fullRef.current
      if (!f) return
      const prev = windowRef.current ?? f
      const rect = svgRef.current.getBoundingClientRect()
      const dxPx = ((e.clientX - last.current.x) / Math.max(1, rect.width)) * viewW
      const dyPx = ((e.clientY - last.current.y) / Math.max(1, rect.height)) * viewH
      last.current = { x: e.clientX, y: e.clientY }

      const b = boxRef.current
      const sp = spans(prev)
      const dX = -(dxPx / Math.max(1, b.plotW)) * sp.x
      const dY = (dyPx / Math.max(1, b.plotH)) * sp.y

      setWindow({
        xMin: prev.xMin + dX,
        xMax: prev.xMax + dX,
        yMin: prev.yMin + dY,
        yMax: prev.yMax + dY,
      })
    },
    [viewH, viewW],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false
    try {
      ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }, [])

  const onDoubleClick = useCallback(() => reset(), [reset])

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const block = (ev: WheelEvent) => {
      ev.preventDefault()
    }
    el.addEventListener('wheel', block, { passive: false })
    return () => el.removeEventListener('wheel', block)
  })

  return {
    svgRef,
    domain,
    scale,
    reset,
    zoomAbout,
    handlers: {
      onWheel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onDoubleClick,
    },
  }
}
