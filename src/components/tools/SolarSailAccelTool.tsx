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
  solarSailAccel,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  flux: numParam(1361,{min:1}),
  A: numParam(100,{min:0.000001}),
  m: numParam(10,{min:0}),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  eta: numParam(0.9,{min:0.01}),
} as const

export function SolarSailAccelTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const m=toSi(p.m,p.mu)
    return solarSailAccel(p.flux,p.A,m,p.eta)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.flux')} type="number" min={1}  step="any" value={p.flux} onChange={(e)=>setP({flux:Number(e.target.value)})} />
          <UiField label={t('fields.disc_a')} type="number" min={0.000001}  step="any" value={p.A} onChange={(e)=>setP({A:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_m')} category="mass" unitIds={TOOL_UNIT_SETS.mass} unitId={p.mu} value={p.m} min={0} onValueChange={(m)=>setP({m})} onUnitChange={(mu,m)=>setP({mu,m})} />
          <UiField label={t('fields.eta')} type="number" min={0.01}  step="any" value={p.eta} onChange={(e)=>setP({eta:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_a_2')} value={formatNumber(res,6)} unit="m/s²" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="solar-sail-accel"
          values={{ ...p, m: toSi(p.m, p.mu) }}
        />
      }
    />
  )
}
