import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, getBody, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  a: numParam(7000, { min: 0.001 }),
  au: strParam('km', TOOL_UNIT_SETS.length),
  e: numParam(0.1, { min: 0, max: 0.999 }),
} as const

/** h = √(μ a (1−e²)) = √(μ p) */
export function SpecificAngularMomentumTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a = toSi(p.a, p.au)
  const res = useMemo(() => {
    if (!(a > 0) || p.e < 0 || p.e >= 1) return null
    const param = a * (1 - p.e * p.e)
    const h = Math.sqrt(body.mu * param)
    return { h, p: param }
  }, [body.mu, a, p.e])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField label={t('fields.a')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.au} value={p.a} min={0.001} onValueChange={(a) => setP({ a })} onUnitChange={(au, a) => setP({ au, a })} />
          <UiField label={t('fields.e')} type="number" value={p.e} min={0} max={0.999} step={0.001} onChange={(e) => setP({ e: Number(e.target.value) })} />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard label={t('fields.h_p')} value={res.h.toExponential(6)} unit="m²/s" accent />
            <ResultCard label={t('fields.p_a_1_e')} si={res.p} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={2} />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.need_ellipse_e')}</p>
        )
      }
      code={<CodeExport formulaId="specific-angular-momentum" values={{ a, mu: body.mu, e: p.e, body: p.body }} />}
    />
  )
}
