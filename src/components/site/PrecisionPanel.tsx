import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/shared/Panel'
import { getToolPrecision, type PrecisionClass } from '@/data/precision'

type Props = {
  toolId: string
}

const CLASS_KEY: Record<PrecisionClass, string> = {
  'two-body-exact': 'two_body_exact',
  'two-body-series': 'two_body_series',
  'j2-secular': 'j2_secular',
  'atmosphere-order': 'atmosphere_order',
  'eclss-educational': 'eclss_educational',
  'rf-friis': 'rf_friis',
  'empirical-const': 'empirical_const',
  utility: 'utility',
}

/**
 * Model and numerical limits for the active tool (educational).
 */
export function PrecisionPanel({ toolId }: Props) {
  const { t } = useTranslation()
  const p = getToolPrecision(toolId)
  const classLabel = t(`tool.precision.classes.${CLASS_KEY[p.modelClass]}`)

  return (
    <Panel title={t('tool.precision.title')}>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {t('tool.precision.model')}
          </dt>
          <dd className="mt-1 text-fg">{classLabel}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {t('tool.precision.error')}
          </dt>
          <dd className="mt-1 text-muted">{p.errorClass}</dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {t('tool.precision.limits')}
          </dt>
          <dd className="mt-1 leading-relaxed text-muted">{p.limits}</dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {t('tool.precision.reference')}
          </dt>
          <dd className="mt-1 text-muted">{p.referenceHint}</dd>
        </div>
      </dl>
      <p className="mt-3 font-mono text-[10px] leading-relaxed text-subtle">
        {t('tool.precision.disclaimer')}
      </p>
    </Panel>
  )
}
