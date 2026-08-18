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
  exponentialDensity,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  rho0: numParam(1.225,{min:1e-9}),
  h: numParam(100,{min:0}),
  hu: strParam('km', TOOL_UNIT_SETS.length),
  H: numParam(8.5,{min:0}),
  Hu: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function ExponentialDensityTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const h=toSi(p.h,p.hu)
    const H=toSi(p.H,p.Hu)
    return exponentialDensity(h, p.rho0, H)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.rho0')} type="number" min={1e-9}  step="any" value={p.rho0} onChange={(e)=>setP({rho0:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_h')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.hu} value={p.h} min={0} onValueChange={(h)=>setP({h})} onUnitChange={(hu,h)=>setP({hu,h})} />
          <UiUnitField label={t('fields.disc_h_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.Hu} value={p.H} min={0} onValueChange={(H)=>setP({H})} onUnitChange={(Hu,H)=>setP({Hu,H})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.rho')} value={formatNumber(res,6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="exponential-density"
          values={{ ...p, h: toSi(p.h, p.hu), H: toSi(p.H, p.Hu) }}
        />
      }
    />
  )
}
