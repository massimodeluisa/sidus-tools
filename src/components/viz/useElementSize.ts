import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export type ElementSize = { width: number; height: number }

/**
 * Observe an element's content box (ResizeObserver).
 * Uses a callback ref so the observer always tracks the *live* DOM node
 * (critical when the measured element remounts after conditional renders).
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(
  minWidth = 1,
  minHeight = 1,
) {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })
  const [node, setNode] = useState<T | null>(null)
  const roRef = useRef<ResizeObserver | null>(null)

  const ref = useCallback((el: T | null) => {
    setNode(el)
  }, [])

  useLayoutEffect(() => {
    if (!node) return

    const apply = (w: number, h: number) => {
      const width = Math.max(minWidth, Math.floor(w))
      const height = Math.max(minHeight, Math.floor(h))
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      )
    }

    const rect = node.getBoundingClientRect()
    apply(rect.width, rect.height)

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const box = entry.contentBoxSize?.[0]
      if (box) {
        apply(box.inlineSize, box.blockSize)
      } else {
        apply(entry.contentRect.width, entry.contentRect.height)
      }
    })
    ro.observe(node)
    roRef.current = ro

    return () => {
      ro.disconnect()
      if (roRef.current === ro) roRef.current = null
    }
  }, [node, minHeight, minWidth])

  return {
    ref,
    width: size.width,
    height: size.height,
    ready: size.width > 0 && size.height > 0,
  }
}
