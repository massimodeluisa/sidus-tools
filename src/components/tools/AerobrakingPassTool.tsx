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
  aerobrakingDv,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  ball: numParam(0.01,{min:1e-9}),
  rho: numParam(1e-8,{min:1e-20}),
  v: numParam(7,{min:0}),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity),
  L: numParam(200,{min:0}),
  Lu: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function AerobrakingPassTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const v=toSi(p.v,p.vu)
    const L=toSi(p.L,p.Lu)
    return aerobrakingDv(p.ball,p.rho,v,L)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.ball')} type="number" min={1e-9}  step="any" value={p.ball} onChange={(e)=>setP({ball:Number(e.target.value)})} />
          <UiField label={t('fields.rho')} type="number" min={1e-20}  step="any" value={p.rho} onChange={(e)=>setP({rho:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_v_2')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.v} min={0} onValueChange={(v)=>setP({v})} onUnitChange={(vu,v)=>setP({vu,v})} />
          <UiUnitField label={t('fields.disc_l')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.Lu} value={p.L} min={0} onValueChange={(L)=>setP({L})} onUnitChange={(Lu,L)=>setP({Lu,L})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_dv')} si={res} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="aerobraking-pass"
          values={{ ...p, v: toSi(p.v, p.vu), L: toSi(p.L, p.Lu) }}
        />
      }
    />
  )
}
