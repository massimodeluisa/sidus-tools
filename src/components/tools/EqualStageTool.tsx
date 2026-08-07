import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { equalStageMassRatio, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  dv: numParam(9000, { min: 0 }),
  dvu: strParam('mps', TOOL_UNIT_SETS.velocity),
  n: numParam(3, { min: 1 }),
  isp: numParam(300, { min: 0.001 }),
} as const

export function EqualStageTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const dv = toSi(p.dv, p.dvu)
  const res = useMemo(() => equalStageMassRatio(dv, Math.round(p.n), p.isp), [dv, p.n, p.isp])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <UiUnitField label={t('fields.total_v')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.dvu} value={p.dv} min={0} onValueChange={(dv) => setP({ dv })} onUnitChange={(dvu, dv) => setP({ dvu, dv })} />
        <UiField label={t('fields.number_of_equal_stages')} type="number" value={p.n} min={1} onChange={(e) => setP({ n: Number(e.target.value) })} />
        <UiField label={t('fields.i_sp_each_stage')} type="number" value={p.isp} min={0.001} onChange={(e) => setP({ isp: Number(e.target.value) })} unit="s" />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.v_per_stage')} si={res.dvStage} category="velocity" unitId="mps" unitIds={TOOL_UNIT_SETS.velocity} digits={1} accent />
        <ResultCard label={t('fields.m_m_f_per_stage')} value={res.massRatio.toFixed(4)} />
        <ResultCard label={t('fields.v_e')} si={res.ve} category="velocity" unitId="mps" unitIds={TOOL_UNIT_SETS.velocity} digits={1} />
        <ResultCard label={t('fields.overall_mass_ratio_ideal_equal')} value={(res.massRatio ** Math.round(p.n)).toFixed(3)} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.invalid_stage_budget')}</p>}
      code={<CodeExport formulaId="equal-stage" values={{ dv, n: p.n, isp: p.isp }} />}
    />
  )
}
