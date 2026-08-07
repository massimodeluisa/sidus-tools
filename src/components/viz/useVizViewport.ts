import { useCallback, useEffect, useRef, useState } from 'react'

export type VizViewport = {
  scale: number
  panX: number
  panY: number
}

const DEFAULT: VizViewport = { scale: 1, panX: 0, panY: 0 }

/**
 * Wheel zoom (toward cursor) + drag pan for SVG viz.
 * Double-click / reset() restores fit view.
 *
 * Wheel uses a non-passive native listener (React onWheel alone cannot reliably
 * preventDefault, and an empty preventDefault-only listener was blocking zoom).
 */
export function useVizViewport(viewW: number, viewH: number = viewW) {
  const [vp, setVp] = useState<VizViewport>(DEFAULT)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement | null>(null)
  const vpRef = useRef(vp)
  vpRef.current = vp

  const reset = useCallback(() => setVp(DEFAULT), [])

  const zoomAbout = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      const svg = svgRef.current
      let mx = viewW / 2
      let my = viewH / 2
      if (svg && clientX != null && clientY != null) {
        const rect = svg.getBoundingClientRect()
        mx = ((clientX - rect.left) / Math.max(1, rect.width)) * viewW
        my = ((clientY - rect.top) / Math.max(1, rect.height)) * viewH
      }
      setVp((prev) => {
        const nextScale = Math.min(32, Math.max(0.25, prev.scale * factor))
        const worldX = (mx - prev.panX) / prev.scale
        const worldY = (my - prev.panY) / prev.scale
        return {
          scale: nextScale,
          panX: mx - worldX * nextScale,
          panY: my - worldY * nextScale,
        }
      })
    },
    [viewH, viewW],
  )

  // Non-passive wheel: zoom + prevent page scroll
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const factor = e.deltaY > 0 ? 0.88 : 1.14
      // Inline zoom (same as zoomAbout) so we have client coords
      let mx = viewW / 2
      let my = viewH / 2
      const rect = el.getBoundingClientRect()
      mx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * viewW
      my = ((e.clientY - rect.top) / Math.max(1, rect.height)) * viewH
      setVp((prev) => {
        const nextScale = Math.min(32, Math.max(0.25, prev.scale * factor))
        const worldX = (mx - prev.panX) / prev.scale
        const worldY = (my - prev.panY) / prev.scale
        return {
          scale: nextScale,
          panX: mx - worldX * nextScale,
          panY: my - worldY * nextScale,
        }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [viewH, viewW])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const dx = ((e.clientX - last.current.x) / Math.max(1, rect.width)) * viewW
      const dy = ((e.clientY - last.current.y) / Math.max(1, rect.height)) * viewH
      last.current = { x: e.clientX, y: e.clientY }
      setVp((prev) => ({
        ...prev,
        panX: prev.panX + dx,
        panY: prev.panY + dy,
      }))
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

  const transform = `translate(${vp.panX} ${vp.panY}) scale(${vp.scale})`

  return {
    svgRef,
    vp,
    setVp,
    transform,
    reset,
    zoomAbout,
    handlers: {
      // wheel handled natively above: do not attach React onWheel (duplicate)
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onDoubleClick,
    },
  }
}
