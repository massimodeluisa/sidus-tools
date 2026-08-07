import { useTranslation } from 'react-i18next'
import { UiSelect } from './UiSelect'
import { BODIES } from '@/lib/physics'

type Props = {
  value: string
  onChange: (bodyId: string) => void
  /** Override default i18n label */
  label?: string
}

/**
 * Shared central-body picker: same options everywhere, no duplicated BODIES maps.
 */
export function BodySelect({ value, onChange, label }: Props) {
  const { t } = useTranslation()
  return (
    <UiSelect
      label={label ?? t('common.body')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={BODIES.map((b) => ({ value: b.id, label: b.name }))}
      // No empty hint track: body picker is usually first and was leaving a tall void
      reserveHint={false}
    />
  )
}

/** Schema helper: `body: bodyParam()` inside useToolSearchParams schemas. */
export function bodyParamIds(): string[] {
  return BODIES.map((b) => b.id)
}
