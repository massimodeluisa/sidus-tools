import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldNote } from '@/components/shared/Field'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  leakDepressTime,
  repressMass,
  M_N2,
  M_O2,
  TOOL_UNIT_SETS,
  toSi,
  fromSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  /** Free volume in `Vu` (default SI-friendly m³) */
  V: numParam(10, { min: 0 }),
  Vu: strParam('m3', TOOL_UNIT_SETS.volume),
  /** Hole diameter in `du` */
  d: numParam(5, { min: 0 }),
  du: strParam('mm', TOOL_UNIT_SETS.lengthSmall),
  /**
   * Pressures in `Pu`. Defaults stay Pa so legacy `?P0=101325` links keep working;
   * switch the unit control to kPa / bar / atm / psi with auto-conversion.
   */
  P0: numParam(101_325, { min: 0 }),
  P1: numParam(70_000, { min: 0 }),
  Pu: strParam('Pa', TOOL_UNIT_SETS.pressure),
  /** Temperature in `Tu` (default K for URL stability) */
  T: numParam(293.15, { min: 0 }),
  Tu: strParam('K', TOOL_UNIT_SETS.temperature),
  Cd: numParam(0.65, { min: 0.1, max: 1 }),
} as const

export function CabinLeakTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const V_m3 = toSi(p.V, p.Vu)
  const d_m = toSi(p.d, p.du)
  // Orifice area: unconditional so it's always available for the code export,
  // not only when the leak-time solve below succeeds.
  const A = Math.PI * (d_m / 2) ** 2
  const P0 = toSi(p.P0, p.Pu)
  const P1 = toSi(p.P1, p.Pu)
  const T_K = toSi(p.T, p.Tu)

  const res = useMemo(() => {
    if (!(V_m3 > 0) || !(d_m > 0) || !(P0 > P1) || !(P1 > 0) || !(T_K > 0)) return null
    const t = leakDepressTime(V_m3, A, P0, P1, T_K, p.Cd)
    if (t == null) return null
    const dP = P0 - P1
    const mN2 = repressMass(V_m3, T_K, dP, M_N2)
    const mO2 = repressMass(V_m3, T_K, dP * 0.21, M_O2)
    return { A, t, mN2, mO2, dP }
  }, [A, V_m3, d_m, P0, P1, T_K, p.Cd])

  function changeVolumeUnit(Vu: string, V: number) {
    setP({ Vu, V })
  }
  function changeDiamUnit(du: string, d: number) {
    setP({ du, d })
  }
  function changePressureUnit(Pu: string) {
    setP({
      Pu,
      P0: fromSi(toSi(p.P0, p.Pu), Pu),
      P1: fromSi(toSi(p.P1, p.Pu), Pu),
    })
  }
  function changeTempUnit(Tu: string, T: number) {
    setP({ Tu, T })
  }

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.free_volume_v')}
            category="volume"
            unitIds={TOOL_UNIT_SETS.volume}
            unitId={p.Vu}
            value={p.V}
            min={0}
            onValueChange={(V) => setP({ V })}
            onUnitChange={(Vu, V) => changeVolumeUnit(Vu, V)}
          />
          <UiUnitField
            label={t('fields.hole_diameter')}
            category="length"
            unitIds={TOOL_UNIT_SETS.lengthSmall}
            unitId={p.du}
            value={p.d}
            min={0}
            onValueChange={(d) => setP({ d })}
            onUnitChange={(du, d) => changeDiamUnit(du, d)}
            hint={t('fields.hint_orifice')}
          />
          {/* Own grid cells: never nest a 2-col grid inside one ParamsGrid track */}
          <UiUnitField
            label={t('fields.initial_p')}
            category="pressure"
            unitIds={TOOL_UNIT_SETS.pressure}
            unitId={p.Pu}
            value={p.P0}
            min={0}
            onValueChange={(P0) => setP({ P0 })}
            onUnitChange={(Pu) => changePressureUnit(Pu)}
          />
          <UiUnitField
            label={t('fields.final_p')}
            category="pressure"
            unitIds={TOOL_UNIT_SETS.pressure}
            unitId={p.Pu}
            value={p.P1}
            min={0}
            onValueChange={(P1) => setP({ P1 })}
            onUnitChange={(Pu) => changePressureUnit(Pu)}
            hint={t('fields.hint_cabin_p1')}
          />
          <UiUnitField
            label={t('fields.temperature')}
            category="temperature"
            unitIds={TOOL_UNIT_SETS.temperature}
            unitId={p.Tu}
            value={p.T}
            onValueChange={(T) => setP({ T })}
            onUnitChange={(Tu, T) => changeTempUnit(Tu, T)}
          />
          <UiField
            label={t('fields.discharge_coeff_cd')}
            type="number"
            min={0.1}
            max={1}
            step="any"
            value={p.Cd}
            onChange={(e) => setP({ Cd: Number(e.target.value) })}
          />
          <FieldNote>{t('fields.note_cabin_leak')}</FieldNote>
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.need_p0_gt_p1')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.time_p_p')}
              si={res.t}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.orifice_area')}
              si={res.A}
              category="area"
              unitId="mm2"
              unitIds={TOOL_UNIT_SETS.area}
              digits={3}
            />
            <ResultCard
              label={t('fields.p')}
              si={res.dP}
              category="pressure"
              unitId="kPa"
              unitIds={TOOL_UNIT_SETS.pressure}
              digits={3}
            />
            <ResultCard
              label={t('fields.n_mass_to_restore_p')}
              si={res.mN2 ?? NaN}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={4}
            />
            <ResultCard
              label={t('fields.o_mass_21_of_p')}
              si={res.mO2 ?? NaN}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={4}
            />
          </div>
        )
      }
      code={<CodeExport formulaId="cabin-leak" values={{ V_m3, d_m, A, P0, P1, T_K, V: V_m3, d: p.d, T: T_K, Cd: p.Cd, du: p.du, Pu: p.Pu }} />}
    />
  )
}
