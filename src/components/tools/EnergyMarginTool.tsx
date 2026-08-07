import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, circularOrbitVelocity, escapeVelocity, getBody, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
} as const

/** Margin to escape from circular: Δv = v_esc − v_c = (√2−1) v_c */
export function EnergyMarginTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const r = body.radius + toSi(p.h, p.hu)
  const res = useMemo(() => {
    if (!(r > 0)) return null
    const vc = circularOrbitVelocity(body.mu, r)
    const ve = escapeVelocity(body.mu, r)
    return { vc, ve, dv: ve - vc, ratio: ve / vc }
  }, [body.mu, r])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField label={t('fields.altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.v_circ_escape')} si={res.dv} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.v_circ')} si={res.vc} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.v_esc')} si={res.ve} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.v_esc_v_c')} value={res.ratio.toFixed(6)} unit="√2" />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_radius')}</p>
        )
      }
      code={<CodeExport formulaId="escape-margin" values={{ r, mu: body.mu, R: body.radius, h: p.h, body: p.body }} />}
    />
  )
}
