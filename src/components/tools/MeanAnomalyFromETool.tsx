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
  meanAnomalyFromE,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  E: numParam(60,{min:0}),
  Eu: strParam('deg', TOOL_UNIT_SETS.angle),
  e: numParam(0.1,{min:0}),
} as const

export function MeanAnomalyFromETool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const E=toSi(p.E,p.Eu)
    return meanAnomalyFromE(E,p.e)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_e_2')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.Eu} value={p.E} min={0} onValueChange={(E)=>setP({E})} onUnitChange={(Eu,E)=>setP({Eu,E})} />
          <UiField label={t('fields.disc_e')} type="number" min={0}  step="any" value={p.e} onChange={(e)=>setP({e:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_m_2')} si={res} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="mean-anomaly-from-e"
          values={{ ...p, E: toSi(p.E, p.Eu) }}
        />
      }
    />
  )
}
