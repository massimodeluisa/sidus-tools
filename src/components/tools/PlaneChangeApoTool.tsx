import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, getBody, planeChangeAtApsides, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  hp: numParam(200, { min: 0 }),
  ha: numParam(35786, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  di: numParam(28.5),
  diu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function PlaneChangeApoTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const rp = body.radius + toSi(p.hp, p.hu)
  const ra = body.radius + toSi(p.ha, p.hu)
  const di = toSi(p.di, p.diu)
  const res = useMemo(() => planeChangeAtApsides(body.mu, rp, ra, di), [body.mu, rp, ra, di])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.periapsis_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.hp} min={0} onValueChange={(hp) => setP({ hp })} onUnitChange={(hu, hp) => setP({ hu, hp })} />
        <UiUnitField label={t('fields.apoapsis_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.ha} min={0} onValueChange={(ha) => setP({ ha })} onUnitChange={(hu, ha) => setP({ hu, ha })} />
        <UiUnitField label={t('fields.i_2')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.diu} value={p.di} onValueChange={(di) => setP({ di })} onUnitChange={(diu, di) => setP({ diu, di })} />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.v_at_periapsis')} si={res.dvPeri} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
        <ResultCard label={t('fields.v_at_apoapsis')} si={res.dvApo} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
        <ResultCard label={t('fields.cost_ratio_apo_peri')} value={res.ratio.toFixed(4)} />
        <ResultCard label={t('fields.savings_at_apo')} si={res.dvPeri - res.dvApo} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.need_ra_gt_rp')}</p>}
      code={
        <CodeExport
          formulaId="plane-change-apo"
          values={{
            di,
            mu: body.mu,
            R: body.radius,
            hp: toSi(p.hp, p.hu),
            ha: toSi(p.ha, p.hu),
            body: p.body,
          }}
        />
      }
    />
  )
}
