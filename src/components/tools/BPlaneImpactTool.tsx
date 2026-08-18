import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  toSi,
  bPlaneImpactParameter,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  mu: numParam(398600441800000,{min:1}),
  vinf: numParam(3,{min:0}),
  vinfu: strParam('kmps', TOOL_UNIT_SETS.velocity),
  delta: numParam(90,{min:0}),
  deltau: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function BPlaneImpactTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const vinf=toSi(p.vinf,p.vinfu)
    const delta=toSi(p.delta,p.deltau)
    return bPlaneImpactParameter(p.mu,vinf,delta)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_mu')} type="number" min={1}  step="any" value={p.mu} onChange={(e)=>setP({mu:Number(e.target.value)})} />
          <UiUnitField label={t('fields.vinf')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vinfu} value={p.vinf} min={0} onValueChange={(vinf)=>setP({vinf})} onUnitChange={(vinfu,vinf)=>setP({vinfu,vinf})} />
          <UiUnitField label={t('fields.delta')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.deltau} value={p.delta} min={0} onValueChange={(delta)=>setP({delta})} onUnitChange={(deltau,delta)=>setP({deltau,delta})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_b_2')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="b-plane-impact"
          values={{ ...p, vinf: toSi(p.vinf, p.vinfu), delta: toSi(p.delta, p.deltau) }}
        />
      }
    />
  )
}
