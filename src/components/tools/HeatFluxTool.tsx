import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { SUTTON_GRAVES_K_EARTH, suttonGravesHeatFlux, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  rho: numParam(1e-4, { min: 0 }),
  rhou: strParam('kgm3', TOOL_UNIT_SETS.density),
  v: numParam(7.5, { min: 0 }),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity),
  Rn: numParam(0.5, { min: 0.001 }),
  Rnu: strParam('m', TOOL_UNIT_SETS.length),
} as const

export function HeatFluxTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const rho = toSi(p.rho, p.rhou)
  const v = toSi(p.v, p.vu)
  const Rn = toSi(p.Rn, p.Rnu)
  const q = useMemo(() => suttonGravesHeatFlux(rho, v, Rn), [rho, v, Rn])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.density')}
            category="density"
            unitIds={TOOL_UNIT_SETS.density}
            unitId={p.rhou}
            value={p.rho}
            min={0}
            onValueChange={(rho) => setP({ rho })}
            onUnitChange={(rhou, rho) => setP({ rhou, rho })}
            hint={t('fields.hint_freestream_density')}
          />
          <UiUnitField
            label={t('fields.speed_v')}
            category="velocity"
            unitIds={TOOL_UNIT_SETS.velocity}
            unitId={p.vu}
            value={p.v}
            min={0}
            onValueChange={(v) => setP({ v })}
            onUnitChange={(vu, v) => setP({ vu, v })}
          />
          <UiUnitField
            label={t('fields.nose_radius_r_n')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.Rnu}
            value={p.Rn}
            min={0.001}
            onValueChange={(Rn) => setP({ Rn })}
            onUnitChange={(Rnu, Rn) => setP({ Rnu, Rn })}
          />
        </ParamsGrid>
      }
      results={
        q != null ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.q_sutton_graves')}
              si={q}
              category="heatFlux"
              unitId="Wm2"
              unitIds={TOOL_UNIT_SETS.heatFlux}
              digits={4}
              accent
            />
            <ResultCard label={t('fields.k_earth')} value={SUTTON_GRAVES_K_EARTH.toExponential(3)} unit="SI" />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.need_rho_v_rn')}</p>
        )
      }
      code={<CodeExport formulaId="heat-flux" values={{ rho, v, Rn, rn: Rn }} />}
    />
  )
}
