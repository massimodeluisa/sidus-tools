import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, circularEclipseDuration, getBody, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

export function EclipseDurationTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a = body.radius + toSi(p.h, p.hu)
  const res = useMemo(() => circularEclipseDuration(a, body.radius, body.mu), [a, body])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} hint={t('fields.hint_eclipse_cylinder')} />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.eclipse_duration')} si={res.eclipseS} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} accent />
        <ResultCard label={t('fields.orbit_period')} si={res.period} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
        <ResultCard label={t('fields.fraction_in_shadow')} value={(res.fraction * 100).toFixed(2)} unit="%" />
        <ResultCard label={t('fields.half_angle')} si={res.betaRad} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={2} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.altitude_above_body')}</p>}
      code={
        <CodeExport
          formulaId="eclipse-duration"
          values={{
            a,
            R: body.radius,
            T: res?.period,
            mu: body.mu,
            h: p.h,
            body: p.body,
          }}
        />
      }
    />
  )
}
