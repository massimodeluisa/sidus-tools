import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiField } from '@/components/shared/UiField'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { FunctionPlot } from '@/components/viz/FunctionPlot'
import {
  exhaustVelocity,
  fromSi,
  G0,
  propellantMass,
  rocketDeltaV,
  rocketMassInitial,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  mode: strParam('dv', ['dv', 'm0'] as const),
  isp: numParam(330, { min: 0.001 }),
  m0: numParam(500_000, { min: 0.001 }),
  mf: numParam(100_000, { min: 0.001 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  dv: numParam(9000, { min: 0 }),
  dvu: strParam('mps', TOOL_UNIT_SETS.velocity),
} as const

export function RocketEquationTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const m0_kg = toSi(p.m0, p.mu)
  const mf_kg = toSi(p.mf, p.mu)
  const dv_si = toSi(p.dv, p.dvu)

  const results = useMemo(() => {
    if (!(p.isp > 0) || !(mf_kg > 0)) return null
    if (p.mode === 'dv') {
      if (!(m0_kg > mf_kg)) return null
      const deltaV = rocketDeltaV(p.isp, m0_kg, mf_kg)
      return {
        deltaV,
        m0: m0_kg,
        mf: mf_kg,
        prop: propellantMass(m0_kg, mf_kg),
        ratio: m0_kg / mf_kg,
        ve: exhaustVelocity(p.isp),
      }
    }
    if (!(dv_si >= 0)) return null
    const M0 = rocketMassInitial(p.isp, dv_si, mf_kg)
    if (!Number.isFinite(M0)) return null
    return {
      deltaV: dv_si,
      m0: M0,
      mf: mf_kg,
      prop: propellantMass(M0, mf_kg),
      ratio: M0 / mf_kg,
      ve: exhaustVelocity(p.isp),
    }
  }, [dv_si, m0_kg, mf_kg, p.isp, p.mode])

  const curve = useMemo(() => {
    if (!(p.isp > 0) || !(mf_kg > 0)) return []
    const points: { x: number; y: number }[] = []
    for (let i = 0; i <= 40; i++) {
      const ratio = 1.05 + (i / 40) * 9.95
      const m0i = mf_kg * ratio
      const dv = rocketDeltaV(p.isp, m0i, mf_kg)
      if (Number.isFinite(dv)) points.push({ x: ratio, y: dv / 1000 })
    }
    return points
  }, [mf_kg, p.isp])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.solve_for')}
            value={p.mode}
            onChange={(e) => setP({ mode: e.target.value })}
            options={[
              { value: 'dv', label: t('fields.mode_dv_from_masses') },
              { value: 'm0', label: t('fields.mode_m0_from_dv') },
            ]}
          />
          <UiField
            label={t('fields.isp_vacuum')}
            unit="s"
            type="number"
            min={0}
            step="any"
            value={p.isp}
            onChange={(e) => setP({ isp: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.final_mass_m_f')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.mf}
            min={0}
            onValueChange={(mf) => setP({ mf })}
            onUnitChange={(mu, mf) =>
              setP({
                mu,
                mf,
                m0: fromSi(toSi(p.m0, p.mu), mu),
              })
            }
          />
          {p.mode === 'dv' ? (
            <UiUnitField
              label={t('fields.initial_mass_m')}
              category="mass"
              unitIds={TOOL_UNIT_SETS.mass}
              unitId={p.mu}
              value={p.m0}
              min={0}
              onValueChange={(m0) => setP({ m0 })}
              onUnitChange={(mu, m0) =>
                setP({
                  mu,
                  m0,
                  mf: fromSi(toSi(p.mf, p.mu), mu),
                })
              }
            />
          ) : (
            <UiUnitField
              label={t('fields.required_v')}
              category="velocity"
              unitIds={TOOL_UNIT_SETS.velocity}
              unitId={p.dvu}
              value={p.dv}
              min={0}
              onValueChange={(dv) => setP({ dv })}
              onUnitChange={(dvu, dv) => setP({ dvu, dv })}
            />
          )}
          <FieldPresets label={t('common.presets')}>
            {[
              { l: t('fields.preset_cold_gas'), v: 70 },
              { l: t('fields.preset_hydrazine'), v: 220 },
              { l: t('fields.preset_rp1_lox'), v: 330 },
              { l: t('fields.preset_lh2_lox'), v: 450 },
              { l: t('fields.preset_hall_ion'), v: 1600 },
              { l: t('fields.preset_ion'), v: 3000 },
            ].map((pr) => (
              <PresetChip key={pr.v} onClick={() => setP({ isp: pr.v })}>
                {pr.l}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        results && Number.isFinite(results.deltaV) ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.v_3')}
              si={results.deltaV}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.exhaust_ve')}
              si={results.ve}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={1}
            />
            <ResultCard
              label={t('fields.mass_ratio_m_m_f')}
              value={formatNumber(results.ratio, 4)}
            />
            <ResultCard
              label={t('fields.propellant')}
              si={results.prop}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={1}
            />
            <ResultCard
              label={t('fields.m')}
              si={results.m0}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={1}
            />
            <ResultCard
              label={t('fields.g_used')}
              si={G0}
              category="accel"
              unitId="mps2"
              unitIds={['mps2', 'g']}
              digits={5}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">
            {t('fields.need_isp_mf_m0')}
          </p>
        )
      }
      preview={<FunctionPlot points={curve} xLabel="m₀/m_f" yLabel="Δv (km/s)" />}
      code={<CodeExport formulaId="rocket-equation" values={{ m0_kg, mf_kg, dv_si, isp: p.isp, m0: p.m0, mf: p.mf, dv: p.dv, mode: p.mode }} />}
    />
  )
}
