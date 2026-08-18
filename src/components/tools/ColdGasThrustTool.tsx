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
  coldGasThrust,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  mdot: numParam(0.005,{min:1e-9}),
  ve: numParam(700,{min:0}),
  veu: strParam('mps', TOOL_UNIT_SETS.velocity),
} as const

export function ColdGasThrustTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const ve=toSi(p.ve,p.veu)
    return coldGasThrust(p.mdot,ve)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.mdot')} type="number" min={1e-9}  step="any" value={p.mdot} onChange={(e)=>setP({mdot:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_ve')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.veu} value={p.ve} min={0} onValueChange={(ve)=>setP({ve})} onUnitChange={(veu,ve)=>setP({veu,ve})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_f')} value={formatNumber(res,4)} unit="N" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="cold-gas-thrust"
          values={{ ...p, ve: toSi(p.ve, p.veu) }}
        />
      }
    />
  )
}
