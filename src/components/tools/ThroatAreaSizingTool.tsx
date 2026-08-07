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
  throatAreaFromThrust,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  F: numParam(500,{min:0}),
  Fu: strParam('kN', TOOL_UNIT_SETS.force),
  Cf: numParam(1.6,{min:0.1}),
  pc: numParam(100,{min:0}),
  pcu: strParam('bar', TOOL_UNIT_SETS.pressure),
} as const

export function ThroatAreaSizingTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const F=toSi(p.F,p.Fu)
    const pc=toSi(p.pc,p.pcu)
    return throatAreaFromThrust(F,p.Cf,pc)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_f')} category="force" unitIds={TOOL_UNIT_SETS.force} unitId={p.Fu} value={p.F} min={0} onValueChange={(F)=>setP({F})} onUnitChange={(Fu,F)=>setP({Fu,F})} />
          <UiField label={t('fields.disc_cf')} type="number" min={0.1}  step="any" value={p.Cf} onChange={(e)=>setP({Cf:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_pc')} category="pressure" unitIds={TOOL_UNIT_SETS.pressure} unitId={p.pcu} value={p.pc} min={0} onValueChange={(pc)=>setP({pc})} onUnitChange={(pcu,pc)=>setP({pcu,pc})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_at')} value={formatNumber(res,6)} unit="m²" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="throat-area-sizing"
          values={{ ...p, F: toSi(p.F, p.Fu), pc: toSi(p.pc, p.pcu) }}
        />
      }
    />
  )
}
