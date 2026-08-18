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
  relativityClockRate,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  dPhi: numParam(60000000),
  v: numParam(7000,{min:0}),
  vu: strParam('mps', TOOL_UNIT_SETS.velocity),
} as const

export function RelativityClockRateTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const v=toSi(p.v,p.vu)
    return relativityClockRate(p.dPhi,v)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.dphi')} type="number"   step="any" value={p.dPhi} onChange={(e)=>setP({dPhi:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_v_2')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.v} min={0} onValueChange={(v)=>setP({v})} onUnitChange={(vu,v)=>setP({vu,v})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.dff')} value={formatNumber(res,6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="relativity-clock-rate"
          values={{ ...p, v: toSi(p.v, p.vu) }}
        />
      }
    />
  )
}
