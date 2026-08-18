import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  EARTH_MASS,
  fromSi,
  SOLAR_MASS,
  sphereOfInfluence,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  a: numParam(1, { min: 0.001 }),
  au: strParam('au', TOOL_UNIT_SETS.length),
  m: numParam(EARTH_MASS, { min: 1 }),
  M: numParam(SOLAR_MASS, { min: 1 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
} as const

export function SoiTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const a = toSi(p.a, p.au)
  const m = toSi(p.m, p.mu)
  const M = toSi(p.M, p.mu)
  const soi = useMemo(() => sphereOfInfluence(a, m, M), [a, m, M])

  function changeMassUnit(mu: string) {
    setP({
      mu,
      m: fromSi(toSi(p.m, p.mu), mu),
      M: fromSi(toSi(p.M, p.mu), mu),
    })
  }

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.semi_major_a_planet_about_primary')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.au}
            value={p.a}
            min={0.001}
            onValueChange={(a) => setP({ a })}
            onUnitChange={(au, a) => setP({ au, a })}
          />
          <UiUnitField
            label={t('fields.planet_mass_m')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.m}
            min={1}
            onValueChange={(m) => setP({ m })}
            onUnitChange={(mu) => changeMassUnit(mu)}
          />
          <UiUnitField
            label={t('fields.primary_mass_m')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.M}
            min={1}
            onValueChange={(M) => setP({ M })}
            onUnitChange={(mu) => changeMassUnit(mu)}
          />
        </ParamsGrid>
      }
      results={
        soi != null ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.r_soi')}
              si={soi}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={2}
              accent
            />
            <ResultCard label={t('fields.r_soi_a')} value={(soi / a).toFixed(5)} />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_masses_or_a')}</p>
        )
      }
      code={<CodeExport formulaId="soi" values={{ a, m, M }} />}
    />
  )
}
