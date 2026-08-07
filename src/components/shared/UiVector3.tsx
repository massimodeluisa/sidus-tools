import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formatEditableNumber,
  isPartialLocaleNumber,
  parseLocaleNumber,
} from '@/lib/localeNumber'
import { Field } from '@/components/shared/Field'
import { cn } from '@/lib/utils'

export type Vec3 = { x: number; y: number; z: number }

type Props = {
  label: string
  unit?: string
  value: Vec3
  onChange: (v: Vec3) => void
  step?: string | number
}

function AxisField({
  axis,
  value,
  onCommit,
  locale,
}: {
  axis: 'x' | 'y' | 'z'
  value: number
  onCommit: (n: number) => void
  locale: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const display =
    draft ?? (Number.isFinite(value) ? formatEditableNumber(value, locale) : '')

  return (
    <Field label={axis.toUpperCase()} reserveHint={false}>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onFocus={() =>
          setDraft(Number.isFinite(value) ? formatEditableNumber(value, locale) : '')
        }
        onBlur={() => {
          if (draft != null) {
            const n = parseLocaleNumber(draft, locale)
            if (n != null) onCommit(n)
          }
          setDraft(null)
        }}
        onChange={(e) => {
          const s = e.target.value
          setDraft(s)
          if (isPartialLocaleNumber(s, locale)) return
          const n = parseLocaleNumber(s, locale)
          if (n != null) onCommit(n)
        }}
        className={cn(
          'h-full w-full border border-border bg-bg px-2.5 font-mono text-base tabular text-fg outline-none transition-colors',
          'placeholder:text-subtle focus:border-border-strong',
        )}
      />
    </Field>
  )
}

/** Three-axis vector input: shared by RV / Kepler / Lambert tools. */
export function UiVector3({
  label,
  unit = 'm or m/s',
  value,
  onChange,
}: Props) {
  const { i18n } = useTranslation()
  const locale = i18n.language ?? 'en'

  return (
    <fieldset className="col-span-full min-w-0 space-y-1.5 border border-border p-2.5 sm:p-3">
      <legend className="px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:text-[11px]">
        {label}
        {unit ? (
          <span className="ml-2 text-[10px] tracking-wider text-subtle">{unit}</span>
        ) : null}
      </legend>
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <AxisField
            key={axis}
            axis={axis}
            value={value[axis]}
            locale={locale}
            onCommit={(n) => onChange({ ...value, [axis]: n })}
          />
        ))}
      </div>
    </fieldset>
  )
}

export function vec3ToTuple(v: Vec3): [number, number, number] {
  return [v.x, v.y, v.z]
}

export function tupleToVec3(t: [number, number, number]): Vec3 {
  return { x: t[0], y: t[1], z: t[2] }
}
