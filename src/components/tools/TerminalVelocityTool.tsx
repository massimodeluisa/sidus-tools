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
  terminalVelocity,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  m: numParam(100,{min:0}),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  Cd: numParam(1,{min:0.01}),
  A: numParam(1,{min:0.000001}),
  rho: numParam(1.225,{min:0.000001}),
  g: numParam(9.80665,{min:0.001}),
} as const

export function TerminalVelocityTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const m=toSi(p.m,p.mu)
    return terminalVelocity(m,p.Cd,p.A,p.rho,p.g)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_m')} category="mass" unitIds={TOOL_UNIT_SETS.mass} unitId={p.mu} value={p.m} min={0} onValueChange={(m)=>setP({m})} onUnitChange={(mu,m)=>setP({mu,m})} />
          <UiField label={t('fields.disc_cd')} type="number" min={0.01}  step="any" value={p.Cd} onChange={(e)=>setP({Cd:Number(e.target.value)})} />
          <UiField label={t('fields.disc_a')} type="number" min={0.000001}  step="any" value={p.A} onChange={(e)=>setP({A:Number(e.target.value)})} />
          <UiField label={t('fields.rho')} type="number" min={0.000001}  step="any" value={p.rho} onChange={(e)=>setP({rho:Number(e.target.value)})} />
          <UiField label={t('fields.disc_g_2')} type="number" min={0.001}  step="any" value={p.g} onChange={(e)=>setP({g:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.vterm')} si={res} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="terminal-velocity"
          values={{ ...p, m: toSi(p.m, p.mu) }}
        />
      }
    />
  )
}
