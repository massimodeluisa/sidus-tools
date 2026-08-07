import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { UiSelect } from '@/components/shared/UiSelect'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, circularizeBurn, getBody, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  a: numParam(8000, { min: 0.001 }),
  au: strParam('km', TOOL_UNIT_SETS.length),
  e: numParam(0.1, { min: 0, max: 0.999 }),
  at: strParam('apo', ['peri', 'apo'] as const),
} as const

export function CircularizeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a = toSi(p.a, p.au)
  const res = useMemo(() => circularizeBurn(body.mu, a, p.e, p.at as 'peri' | 'apo'), [body.mu, a, p.e, p.at])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.semi_major_axis')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.au} value={p.a} min={0.001} onValueChange={(a) => setP({ a })} onUnitChange={(au, a) => setP({ au, a })} />
        <UiField label={t('fields.eccentricity')} type="number" value={p.e} min={0} max={0.999} step={0.001} onChange={(e) => setP({ e: Number(e.target.value) })} />
        <UiSelect
          label={t('fields.burn_at')}
          value={p.at}
          onChange={(e) => setP({ at: e.target.value })}
          options={[
            { value: 'apo', label: t('fields.apoapsis') },
            { value: 'peri', label: t('fields.periapsis') },
          ]}
        />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.delta_v_circularize')} si={res.dv} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
        <ResultCard label={t('fields.r_aps')} si={res.r} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={2} />
        <ResultCard label={t('fields.v_ellipse')} si={res.vEll} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
        <ResultCard label={t('fields.v_circ')} si={res.vCirc} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.need_eccentricity')}</p>}
      code={<CodeExport formulaId="circularize" values={{ a, mu: body.mu, e: p.e, body: p.body, at: p.at }} />}
    />
  )
}
