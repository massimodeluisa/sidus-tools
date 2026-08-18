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
  finiteBurnDv,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  ve: numParam(3000,{min:0}),
  veu: strParam('mps', TOOL_UNIT_SETS.velocity),
  m0: numParam(1000,{min:0}),
  m0u: strParam('kg', TOOL_UNIT_SETS.mass),
  mdot: numParam(2,{min:1e-9}),
  tb: numParam(100,{min:0}),
  tbu: strParam('s', TOOL_UNIT_SETS.time),
} as const

export function FiniteBurnDvTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const ve=toSi(p.ve,p.veu)
    const m0=toSi(p.m0,p.m0u)
    const tb=toSi(p.tb,p.tbu)
    return finiteBurnDv(ve,m0,p.mdot,tb)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_ve')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.veu} value={p.ve} min={0} onValueChange={(ve)=>setP({ve})} onUnitChange={(veu,ve)=>setP({veu,ve})} />
          <UiUnitField label={t('fields.disc_m0')} category="mass" unitIds={TOOL_UNIT_SETS.mass} unitId={p.m0u} value={p.m0} min={0} onValueChange={(m0)=>setP({m0})} onUnitChange={(m0u,m0)=>setP({m0u,m0})} />
          <UiField label={t('fields.mdot')} type="number" min={1e-9}  step="any" value={p.mdot} onChange={(e)=>setP({mdot:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_tb')} category="time" unitIds={TOOL_UNIT_SETS.time} unitId={p.tbu} value={p.tb} min={0} onValueChange={(tb)=>setP({tb})} onUnitChange={(tbu,tb)=>setP({tbu,tb})} />
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
          formulaId="finite-burn-dv"
          values={{ ...p, ve: toSi(p.ve, p.veu), m0: toSi(p.m0, p.m0u), tb: toSi(p.tb, p.tbu) }}
        />
      }
    />
  )
}
