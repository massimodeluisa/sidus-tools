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
  klobucharIonoDelayM,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  elev: numParam(30,{min:0}),
  elevu: strParam('deg', TOOL_UNIT_SETS.angle),
  tecu: numParam(10,{min:0}),
  f: numParam(1575420000,{min:1000000}),
} as const

export function GnssIonosphereKlobucharTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const elev=toSi(p.elev,p.elevu)
    return klobucharIonoDelayM(elev,p.tecu,p.f)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.elev')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.elevu} value={p.elev} min={0} onValueChange={(elev)=>setP({elev})} onUnitChange={(elevu,elev)=>setP({elevu,elev})} />
          <UiField label={t('fields.tecu')} type="number" min={0}  step="any" value={p.tecu} onChange={(e)=>setP({tecu:Number(e.target.value)})} />
          <UiField label={t('fields.disc_f_2')} type="number" min={1000000}  step="any" value={p.f} onChange={(e)=>setP({f:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.delay')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="gnss-ionosphere-klobuchar"
          values={{ ...p, elev: toSi(p.elev, p.elevu) }}
        />
      }
    />
  )
}
