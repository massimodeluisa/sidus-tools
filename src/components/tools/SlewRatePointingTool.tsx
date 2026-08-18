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
  slewTimeMin,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  dth: numParam(30,{min:0}),
  dthu: strParam('deg', TOOL_UNIT_SETS.angle),
  wmax: numParam(0.05,{min:0.000001}),
  amax: numParam(0.01,{min:0.000001}),
} as const

export function SlewRatePointingTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const dth=toSi(p.dth,p.dthu)
    return slewTimeMin(dth,p.wmax,p.amax)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.dth')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.dthu} value={p.dth} min={0} onValueChange={(dth)=>setP({dth})} onUnitChange={(dthu,dth)=>setP({dthu,dth})} />
          <UiField label={t('fields.wmax')} type="number" min={0.000001}  step="any" value={p.wmax} onChange={(e)=>setP({wmax:Number(e.target.value)})} />
          <UiField label={t('fields.amax')} type="number" min={0.000001}  step="any" value={p.amax} onChange={(e)=>setP({amax:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.tslew')} si={res} category="time" unitId="s" unitIds={TOOL_UNIT_SETS.time} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="slew-rate-pointing"
          values={{ ...p, dth: toSi(p.dth, p.dthu) }}
        />
      }
    />
  )
}
