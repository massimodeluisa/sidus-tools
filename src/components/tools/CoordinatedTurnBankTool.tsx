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
  bankAngleRad,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  v: numParam(100,{min:0}),
  vu: strParam('mps', TOOL_UNIT_SETS.velocity),
  R: numParam(500,{min:0}),
  Ru: strParam('m', TOOL_UNIT_SETS.length),
  g: numParam(9.80665,{min:0.001}),
} as const

export function CoordinatedTurnBankTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const v=toSi(p.v,p.vu)
    const R=toSi(p.R,p.Ru)
    return bankAngleRad(v,R,p.g)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_v_2')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.v} min={0} onValueChange={(v)=>setP({v})} onUnitChange={(vu,v)=>setP({vu,v})} />
          <UiUnitField label={t('fields.disc_r')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.Ru} value={p.R} min={0} onValueChange={(R)=>setP({R})} onUnitChange={(Ru,R)=>setP({Ru,R})} />
          <UiField label={t('fields.disc_g_2')} type="number" min={0.001}  step="any" value={p.g} onChange={(e)=>setP({g:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.phi')} si={res} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="coordinated-turn-bank"
          values={{ ...p, v: toSi(p.v, p.vu), R: toSi(p.R, p.Ru) }}
        />
      }
    />
  )
}
