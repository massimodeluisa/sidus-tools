import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, getBody, TOOL_UNIT_SETS, toSi, visViva } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

function rOfNu(a: number, e: number, nu: number) {
  return (a * (1 - e * e)) / (1 + e * Math.cos(nu))
}

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  a: numParam(8000, { min: 0.001 }),
  au: strParam('km', TOOL_UNIT_SETS.length),
  e: numParam(0.1, { min: 0, max: 0.999 }),
  nu: numParam(45),
  nuu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function TrueAnomalyTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a = toSi(p.a, p.au)
  const nu = toSi(p.nu, p.nuu)
  const res = useMemo(() => {
    if (!(a > 0) || p.e >= 1) return null
    const r = rOfNu(a, p.e, nu)
    const v = visViva(body.mu, r, a)
    return { r, v }
  }, [body.mu, a, p.e, nu])
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
            label={t('fields.true_anomaly')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.nuu}
            value={p.nu}
            onValueChange={(nu) => setP({ nu })}
            onUnitChange={(nuu, nu) => setP({ nuu, nu })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.r_3')}
              si={res.r}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={2}
              accent
            />
            <ResultCard
              label={t('fields.v_4')}
              si={res.v}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_ellipse')}</p>
        )
      }
      code={<CodeExport formulaId="true-anomaly" values={{ a, nu, e: p.e, mu: body.mu }} />}
    />
  )
}
