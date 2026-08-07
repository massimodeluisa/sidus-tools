import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /**
   * Column density:
   * - default: auto-fit, min 13.5rem (empty tracks collapse — no orphan voids)
   * - pair: 1 → 2 only (body + altitude style)
   * - dense: tighter min (12rem) for many short fields
   * - stack: always single column (wizards / long forms)
   */
  variant?: 'default' | 'pair' | 'dense' | 'stack'
}

/**
 * Responsive PARAMETERS layout for multi-field tools.
 *
 * Prefer **auto-fit** over auto-fill so unused columns collapse (avoids a lone
 * BodySelect sitting in a wide empty row). Full-width cells use FieldNote /
 * FieldPresets / UiVector3 with col-span-full.
 */
export function ParamsGrid({ children, className, variant = 'default' }: Props) {
  return (
    <div
      className={cn(
        'grid min-w-0 gap-x-4 gap-y-5',
        variant === 'stack' && 'grid-cols-1',
        variant === 'pair' && 'grid-cols-1 sm:grid-cols-2',
        // auto-fit: collapse empty tracks at every breakpoint
        variant === 'default' &&
          '[grid-template-columns:repeat(auto-fit,minmax(min(100%,13.5rem),1fr))]',
        variant === 'dense' &&
          '[grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))]',
        className,
      )}
    >
      {children}
    </div>
  )
}
