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
  opticalLinkReceivedPower,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  pt: numParam(1,{min:1e-12}),
  etaT: numParam(0.7,{min:0.01}),
  etaR: numParam(0.7,{min:0.01}),
  gt: numParam(1000000,{min:1}),
  gr: numParam(1000000,{min:1}),
  lam: numParam(0.00000155,{min:1e-9}),
  R: numParam(1000,{min:0}),
  Ru: strParam('km', TOOL_UNIT_SETS.length),
  L: numParam(2,{min:1}),
} as const

export function LaserLinkBudgetTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const R=toSi(p.R,p.Ru)
    return opticalLinkReceivedPower({ptW:p.pt,etaT:p.etaT,etaR:p.etaR,gt:p.gt,gr:p.gr,wavelengthM:p.lam,rangeM:R,lossLin:p.L})
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_pt')} type="number" min={1e-12}  step="any" value={p.pt} onChange={(e)=>setP({pt:Number(e.target.value)})} />
          <UiField label={t('fields.etat')} type="number" min={0.01}  step="any" value={p.etaT} onChange={(e)=>setP({etaT:Number(e.target.value)})} />
          <UiField label={t('fields.etar')} type="number" min={0.01}  step="any" value={p.etaR} onChange={(e)=>setP({etaR:Number(e.target.value)})} />
          <UiField label={t('fields.disc_gt')} type="number" min={1}  step="any" value={p.gt} onChange={(e)=>setP({gt:Number(e.target.value)})} />
          <UiField label={t('fields.disc_gr')} type="number" min={1}  step="any" value={p.gr} onChange={(e)=>setP({gr:Number(e.target.value)})} />
          <UiField label={t('fields.lam')} type="number" min={1e-9}  step="any" value={p.lam} onChange={(e)=>setP({lam:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_r')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.Ru} value={p.R} min={0} onValueChange={(R)=>setP({R})} onUnitChange={(Ru,R)=>setP({Ru,R})} />
          <UiField label={t('fields.disc_l')} type="number" min={1}  step="any" value={p.L} onChange={(e)=>setP({L:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_pr')} value={formatNumber(res,6)} unit="W" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="laser-link-budget"
          values={{ ...p, R: toSi(p.R, p.Ru) }}
        />
      }
    />
  )
}
