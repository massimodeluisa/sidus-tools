import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  magnetorquerMoment,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  N: numParam(200,{min:1}),
  I: numParam(0.1,{min:0.000001}),
  A: numParam(0.04,{min:1e-9}),
} as const

export function MagnetorquerMomentTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return magnetorquerMoment(p.N,p.I,p.A)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_n_2')} type="number" min={1}  step="any" value={p.N} onChange={(e)=>setP({N:Number(e.target.value)})} />
          <UiField label={t('fields.disc_i')} type="number" min={0.000001}  step="any" value={p.I} onChange={(e)=>setP({I:Number(e.target.value)})} />
          <UiField label={t('fields.disc_a')} type="number" min={1e-9}  step="any" value={p.A} onChange={(e)=>setP({A:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_m')} value={formatNumber(res,6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="magnetorquer-moment"
          values={{ ...p }}
        />
      }
    />
  )
}
