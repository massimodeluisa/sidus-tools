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
  sunSensorAngle,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  bx: numParam(0),
  by: numParam(0),
  bz: numParam(1),
  sx: numParam(0.2),
  sy: numParam(0.1),
  sz: numParam(0.97),
  fov: numParam(60,{min:0}),
  fovu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function SunSensorConeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const fov=toSi(p.fov,p.fovu)
    const ang=sunSensorAngle([p.bx,p.by,p.bz],[p.sx,p.sy,p.sz]);if(ang==null)return null;return{ang,inFov:ang<=fov?1:0}
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_bx')} type="number"   step="any" value={p.bx} onChange={(e)=>setP({bx:Number(e.target.value)})} />
          <UiField label={t('fields.disc_by')} type="number"   step="any" value={p.by} onChange={(e)=>setP({by:Number(e.target.value)})} />
          <UiField label={t('fields.disc_bz')} type="number"   step="any" value={p.bz} onChange={(e)=>setP({bz:Number(e.target.value)})} />
          <UiField label={t('fields.disc_sx')} type="number"   step="any" value={p.sx} onChange={(e)=>setP({sx:Number(e.target.value)})} />
          <UiField label={t('fields.disc_sy')} type="number"   step="any" value={p.sy} onChange={(e)=>setP({sy:Number(e.target.value)})} />
          <UiField label={t('fields.disc_sz')} type="number"   step="any" value={p.sz} onChange={(e)=>setP({sz:Number(e.target.value)})} />
          <UiUnitField label={t('fields.fov')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.fovu} value={p.fov} min={0} onValueChange={(fov)=>setP({fov})} onUnitChange={(fovu,fov)=>setP({fovu,fov})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.angle')} si={res.ang} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} accent />
            <ResultCard label={t('fields.infov')} value={formatNumber(res.inFov,6)} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="sun-sensor-cone"
          values={{ ...p, fov: toSi(p.fov, p.fovu) }}
        />
      }
    />
  )
}
