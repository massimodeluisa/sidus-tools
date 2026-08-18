import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  SOLAR_CONSTANT_1AU,
  solarArrayPower,
  TOOL_UNIT_SETS,
  toSi,
  fromSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  A: numParam(20, { min: 0.001 }),
  Au: strParam('m2', TOOL_UNIT_SETS.area),
  eta: numParam(0.3, { min: 0.001, max: 1 }),
  /** Incidence angle from array normal, in `anu` */
  ang: numParam(0),
  anu: strParam('deg', TOOL_UNIT_SETS.angle),
  r: numParam(1, { min: 0.1 }),
  ru: strParam('au', TOOL_UNIT_SETS.length),
} as const

export function SolarArrayTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const A = toSi(p.A, p.Au)
  // Physics helper takes incidence in degrees
  const angDeg = fromSi(toSi(p.ang, p.anu), 'deg')
  const rAu = fromSi(toSi(p.r, p.ru), 'au')
  const P = useMemo(
    () => solarArrayPower(A, p.eta, angDeg, rAu),
    [A, p.eta, angDeg, rAu],
  )

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.array_area')}
            category="area"
            unitIds={TOOL_UNIT_SETS.area}
            unitId={p.Au}
            value={p.A}
            min={0.001}
            onValueChange={(A) => setP({ A })}
            onUnitChange={(Au, A) => setP({ Au, A })}
          />
          <UiField
            label={t('fields.efficiency')}
            type="number"
            value={p.eta}
            min={0.001}
            max={1}
            step={0.01}
            onChange={(e) => setP({ eta: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.sun_incidence_from_normal')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.anu}
            value={p.ang}
            onValueChange={(ang) => setP({ ang })}
            onUnitChange={(anu, ang) => setP({ anu, ang })}
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
        P != null ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.electrical_power')}
              si={P}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={2}
              accent
            />
            <ResultCard
              label={t('fields.s_1_au')}
              si={SOLAR_CONSTANT_1AU}
              category="heatFlux"
              unitId="Wm2"
              unitIds={TOOL_UNIT_SETS.heatFlux}
              digits={1}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_array_inputs')}</p>
        )
      }
      code={<CodeExport formulaId="solar-array" values={{ A, eta: p.eta, ang: angDeg, r_au: rAu, r: p.r }} />}
    />
  )
}
