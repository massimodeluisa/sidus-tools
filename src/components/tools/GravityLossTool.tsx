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
  gravityLossDv,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  g: numParam(9.80665,{min:0.001}),
  tb: numParam(120,{min:0}),
  tbu: strParam('s', TOOL_UNIT_SETS.time),
  gamma: numParam(45,{min:0}),
  gammau: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function GravityLossTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const tb=toSi(p.tb,p.tbu)
    const gamma=toSi(p.gamma,p.gammau)
    return gravityLossDv(p.g,tb,gamma)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_g_2')} type="number" min={0.001}  step="any" value={p.g} onChange={(e)=>setP({g:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_tb')} category="time" unitIds={TOOL_UNIT_SETS.time} unitId={p.tbu} value={p.tb} min={0} onValueChange={(tb)=>setP({tb})} onUnitChange={(tbu,tb)=>setP({tbu,tb})} />
          <UiUnitField label={t('fields.gamma')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.gammau} value={p.gamma} min={0} onValueChange={(gamma)=>setP({gamma})} onUnitChange={(gammau,gamma)=>setP({gammau,gamma})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.dvgl')} si={res} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="gravity-loss"
          values={{ ...p, tb: toSi(p.tb, p.tbu), gamma: toSi(p.gamma, p.gammau) }}
        />
      }
    />
  )
}
