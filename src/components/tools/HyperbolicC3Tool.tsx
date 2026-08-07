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
  characteristicEnergy,
  departureBurnFromCircular,
  getBody,
  gravityAssistTurn,
  hyperbolicEccentricity,
  hyperbolicPeriapsisSpeed,
  hyperbolicSma,
  TOOL_UNIT_SETS,
  toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(300, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  vinf: numParam(3.0, { min: 0 }),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity) } as const

export function HyperbolicC3Tool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const h = toSi(p.h, p.hu)
  const vInf = toSi(p.vinf, p.vu)
  const r = body.radius + h

  const res = useMemo(() => {
    const burn = departureBurnFromCircular(body.mu, r, vInf)
    if (!burn) return null
    const a = hyperbolicSma(body.mu, vInf)
    const e = hyperbolicEccentricity(body.mu, r, vInf)
    const delta = e != null ? gravityAssistTurn(e) : null
    const vp = hyperbolicPeriapsisSpeed(body.mu, r, vInf)
    return { ...burn, a, e, delta, vp, c3: characteristicEnergy(vInf) }
  }, [body.mu, r, vInf])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField label={t('fields.periapsis_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
          <UiUnitField label={t('fields.v_hyperbolic_excess')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.vinf} min={0} onValueChange={(vinf) => setP({ vinf })} onUnitChange={(vu, vinf) => setP({ vu, vinf })} />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.c3')}
              si={res.c3}
              category="specificEnergy"
              unitId="km2ps2"
              unitIds={TOOL_UNIT_SETS.c3}
              digits={4}
              accent
            />
            <ResultCard label={t('fields.v_circ_hyper')} si={res.dv} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.v_p')} si={res.vp ?? 0} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.v_circ')} si={res.vc} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            {res.a != null ? <ResultCard label={t('fields.a_hyperbola')} si={res.a} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={1} /> : null}
            {res.e != null ? <ResultCard label={t('fields.e')} value={res.e.toFixed(5)} /> : null}
            {res.delta != null ? <ResultCard label={t('fields.turn_flyby')} si={res.delta} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={2} /> : null}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_hyperbolic_c3')}</p>
        )
      }
      code={<CodeExport formulaId="hyperbolic-c3" values={{ h, vInf, r, mu: body.mu, R: body.radius, vinf: p.vinf, v_inf: vInf, body: p.body }} />}
    />
  )
}
