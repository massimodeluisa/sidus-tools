import { useTranslation } from 'react-i18next'
import { Field } from '@/components/shared/Field'
import { tooltipProps } from '@/components/shared/tooltip'
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
 * UTC epoch field: free-form ISO text + datetime-local picker (UTC) + Now.
 * Free typing stays unconstrained; the picker always writes canonical ISO UTC.
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
  const { t } = useTranslation()
  const pickerValue = toUtcDatetimeLocalValue(resolved)
  const hint = emptyMeansNow && !value.trim()
    ? `${t('fields.utc_empty_now')} · ${resolved.toISOString()}`
    : resolved.toISOString()

  return (
    <div className={cn('col-span-full min-w-0 space-y-2', className)}>
      <Field label={label} tip={tip} hint={hint} reserveHint>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={emptyMeansNow ? t('fields.utc_empty_now') : 'YYYY-MM-DDTHH:mm:ss.sssZ'}
          className="h-full w-full border border-border bg-bg px-2.5 font-mono text-base tabular text-fg outline-none transition-colors placeholder:text-subtle focus:border-border-strong"
        />
      </Field>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {t('fields.utc_picker')}
          </span>
          <span
            {...tooltipProps(
              t('fields.utc_picker_hint'),
              'min-w-0 flex-1',
            )}
          >
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
              className="h-9 min-w-0 w-full border border-border bg-bg px-2.5 font-mono text-base tabular text-white outline-none transition-colors focus:border-border-strong [color-scheme:dark]"
            />
          </span>
        </label>
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
    </div>
  )
}
