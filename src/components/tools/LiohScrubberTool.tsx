import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldNote } from '@/components/shared/Field'
import { UiField } from '@/components/shared/UiField'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  liohDuration,
  liohForCo2,
  LIOH_CO2_CAPACITY,
  METABOLIC_RATES,
  metabolicBudget,
  type MetabolicActivity,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const ACTS = Object.keys(METABOLIC_RATES) as MetabolicActivity[]

const SCHEMA = {
  m: numParam(2.0, { min: 0.01 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  capacity: numParam(LIOH_CO2_CAPACITY, { min: 0.1, max: 1 }),
  crew: numParam(3, { min: 1, max: 12 }),
  activity: strParam('nominal', ACTS),
  mode: strParam('crew', ['crew', 'manual'] as const),
  co2_day: numParam(1.0, { min: 0.001 }),
  co2u: strParam('kgpd', TOOL_UNIT_SETS.massFlow),
} as const

export function LiohScrubberTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const act = p.activity as MetabolicActivity
  const m = toSi(p.m, p.mu)
  const co2RateManual = toSi(p.co2_day, p.co2u) // kg/s

  const res = useMemo(() => {
    let co2Rate: number
    if (p.mode === 'manual') {
      co2Rate = co2RateManual
    } else {
      const b = metabolicBudget(act, 86400, p.crew)
      if (!b) return null
      co2Rate = b.co2Kg / 86400
    }
    const d = liohDuration(m, co2Rate, p.capacity)
    if (!d) return null
    const co2PerDay = co2Rate * 86400
    return {
      ...d,
      co2PerDay,
      co2Rate,
      liohPerDay: liohForCo2(co2PerDay, p.capacity),
      theoreticalCap: m * (0.04401 / (2 * 0.02395)),
    }
  }, [act, co2RateManual, m, p.capacity, p.crew, p.mode])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.lioh_mass')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.m}
            min={0.01}
            onValueChange={(m) => setP({ m })}
            onUnitChange={(mu, m) => setP({ mu, m })}
            hint={t('fields.hint_lioh_mass')}
          />
          <UiField
            label={t('fields.practical_capacity')}
            unit="kg CO₂ / kg LiOH"
            type="number"
            min={0.1}
            max={1}
            step="any"
            value={p.capacity}
            onChange={(e) => setP({ capacity: Number(e.target.value) })}
            hint={t('fields.hint_lioh_capacity', { cap: LIOH_CO2_CAPACITY })}
          />
          <UiSelect
            label={t('fields.co_load_source')}
            value={p.mode}
            onChange={(e) => setP({ mode: e.target.value })}
            options={[
              { value: 'crew', label: t('fields.mode_crew_metab') },
              { value: 'manual', label: t('fields.mode_manual_co2') },
            ]}
          />
          {p.mode === 'crew' ? (
            <>
              <UiSelect
                label={t('fields.activity')}
                value={p.activity}
                onChange={(e) => setP({ activity: e.target.value })}
                options={ACTS.map((a) => ({
                  value: a,
                  label: t(`fields.activity_${a}`),
                }))}
              />
              <UiField
                label={t('fields.crew')}
                type="number"
                min={1}
                max={12}
                value={p.crew}
                onChange={(e) => setP({ crew: Number(e.target.value) })}
              />
            </>
          ) : (
            <UiUnitField
              label={t('fields.co_production')}
              category="massFlow"
              unitIds={TOOL_UNIT_SETS.massFlow}
              unitId={p.co2u}
              value={p.co2_day}
              min={0.001}
              onValueChange={(co2_day) => setP({ co2_day })}
              onUnitChange={(co2u, co2_day) => setP({ co2u, co2_day })}
            />
          )}
          <FieldNote>{t('fields.note_lioh')}</FieldNote>
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_lioh_inputs')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.co_capacity')}
              si={res.capacityKg}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={3}
              accent
            />
            <ResultCard
              label={t('fields.time_to_breakthrough')}
              si={res.durationS}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.co_load')}
              si={res.co2Rate}
              category="massFlow"
              unitId="kgpd"
              unitIds={TOOL_UNIT_SETS.massFlow}
              digits={3}
            />
            <ResultCard
              label={t('fields.lioh_use_rate')}
              si={(res.liohPerDay ?? 0) / 86400}
              category="massFlow"
              unitId="kgpd"
              unitIds={TOOL_UNIT_SETS.massFlow}
              digits={3}
            />
            <ResultCard
              label={t('fields.stoich_capacity_ref')}
              si={res.theoreticalCap}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={3}
            />
          </div>
        )
      }
      code={<CodeExport formulaId="lioh-scrubber" values={{ m, co2RateManual, capacity: p.capacity, crew: p.crew, co2_day: p.co2_day, activity: p.activity, mode: p.mode }} />}
    />
  )
}
