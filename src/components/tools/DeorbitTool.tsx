import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, deorbitBurn, entryInterfaceSpeed, getBody, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hp: numParam(80, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

export function DeorbitTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const r = body.radius + toSi(p.h, p.hu)
  const rp = body.radius + toSi(p.hp, p.hu)
  const res = useMemo(() => {
    const d = deorbitBurn(body.mu, r, rp)
    const ve = entryInterfaceSpeed(body.mu, r, rp)
    return d && ve != null ? { ...d, ve } : null
  }, [body.mu, r, rp])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
        <UiUnitField label={t('fields.target_periapsis_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.hp} min={0} onValueChange={(hp) => setP({ hp })} onUnitChange={(hu, hp) => setP({ hu, hp })} hint={t('fields.hint_deorbit_interface')} />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.deorbit_v')} si={res.dv} category="velocity" unitId="mps" unitIds={TOOL_UNIT_SETS.velocity} digits={2} accent />
        <ResultCard label={t('fields.v_at_periapsis_2')} si={res.ve} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
        <ResultCard label={t('fields.half_period_tof')} si={res.tofHalf} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
        <ResultCard label={t('fields.transfer_a')} si={res.a} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={1} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.need_circ_above_peri')}</p>}
      code={<CodeExport formulaId="deorbit" values={{ h: toSi(p.h, p.hu), hp: toSi(p.hp, p.hu), mu: body.mu, R: body.radius, body: p.body }} />}
    />
  )
}
