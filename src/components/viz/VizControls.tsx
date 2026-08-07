import { Minus, Plus, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  scaleLabel?: string
  /** Shown only in `bar` variant (screen-reader always gets control labels). */
  hint?: string
  /**
   * `overlay`: floating corner buttons over the canvas (default for stacked orbit previews).
   * `bar`: full-width toolbar with hint text (function plots, standalone shells).
   */
  variant?: 'overlay' | 'bar'
  className?: string
}

export function VizControls({
  onZoomIn,
  onZoomOut,
  onReset,
  scaleLabel,
  hint = 'Scroll zoom · drag pan · double-click reset',
  variant = 'overlay',
  className,
}: Props) {
  if (variant === 'bar') {
    const showHint = Boolean(hint?.trim())
    return (
      <div
        className={cn(
          'flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-2 py-1.5',
          showHint ? 'justify-between' : 'justify-end',
          className,
        )}
      >
        {showHint ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{hint}</p>
        ) : null}
        <div className="flex items-center gap-1">
          {scaleLabel ? (
            <span className="mr-1 font-mono text-[10px] tabular text-muted">{scaleLabel}</span>
          ) : null}
          <IconBtn label="Zoom in" onClick={onZoomIn}>
            <Plus size={14} aria-hidden />
          </IconBtn>
          <IconBtn label="Zoom out" onClick={onZoomOut}>
            <Minus size={14} aria-hidden />
          </IconBtn>
          <IconBtn label="Reset view" onClick={onReset}>
            <RotateCcw size={14} aria-hidden />
          </IconBtn>
        </div>
      </div>
    )
  }

  // Overlay: no second “random” toolbar row: only corner chrome.
  return (
    <div
      className={cn(
        'pointer-events-none absolute right-1.5 top-1.5 z-10 flex items-center gap-1',
        className,
      )}
    >
      {scaleLabel ? (
        <span className="pointer-events-none mr-0.5 rounded border border-border/80 bg-bg/80 px-1.5 py-0.5 font-mono text-[10px] tabular text-muted backdrop-blur-sm">
          {scaleLabel}
        </span>
      ) : null}
      <div className="pointer-events-auto flex items-center gap-0.5 rounded border border-border/80 bg-bg/85 p-0.5 shadow-sm backdrop-blur-sm">
        <IconBtn label="Zoom in" onClick={onZoomIn} compact>
          <Plus size={13} aria-hidden />
        </IconBtn>
        <IconBtn label="Zoom out" onClick={onZoomOut} compact>
          <Minus size={13} aria-hidden />
        </IconBtn>
        <IconBtn label="Reset view" onClick={onReset} compact>
          <RotateCcw size={13} aria-hidden />
        </IconBtn>
      </div>
    </div>
  )
}

function IconBtn({
  label,
  onClick,
  children,
  compact,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  compact?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center text-muted transition-colors hover:border-border-strong hover:text-fg',
        compact
          ? 'size-6 border border-transparent hover:bg-surface'
          : 'size-7 border border-border bg-bg',
      )}
    >
      {children}
    </button>
  )
}
