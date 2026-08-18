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
  wienPeakWavelength,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  T: numParam(5800,{min:0}),
  Tu: strParam('K', TOOL_UNIT_SETS.temperature),
} as const

export function WienPeakTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const T=toSi(p.T,p.Tu)
    return wienPeakWavelength(T)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_t')} category="temperature" unitIds={TOOL_UNIT_SETS.temperature} unitId={p.Tu} value={p.T} min={0} onValueChange={(T)=>setP({T})} onUnitChange={(Tu,T)=>setP({Tu,T})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.lam')} value={formatNumber(res,6)} unit="m" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="wien-peak"
          values={{ ...p, T: toSi(p.T, p.Tu) }}
        />
      }
    />
  )
}
