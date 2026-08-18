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
  fromSi,
  getBody,
  specificEnergy,
  TOOL_UNIT_SETS,
  toSi,
  visViva,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  r: numParam(6778, { min: 0.001 }),
  a: numParam(6778, { min: 0.001 }),
  lu: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function VisVivaTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const body = getBody(p.body)
  const r_m = toSi(p.r, p.lu)
  const a_m = toSi(p.a, p.lu)

  const results = useMemo(() => {
    if (!(r_m > 0) || !(a_m > 0)) return null
    if (2 / r_m - 1 / a_m < 0) return { invalid: true as const }
    const v = visViva(body.mu, r_m, a_m)
    const energy = specificEnergy(body.mu, a_m)
    return { invalid: false as const, v, energy }
  }, [a_m, body.mu, r_m])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.radial_distance_r')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.lu}
            value={p.r}
            min={0}
            onValueChange={(r) => setP({ r })}
            onUnitChange={(lu, r) =>
              setP({
                lu,
                r,
                a: fromSi(toSi(p.a, p.lu), lu),
              })
            }
            hint={t('fields.hint_r_from_centre')}
          />
          <UiUnitField
            label={t('fields.semi_major_axis')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.lu}
            value={p.a}
            min={0}
            onValueChange={(a) => setP({ a })}
            onUnitChange={(lu, a) =>
              setP({
                lu,
                a,
                r: fromSi(toSi(p.r, p.lu), lu),
              })
            }
            hint={t('fields.hint_sma_ellipse')}
          />
        </ParamsGrid>
      }
      results={
        !results ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : results.invalid ? (
          <p className="font-mono text-sm text-muted">
            {t('fields.visviva_negative')}
          </p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.orbital_speed')}
              si={results.v}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.specific_energy')}
              si={results.energy}
              category="specificEnergy"
              unitId="Jpkg"
              unitIds={TOOL_UNIT_SETS.specificEnergy}
              digits={4}
            />
          </div>
        )
      }
      code={<CodeExport formulaId="vis-viva" values={{ r: r_m, a: a_m, mu: body.mu, body: p.body }} />}
    />
  )
}
