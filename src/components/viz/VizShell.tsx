import type { ReactNode } from 'react'
import { VizControls } from './VizControls'
import { useElementSize } from './useElementSize'
import { cn } from '@/lib/utils'

type Props = {
  /** Render plot given the measured plot-area size in CSS pixels. */
  children: (size: { width: number; height: number }) => ReactNode
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  scaleLabel?: string
  className?: string
  toolbarExtra?: ReactNode
}

/**
 * Controls + measured plot area. Height is driven by the parent Panel
 * (fixed compact height); width/height of the SVG area come from ResizeObserver.
 */
export function VizShell({
  children,
  onZoomIn,
  onZoomOut,
  onReset,
  scaleLabel,
  className,
  toolbarExtra,
}: Props) {
  const { ref, width, height, ready } = useElementSize<HTMLDivElement>(32, 32)

  return (
    <div
      className={cn(
        'viz-root flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-bg',
        className,
      )}
    >
      <VizControls
        variant="bar"
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onReset}
        scaleLabel={scaleLabel}
      />
      {toolbarExtra}
      <div ref={ref} className="relative min-h-0 w-full flex-1 overflow-hidden">
        {ready ? (
          children({ width, height })
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[11px] text-subtle">
            …
          </div>
        )}
      </div>
    </div>
  )
}
