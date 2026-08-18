import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  rwMomentum,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  I: numParam(0.01,{min:1e-9}),
  w: numParam(500,{min:0}),
} as const

export function RwMomentumCapacityTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return rwMomentum(p.I,p.w)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_i')} type="number" min={1e-9}  step="any" value={p.I} onChange={(e)=>setP({I:Number(e.target.value)})} />
          <UiField label={t('fields.disc_w')} type="number" min={0}  step="any" value={p.w} onChange={(e)=>setP({w:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_h')} value={formatNumber(res,6)} unit="N·m·s" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="rw-momentum-capacity"
          values={{ ...p }}
        />
      }
    />
  )
}
