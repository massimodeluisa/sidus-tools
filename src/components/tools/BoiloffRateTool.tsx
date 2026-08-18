import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  boiloffRate,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  Q: numParam(10,{min:0.001}),
  hfg: numParam(200000,{min:1}),
} as const

export function BoiloffRateTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return boiloffRate(p.Q,p.hfg)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_q')} type="number" min={0.001}  step="any" value={p.Q} onChange={(e)=>setP({Q:Number(e.target.value)})} />
          <UiField label={t('fields.hfg')} type="number" min={1}  step="any" value={p.hfg} onChange={(e)=>setP({hfg:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.mdot')} value={formatNumber(res,6)} unit="kg/s" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="boiloff-rate"
          values={{ ...p }}
        />
      }
    />
  )
}
