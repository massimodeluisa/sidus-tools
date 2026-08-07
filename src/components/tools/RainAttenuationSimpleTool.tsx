import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  rainAttenuationDb,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  rate: numParam(20,{min:0}),
  path: numParam(5,{min:0.001}),
  k: numParam(0.01,{min:1e-9}),
  alpha: numParam(1.1,{min:0.1}),
} as const

export function RainAttenuationSimpleTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return rainAttenuationDb(p.rate,p.path,p.k,p.alpha)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.rate')} type="number" min={0}  step="any" value={p.rate} onChange={(e)=>setP({rate:Number(e.target.value)})} />
          <UiField label={t('fields.path')} type="number" min={0.001}  step="any" value={p.path} onChange={(e)=>setP({path:Number(e.target.value)})} />
          <UiField label={t('fields.disc_k')} type="number" min={1e-9}  step="any" value={p.k} onChange={(e)=>setP({k:Number(e.target.value)})} />
          <UiField label={t('fields.alpha')} type="number" min={0.1}  step="any" value={p.alpha} onChange={(e)=>setP({alpha:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_a')} value={formatNumber(res,4)} unit="dB" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="rain-attenuation-simple"
          values={{ ...p }}
        />
      }
    />
  )
}
