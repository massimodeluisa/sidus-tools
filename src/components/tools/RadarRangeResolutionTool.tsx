import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  radarRangeResolution,
} from '@/lib/physics'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  B: numParam(50000000,{min:1}),
} as const

export function RadarRangeResolutionTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return radarRangeResolution(p.B)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_b')} type="number" min={1}  step="any" value={p.B} onChange={(e)=>setP({B:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_dr')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="radar-range-resolution"
          values={{ ...p }}
        />
      }
    />
  )
}
