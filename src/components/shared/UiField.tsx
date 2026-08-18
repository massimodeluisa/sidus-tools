import type { InputHTMLAttributes } from 'react'
import { Field, FieldMetaText } from '@/components/shared/Field'
import { cn } from '@/lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  unit?: string
  hint?: string
  /** Short physical meaning: hover tooltip on the label (also in the DOM for AT / SEO). */
  tip?: string
  /** When false, omit reserved hint track (rare). Default true for grid align. */
  reserveHint?: boolean
}

export function UiField({
  label,
  unit,
  hint,
  tip,
  id,
  className,
  reserveHint,
  ...rest
}: Props) {
  const fieldId = id ?? rest.name
  return (
    <Field
      label={label}
      tip={tip}
      hint={hint}
      reserveHint={reserveHint}
      meta={unit ? <FieldMetaText>{unit}</FieldMetaText> : undefined}
    >
      <input
        id={fieldId}
        className={cn(
          // Always ≥16px (text-base): iOS Safari zooms any focused control under 16px
          'box-border h-full min-h-11 w-full min-w-0 border border-border bg-bg px-2.5 font-mono text-base tabular text-fg outline-none transition-colors placeholder:text-subtle focus:border-border-strong sm:min-h-9',
          className,
        )}
        {...rest}
      />
    </Field>
  )
}
