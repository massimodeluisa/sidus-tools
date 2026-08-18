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
  earthIrFlux,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  h: numParam(400,{min:0}),
  hu: strParam('km', TOOL_UNIT_SETS.length),
  Te: numParam(255,{min:0}),
  Teu: strParam('K', TOOL_UNIT_SETS.temperature),
} as const

export function EarthIrFluxTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const h=toSi(p.h,p.hu)
    const Te=toSi(p.Te,p.Teu)
    return earthIrFlux(h,Te)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_h')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.hu} value={p.h} min={0} onValueChange={(h)=>setP({h})} onUnitChange={(hu,h)=>setP({hu,h})} />
          <UiUnitField label={t('fields.disc_te')} category="temperature" unitIds={TOOL_UNIT_SETS.temperature} unitId={p.Teu} value={p.Te} min={0} onValueChange={(Te)=>setP({Te})} onUnitChange={(Teu,Te)=>setP({Teu,Te})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_f')} value={formatNumber(res,4)} unit="W/m²" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="earth-ir-flux"
          values={{ ...p, h: toSi(p.h, p.hu), Te: toSi(p.Te, p.Teu) }}
        />
      }
    />
  )
}
