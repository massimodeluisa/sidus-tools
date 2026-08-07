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
  coverageSwathWidth,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  h: numParam(500,{min:0}),
  hu: strParam('km', TOOL_UNIT_SETS.length),
  fov: numParam(20,{min:0}),
  fovu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function CoverageSwathTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const h=toSi(p.h,p.hu)
    const fov=toSi(p.fov,p.fovu)
    return coverageSwathWidth(h,fov)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_h')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.hu} value={p.h} min={0} onValueChange={(h)=>setP({h})} onUnitChange={(hu,h)=>setP({hu,h})} />
          <UiUnitField label={t('fields.fov')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.fovu} value={p.fov} min={0} onValueChange={(fov)=>setP({fov})} onUnitChange={(fovu,fov)=>setP({fovu,fov})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.swath')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="coverage-swath"
          values={{ ...p, h: toSi(p.h, p.hu), fov: toSi(p.fov, p.fovu) }}
        />
      }
    />
  )
}
