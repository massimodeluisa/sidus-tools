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
  revisitTimeSimple,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  T: numParam(95,{min:0}),
  Tu: strParam('min', TOOL_UNIT_SETS.time),
  swath: numParam(100,{min:0}),
  swathu: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function RevisitTimeSimpleTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const T=toSi(p.T,p.Tu)
    const swath=toSi(p.swath,p.swathu)
    return revisitTimeSimple(T,swath)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_t')} category="time" unitIds={TOOL_UNIT_SETS.time} unitId={p.Tu} value={p.T} min={0} onValueChange={(T)=>setP({T})} onUnitChange={(Tu,T)=>setP({Tu,T})} />
          <UiUnitField label={t('fields.swath')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.swathu} value={p.swath} min={0} onValueChange={(swath)=>setP({swath})} onUnitChange={(swathu,swath)=>setP({swathu,swath})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.trev')} si={res} category="time" unitId="s" unitIds={TOOL_UNIT_SETS.time} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="revisit-time-simple"
          values={{ ...p, T: toSi(p.T, p.Tu), swath: toSi(p.swath, p.swathu) }}
        />
      }
    />
  )
}
