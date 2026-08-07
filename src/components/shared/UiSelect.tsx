import type { SelectHTMLAttributes } from 'react'
import { Field } from '@/components/shared/Field'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: Option[]
  hint?: string
  tip?: string
  reserveHint?: boolean
}

export function UiSelect({
  label,
  options,
  hint,
  tip,
  id,
  className,
  reserveHint,
  ...rest
}: Props) {
  const fieldId = id ?? rest.name
  return (
    <Field label={label} tip={tip} hint={hint} reserveHint={reserveHint}>
      <select
        id={fieldId}
        className={cn(
          'box-border h-full min-h-11 w-full min-w-0 border border-border bg-bg px-2.5 font-mono text-base text-fg outline-none transition-colors focus:border-border-strong sm:min-h-9',
          className,
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
