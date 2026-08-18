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
  thrusterImpulseBit,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  F: numParam(1,{min:0}),
  Fu: strParam('N', TOOL_UNIT_SETS.force),
  ton: numParam(50,{min:0}),
  tonu: strParam('ms', TOOL_UNIT_SETS.time),
} as const

export function ThrusterImpulseBitTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const F=toSi(p.F,p.Fu)
    const ton=toSi(p.ton,p.tonu)
    return thrusterImpulseBit(F,ton)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_f')} category="force" unitIds={TOOL_UNIT_SETS.force} unitId={p.Fu} value={p.F} min={0} onValueChange={(F)=>setP({F})} onUnitChange={(Fu,F)=>setP({Fu,F})} />
          <UiUnitField label={t('fields.ton')} category="time" unitIds={TOOL_UNIT_SETS.time} unitId={p.tonu} value={p.ton} min={0} onValueChange={(ton)=>setP({ton})} onUnitChange={(tonu,ton)=>setP({tonu,ton})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.ibit')} value={formatNumber(res,6)} unit="N·s" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="thruster-impulse-bit"
          values={{ ...p, F: toSi(p.F, p.Fu), ton: toSi(p.ton, p.tonu) }}
        />
      }
    />
  )
}
