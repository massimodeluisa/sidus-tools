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
  BVAD_ISS_WATER,
  ISS_DAY_O2_KG,
  ISS_UPA_RECOVERY,
  waterLoopBudget,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/use-tool-search-params'

const SCHEMA = {
  potable: numParam(BVAD_ISS_WATER.potableKg, { min: 0 }),
  hygiene: numParam(BVAD_ISS_WATER.hygieneKg, { min: 0 }),
  flush: numParam(BVAD_ISS_WATER.flushKg, { min: 0 }),
  o2: numParam(ISS_DAY_O2_KG, { min: 0 }),
  urine: numParam(BVAD_ISS_WATER.urineKg, { min: 0 }),
  condensate: numParam(BVAD_ISS_WATER.condensateKg, { min: 0 }),
  eta_u: numParam(ISS_UPA_RECOVERY, { min: 0, max: 1 }),
  eta_c: numParam(1, { min: 0, max: 1 }),
  eta_h: numParam(0, { min: 0, max: 1 }),
  crew: numParam(4, { min: 1, max: 100 }),
  dur: numParam(180, { min: 0.001 }),
  du: strParam('d', TOOL_UNIT_SETS.time),
  reserve: numParam(0.1, { min: 0, max: 5 }),
} as const

const PER_CREW_DAY = 'kg / crew·day'

export function WaterLoopTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const durationS = toSi(p.dur, p.du)

  const res = useMemo(
    () =>
      waterLoopBudget({
        potableKg: p.potable,
        hygieneKg: p.hygiene,
        flushKg: p.flush,
        o2Kg: p.o2,
        urineKg: p.urine,
        condensateKg: p.condensate,
        etaUrine: p.eta_u,
        etaCondensate: p.eta_c,
        etaHygiene: p.eta_h,
        crew: p.crew,
        durationS,
        reserveFrac: p.reserve,
      }),
    [p.potable, p.hygiene, p.flush, p.o2, p.urine, p.condensate, p.eta_u, p.eta_c, p.eta_h, p.crew, durationS, p.reserve],
  )

  const kgField = (key: 'potable' | 'hygiene' | 'flush' | 'o2' | 'urine' | 'condensate', hint?: string) => (
    <UiField
      label={t(`fields.water_${key}`)}
      unit={PER_CREW_DAY}
      type="number"
      min={0}
      step="any"
      value={p[key]}
      onChange={(e) => setP({ [key]: Number(e.target.value) })}
      hint={hint}
    />
  )

  const etaField = (key: 'eta_u' | 'eta_c' | 'eta_h', hint: string) => (
    <UiField
      label={t(`fields.water_${key}`)}
      unit="0…1"
      type="number"
      min={0}
      max={1}
      step="any"
      value={p[key]}
      onChange={(e) => setP({ [key]: Number(e.target.value) })}
      hint={hint}
    />
  )

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          {kgField('potable', t('fields.hint_water_potable'))}
          {kgField('hygiene', t('fields.hint_water_hygiene'))}
          {kgField('flush')}
          {kgField('o2', t('fields.hint_water_o2'))}
          {kgField('urine')}
          {kgField('condensate')}
          {etaField('eta_u', t('fields.hint_water_eta_u'))}
          {etaField('eta_c', t('fields.hint_water_eta_c'))}
          {etaField('eta_h', t('fields.hint_water_eta_h'))}
          <UiField
            label={t('fields.crew')}
            type="number"
            min={1}
            max={100}
            value={p.crew}
            onChange={(e) => setP({ crew: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.duration')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.du}
            value={p.dur}
            min={0.001}
            onValueChange={(dur) => setP({ dur })}
            onUnitChange={(du, dur) => setP({ du, dur })}
          />
          <UiField
            label={t('fields.water_reserve')}
            unit="0…5"
            type="number"
            min={0}
            max={5}
            step="any"
            value={p.reserve}
            onChange={(e) => setP({ reserve: Number(e.target.value) })}
          />
          <FieldNote>{t('fields.note_water_loop')}</FieldNote>
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_water_inputs')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.water_mission')}
              si={res.missionKg}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.water_makeup')}
              si={(res.makeupKg * p.crew) / 86400}
              category="massFlow"
              unitId="kgpd"
              unitIds={TOOL_UNIT_SETS.massFlow}
              digits={3}
              accent
            />
            <ResultCard
              label={t('fields.water_closure')}
              value={(res.closure * 100).toFixed(1)}
              unit="%"
            />
            <ResultCard
              label={t('fields.water_open_loop')}
              si={res.openLoopKg}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={4}
            />
            <ResultCard
              label={t('fields.water_saved')}
              si={res.savedKg}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={4}
            />
            <ResultCard
              label={t('fields.water_demand')}
              value={res.demandKg.toFixed(3)}
              unit={PER_CREW_DAY}
            />
            <ResultCard
              label={t('fields.water_electrolysis')}
              value={res.electrolysisKg.toFixed(3)}
              unit={PER_CREW_DAY}
            />
            <ResultCard
              label={t('fields.water_recovered')}
              value={res.recoveredKg.toFixed(3)}
              unit={PER_CREW_DAY}
            />
            {res.surplusKg > 0 ? (
              <ResultCard
                label={t('fields.water_surplus')}
                value={res.surplusKg.toFixed(3)}
                unit={PER_CREW_DAY}
              />
            ) : null}
          </div>
        )
      }
      code={
        res ? (
          <CodeExport
            formulaId="water-loop"
            values={{
              potable: p.potable,
              hygiene: p.hygiene,
              flush: p.flush,
              o2: p.o2,
              urine: p.urine,
              condensate: p.condensate,
              eta_u: p.eta_u,
              eta_c: p.eta_c,
              eta_h: p.eta_h,
              crew: p.crew,
              tS: durationS,
              reserve: p.reserve,
            }}
          />
        ) : null
      }
    />
  )
}
