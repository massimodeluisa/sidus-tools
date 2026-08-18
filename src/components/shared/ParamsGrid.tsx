import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /**
   * Column density (container queries vs panel width, not the viewport):
   * - default: 1 → 2 → 3 as the PARAMETERS card grows
   * - pair: 1 → 2 only (body + altitude style)
   * - dense: 2/3 columns a bit earlier (short fields)
   * - stack: always single column (wizards / long forms)
   */
  variant?: 'default' | 'pair' | 'dense' | 'stack'
}

/**
 * Responsive PARAMETERS layout for multi-field tools.
 *
 * Columns follow the panel width (`@container`), so a half-width PARAMETERS
 * card still gets 2 columns. Full-width cells use FieldNote / FieldPresets /
 * UiVector3 with col-span-full.
 */
export function ParamsGrid({ children, className, variant = 'default' }: Props) {
  return (
    <div className={cn('@container min-w-0', className)}>
      <div
        className={cn(
          'grid min-w-0 gap-x-4 gap-y-5',
          variant === 'stack' && 'grid-cols-1',
          variant === 'pair' && 'grid-cols-1 @xs:grid-cols-2',
          variant === 'default' && 'grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-3',
          variant === 'dense' && 'grid-cols-1 @xs:grid-cols-2 @lg:grid-cols-3',
        )}
      >
        {children}
      </div>
    </div>
  )
}
