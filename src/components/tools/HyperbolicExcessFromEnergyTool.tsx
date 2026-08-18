import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, characteristicEnergy, getBody, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

// LEO periapsis class with clear hyperbolic energy (vesc@6678 km ≈ 10.9 km/s)
const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  r: numParam(6678, { min: 0.001 }),
  ru: strParam('km', TOOL_UNIT_SETS.length),
  v: numParam(12, { min: 0 }),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity),
} as const

export function HyperbolicExcessFromEnergyTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const r = toSi(p.r, p.ru)
  const v = toSi(p.v, p.vu)
  const res = useMemo(() => {
    const eps = (v * v) / 2 - body.mu / r
    if (!(eps > 0)) return { eps, bound: true as const }
    const vinf = Math.sqrt(2 * eps)
    return { eps, vinf, c3: characteristicEnergy(vinf), bound: false as const }
  }, [body.mu, r, v])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.r_2')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.ru}
            value={p.r}
            min={0.001}
            onValueChange={(r) => setP({ r })}
            onUnitChange={(ru, r) => setP({ ru, r })}
          />
          <UiUnitField
            label={t('fields.velocity_v')}
            category="velocity"
            unitIds={TOOL_UNIT_SETS.velocity}
            unitId={p.vu}
            value={p.v}
            min={0}
            onValueChange={(v) => setP({ v })}
            onUnitChange={(vu, v) => setP({ vu, v })}
          />
        </ParamsGrid>
      }
      results={
        <div className="sidus-results">
          <ResultCard
            label={t('fields.f__4')}
            si={res.eps}
            category="specificEnergy"
            unitId="MJpkg"
            unitIds={TOOL_UNIT_SETS.specificEnergy}
            digits={4}
            accent
          />
          {res.bound ? (
            <ResultCard label={t('fields.orbit_type')} value="bound / parabolic" />
          ) : (
            <>
              <ResultCard
                label={t('fields.v')}
                si={res.vinf}
                category="velocity"
                unitId="kmps"
                unitIds={TOOL_UNIT_SETS.velocity}
                digits={4}
              />
              <ResultCard
                label={t('fields.c3')}
                si={res.c3}
                category="specificEnergy"
                unitId="km2ps2"
                unitIds={TOOL_UNIT_SETS.c3}
                digits={4}
              />
            </>
          )}
        </div>
      }
      code={<CodeExport formulaId="energy-vinf" values={{ r, v, mu: body.mu, body: p.body }} />}
    />
  )
}
