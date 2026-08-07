import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  batteryDepthOfDischarge,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  eUsed: numParam(50,{min:0}),
  eCap: numParam(100,{min:0.001}),
} as const

export function BatteryDodTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return batteryDepthOfDischarge(p.eUsed,p.eCap)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.eused')} type="number" min={0}  step="any" value={p.eUsed} onChange={(e)=>setP({eUsed:Number(e.target.value)})} />
          <UiField label={t('fields.ecap')} type="number" min={0.001}  step="any" value={p.eCap} onChange={(e)=>setP({eCap:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.dod')} value={formatNumber(res,6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="battery-dod"
          values={{ ...p }}
        />
      }
    />
  )
}
