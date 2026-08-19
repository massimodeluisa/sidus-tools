import { useTranslation } from 'react-i18next'
import { Field } from '@/components/shared/Field'
import { formatInZone } from '@/lib/timezone'
import {
  fromUtcDatetimeLocalValue,
  nowUtcIso,
  toUtcDatetimeLocalValue,
} from '@/lib/utcInput'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  /** Free-text ISO-8601 (or empty when emptyMeansNow). */
  value: string
  onChange: (iso: string) => void
  /** Resolved instant used for picker sync + hint (e.g. empty → now). */
  resolved: Date
  tip?: string
  /** When true, empty value means “use now” (default). */
  emptyMeansNow?: boolean
  className?: string
}

/**
 * UTC epoch field: a single `datetime-local` (UTC) picker + Now / Clear.
 * The picker always writes canonical ISO UTC; the hint line echoes the
 * resolved instant as ISO and as a readable UTC date/time.
 */
export function UiUtcField({
  label,
  value,
  onChange,
  resolved,
  tip,
  emptyMeansNow = true,
  className,
}: Props) {
  const { t, i18n } = useTranslation()
  const pickerValue = toUtcDatetimeLocalValue(resolved)
  const readable = formatInZone(resolved, 'UTC', i18n.language)
  const echo = `${resolved.toISOString()} · ${readable.date} ${readable.time} UTC`
  const hint = emptyMeansNow && !value.trim() ? `${t('fields.utc_empty_now')} · ${echo}` : echo

  return (
    <div className={cn('col-span-full min-w-0', className)}>
      <Field label={label} tip={tip} hint={hint} reserveHint>
        <div className="flex min-w-0 flex-1 items-stretch gap-2">
          <input
            type="datetime-local"
            step={1}
            value={pickerValue}
            onChange={(e) => {
              const v = e.target.value
              if (!v) {
                if (emptyMeansNow) onChange('')
                return
              }
              onChange(fromUtcDatetimeLocalValue(v))
            }}
            className="h-full min-w-0 flex-1 border border-border bg-bg px-2.5 font-mono text-base tabular text-white outline-none transition-colors focus:border-border-strong [color-scheme:dark]"
          />
          <button
            type="button"
            onClick={() => onChange(nowUtcIso())}
            className="inline-flex h-9 shrink-0 items-center border border-border-strong bg-bg-elevated px-3 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-fg"
          >
            {t('fields.utc_now')}
          </button>
          {emptyMeansNow && value.trim() ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex h-9 shrink-0 items-center border border-border px-3 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-fg"
            >
              {t('fields.utc_clear_now')}
            </button>
          ) : null}
        </div>
      </Field>
    </div>
  )
}
