import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  toSi,
  hillSphere,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  a: numParam(1,{min:0}),
  au: strParam('au', TOOL_UNIT_SETS.length),
  m: numParam(5.972e+24,{min:0}),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  M: numParam(1.989e+30,{min:0}),
  Mu: strParam('kg', TOOL_UNIT_SETS.mass),
} as const

export function HillSphereTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const a=toSi(p.a,p.au)
    const m=toSi(p.m,p.mu)
    const M=toSi(p.M,p.Mu)
    return hillSphere(a,m,M)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_a_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.au} value={p.a} min={0} onValueChange={(a)=>setP({a})} onUnitChange={(au,a)=>setP({au,a})} />
          <UiUnitField label={t('fields.disc_m')} category="mass" unitIds={TOOL_UNIT_SETS.mass} unitId={p.mu} value={p.m} min={0} onValueChange={(m)=>setP({m})} onUnitChange={(mu,m)=>setP({mu,m})} />
          <UiUnitField label={t('fields.disc_m_2')} category="mass" unitIds={TOOL_UNIT_SETS.mass} unitId={p.Mu} value={p.M} min={0} onValueChange={(M)=>setP({M})} onUnitChange={(Mu,M)=>setP({Mu,M})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_rh')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="hill-sphere"
          values={{ ...p, a: toSi(p.a, p.au), m: toSi(p.m, p.mu), M: toSi(p.M, p.Mu) }}
        />
      }
    />
  )
}
