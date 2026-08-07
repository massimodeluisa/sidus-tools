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
  solarFluxAtDistance,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  r: numParam(1.5,{min:0}),
  ru: strParam('au', TOOL_UNIT_SETS.length),
  S0: numParam(1361,{min:1}),
} as const

export function SolarFluxDistanceTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const r=toSi(p.r,p.ru)
    return solarFluxAtDistance(r,p.S0)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_r_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.ru} value={p.r} min={0} onValueChange={(r)=>setP({r})} onUnitChange={(ru,r)=>setP({ru,r})} />
          <UiField label={t('fields.disc_s0')} type="number" min={1}  step="any" value={p.S0} onChange={(e)=>setP({S0:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_s')} value={formatNumber(res,4)} unit="W/m²" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="solar-flux-distance"
          values={{ ...p, r: toSi(p.r, p.ru) }}
        />
      }
    />
  )
}
