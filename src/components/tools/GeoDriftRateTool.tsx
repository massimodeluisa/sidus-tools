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
  geoDriftRate,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  a: numParam(42170,{min:0}),
  au: strParam('km', TOOL_UNIT_SETS.length),
  aGeo: numParam(42164,{min:0}),
  aGeou: strParam('km', TOOL_UNIT_SETS.length),
  nGeo: numParam(0.00007292115,{min:1e-12}),
} as const

export function GeoDriftRateTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const a=toSi(p.a,p.au)
    const aGeo=toSi(p.aGeo,p.aGeou)
    return geoDriftRate(a,aGeo,p.nGeo)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_a_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.au} value={p.a} min={0} onValueChange={(a)=>setP({a})} onUnitChange={(au,a)=>setP({au,a})} />
          <UiUnitField label={t('fields.ageo')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.aGeou} value={p.aGeo} min={0} onValueChange={(aGeo)=>setP({aGeo})} onUnitChange={(aGeou,aGeo)=>setP({aGeou,aGeo})} />
          <UiField label={t('fields.ngeo')} type="number" min={1e-12}  step="any" value={p.nGeo} onChange={(e)=>setP({nGeo:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.rate')} value={formatNumber(res,8)} unit="rad/s" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="geo-drift-rate"
          values={{ ...p, a: toSi(p.a, p.au), aGeo: toSi(p.aGeo, p.aGeou) }}
        />
      }
    />
  )
}
