import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export function Chip({ children, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 border px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
        active
          ? 'border-border-strong bg-surface text-fg'
          : 'border-border bg-transparent text-muted hover:text-fg',
      )}
    >
      {children}
    </button>
  )
}
