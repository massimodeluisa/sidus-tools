import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiSelect } from '@/components/shared/UiSelect'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  laserRangeFromRtt,
  laserRangeFromTof,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  t: numParam(0.002,{min:1e-12}),
  mode: strParam('rtt', ["rtt","one"] as const),
} as const

export function LaserTimeOfFlightTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return p.mode==='one'?laserRangeFromTof(p.t):laserRangeFromRtt(p.t)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_t_2')} type="number" min={1e-12}  step="any" value={p.t} onChange={(e)=>setP({t:Number(e.target.value)})} />
          <UiSelect label={t('fields.disc_mode')} value={p.mode} onChange={(e)=>setP({mode:e.target.value})} options={[{value:'rtt',label:t('fields.round_trip')},{value:'one',label:t('fields.one_way')}]} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.range')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="laser-time-of-flight"
          values={{ ...p }}
        />
      }
    />
  )
}
