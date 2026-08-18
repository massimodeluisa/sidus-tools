import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  circularOrbitVelocity,
  geoRadius,
  getBody,
  orbitalPeriod,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  period: numParam(86164.0905, { min: 1 }),
  pu: strParam('s', TOOL_UNIT_SETS.time),
} as const

export function GeoOrbitTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const periodS = toSi(p.period, p.pu)
  const res = useMemo(() => {
    const a = geoRadius(body.mu, periodS)
    if (a == null) return null
    const v = circularOrbitVelocity(body.mu, a)
    const h = a - body.radius
    return { a, v, h, T: orbitalPeriod(body.mu, a) }
  }, [body, periodS])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.sync_period')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.pu}
            value={p.period}
            min={1}
            onValueChange={(period) => setP({ period })}
            onUnitChange={(pu, period) => setP({ pu, period })}
            hint={t('fields.hint_sidereal_day')}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.a_geo')}
              si={res.a}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={2}
              accent
            />
            <ResultCard
              label={t('fields.altitude')}
              si={res.h}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.altitude}
              digits={2}
            />
            <ResultCard
              label={t('fields.v_circ')}
              si={res.v}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.period_check')}
              si={res.T}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_period')}</p>
        )
      }
      code={<CodeExport formulaId="geo-orbit" values={{ T: periodS, periodS, mu: body.mu, R: body.radius, period: p.period, body: p.body }} />}
    />
  )
}
