import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  tankPropellantMass,
} from '@/lib/physics'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  V: numParam(0.5,{min:0.000001}),
  fill: numParam(0.95,{min:0.01}),
  rho: numParam(1000,{min:1}),
} as const

export function TankUllageTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return tankPropellantMass(p.V,p.fill,p.rho)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_v')} type="number" min={0.000001}  step="any" value={p.V} onChange={(e)=>setP({V:Number(e.target.value)})} />
          <UiField label={t('fields.fill')} type="number" min={0.01}  step="any" value={p.fill} onChange={(e)=>setP({fill:Number(e.target.value)})} />
          <UiField label={t('fields.rho')} type="number" min={1}  step="any" value={p.rho} onChange={(e)=>setP({rho:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.m_prop')} si={res} category="mass" unitId="kg" unitIds={TOOL_UNIT_SETS.mass} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="tank-ullage"
          values={{ ...p }}
        />
      }
    />
  )
}
