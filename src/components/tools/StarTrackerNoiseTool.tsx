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
  starTrackerNoiseRad,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  pix: numParam(20,{min:0}),
  pixu: strParam('arcsec', TOOL_UNIT_SETS.angle),
  n: numParam(16,{min:1}),
} as const

export function StarTrackerNoiseTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const pix=toSi(p.pix,p.pixu)
    return starTrackerNoiseRad(pix,p.n)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.pix')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.pixu} value={p.pix} min={0} onValueChange={(pix)=>setP({pix})} onUnitChange={(pixu,pix)=>setP({pixu,pix})} />
          <UiField label={t('fields.disc_n')} type="number" min={1}  step="any" value={p.n} onChange={(e)=>setP({n:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.sigma')} si={res} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="star-tracker-noise"
          values={{ ...p, pix: toSi(p.pix, p.pixu) }}
        />
      }
    />
  )
}
