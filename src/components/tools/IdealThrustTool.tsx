import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  G0,
  burnTime,
  idealThrust,
  ispFromVe,
  massFlowFromThrustIsp,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  mode: numParam(0), // 0: mdot+ve, 1: F+Isp
  mdot: numParam(250, { min: 0.001 }),
  mdotu: strParam('kgps', TOOL_UNIT_SETS.massFlow),
  ve: numParam(3000, { min: 0.001 }),
  veu: strParam('mps', TOOL_UNIT_SETS.velocity),
  F: numParam(750000, { min: 0.001 }),
  Fu: strParam('N', TOOL_UNIT_SETS.force),
  isp: numParam(300, { min: 0.001 }),
  prop: numParam(100000, { min: 0 }),
  propu: strParam('kg', TOOL_UNIT_SETS.mass),
} as const

export function IdealThrustTool() {
  const { t } = useTranslation()
  const { t: tr } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const mdot = toSi(p.mdot, p.mdotu)
  const ve = toSi(p.ve, p.veu)
  const F = toSi(p.F, p.Fu)
  const prop = toSi(p.prop, p.propu)
  const res = useMemo(() => {
    if (p.mode < 0.5) {
      const thrust = idealThrust(mdot, ve)
      const isp = ispFromVe(ve)
      const t = burnTime(prop, mdot)
      return thrust != null && isp != null ? { F: thrust, isp, mdot, ve, t } : null
    }
    const mdotOut = massFlowFromThrustIsp(F, p.isp)
    if (mdotOut == null) return null
    const veOut = p.isp * G0
    const t = burnTime(prop, mdotOut)
    return { F, isp: p.isp, mdot: mdotOut, ve: veOut, t }
  }, [p.mode, mdot, ve, F, p.isp, prop])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField
            label={t('fields.mode_0_ve_1_f_isp')}
            type="number"
            value={p.mode}
            onChange={(e) => setP({ mode: Number(e.target.value) })}
            hint={t('fields.hint_ideal_thrust_mode')}
          />
          {p.mode < 0.5 ? (
            <>
              <UiUnitField
                label={t('fields.f__2')}
                category="massFlow"
                unitIds={TOOL_UNIT_SETS.massFlow}
                unitId={p.mdotu}
                value={p.mdot}
                min={0.001}
                onValueChange={(mdot) => setP({ mdot })}
                onUnitChange={(mdotu, mdot) => setP({ mdotu, mdot })}
              />
              <UiUnitField
                label={t('fields.v_e')}
                category="velocity"
                unitIds={TOOL_UNIT_SETS.velocity}
                unitId={p.veu}
                value={p.ve}
                min={0.001}
                onValueChange={(ve) => setP({ ve })}
                onUnitChange={(veu, ve) => setP({ veu, ve })}
              />
            </>
          ) : (
            <>
              <UiUnitField
                label={tr('fields.thrust')}
                category="force"
                unitIds={TOOL_UNIT_SETS.force}
                unitId={p.Fu}
                value={p.F}
                min={0.001}
                onValueChange={(F) => setP({ F })}
                onUnitChange={(Fu, F) => setP({ Fu, F })}
              />
              <UiField
                label={tr('fields.isp')}
                type="number"
                value={p.isp}
                onChange={(e) => setP({ isp: Number(e.target.value) })}
                unit="s"
              />
            </>
          )}
          <UiUnitField
            label={t('fields.propellant_mass_for_burn_time')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.propu}
            value={p.prop}
            min={0}
            onValueChange={(prop) => setP({ prop })}
            onUnitChange={(propu, prop) => setP({ propu, prop })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={tr('fields.thrust')}
              si={res.F}
              category="force"
              unitId="N"
              unitIds={TOOL_UNIT_SETS.force}
              digits={4}
              accent
            />
            <ResultCard label={tr('fields.isp')} value={res.isp.toFixed(2)} unit="s" />
            <ResultCard
              label={t('fields.f__2')}
              si={res.mdot}
              category="massFlow"
              unitId="kgps"
              unitIds={TOOL_UNIT_SETS.massFlow}
              digits={4}
            />
            <ResultCard
              label={t('fields.v_e')}
              si={res.ve}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={1}
            />
            {res.t != null ? (
              <ResultCard
                label={tr('fields.burn_time')}
                si={res.t}
                category="time"
                unitId="pretty"
                unitIds={TOOL_UNIT_SETS.timePretty}
                digits={2}
              />
            ) : null}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_thrust_inputs')}</p>
        )
      }
      code={<CodeExport formulaId="ideal-thrust" values={{ mdot, ve, F, prop, mode: p.mode, isp: p.isp, veu: p.veu, Fu: p.Fu, propu: p.propu }} />}
    />
  )
}
