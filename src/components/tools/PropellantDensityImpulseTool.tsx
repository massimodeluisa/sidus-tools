import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  densityImpulse,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  rho: numParam(1000,{min:1}),
  isp: numParam(320,{min:1}),
} as const

export function PropellantDensityImpulseTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return densityImpulse(p.rho,p.isp)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.rho')} type="number" min={1}  step="any" value={p.rho} onChange={(e)=>setP({rho:Number(e.target.value)})} />
          <UiField label={t('fields.isp')} type="number" min={1}  step="any" value={p.isp} onChange={(e)=>setP({isp:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.rhoisp')} value={formatNumber(res,6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="propellant-density-impulse"
          values={{ ...p }}
        />
      }
    />
  )
}
