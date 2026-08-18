import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  gnssPseudorange,
} from '@/lib/physics'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  tTx: numParam(0),
  tRx: numParam(0.07),
  bias: numParam(0),
} as const

export function GnssPseudorangeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return gnssPseudorange(p.tTx,p.tRx,p.bias)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.ttx')} type="number"   step="any" value={p.tTx} onChange={(e)=>setP({tTx:Number(e.target.value)})} />
          <UiField label={t('fields.trx')} type="number"   step="any" value={p.tRx} onChange={(e)=>setP({tRx:Number(e.target.value)})} />
          <UiField label={t('fields.bias')} type="number"   step="any" value={p.bias} onChange={(e)=>setP({bias:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.rho')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="gnss-pseudorange"
          values={{ ...p }}
        />
      }
    />
  )
}
