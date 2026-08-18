import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  walkerSpacing,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  T: numParam(24,{min:1}),
  P: numParam(3,{min:1}),
} as const

export function ConstellationWalkerTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return walkerSpacing(Math.round(p.T),Math.round(p.P))
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_t')} type="number" min={1}  step="any" value={p.T} onChange={(e)=>setP({T:Number(e.target.value)})} />
          <UiField label={t('fields.disc_p')} type="number" min={1}  step="any" value={p.P} onChange={(e)=>setP({P:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.spp')} value={formatNumber(res.satsPerPlane,6)} accent />
            <ResultCard label={t('fields.din')} value={formatNumber(res.inPlaneSpacingRad,6)} unit="rad" />
            <ResultCard label={t('fields.dpl')} value={formatNumber(res.planeSpacingRad,6)} unit="rad" />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="constellation-walker"
          values={{ ...p }}
        />
      }
    />
  )
}
