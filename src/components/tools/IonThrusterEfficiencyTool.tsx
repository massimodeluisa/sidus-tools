import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  ionThrusterEfficiency,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  T: numParam(0.05,{min:1e-9}),
  mdot: numParam(0.000001,{min:1e-12}),
  P: numParam(1500,{min:0.000001}),
} as const

export function IonThrusterEfficiencyTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return ionThrusterEfficiency(p.T,p.mdot,p.P)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_t')} type="number" min={1e-9}  step="any" value={p.T} onChange={(e)=>setP({T:Number(e.target.value)})} />
          <UiField label={t('fields.mdot')} type="number" min={1e-12}  step="any" value={p.mdot} onChange={(e)=>setP({mdot:Number(e.target.value)})} />
          <UiField label={t('fields.disc_p')} type="number" min={0.000001}  step="any" value={p.P} onChange={(e)=>setP({P:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.eta')} value={formatNumber(res,6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="ion-thruster-efficiency"
          values={{ ...p }}
        />
      }
    />
  )
}
