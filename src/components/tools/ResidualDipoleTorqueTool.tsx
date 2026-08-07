import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  residualDipoleTorque,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  m: numParam(0.1,{min:1e-9}),
  B: numParam(0.00003,{min:1e-12}),
} as const

export function ResidualDipoleTorqueTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return residualDipoleTorque(p.m,p.B)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_m')} type="number" min={1e-9}  step="any" value={p.m} onChange={(e)=>setP({m:Number(e.target.value)})} />
          <UiField label={t('fields.disc_b')} type="number" min={1e-12}  step="any" value={p.B} onChange={(e)=>setP({B:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.tau')} value={formatNumber(res,6)} unit="N·m" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="residual-dipole-torque"
          values={{ ...p }}
        />
      }
    />
  )
}
