import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TooltipLabel, tooltipProps } from '@/components/shared/tooltip'
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

/** Same type scale as Field labels; `text-fg` so 10px captions stay readable. */
const RESULT_LABEL =
  'min-w-0 max-w-full font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-fg sm:text-[11px]'

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

function ResultShell({
  label,
  tip,
  accent,
  meta,
  children,
}: {
  label: string
  tip?: string
  accent?: boolean
  meta?: ReactNode
  children: ReactNode
}) {
  const resolvedTip = tip ?? tipForLabel(label)
  return (
    <div
      className={cn(
        // Match Field: label row, then value+unit. No unit on the label row.
        'grid min-w-0 max-w-full grid-rows-[auto_auto] gap-y-1.5 overflow-visible p-2.5 sm:p-3',
        'border border-border',
        accent ? 'border-border-strong bg-surface-hover' : 'bg-bg-elevated/40',
      )}
    >
      <TooltipLabel tip={resolvedTip} className={RESULT_LABEL}>
        <span className="break-words hyphens-auto">{label}</span>
      </TooltipLabel>
      <div className="flex min-h-9 min-w-0 items-center justify-between gap-2 overflow-visible sm:min-h-8">
        <div className="min-w-0 flex-1 break-words font-mono text-lg tabular text-fg sm:text-xl">
          {children}
        </div>
        {meta != null ? (
          <div className="flex max-w-[45%] shrink-0 items-center justify-end overflow-visible">
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function UnitMeta({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <label
      {...tooltipProps(
        t('common.unit_converts'),
        'relative inline-flex max-w-full shrink-0 items-center overflow-visible',
        'above-end',
      )}
    >
      <span className="sr-only">{t('common.unit_for', { label })}</span>
      {children}
    </label>
  )
}

/**
 * Result tile. Same chrome as Field: label on its own row, value + unit below
 * (mirrors PARAMETERS label / control / meta).
 */
export function ResultCard(props: Props) {
  if (isConvertible(props)) {
    return <ConvertibleResult {...props} />
  }
  const { label, value, unit, tip, accent } = props
  return (
    <ResultShell
      label={label}
      tip={tip}
      accent={accent}
      meta={
        unit ? (
          <span className="max-w-full break-all font-mono text-[10px] uppercase tracking-wider text-signal sm:text-[11px]">
            {unit}
          </span>
        ) : undefined
      }
    >
      {value}
    </ResultShell>
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

  const unitMeta =
    options.length > 0 ? (
      <UnitMeta label={label}>
        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className={cn(
            'box-border h-8 max-w-[6rem] cursor-pointer appearance-none border border-border-strong bg-surface py-0 pl-2 pr-6 sm:h-7',
            // Always ≥16px — iOS zooms focused <select> under 16px
            'font-mono text-base uppercase tracking-wider text-signal',
            'outline-none transition-colors hover:border-muted hover:text-fg',
            'focus:border-border-strong focus:text-fg',
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
          className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-[8px] text-subtle"
        >
          ▾
        </span>
      </UnitMeta>
    ) : current ? (
      <span className="max-w-full break-all font-mono text-[10px] uppercase tracking-wider text-signal sm:text-[11px]">
        {current.short}
      </span>
    ) : undefined

  return (
    <ResultShell label={label} tip={tip} accent={accent} meta={unitMeta}>
      {text}
    </ResultShell>
  )
}
