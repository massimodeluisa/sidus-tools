import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  toSi,
  pointingBudgetRss,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  s1: numParam(10,{min:0}),
  s1u: strParam('arcsec', TOOL_UNIT_SETS.angle),
  s2: numParam(5,{min:0}),
  s2u: strParam('arcsec', TOOL_UNIT_SETS.angle),
  s3: numParam(3,{min:0}),
  s3u: strParam('arcsec', TOOL_UNIT_SETS.angle),
} as const

export function PointingBudgetRssTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const s1=toSi(p.s1,p.s1u)
    const s2=toSi(p.s2,p.s2u)
    const s3=toSi(p.s3,p.s3u)
    return pointingBudgetRss([s1,s2,s3])
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_s1')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.s1u} value={p.s1} min={0} onValueChange={(s1)=>setP({s1})} onUnitChange={(s1u,s1)=>setP({s1u,s1})} />
          <UiUnitField label={t('fields.disc_s2')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.s2u} value={p.s2} min={0} onValueChange={(s2)=>setP({s2})} onUnitChange={(s2u,s2)=>setP({s2u,s2})} />
          <UiUnitField label={t('fields.disc_s3')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.s3u} value={p.s3} min={0} onValueChange={(s3)=>setP({s3})} onUnitChange={(s3u,s3)=>setP({s3u,s3})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.sigma')} si={res} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="pointing-budget-rss"
          values={{ ...p, s1: toSi(p.s1, p.s1u), s2: toSi(p.s2, p.s2u), s3: toSi(p.s3, p.s3u) }}
        />
      }
    />
  )
}
