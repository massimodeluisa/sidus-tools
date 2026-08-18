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
  applyMetabolism,
  atmosphereFlags,
  cabinFromMasses,
  cabinMassesFromComposition,
  METABOLIC_RATES,
  type MetabolicActivity,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const ACTS = ['none', ...Object.keys(METABOLIC_RATES)] as const

const SCHEMA = {
  V: numParam(10, { min: 0.1 }),
  Vu: strParam('m3', TOOL_UNIT_SETS.volume),
  T: numParam(22, { min: -50, max: 100 }),
  Tu: strParam('C', TOOL_UNIT_SETS.temperature),
  p: numParam(101.325, { min: 0.001 }),
  pu: strParam('kPa', TOOL_UNIT_SETS.pressure),
  o2frac: numParam(0.21, { min: 0.05, max: 0.5 }),
  ppco2: numParam(2.0, { min: 0 }),
  ppco2u: strParam('mmHg', TOOL_UNIT_SETS.pressureCabin),
  rh: numParam(0.4, { min: 0, max: 1 }),
  crew: numParam(3, { min: 0, max: 12 }),
  activity: strParam('nominal', ACTS as unknown as string[]),
  hours: numParam(8, { min: 0 }),
  hoursu: strParam('h', TOOL_UNIT_SETS.time),
} as const

export function CabinAtmosphereTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const V = toSi(p.V, p.Vu)
  const T = toSi(p.T, p.Tu)
  const pTotal = toSi(p.p, p.pu)
  const ppco2Pa = toSi(p.ppco2, p.ppco2u)
  const hoursS = toSi(p.hours, p.hoursu)

  const res = useMemo(() => {
    const masses0 = cabinMassesFromComposition(V, T, pTotal, p.o2frac, ppco2Pa, p.rh)
    if (!masses0) return null
    let masses = masses0
    let note: string = t('fields.note_cabin_initial')
    if (p.activity !== 'none' && p.crew > 0 && hoursS > 0) {
      const act = p.activity as MetabolicActivity
      if (act in METABOLIC_RATES) {
        const step = applyMetabolism(V, T, masses0, act, hoursS, p.crew)
        if (step) {
          masses = step.masses
          note = t('fields.note_cabin_after', {
            crew: p.crew,
            activity: t(`fields.activity_${act}`),
          })
        }
      }
    }
    const atm = cabinFromMasses(V, T, masses)
    if (!atm) return null
    return { masses, atm, note, flags: atmosphereFlags(atm) }
  }, [T, V, hoursS, p.activity, p.crew, p.o2frac, p.rh, pTotal, ppco2Pa, t])

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
            min={0.1}
            onValueChange={(V) => setP({ V })}
            onUnitChange={(Vu, V) => setP({ Vu, V })}
            hint={t('fields.hint_cabin_volume')}
          />
          <UiUnitField
            label={t('fields.temperature')}
            category="temperature"
            unitIds={TOOL_UNIT_SETS.temperature}
            unitId={p.Tu}
            value={p.T}
            onValueChange={(T) => setP({ T })}
            onUnitChange={(Tu, T) => setP({ Tu, T })}
          />
          <UiUnitField
            label={t('fields.total_pressure')}
            category="pressure"
            unitIds={TOOL_UNIT_SETS.pressure}
            unitId={p.pu}
            value={p.p}
            min={0.001}
            onValueChange={(pVal) => setP({ p: pVal })}
            onUnitChange={(pu, pVal) => setP({ pu, p: pVal })}
            hint={t('fields.hint_cabin_pressure')}
          />
          <UiField
            label={t('fields.dry_o_mole_fraction')}
            type="number"
            min={0.05}
            max={0.5}
            step="any"
            value={p.o2frac}
            onChange={(e) => setP({ o2frac: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.initial_ppco')}
            category="pressure"
            unitIds={TOOL_UNIT_SETS.pressureCabin}
            unitId={p.ppco2u}
            value={p.ppco2}
            min={0}
            onValueChange={(ppco2) => setP({ ppco2 })}
            onUnitChange={(ppco2u, ppco2) => setP({ ppco2u, ppco2 })}
          />
          <UiField
            label={t('fields.relative_humidity')}
            type="number"
            min={0}
            max={1}
            step="any"
            value={p.rh}
            onChange={(e) => setP({ rh: Number(e.target.value) })}
            hint={t('fields.hint_rh_0_1')}
          />
          <UiSelect
            label={t('fields.then_simulate_metabolism')}
            value={p.activity}
            onChange={(e) => setP({ activity: e.target.value })}
            options={[
              { value: 'none', label: t('fields.mode_none_initial') },
              ...Object.keys(METABOLIC_RATES).map((k) => ({
                value: k,
                label: t(`fields.activity_${k}`),
              })),
            ]}
          />
          <UiField
            label={t('fields.crew')}
            type="number"
            min={0}
            max={12}
            value={p.crew}
            onChange={(e) => setP({ crew: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.duration')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.hoursu}
            value={p.hours}
            min={0}
            onValueChange={(hours) => setP({ hours })}
            onUnitChange={(hoursu, hours) => setP({ hoursu, hours })}
          />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_cabin_inputs')}</p>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-[11px] text-muted">{res.note}</p>
            <div className="sidus-results">
              <ResultCard
                label={t('fields.ppo')}
                si={res.atm.ppO2Pa}
                category="pressure"
                unitId="mmHg"
                unitIds={TOOL_UNIT_SETS.pressureCabin}
                digits={2}
                accent
              />
              <ResultCard
                label={t('fields.ppco')}
                si={res.atm.ppCO2Pa}
                category="pressure"
                unitId="mmHg"
                unitIds={TOOL_UNIT_SETS.pressureCabin}
                digits={2}
                accent
              />
              <ResultCard
                label={t('fields.total_p')}
                si={res.atm.pTotalPa}
                category="pressure"
                unitId="kPa"
                unitIds={TOOL_UNIT_SETS.pressure}
                digits={2}
              />
              <ResultCard
                label={t('fields.dry_o')}
                value={(res.atm.dryFracO2 * 100).toFixed(2)}
                unit="%"
              />
              <ResultCard
                label={t('fields.m_o')}
                si={res.masses.o2}
                category="mass"
                unitId="kg"
                unitIds={TOOL_UNIT_SETS.mass}
                digits={3}
              />
              <ResultCard
                label={t('fields.m_co')}
                si={res.masses.co2}
                category="mass"
                unitId="kg"
                unitIds={TOOL_UNIT_SETS.mass}
                digits={3}
              />
              <ResultCard
                label={t('fields.m_n')}
                si={res.masses.n2}
                category="mass"
                unitId="kg"
                unitIds={TOOL_UNIT_SETS.mass}
                digits={3}
              />
              <ResultCard
                label={t('fields.m_h_o')}
                si={res.masses.h2o}
                category="mass"
                unitId="kg"
                unitIds={TOOL_UNIT_SETS.mass}
                digits={3}
              />
            </div>
            <ul className="space-y-1 border border-border bg-bg px-3 py-2 font-mono text-[11px] text-muted">
              {res.flags.map((f) => (
                <li key={f}>· {t(`fields.${f}`)}</li>
              ))}
            </ul>
          </div>
        )
      }
      code={<CodeExport formulaId="cabin-atmosphere" values={{ V, T, pTotal, ppco2Pa, hoursS, p: p.p, o2frac: p.o2frac, ppco2: p.ppco2, rh: p.rh, crew: p.crew, hours: p.hours, activity: p.activity }} />}
    />
  )
}
