import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  equilibriumTemperature,
  thermalRadiatedPower,
  TOOL_UNIT_SETS,
  toSi,
  fromSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  A: numParam(5, { min: 0.001 }),
  Au: strParam('m2', TOOL_UNIT_SETS.area),
  T: numParam(300, { min: 1 }),
  Tu: strParam('K', TOOL_UNIT_SETS.temperature),
  eps: numParam(0.8, { min: 0.001, max: 1 }),
  alpha: numParam(0.3, { min: 0, max: 1 }),
  ang: numParam(0),
  anu: strParam('deg', TOOL_UNIT_SETS.angle),
  r: numParam(1, { min: 0.1 }),
  ru: strParam('au', TOOL_UNIT_SETS.length),
} as const

export function ThermalRadTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const A = toSi(p.A, p.Au)
  const T_K = toSi(p.T, p.Tu)
  const angDeg = fromSi(toSi(p.ang, p.anu), 'deg')
  const rAu = fromSi(toSi(p.r, p.ru), 'au')
  const res = useMemo(() => {
    const Q = thermalRadiatedPower(A, T_K, p.eps)
    const Teq = equilibriumTemperature(p.alpha, p.eps, angDeg, rAu)
    return { Q, Teq }
  }, [A, T_K, p.eps, p.alpha, angDeg, rAu])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
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
          <UiUnitField
            label={t('fields.temperature_t')}
            category="temperature"
            unitIds={TOOL_UNIT_SETS.temperature}
            unitId={p.Tu}
            value={p.T}
            min={0}
            onValueChange={(T) => setP({ T })}
            onUnitChange={(Tu, T) => setP({ Tu, T })}
          />
          <UiField
            label={t('fields.emissivity')}
            type="number"
            value={p.eps}
            min={0.001}
            max={1}
            step={0.01}
            onChange={(e) => setP({ eps: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.absorptivity_for_teq')}
            type="number"
            value={p.alpha}
            min={0}
            max={1}
            step={0.01}
            onChange={(e) => setP({ alpha: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.sun_incidence')}
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
        <div className="sidus-results">
          {res.Q != null ? (
            <ResultCard
              label={t('fields.radiated_q')}
              si={res.Q}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={1}
              accent
            />
          ) : null}
          {res.Teq != null ? (
            <ResultCard
              label={t('fields.t_eq_simple')}
              si={res.Teq}
              category="temperature"
              unitId="K"
              unitIds={TOOL_UNIT_SETS.temperature}
              digits={1}
            />
          ) : null}
        </div>
      }
      code={<CodeExport formulaId="thermal-rad" values={{ A, T_K, T: T_K, eps: p.eps, alpha: p.alpha, ang: p.ang, r: p.r }} />}
    />
  )
}
