import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, circularOrbitVelocity, deltaAFromTangentialDv, getBody, tangentialDvFromDeltaA, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  dv: numParam(10, { min: 0 }),
  dvu: strParam('mps', TOOL_UNIT_SETS.velocity),
  da: numParam(20, { min: 0 }),
  dau: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function DeltaABurnTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a = body.radius + toSi(p.h, p.hu)
  const dv = toSi(p.dv, p.dvu)
  const da = toSi(p.da, p.dau)
  const res = useMemo(() => {
    const v = circularOrbitVelocity(body.mu, a)
    const daFromDv = deltaAFromTangentialDv(a, v, dv)
    const dvFromDa = tangentialDvFromDeltaA(a, v, da)
    return daFromDv != null && dvFromDa != null ? { v, daFromDv, dvFromDa } : null
  }, [body.mu, a, dv, da])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
        <UiUnitField label={t('fields.tangential_v')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.dvu} value={p.dv} min={0} onValueChange={(dv) => setP({ dv })} onUnitChange={(dvu, dv) => setP({ dvu, dv })} />
        <UiUnitField label={t('fields.desired_a')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.dau} value={p.da} min={0} onValueChange={(da) => setP({ da })} onUnitChange={(dau, da) => setP({ dau, da })} />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.a_from_v')} si={res.daFromDv} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={3} accent />
        <ResultCard label={t('fields.v_from_a')} si={res.dvFromDa} category="velocity" unitId="mps" unitIds={TOOL_UNIT_SETS.velocity} digits={3} />
        <ResultCard label={t('fields.v_circ')} si={res.v} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.invalid_circular_orbit')}</p>}
      code={<CodeExport formulaId="delta-a-burn" values={{ dv, da, h: toSi(p.h, p.hu), mu: body.mu, R: body.radius, body: p.body }} />}
    />
  )
}
