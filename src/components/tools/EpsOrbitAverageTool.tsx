import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  epsOrbitAverage,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  psun: numParam(200,{min:0.001}),
  fecl: numParam(0.35,{min:0}),
  eta: numParam(0.28,{min:0.01}),
} as const

export function EpsOrbitAverageTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return epsOrbitAverage(p.psun,p.fecl,p.eta)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.psun')} type="number" min={0.001}  step="any" value={p.psun} onChange={(e)=>setP({psun:Number(e.target.value)})} />
          <UiField label={t('fields.fecl')} type="number" min={0}  step="any" value={p.fecl} onChange={(e)=>setP({fecl:Number(e.target.value)})} />
          <UiField label={t('fields.eta')} type="number" min={0.01}  step="any" value={p.eta} onChange={(e)=>setP({eta:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.pavg')} value={formatNumber(res,6)} unit="W" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="eps-orbit-average"
          values={{ ...p }}
        />
      }
    />
  )
}
