import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, getBody, j2RaanRate, raanPeriodS, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  a: numParam(7000, { min: 0.001 }),
  au: strParam('km', TOOL_UNIT_SETS.length),
  e: numParam(0.001, { min: 0, max: 0.999 }),
  i: numParam(98),
  iu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function NodalPeriodTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a = toSi(p.a, p.au)
  const i = toSi(p.i, p.iu)
  const res = useMemo(() => {
    const rate = j2RaanRate(body.mu, a, p.e, i)
    if (rate == null) return null
    const T = raanPeriodS(rate)
    return { rate, T, degDay: (rate * 180) / Math.PI * 86400 }
  }, [body.mu, a, p.e, i])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.a')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.au}
            value={p.a}
            min={0.001}
            onValueChange={(a) => setP({ a })}
            onUnitChange={(au, a) => setP({ au, a })}
          />
          <UiField
            label={t('fields.e')}
            type="number"
            value={p.e}
            min={0}
            max={0.999}
            step={0.001}
            onChange={(e) => setP({ e: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.i')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.iu}
            value={p.i}
            onValueChange={(i) => setP({ i })}
            onUnitChange={(iu, i) => setP({ iu, i })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.f__5')} value={res.degDay.toFixed(4)} unit="°/day" accent />
            <ResultCard
              label={t('fields.nodal_period_2')}
              si={res.T != null ? Math.abs(res.T) : NaN}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
            />
            {res.T != null ? (
              <ResultCard
                label={t('fields.days_full_raan')}
                si={Math.abs(res.T)}
                category="time"
                unitId="d"
                unitIds={TOOL_UNIT_SETS.time}
                digits={2}
              />
            ) : null}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_elements')}</p>
        )
      }
      code={
        <CodeExport
          formulaId="nodal-period"
          values={{ a, i, e: p.e, mu: body.mu, R: body.radius, raan_rate: res?.rate }}
        />
      }
    />
  )
}
