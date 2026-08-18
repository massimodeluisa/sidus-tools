import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Field } from '@/components/shared/Field'
import { tooltipProps } from '@/components/shared/tooltip'
import {
  formatEditableNumber,
  isPartialLocaleNumber,
  parseLocaleNumber,
} from '@/lib/localeNumber'
import { convertById, getUnit, unitsForCategory, type UnitCategory } from '@/lib/physics'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  /** Value expressed in `unitId` (not necessarily SI). */
  value: number
  unitId: string
  category: UnitCategory
  /** Optional allow-list of unit ids (order preserved). */
  unitIds?: readonly string[]
  onValueChange: (value: number) => void
  /**
   * Called when the user picks another unit.
   * `value` is already converted into the new unit.
   */
  onUnitChange: (unitId: string, convertedValue: number) => void
  hint?: string
  /** Short physical meaning: hover tooltip on the label (also in the DOM for AT / SEO). */
  tip?: string
  min?: number
  max?: number
  step?: string | number
  disabled?: boolean
  className?: string
  reserveHint?: boolean
}

/**
 * Number field + unit selector (shared Field chrome).
 * Changing the unit converts the displayed value via pure physics helpers.
 * While focused, intermediate strings like "1," / "1." are kept so the caret
 * does not jump. Parsing uses the active i18n locale (comma vs dot decimal).
 */
export function UiUnitField({
  label,
  value,
  unitId,
  category,
  unitIds,
  onValueChange,
  onUnitChange,
  hint,
  tip,
  min,
  max,
  step = 'any',
  disabled,
  className,
  reserveHint,
}: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language ?? 'en'
  const [draft, setDraft] = useState<string | null>(null)
  const options = (unitIds?.length
    ? unitIds.map((id) => getUnit(id)).filter(Boolean)
    : unitsForCategory(category)) as NonNullable<ReturnType<typeof getUnit>>[]

  const current = getUnit(unitId) ?? options[0]
  const effectiveId = current?.id ?? unitId
  const display =
    draft ?? (Number.isFinite(value) ? formatEditableNumber(value, locale) : '')

  function handleUnitSelect(nextId: string) {
    if (nextId === effectiveId) return
    const converted = convertById(value, effectiveId, nextId)
    setDraft(null)
    onUnitChange(nextId, converted)
  }

  // Compact unit chrome: short symbols (Pa, mm, K) must not steal label width
  // Tooltip lives on the <label>: ::before does not render on <select>
  const unitTip = t('common.unit_converts')
  const unitSelect = (
    <label
      {...tooltipProps(
        unitTip,
        'relative inline-flex min-h-7 max-w-full shrink-0 items-center overflow-visible',
        'above-end',
      )}
    >
      <span className="sr-only">{t('common.unit_for', { label })}</span>
      <select
        value={effectiveId}
        disabled={Boolean(disabled)}
        onChange={(e) => handleUnitSelect(e.target.value)}
        className={cn(
          // Always ≥16px — unit <select> also triggers iOS focus zoom
          'box-border h-7 w-auto min-w-[2.75rem] max-w-[5.5rem] cursor-pointer appearance-none border border-border-strong bg-surface py-0 pl-1.5 pr-5 sm:h-8',
          'font-mono text-base uppercase tracking-wider text-signal',
          'outline-none transition-colors hover:border-muted hover:text-fg',
          'focus:border-border-strong focus:text-fg',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {options.map((u) => (
          <option key={u.id} value={u.id}>
            {u.short}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 font-mono text-[8px] text-subtle"
      >
        ▾
      </span>
    </label>
  )

  return (
    <Field
      label={label}
      tip={tip}
      hint={hint}
      meta={unitSelect}
      reserveHint={reserveHint}
      className={className}
    >
      <input
        type="text"
        inputMode="decimal"
        value={display}
        min={min}
        max={max}
        step={step}
        disabled={Boolean(disabled)}
        onFocus={() =>
          setDraft(Number.isFinite(value) ? formatEditableNumber(value, locale) : '')
        }
        onBlur={() => {
          if (draft != null) {
            const n = parseLocaleNumber(draft, locale)
            if (n != null) onValueChange(n)
          }
          setDraft(null)
        }}
        onChange={(e) => {
          const s = e.target.value
          setDraft(s)
          if (isPartialLocaleNumber(s, locale)) return
          const n = parseLocaleNumber(s, locale)
          if (n != null) onValueChange(n)
        }}
        className={cn(
          'box-border h-full min-h-11 w-full min-w-0 border border-border bg-bg px-2.5 font-mono text-base tabular text-fg outline-none transition-colors sm:min-h-9',
          'placeholder:text-subtle focus:border-border-strong',
          'disabled:opacity-50',
        )}
      />
    </Field>
  )
}
