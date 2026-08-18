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
  dragMakeupDvPerRev,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  rho: numParam(1e-12,{min:1e-20}),
  a: numParam(6778,{min:0}),
  au: strParam('km', TOOL_UNIT_SETS.length),
  v: numParam(7.5,{min:0}),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity),
  B: numParam(100,{min:0.001}),
} as const

export function DragMakeUpDvTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const a=toSi(p.a,p.au)
    const v=toSi(p.v,p.vu)
    return dragMakeupDvPerRev(p.rho,a,v,p.B)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.rho')} type="number" min={1e-20}  step="any" value={p.rho} onChange={(e)=>setP({rho:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_a_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.au} value={p.a} min={0} onValueChange={(a)=>setP({a})} onUnitChange={(au,a)=>setP({au,a})} />
          <UiUnitField label={t('fields.disc_v_2')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.v} min={0} onValueChange={(v)=>setP({v})} onUnitChange={(vu,v)=>setP({vu,v})} />
          <UiField label={t('fields.disc_b')} type="number" min={0.001}  step="any" value={p.B} onChange={(e)=>setP({B:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_dv')} si={res} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="drag-make-up-dv"
          values={{ ...p, a: toSi(p.a, p.au), v: toSi(p.v, p.vu) }}
        />
      }
    />
  )
}
