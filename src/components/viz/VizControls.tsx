import { useTranslation } from 'react-i18next'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { tooltipProps, type TipPlacement } from '@/components/shared/tooltip'
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
  hint,
  variant = 'overlay',
  className,
}: Props) {
  const { t } = useTranslation()
  const zoomIn = t('common.zoom_in')
  const zoomOut = t('common.zoom_out')
  const resetView = t('common.reset_view')
  const resolvedHint = hint === undefined ? t('common.viz_hint') : hint
  if (variant === 'bar') {
    const showHint = Boolean(resolvedHint?.trim())
    return (
      <div
        className={cn(
          'flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-2 py-1.5',
          showHint ? 'justify-between' : 'justify-end',
          className,
        )}
      >
        {showHint ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{resolvedHint}</p>
        ) : null}
        <div className="flex items-center gap-1">
          {scaleLabel ? (
            <span className="mr-1 font-mono text-[10px] tabular text-muted">{scaleLabel}</span>
          ) : null}
          <IconBtn label={zoomIn} onClick={onZoomIn}>
            <Plus size={14} aria-hidden />
          </IconBtn>
          <IconBtn label={zoomOut} onClick={onZoomOut}>
            <Minus size={14} aria-hidden />
          </IconBtn>
          <IconBtn label={resetView} onClick={onReset}>
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
        <IconBtn label={zoomIn} onClick={onZoomIn} compact placement="below-end">
          <Plus size={13} aria-hidden />
        </IconBtn>
        <IconBtn label={zoomOut} onClick={onZoomOut} compact placement="below-end">
          <Minus size={13} aria-hidden />
        </IconBtn>
        <IconBtn label={resetView} onClick={onReset} compact placement="below-end">
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
  placement = 'above',
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  compact?: boolean
  placement?: TipPlacement
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      {...tooltipProps(
        label,
        cn(
          'flex items-center justify-center text-muted transition-colors hover:border-border-strong hover:text-fg',
          compact
            ? 'size-6 border border-transparent hover:bg-surface'
            : 'size-7 border border-border bg-bg',
        ),
        placement,
      )}
    >
      {children}
    </button>
  )
}
