import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { losRangeRate, TOOL_UNIT_SETS } from '@/lib/physics'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  x: numParam(1000), y: numParam(5000), z: numParam(200),
  vx: numParam(-1), vy: numParam(0.5), vz: numParam(0.1),
} as const

export function LosRangeRateTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => losRangeRate([p.x, p.y, p.z], [p.vx, p.vy, p.vz]), [p.x, p.y, p.z, p.vx, p.vy, p.vz])
  return (
    <ToolShell
      parameters={<div className="space-y-3">
        <p className="font-mono text-[10px] text-subtle">{t('fields.note_los_frame')}</p>
        {(['x','y','z'] as const).map((k) => (
          <UiField key={k} label={`r_${k}`} type="number" value={p[k]} onChange={(e) => setP({ [k]: Number(e.target.value) })} unit="m" />
        ))}
        {(['vx','vy','vz'] as const).map((k) => (
          <UiField key={k} label={k} type="number" value={p[k]} onChange={(e) => setP({ [k]: Number(e.target.value) })} unit="m/s" />
        ))}
      </div>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.range_2')} si={res.range} category="length" unitId="m" unitIds={TOOL_UNIT_SETS.length} digits={2} accent />
        <ResultCard label={t('fields.range_rate')} si={res.rangeRate} category="velocity" unitId="mps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.r_must_nonzero')}</p>}
      code={<CodeExport formulaId="los-range-rate" values={{ x: p.x, vx: p.vx }} />}
    />
  )
}
