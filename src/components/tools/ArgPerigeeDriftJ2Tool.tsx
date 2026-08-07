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
  argPerigeeDriftJ2,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  n: numParam(0.001,{min:1e-9}),
  j2: numParam(0.00108263,{min:0}),
  R: numParam(6378.14,{min:0}),
  Ru: strParam('km', TOOL_UNIT_SETS.length),
  sma_p: numParam(6778,{min:0}),
  sma_pu: strParam('km', TOOL_UNIT_SETS.length),
  i: numParam(51.6,{min:0}),
  iu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function ArgPerigeeDriftJ2Tool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const R=toSi(p.R,p.Ru)
    const sma_p=toSi(p.sma_p,p.sma_pu)
    const i=toSi(p.i,p.iu)
    return argPerigeeDriftJ2(p.n,p.j2,R,sma_p,i)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_n')} type="number" min={1e-9}  step="any" value={p.n} onChange={(e)=>setP({n:Number(e.target.value)})} />
          <UiField label={t('fields.disc_j2')} type="number" min={0}  step="any" value={p.j2} onChange={(e)=>setP({j2:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_r')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.Ru} value={p.R} min={0} onValueChange={(R)=>setP({R})} onUnitChange={(Ru,R)=>setP({Ru,R})} />
          <UiUnitField label={t('fields.sma_p')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.sma_pu} value={p.sma_p} min={0} onValueChange={(sma_p)=>setP({sma_p})} onUnitChange={(sma_pu,sma_p)=>setP({sma_pu,sma_p})} />
          <UiUnitField label={t('fields.disc_i_2')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.iu} value={p.i} min={0} onValueChange={(i)=>setP({i})} onUnitChange={(iu,i)=>setP({iu,i})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.wdot')} value={formatNumber(res,8)} unit="rad/s" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="arg-perigee-drift-j2"
          values={{ ...p, R: toSi(p.R, p.Ru), sma_p: toSi(p.sma_p, p.sma_pu), i: toSi(p.i, p.iu) }}
        />
      }
    />
  )
}
