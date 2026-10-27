import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  repeatingGroundTrackPeriod,
} from '@/lib/physics'
import { numParam, useToolSearchParams } from '@/lib/use-tool-search-params'

const SCHEMA = {
  k: numParam(14,{min:1}),
  days: numParam(1,{min:0.001}),
} as const

export function RepeatingGroundTrackTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const k = Math.round(p.k)
  const res = useMemo(() => repeatingGroundTrackPeriod(k, p.days), [k, p.days])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_k')} type="number" min={1} step={1} value={p.k} hint={t('fields.hint_repeat_k')} onChange={(e)=>setP({k:Number(e.target.value)})} />
          <UiField label={t('fields.days')} type="number" min={0.001}  step="any" value={p.days} onChange={(e)=>setP({days:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_t')} si={res} category="time" unitId="s" unitIds={TOOL_UNIT_SETS.time} digits={4} accent />
          </div>
        )
      }
      code={
        res == null ? undefined : (
          <CodeExport
            formulaId="repeating-ground-track"
            values={{ ...p, k }}
          />
        )
      }
    />
  )
}
