import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, apoapsisRaiseFromCircular, getBody, orbitalPeriod, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(200, { min: 0 }),
  ha: numParam(35786, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

export function ApoRaiseTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const r = body.radius + toSi(p.h, p.hu)
  const ra = body.radius + toSi(p.ha, p.hu)
  const res = useMemo(() => {
    const d = apoapsisRaiseFromCircular(body.mu, r, ra)
    if (!d) return null
    return { ...d, T: orbitalPeriod(body.mu, d.a) }
  }, [body.mu, r, ra])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.circular_altitude_burn')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
        <UiUnitField label={t('fields.target_apoapsis_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.ha} min={0} onValueChange={(ha) => setP({ ha })} onUnitChange={(hu, ha) => setP({ hu, ha })} />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.v_raise_apo')} si={res.dv} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
        <ResultCard label={t('fields.v_p_after_burn')} si={res.vp} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
        <ResultCard label={t('fields.transfer_a')} si={res.a} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={1} />
        <ResultCard label={t('fields.period_ellipse')} si={res.T} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.need_target_apo_above_burn')}</p>}
      code={<CodeExport formulaId="apo-raise" values={{ h: toSi(p.h, p.hu), ha: toSi(p.ha, p.hu), mu: body.mu, R: body.radius, body: p.body }} />}
    />
  )
}
