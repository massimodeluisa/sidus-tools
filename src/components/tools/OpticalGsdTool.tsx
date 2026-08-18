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
  opticalGsd,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  h: numParam(500,{min:0}),
  hu: strParam('km', TOOL_UNIT_SETS.length),
  ifov: numParam(0.02,{min:0}),
  ifovu: strParam('mrad', TOOL_UNIT_SETS.angle),
} as const

export function OpticalGsdTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const h=toSi(p.h,p.hu)
    const ifov=toSi(p.ifov,p.ifovu)
    return opticalGsd(h,ifov)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_h')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.hu} value={p.h} min={0} onValueChange={(h)=>setP({h})} onUnitChange={(hu,h)=>setP({hu,h})} />
          <UiUnitField label={t('fields.ifov')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.ifovu} value={p.ifov} min={0} onValueChange={(ifov)=>setP({ifov})} onUnitChange={(ifovu,ifov)=>setP({ifovu,ifov})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.gsd')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="optical-gsd"
          values={{ ...p, h: toSi(p.h, p.hu), ifov: toSi(p.ifov, p.ifovu) }}
        />
      }
    />
  )
}
