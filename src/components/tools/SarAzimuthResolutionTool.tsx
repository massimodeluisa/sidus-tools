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
  sarAzimuthResolution,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  lam: numParam(0.03,{min:1e-9}),
  theta: numParam(5,{min:0}),
  thetau: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function SarAzimuthResolutionTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const theta=toSi(p.theta,p.thetau)
    return sarAzimuthResolution(p.lam,theta)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.lam')} type="number" min={1e-9}  step="any" value={p.lam} onChange={(e)=>setP({lam:Number(e.target.value)})} />
          <UiUnitField label={t('fields.theta')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.thetau} value={p.theta} min={0} onValueChange={(theta)=>setP({theta})} onUnitChange={(thetau,theta)=>setP({thetau,theta})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.daz')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="sar-azimuth-resolution"
          values={{ ...p, theta: toSi(p.theta, p.thetau) }}
        />
      }
    />
  )
}
