import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  panelEolPower,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  p0: numParam(200,{min:0.001}),
  d: numParam(0.02,{min:0}),
  years: numParam(15,{min:0}),
} as const

export function PanelEolPowerTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return panelEolPower(p.p0,p.d,p.years)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_p0')} type="number" min={0.001}  step="any" value={p.p0} onChange={(e)=>setP({p0:Number(e.target.value)})} />
          <UiField label={t('fields.disc_d_2')} type="number" min={0}  step="any" value={p.d} onChange={(e)=>setP({d:Number(e.target.value)})} />
          <UiField label={t('fields.years')} type="number" min={0}  step="any" value={p.years} onChange={(e)=>setP({years:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.peol')} value={formatNumber(res,6)} unit="W" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="panel-eol-power"
          values={{ ...p }}
        />
      }
    />
  )
}
