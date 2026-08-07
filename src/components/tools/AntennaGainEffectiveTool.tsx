import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  effectiveAperture,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  G: numParam(1000,{min:0.001}),
  lam: numParam(0.03,{min:1e-9}),
} as const

export function AntennaGainEffectiveTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return effectiveAperture(p.G,p.lam)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_g')} type="number" min={0.001}  step="any" value={p.G} onChange={(e)=>setP({G:Number(e.target.value)})} />
          <UiField label={t('fields.lam')} type="number" min={1e-9}  step="any" value={p.lam} onChange={(e)=>setP({lam:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_ae')} value={formatNumber(res,6)} unit="m²" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="antenna-gain-effective"
          values={{ ...p }}
        />
      }
    />
  )
}
