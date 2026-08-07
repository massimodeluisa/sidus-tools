import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  title?: string
  children: ReactNode
  className?: string
}

/**
 * Solid card shell for tool panels (parameters, results, code, preview).
 * flex-1 body so paired PREVIEW/CODE stretch to the same row height.
 */
export function Panel({ title, children, className }: Props) {
  return (
    <section
      className={cn(
        // Design A density: equal padding on PARAMETERS / RESULTS / PREVIEW / CODE
        'sidus-card flex h-full min-h-0 min-w-0 flex-col p-3 sm:p-3.5',
        className,
      )}
    >
      {title ? (
        <h2 className="mb-2 min-w-0 shrink-0 break-words font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:mb-2.5 sm:text-[11px]">
          {title}
        </h2>
      ) : null}
      <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col">{children}</div>
    </section>
  )
}
