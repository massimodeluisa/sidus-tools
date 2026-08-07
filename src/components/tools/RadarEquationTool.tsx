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
  radarReceivedPower,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  pt: numParam(1000,{min:0.000001}),
  G: numParam(1000,{min:0.1}),
  lam: numParam(0.03,{min:1e-9}),
  rcs: numParam(10,{min:0.000001}),
  R: numParam(500,{min:0}),
  Ru: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function RadarEquationTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const R=toSi(p.R,p.Ru)
    return radarReceivedPower({pt:p.pt,g:p.G,wavelength:p.lam,rcs:p.rcs,range:R})
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_pt')} type="number" min={0.000001}  step="any" value={p.pt} onChange={(e)=>setP({pt:Number(e.target.value)})} />
          <UiField label={t('fields.disc_g')} type="number" min={0.1}  step="any" value={p.G} onChange={(e)=>setP({G:Number(e.target.value)})} />
          <UiField label={t('fields.lam')} type="number" min={1e-9}  step="any" value={p.lam} onChange={(e)=>setP({lam:Number(e.target.value)})} />
          <UiField label={t('fields.rcs')} type="number" min={0.000001}  step="any" value={p.rcs} onChange={(e)=>setP({rcs:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_r')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.Ru} value={p.R} min={0} onValueChange={(R)=>setP({R})} onUnitChange={(Ru,R)=>setP({Ru,R})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_pr')} value={formatNumber(res,6)} unit="W" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="radar-equation"
          values={{ ...p, R: toSi(p.R, p.Ru) }}
        />
      }
    />
  )
}
