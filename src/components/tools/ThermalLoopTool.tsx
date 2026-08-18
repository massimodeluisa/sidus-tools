import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  coolantMassFlow,
  heatFromFlow,
  METABOLIC_RATES,
  type MetabolicActivity,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const FLUIDS: Record<string, { cp: number; labelKey: string }> = {
  water: { cp: 4184, labelKey: 'fields.fluid_water' },
  pgw: { cp: 3500, labelKey: 'fields.fluid_pgw' },
  ammonia: { cp: 4700, labelKey: 'fields.fluid_ammonia' },
  freon: { cp: 1000, labelKey: 'fields.fluid_hfc' },
}

const SCHEMA = {
  mode: strParam('Q', ['Q', 'mdot'] as const),
  Q: numParam(1500, { min: 1 }),
  Qu: strParam('W', TOOL_UNIT_SETS.power),
  dT: numParam(5, { min: 0.1 }),
  fluid: strParam('water', Object.keys(FLUIDS)),
  mdot: numParam(0.05, { min: 1e-6 }),
  mdotu: strParam('kgps', TOOL_UNIT_SETS.massFlow),
  crew: numParam(3, { min: 0, max: 12 }),
  activity: strParam('nominal', Object.keys(METABOLIC_RATES) as MetabolicActivity[]),
  equip: numParam(800, { min: 0 }),
  equipu: strParam('W', TOOL_UNIT_SETS.power),
} as const

export function ThermalLoopTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const fluid = FLUIDS[p.fluid] ?? FLUIDS.water
  const act = p.activity as MetabolicActivity
  const Q = toSi(p.Q, p.Qu)
  const mdot = toSi(p.mdot, p.mdotu)
  const equip = toSi(p.equip, p.equipu)

  const res = useMemo(() => {
    const metaW =
      p.crew > 0 && act in METABOLIC_RATES ? METABOLIC_RATES[act].heatW * p.crew : 0
    const Qload = metaW + equip

    if (p.mode === 'Q') {
      const m = coolantMassFlow(Q, p.dT, fluid.cp)
      if (m == null) return null
      return {
        kind: 'fromQ' as const,
        mdot: m,
        Q,
        metaW,
        equip,
        Qload,
        gpm_waterish: (m / 1000) * 1000 * 60 / 3.785,
      }
    }
    const Qout = heatFromFlow(mdot, p.dT, fluid.cp)
    if (Qout == null) return null
    return {
      kind: 'fromMdot' as const,
      mdot,
      Q: Qout,
      metaW,
      equip,
      Qload,
      gpm_waterish: (mdot / 1000) * 1000 * 60 / 3.785,
    }
  }, [act, equip, fluid.cp, mdot, p.crew, p.dT, p.mode, Q])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.solve_for')}
            value={p.mode}
            onChange={(e) => setP({ mode: e.target.value })}
            options={[
              { value: 'Q', label: t('fields.mode_mdot_from_q') },
              { value: 'mdot', label: t('fields.mode_q_from_mdot') },
            ]}
          />
          <UiSelect
            label={t('fields.coolant')}
            value={p.fluid}
            onChange={(e) => setP({ fluid: e.target.value })}
            options={Object.entries(FLUIDS).map(([k, v]) => ({
              value: k,
              label: t(v.labelKey),
            }))}
          />
          {p.mode === 'Q' ? (
            <UiUnitField
              label={t('fields.heat_to_reject_q')}
              category="power"
              unitIds={TOOL_UNIT_SETS.power}
              unitId={p.Qu}
              value={p.Q}
              min={1}
              onValueChange={(Q) => setP({ Q })}
              onUnitChange={(Qu, Q) => setP({ Qu, Q })}
            />
          ) : (
            <UiUnitField
              label={t('fields.mass_flow')}
              category="massFlow"
              unitIds={TOOL_UNIT_SETS.massFlow}
              unitId={p.mdotu}
              value={p.mdot}
              min={1e-6}
              onValueChange={(mdot) => setP({ mdot })}
              onUnitChange={(mdotu, mdot) => setP({ mdotu, mdot })}
            />
          )}
          <UiField
            label={t('fields.allowable_t')}
            unit="K"
            type="number"
            min={0.1}
            step="any"
            value={p.dT}
            onChange={(e) => setP({ dT: Number(e.target.value) })}
            hint={t('fields.hint_dt_same_c')}
          />
          <p className="font-mono text-[10px] uppercase tracking-wider text-subtle">
            {t('fields.thermal_optional_stack')}
          </p>
          <div className="sidus-results">
            <UiField
              label={t('fields.crew')}
              type="number"
              min={0}
              max={12}
              value={p.crew}
              onChange={(e) => setP({ crew: Number(e.target.value) })}
            />
            <UiSelect
              label={t('fields.activity')}
              value={p.activity}
              onChange={(e) => setP({ activity: e.target.value })}
              options={Object.keys(METABOLIC_RATES).map((k) => ({
                value: k,
                label: t(`fields.activity_${k}`),
              }))}
            />
          </div>
          <UiUnitField
            label={t('fields.equipment_heat')}
            category="power"
            unitIds={TOOL_UNIT_SETS.power}
            unitId={p.equipu}
            value={p.equip}
            min={0}
            onValueChange={(equip) => setP({ equip })}
            onUnitChange={(equipu, equip) => setP({ equipu, equip })}
            hint={t('fields.hint_heat_sources')}
          />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_thermal_inputs')}</p>
        ) : (
          <div className="sidus-results">
            {res.kind === 'fromQ' ? (
              <ResultCard
                label={t('fields.required')}
                si={res.mdot}
                category="massFlow"
                unitId="kgps"
                unitIds={TOOL_UNIT_SETS.massFlow}
                digits={4}
                accent
              />
            ) : (
              <ResultCard
                label={t('fields.transportable_q')}
                si={res.Q}
                category="power"
                unitId="W"
                unitIds={TOOL_UNIT_SETS.power}
                digits={1}
                accent
              />
            )}
            <ResultCard
              label={t('fields.q_cp_t')}
              si={res.Q}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={1}
            />
            <ResultCard
              label={t('fields.metabolic_heat')}
              si={res.metaW}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={1}
            />
            <ResultCard
              label={t('fields.equipment')}
              si={res.equip}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={1}
            />
            <ResultCard
              label={t('fields.crew_equip_load')}
              si={res.Qload}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={1}
              accent
            />
            <ResultCard
              label={t('fields.margin_vs_load')}
              si={res.Q - res.Qload}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={1}
            />
            <ResultCard label={t('fields.cp_used')} value={formatNumber(fluid.cp, 0)} unit="J/(kg·K)" />
            <ResultCard
              label={t('fields.if_water_like_gpm')}
              value={formatNumber(res.gpm_waterish, 2)}
              unit="GPM approx"
            />
          </div>
        )
      }
      code={<CodeExport formulaId="thermal-loop" values={{ Q, mdot, equip, dT: p.dT, crew: p.crew, mode: p.mode, fluid: p.fluid, activity: p.activity }} />}
    />
  )
}
