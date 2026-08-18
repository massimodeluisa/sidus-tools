import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, eclipseWithBeta, getBody, meanMotionFromAltitude, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  beta: numParam(30),
  betaU: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function EclipseBetaTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const h = toSi(p.h, p.hu)
  const betaRad = toSi(p.beta, p.betaU)
  const res = useMemo(() => {
    const m = meanMotionFromAltitude(h, body.mu, body.radius)
    if (!m) return null
    const te = eclipseWithBeta(m.a, body.radius, betaRad, m.period)
    return { period: m.period, te, frac: te != null ? te / m.period : null }
  }, [h, body, betaRad])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
        <UiUnitField label={t('fields.beta_angle')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.betaU} value={p.beta} onValueChange={(beta) => setP({ beta })} onUnitChange={(betaU, beta) => setP({ betaU, beta })} hint={t('fields.sun_elev_hint')} />
      </ParamsGrid>}
      results={res && res.te != null && res.frac != null ? <div className="sidus-results">
        <ResultCard label={t('fields.eclipse_duration')} si={res.te} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} accent />
        <ResultCard label={t('fields.fraction')} value={(res.frac * 100).toFixed(2)} unit="%" />
        <ResultCard label={t('fields.orbit_period')} si={res.period} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.no_eclipse_beta')}</p>}
      code={<CodeExport formulaId="eclipse-beta" values={{ h, betaRad, mu: body.mu, R: body.radius, beta: p.beta, body: p.body, betaU: p.betaU }} />}
    />
  )
}
