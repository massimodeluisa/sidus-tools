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
  dataVolumeBits,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  R: numParam(1000000,{min:1}),
  T: numParam(10,{min:0}),
  Tu: strParam('min', TOOL_UNIT_SETS.time),
  eta: numParam(0.9,{min:0.01}),
} as const

export function DataVolumeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const T=toSi(p.T,p.Tu)
    return dataVolumeBits(p.R,T,p.eta)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_r')} type="number" min={1}  step="any" value={p.R} onChange={(e)=>setP({R:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_t')} category="time" unitIds={TOOL_UNIT_SETS.time} unitId={p.Tu} value={p.T} min={0} onValueChange={(T)=>setP({T})} onUnitChange={(Tu,T)=>setP({Tu,T})} />
          <UiField label={t('fields.eta')} type="number" min={0.01}  step="any" value={p.eta} onChange={(e)=>setP({eta:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.bits')} value={formatNumber(res,6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="data-volume"
          values={{ ...p, T: toSi(p.T, p.Tu) }}
        />
      }
    />
  )
}
