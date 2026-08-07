import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  diffractionLimitAngle,
} from '@/lib/physics'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  lam: numParam(5.5e-7,{min:1e-12}),
  D: numParam(0.3,{min:0.000001}),
} as const

export function DiffractionLimitTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return diffractionLimitAngle(p.lam,p.D)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.lam')} type="number" min={1e-12}  step="any" value={p.lam} onChange={(e)=>setP({lam:Number(e.target.value)})} />
          <UiField label={t('fields.disc_d')} type="number" min={0.000001}  step="any" value={p.D} onChange={(e)=>setP({D:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.theta')} si={res} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="diffraction-limit"
          values={{ ...p }}
        />
      }
    />
  )
}
