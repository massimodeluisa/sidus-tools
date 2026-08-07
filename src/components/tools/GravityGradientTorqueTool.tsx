import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  toSi,
  gravityGradientTorque,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  mu: numParam(398600441800000,{min:1}),
  r: numParam(6778,{min:0}),
  ru: strParam('km', TOOL_UNIT_SETS.length),
  dI: numParam(10,{min:0}),
  delta: numParam(10,{min:0}),
  deltau: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function GravityGradientTorqueTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const r=toSi(p.r,p.ru)
    const delta=toSi(p.delta,p.deltau)
    return gravityGradientTorque(p.mu,r,p.dI,delta)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_mu')} type="number" min={1}  step="any" value={p.mu} onChange={(e)=>setP({mu:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_r_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.ru} value={p.r} min={0} onValueChange={(r)=>setP({r})} onUnitChange={(ru,r)=>setP({ru,r})} />
          <UiField label={t('fields.disc_di')} type="number" min={0}  step="any" value={p.dI} onChange={(e)=>setP({dI:Number(e.target.value)})} />
          <UiUnitField label={t('fields.delta')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.deltau} value={p.delta} min={0} onValueChange={(delta)=>setP({delta})} onUnitChange={(deltau,delta)=>setP({deltau,delta})} />
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
          formulaId="gravity-gradient-torque"
          values={{ ...p, r: toSi(p.r, p.ru), delta: toSi(p.delta, p.deltau) }}
        />
      }
    />
  )
}
