import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

/**
 * Visual CSS tooltip + DOM-resident copy for AT / SEO / GEO.
 *
 * `alt` is valid only on images. For labels and controls the analogue is:
 * - visible text or `aria-label` (accessible name)
 * - `aria-describedby` → real HTML (`.sr-only`) when the tip is extra meaning
 * - `data-tip` + `.sidus-tooltip` for the styled hover/focus bubble
 *
 * CSS `content: attr(data-tip)` is not in the accessibility tree and is a
 * weak signal for crawlers — do not rely on it alone.
 *
 * Do not put `.sidus-tooltip` on replaced elements (`input`, `select`):
 * `::before` / `::after` do not render there. Wrap them instead.
 */

export type TipPlacement =
  | 'above'
  | 'below'
  | 'above-start'
  | 'above-end'
  | 'below-start'
  | 'below-end'

const PLACEMENT_CLASS: Record<TipPlacement, string> = {
  above: '',
  below: 'sidus-tooltip-below',
  'above-start': 'sidus-tooltip-start',
  'above-end': 'sidus-tooltip-end',
  'below-start': 'sidus-tooltip-below sidus-tooltip-start',
  'below-end': 'sidus-tooltip-below sidus-tooltip-end',
}

export function tooltipProps(
  text: string | undefined,
  className?: string,
  placement: TipPlacement = 'above',
) {
  const tip = text?.trim()
  if (!tip) return { className }
  return {
    'data-tip': tip,
    className: cn('sidus-tooltip', PLACEMENT_CLASS[placement], className),
  }
}

export function mergeDescribedBy(
  existing: string | undefined,
  id: string | undefined,
): string | undefined {
  const ids = [existing, id]
    .flatMap((s) => (s ? s.split(/\s+/) : []))
    .filter(Boolean)
  return ids.length ? Array.from(new Set(ids)).join(' ') : undefined
}

type TooltipLabelProps = {
  /** Extra meaning (not the accessible name). Omitted → no tooltip. */
  tip?: string | null
  children: ReactNode
  className?: string
  /** Optional id shared with a form control's aria-describedby. */
  describeId?: string
  placement?: TipPlacement
}

/**
 * Label/control chrome: styled tooltip plus a hidden DOM sentence for
 * screen readers and HTML consumers (search / generative engines).
 */
export function TooltipLabel({
  tip,
  children,
  className,
  describeId,
  placement = 'above-start',
}: TooltipLabelProps) {
  const autoId = useId()
  const id = describeId ?? autoId
  const text = tip?.trim()
  if (!text) {
    return <span className={className}>{children}</span>
  }
  return (
    <span className={cn('relative min-w-0 max-w-full overflow-visible', className)}>
      <span
        className={cn(
          'sidus-tooltip inline-block max-w-full min-w-0 cursor-help overflow-visible',
          PLACEMENT_CLASS[placement],
        )}
        data-tip={text}
        aria-describedby={id}
      >
        {children}
      </span>
      <span id={id} className="sr-only">
        {text}
      </span>
    </span>
  )
}

/** Attach aria-describedby to a single element child (input, select, …). */
export function describeControl(children: ReactNode, describeId?: string): ReactNode {
  if (!describeId || !isValidElement(children)) return children
  const child = children as ReactElement<{ 'aria-describedby'?: string }>
  return cloneElement(child, {
    'aria-describedby': mergeDescribedBy(child.props['aria-describedby'], describeId),
  })
}

/** No-op kept so older imports compile; tips live on labels via TooltipLabel. */
export function FieldTip(_props: { text: string; className?: string }) {
  return null
}
