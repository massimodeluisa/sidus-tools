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
  freeFallTimeConstG,
  freeFallSpeedConstG,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  h: numParam(100,{min:0}),
  hu: strParam('m', TOOL_UNIT_SETS.length),
  g: numParam(9.80665,{min:0.001}),
} as const

export function FreeFallTimeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const h=toSi(p.h,p.hu)
    const t=freeFallTimeConstG(h,p.g);const v=freeFallSpeedConstG(h,p.g);return t!=null&&v!=null?{t,v}:null
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_h')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.hu} value={p.h} min={0} onValueChange={(h)=>setP({h})} onUnitChange={(hu,h)=>setP({hu,h})} />
          <UiField label={t('fields.disc_g_2')} type="number" min={0.001}  step="any" value={p.g} onChange={(e)=>setP({g:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_t_2')} si={res.t} category="time" unitId="s" unitIds={TOOL_UNIT_SETS.time} digits={4} accent />
            <ResultCard label={t('fields.disc_v_2')} si={res.v} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="free-fall-time"
          values={{ ...p, h: toSi(p.h, p.hu) }}
        />
      }
    />
  )
}
