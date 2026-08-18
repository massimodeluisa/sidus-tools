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
  getBody,
  semiMajorFromPeriod,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  T: numParam(90, { min: 0.001 }),
  Tu: strParam('min', TOOL_UNIT_SETS.time),
} as const

export function PeriodMatchTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const T = toSi(p.T, p.Tu)
  const res = useMemo(() => {
    const a = semiMajorFromPeriod(body.mu, T)
    if (a == null) return null
    const h = a - body.radius
    const v = circularOrbitVelocity(body.mu, a)
    return { a, h, v, T }
  }, [body, T])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.target_period')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.Tu}
            value={p.T}
            min={0.001}
            onValueChange={(T) => setP({ T })}
            onUnitChange={(Tu, T) => setP({ Tu, T })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.a')}
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
              label={t('fields.period')}
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
      code={<CodeExport formulaId="period-match" values={{ T, mu: body.mu, R: body.radius, body: p.body }} />}
    />
  )
}
