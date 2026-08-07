import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, getBody, oberthCompare, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

// Classic GTO-class ellipse: rp≈6678 km, ra≈42164 km → a≈24421 km, e≈0.73
const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  a: numParam(24421, { min: 0.001 }),
  au: strParam('km', TOOL_UNIT_SETS.length),
  e: numParam(0.73, { min: 0, max: 0.999 }),
  dv: numParam(1, { min: 0 }),
  dvu: strParam('kmps', TOOL_UNIT_SETS.velocity),
} as const

export function OberthTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a = toSi(p.a, p.au)
  const dv = toSi(p.dv, p.dvu)
  const res = useMemo(() => oberthCompare(body.mu, a, p.e, dv), [body.mu, a, p.e, dv])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.semi_major_a')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.au} value={p.a} min={0.001} onValueChange={(a) => setP({ a })} onUnitChange={(au, a) => setP({ au, a })} />
        <UiField label={t('fields.e')} type="number" value={p.e} min={0} max={0.999} step={0.01} onChange={(e) => setP({ e: Number(e.target.value) })} />
        <UiUnitField label={t('fields.impulsive_v')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.dvu} value={p.dv} min={0} onValueChange={(dv) => setP({ dv })} onUnitChange={(dvu, dv) => setP({ dvu, dv })} />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.at_peri')} si={res.dEp} category="specificEnergy" unitId="MJpkg" unitIds={TOOL_UNIT_SETS.specificEnergy} digits={4} accent />
        <ResultCard label={t('fields.at_apo')} si={res.dEa} category="specificEnergy" unitId="MJpkg" unitIds={TOOL_UNIT_SETS.specificEnergy} digits={4} />
        <ResultCard label={t('fields.oberth_advantage')} si={res.advantage} category="specificEnergy" unitId="MJpkg" unitIds={TOOL_UNIT_SETS.specificEnergy} digits={4} />
        <ResultCard label={t('fields.v_p')} si={res.vp} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
        <ResultCard label={t('fields.v_a')} si={res.va} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.need_ellipse_e_dv')}</p>}
      code={<CodeExport formulaId="oberth" values={{ a, dv, mu: body.mu, e: p.e, body: p.body }} />}
    />
  )
}
