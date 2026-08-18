import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  fromSi,
  solarRadiationAccel,
  solarRadiationForce,
  SOLAR_PRESSURE_1AU,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  m: numParam(500, { min: 0.001 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  A: numParam(20, { min: 0.001 }),
  Au: strParam('m2', TOOL_UNIT_SETS.area),
  Cr: numParam(1.2, { min: 0.001 }),
  r: numParam(1, { min: 0.1 }),
  ru: strParam('au', TOOL_UNIT_SETS.length),
} as const

export function SolarPressureTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const m = toSi(p.m, p.mu)
  const A = toSi(p.A, p.Au)
  const rAu = fromSi(toSi(p.r, p.ru), 'au')
  const res = useMemo(() => {
    const F = solarRadiationForce(A, p.Cr, rAu)
    const a = solarRadiationAccel(m, A, p.Cr, rAu)
    return F != null && a != null ? { F, a } : null
  }, [m, A, p.Cr, rAu])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.mass')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.m}
            min={0.001}
            onValueChange={(m) => setP({ m })}
            onUnitChange={(mu, m) => setP({ mu, m })}
          />
          <UiUnitField
            label={t('fields.area_a')}
            category="area"
            unitIds={TOOL_UNIT_SETS.area}
            unitId={p.Au}
            value={p.A}
            min={0.001}
            onValueChange={(A) => setP({ A })}
            onUnitChange={(Au, A) => setP({ Au, A })}
          />
          <UiField
            label={t('fields.c_r_reflectivity')}
            type="number"
            value={p.Cr}
            onChange={(e) => setP({ Cr: Number(e.target.value) })}
            hint={t('fields.hint_cr_absorb_mirror')}
          />
          <UiUnitField
            label={t('fields.heliocentric_r')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.ru}
            value={p.r}
            min={0.1}
            onValueChange={(r) => setP({ r })}
            onUnitChange={(ru, r) => setP({ ru, r })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.force_f')}
              si={res.F}
              category="force"
              unitId="N"
              unitIds={TOOL_UNIT_SETS.force}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.accel_a')}
              si={res.a}
              category="accel"
              unitId="mps2"
              unitIds={TOOL_UNIT_SETS.accel}
              digits={4}
            />
            <ResultCard
              label={t('fields.p_1_au')}
              si={SOLAR_PRESSURE_1AU}
              category="pressure"
              unitId="Pa"
              unitIds={TOOL_UNIT_SETS.pressure}
              digits={3}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_inputs')}</p>
        )
      }
      code={<CodeExport formulaId="solar-pressure" values={{ m, A, Cr: p.Cr, r_au: rAu, r: p.r }} />}
    />
  )
}
