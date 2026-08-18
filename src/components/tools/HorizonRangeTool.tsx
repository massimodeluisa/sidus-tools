import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, getBody, horizonSlantRange, lightTime, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
} as const

export function HorizonRangeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const h = toSi(p.h, p.hu)
  const res = useMemo(() => {
    const d = horizonSlantRange(h, body.radius)
    if (d == null) return null
    return { d, t: lightTime(d) }
  }, [h, body.radius])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.observer_sat_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} hint={t('fields.hint_horizon_geom')} />
      </ParamsGrid>}
      results={res ? <div className="sidus-results">
        <ResultCard label={t('fields.slant_range_to_horizon')} si={res.d} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={2} accent />
        {res.t != null ? <ResultCard label={t('fields.one_way_light_time')} value={`${(res.t * 1000).toFixed(2)} ms`} /> : null}
      </div> : <p className="font-mono text-sm text-muted">{t('fields.invalid_altitude')}</p>}
      code={<CodeExport formulaId="horizon-range" values={{ h, R: body.radius, body: p.body }} />}
    />
  )
}
