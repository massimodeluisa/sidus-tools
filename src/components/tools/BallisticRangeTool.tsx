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
  ballisticRangeFlat,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  v0: numParam(100,{min:0}),
  v0u: strParam('mps', TOOL_UNIT_SETS.velocity),
  elev: numParam(45,{min:0}),
  elevu: strParam('deg', TOOL_UNIT_SETS.angle),
  g: numParam(9.80665,{min:0.001}),
} as const

export function BallisticRangeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const v0=toSi(p.v0,p.v0u)
    const elev=toSi(p.elev,p.elevu)
    return ballisticRangeFlat(v0,elev,p.g)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_v0')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.v0u} value={p.v0} min={0} onValueChange={(v0)=>setP({v0})} onUnitChange={(v0u,v0)=>setP({v0u,v0})} />
          <UiUnitField label={t('fields.elev')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.elevu} value={p.elev} min={0} onValueChange={(elev)=>setP({elev})} onUnitChange={(elevu,elev)=>setP({elevu,elev})} />
          <UiField label={t('fields.disc_g_2')} type="number" min={0.001}  step="any" value={p.g} onChange={(e)=>setP({g:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.range_2')} si={res.range} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
            <ResultCard label={t('fields.tof')} si={res.tof} category="time" unitId="s" unitIds={TOOL_UNIT_SETS.time} digits={4} />
            <ResultCard label={t('fields.hmax')} si={res.hMax} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="ballistic-range"
          values={{ ...p, v0: toSi(p.v0, p.v0u), elev: toSi(p.elev, p.elevu) }}
        />
      }
    />
  )
}
