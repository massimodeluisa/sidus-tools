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
  stefanBoltzmannPower,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  A: numParam(1,{min:0.000001}),
  T: numParam(300,{min:0}),
  Tu: strParam('K', TOOL_UNIT_SETS.temperature),
  eps: numParam(0.8,{min:0.01}),
} as const

export function StefanBoltzmannTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const T=toSi(p.T,p.Tu)
    return stefanBoltzmannPower(p.A,T,p.eps)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_a')} type="number" min={0.000001}  step="any" value={p.A} onChange={(e)=>setP({A:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_t')} category="temperature" unitIds={TOOL_UNIT_SETS.temperature} unitId={p.Tu} value={p.T} min={0} onValueChange={(T)=>setP({T})} onUnitChange={(Tu,T)=>setP({Tu,T})} />
          <UiField label={t('fields.eps')} type="number" min={0.01}  step="any" value={p.eps} onChange={(e)=>setP({eps:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_p')} value={formatNumber(res,6)} unit="W" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="stefan-boltzmann"
          values={{ ...p, T: toSi(p.T, p.Tu) }}
        />
      }
    />
  )
}
