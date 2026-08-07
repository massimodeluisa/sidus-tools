import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { tipForLabel } from '@/lib/fieldTips'
import { cn } from '@/lib/utils'

export type FieldProps = {
  /** Primary label (uppercase mono chrome). */
  label: string
  /**
   * Right side of the label row: unit select, static unit text, or empty.
   * Compact and non-shrinking so the label keeps readable width.
   */
  meta?: ReactNode
  /** Helper under the control. Empty still reserves the hint track for alignment. */
  hint?: string
  /** Native tooltip on the label (falls back to tipForLabel). */
  tip?: string
  /** Main control: input, select, custom. Stretched to full width. */
  children: ReactNode
  className?: string
  /**
   * Always reserve the hint row (default true) so adjacent fields in a grid
   * share baseline even when some omit `hint`.
   */
  reserveHint?: boolean
}

/**
 * Shared field chrome for PARAMETERS / forms.
 *
 * Three-track layout (label · control · hint). Label is never crushed by the
 * unit control: meta is shrink-0 and compact; label may wrap to 2 lines.
 *
 * ```
 * ┌──────────────────────────────┐
 * │ LABEL…              [unit]   │  min-h-6
 * │ ┌──────────────────────────┐ │
 * │ │ control (h-9)            │ │
 * │ └──────────────────────────┘ │
 * │ hint / reserved spacer       │
 * └──────────────────────────────┘
 * ```
 */
export function Field({
  label,
  meta,
  hint,
  tip,
  children,
  className,
  /**
   * Reserve the hint track so neighboring ParamsGrid cells share the same
   * control baseline. Default true: empty hints keep a fixed min height.
   * Set false only for intentional compact singles (rare).
   */
  reserveHint = true,
}: FieldProps) {
  const resolvedTip = tip ?? tipForLabel(label)
  const showHintTrack = reserveHint || Boolean(hint)
  // Full label always available via title (and tip if present)
  const titleText = [label, resolvedTip].filter(Boolean).join(': ')

  return (
    <div
      className={cn(
        // Auto-grow tracks: large text / accessibility zoom must not clip or overflow.
        // minmax keeps ParamsGrid cells roughly aligned when labels stay short.
        'grid min-w-0 max-w-full grid-rows-[minmax(2.5rem,auto)_minmax(2.75rem,auto)_minmax(1.15rem,auto)] gap-y-1.5',
        className,
      )}
    >
      {/* Track 1: label wraps; meta shrinks but never forces horizontal page overflow */}
      <div className="flex min-h-10 min-w-0 items-start justify-between gap-2">
        <span
          className={cn(
            'min-w-0 flex-1 font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-muted sm:text-[11px]',
            // Prefer wrap over ellipsis so "Initial P" stays readable
            'line-clamp-3 break-words hyphens-auto',
            resolvedTip && 'cursor-help',
          )}
          title={titleText}
        >
          {label}
        </span>
        {meta != null ? (
          <div className="flex min-h-6 max-w-[45%] shrink-0 items-center justify-end">
            {meta}
          </div>
        ) : (
          <div className="h-6 w-0 shrink-0" aria-hidden />
        )}
      </div>

      {/* Track 2: control — min height for 16px mobile type, grows if needed */}
      <div className="flex min-h-11 min-w-0 items-stretch sm:min-h-9 [&_input]:min-h-0 [&_input]:w-full [&_select]:min-h-0 [&_select]:w-full">
        {children}
      </div>

      {/* Track 3: hint — wrap long help text instead of overflowing */}
      {showHintTrack ? (
        <p
          className={cn(
            'min-h-[1.15rem] min-w-0 break-words font-mono text-[10px] leading-snug text-subtle',
            !hint && 'invisible select-none',
          )}
          aria-hidden={!hint || undefined}
        >
          {hint || '\u00a0'}
        </p>
      ) : (
        <div className="min-h-0" aria-hidden />
      )}
    </div>
  )
}

/** Full-width note cell for ParamsGrid (formulas, caveats, model limits). */
export function FieldNote({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        // Always full row: model notes must not sit in a single auto-fit cell
        'col-span-full min-w-0 border border-border/80 bg-bg-elevated/40 px-3 py-2.5',
        'font-mono text-[10px] leading-relaxed text-subtle sm:text-[11px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Full-width preset strip for ParamsGrid: labeled row of chips/buttons.
 * Always col-span-full so it never sits orphaned beside a half-width field.
 */
export function FieldPresets({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'col-span-full min-w-0 grid grid-rows-[minmax(1.5rem,auto)_auto] gap-y-1.5',
        className,
      )}
    >
      <p className="font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-muted sm:text-[11px]">
        {label}
      </p>
      <div className="flex min-h-9 flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

/** Shared chrome for preset chip buttons inside FieldPresets. */
export function PresetChip({
  active,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 shrink-0 items-center border px-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
        active
          ? 'border-border-strong bg-surface text-fg'
          : 'border-border-strong bg-bg-elevated text-muted hover:border-muted hover:text-fg',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  )
}

/** Static unit text for the Field meta slot (matches unit-select height). */
export function FieldMetaText({ children }: { children: ReactNode }) {
  return (
    <span
      className="max-w-[7rem] truncate font-mono text-[10px] uppercase tracking-wider text-subtle"
      title={typeof children === 'string' ? children : undefined}
    >
      {children}
    </span>
  )
}
