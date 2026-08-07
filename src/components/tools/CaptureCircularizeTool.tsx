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
  captureCircularizeDv,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  mu: numParam(398600441800000,{min:1}),
  rp: numParam(6578,{min:0}),
  rpu: strParam('km', TOOL_UNIT_SETS.length),
  vinf: numParam(1,{min:0}),
  vinfu: strParam('kmps', TOOL_UNIT_SETS.velocity),
} as const

export function CaptureCircularizeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const rp=toSi(p.rp,p.rpu)
    const vinf=toSi(p.vinf,p.vinfu)
    return captureCircularizeDv(p.mu,rp,vinf)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_mu')} type="number" min={1}  step="any" value={p.mu} onChange={(e)=>setP({mu:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_rp')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.rpu} value={p.rp} min={0} onValueChange={(rp)=>setP({rp})} onUnitChange={(rpu,rp)=>setP({rpu,rp})} />
          <UiUnitField label={t('fields.vinf')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vinfu} value={p.vinf} min={0} onValueChange={(vinf)=>setP({vinf})} onUnitChange={(vinfu,vinf)=>setP({vinfu,vinf})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_dv')} si={res} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="capture-circularize"
          values={{ ...p, rp: toSi(p.rp, p.rpu), vinf: toSi(p.vinf, p.vinfu) }}
        />
      }
    />
  )
}
