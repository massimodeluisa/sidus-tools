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
  thrustFromCf,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  Cf: numParam(1.7,{min:0.1}),
  pc: numParam(70,{min:0}),
  pcu: strParam('bar', TOOL_UNIT_SETS.pressure),
  At: numParam(0.05,{min:1e-9}),
} as const

export function RocketThrustChamberTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const pc=toSi(p.pc,p.pcu)
    return thrustFromCf(p.Cf,pc,p.At)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_cf')} type="number" min={0.1}  step="any" value={p.Cf} onChange={(e)=>setP({Cf:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_pc')} category="pressure" unitIds={TOOL_UNIT_SETS.pressure} unitId={p.pcu} value={p.pc} min={0} onValueChange={(pc)=>setP({pc})} onUnitChange={(pcu,pc)=>setP({pcu,pc})} />
          <UiField label={t('fields.disc_at')} type="number" min={1e-9}  step="any" value={p.At} onChange={(e)=>setP({At:Number(e.target.value)})} />
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
          formulaId="rocket-thrust-chamber"
          values={{ ...p, pc: toSi(p.pc, p.pcu) }}
        />
      }
    />
  )
}
