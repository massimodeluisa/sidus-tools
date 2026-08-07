import { useEffect, useMemo, useState } from 'react'
import { tipForLabel } from '@/lib/fieldTips'
import {
  fromSi,
  getUnit,
  PRETTY_DURATION_UNIT,
  unitsForCategory,
  type UnitCategory,
  type UnitDef,
} from '@/lib/physics'
import {
  formatDuration,
  formatNumber,
} from '@/lib/physics/format'
import { cn } from '@/lib/utils'

type StaticProps = {
  label: string
  /** Pre-formatted display value (no conversion). Prefer convertible `si` when possible. */
  value: string
  unit?: string
  tip?: string
  accent?: boolean
  si?: never
  category?: never
  unitId?: never
  unitIds?: never
  digits?: never
}

type ConvertibleProps = {
  label: string
  /** Value in SI base for `category` (m, m/s, rad, kg, s, Pa, …). */
  si: number
  category: UnitCategory
  /**
   * Initial / preferred unit id.
   * For time, use `pretty` (auto h/min/s) as default with `TOOL_UNIT_SETS.timePretty`.
   */
  unitId: string
  unitIds?: readonly string[]
  digits?: number
  tip?: string
  accent?: boolean
  value?: never
  unit?: never
}

type Props = StaticProps | ConvertibleProps

function isConvertible(p: Props): p is ConvertibleProps {
  return typeof (p as ConvertibleProps).si === 'number'
}

const PRETTY_DEF: UnitDef = {
  id: PRETTY_DURATION_UNIT,
  label: 'auto (h / min / s)',
  short: 'auto',
  toBase: 1,
  category: 'time',
}

function resolveOptions(
  category: UnitCategory,
  unitIds: readonly string[] | undefined,
): UnitDef[] {
  if (unitIds?.length) {
    return unitIds
      .map((id) => (id === PRETTY_DURATION_UNIT ? PRETTY_DEF : getUnit(id)))
      .filter((u): u is UnitDef => Boolean(u))
  }
  return unitsForCategory(category)
}

/**
 * Result tile. Either static text, or SI value + selectable unit
 * (same conversion helpers as UiUnitField / units tool).
 * Time with unit `pretty` shows human multi-part duration; switch to s/min/h/… for scalars.
 */
export function ResultCard(props: Props) {
  if (isConvertible(props)) {
    return <ConvertibleResult {...props} />
  }
  const { label, value, unit, tip, accent } = props
  const resolvedTip = tip ?? tipForLabel(label)
  return (
    <div
      className={cn(
        'sidus-card-soft min-w-0 max-w-full p-3 sm:p-3.5',
        accent && 'border-border-strong bg-surface-hover',
      )}
    >
      <div className="mb-1.5 flex min-w-0 flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <p
          className={cn(
            'min-w-0 max-w-full flex-1 break-words font-mono text-[10px] uppercase tracking-[0.16em] text-muted',
            resolvedTip && 'cursor-help',
          )}
          title={resolvedTip || undefined}
        >
          {label}
        </p>
        {unit ? (
          <span className="max-w-full shrink-0 break-all font-mono text-[10px] uppercase tracking-wider text-signal">
            {unit}
          </span>
        ) : null}
      </div>
      <p className="min-w-0 break-words font-mono text-lg tabular text-fg sm:text-xl">{value}</p>
    </div>
  )
}

function ConvertibleResult({
  label,
  si,
  category,
  unitId: initialUnitId,
  unitIds,
  digits = 4,
  tip,
  accent,
}: ConvertibleProps) {
  const options = useMemo(
    () => resolveOptions(category, unitIds),
    [category, unitIds],
  )

  const fallback = options[0]?.id ?? initialUnitId
  const [unitId, setUnitId] = useState(
    options.some((u) => u.id === initialUnitId) ? initialUnitId : fallback,
  )

  useEffect(() => {
    if (options.some((u) => u.id === initialUnitId)) {
      setUnitId(initialUnitId)
    }
  }, [initialUnitId]) // eslint-disable-line react-hooks/exhaustive-deps

  const isPretty = unitId === PRETTY_DURATION_UNIT
  const display = Number.isFinite(si)
    ? isPretty
      ? formatDuration(si)
      : fromSi(si, unitId)
    : NaN
  const text = isPretty
    ? (display as string)
    : Number.isFinite(display as number)
      ? formatNumber(display as number, digits)
      : ': '
  const current = isPretty ? PRETTY_DEF : getUnit(unitId)
  const resolvedTip = tip ?? tipForLabel(label)

  return (
    <div
      className={cn(
        'sidus-card-soft min-w-0 max-w-full p-3 sm:p-3.5',
        accent && 'border-border-strong bg-surface-hover',
      )}
    >
      {/* Label + unit on one row (same rhythm as UiUnitField / PARAMETERS) */}
      <div className="mb-1.5 flex min-w-0 flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <p
          className={cn(
            'min-w-0 max-w-full flex-1 break-words font-mono text-[10px] uppercase tracking-[0.16em] text-muted',
            resolvedTip && 'cursor-help',
          )}
          title={resolvedTip || undefined}
        >
          {label}
        </p>
        {options.length > 0 ? (
          <label className="relative inline-flex max-w-full shrink-0 items-center">
            <span className="sr-only">Unit for {label}</span>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className={cn(
                'box-border h-7 max-w-[6rem] cursor-pointer appearance-none border border-border-strong bg-surface py-0 pl-2 pr-6 sm:h-6',
                // Always ≥16px — iOS zooms focused <select> under 16px
                'font-mono text-base uppercase tracking-wider text-signal',
                'outline-none transition-colors hover:border-muted hover:text-fg',
                'focus:border-border-strong focus:text-fg',
              )}
              title="Change unit (value is converted from SI)"
            >
              {options.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.short}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-[8px] text-subtle"
            >
              ▾
            </span>
          </label>
        ) : current ? (
          <span className="max-w-full shrink-0 break-all font-mono text-[10px] uppercase tracking-wider text-signal">
            {current.short}
          </span>
        ) : null}
      </div>
      <p className="min-w-0 break-words font-mono text-lg tabular text-fg sm:text-xl">
        {text}
      </p>
    </div>
  )
}
