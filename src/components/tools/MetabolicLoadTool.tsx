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
  ISS_DAY_CO2_KG,
  ISS_DAY_O2_KG,
  metabolicBudget,
  METABOLIC_RATES,
  respiratoryQuotient,
  TOOL_UNIT_SETS,
  toSi,
  type MetabolicActivity,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const ACTS = Object.keys(METABOLIC_RATES) as MetabolicActivity[]

const SCHEMA = {
  activity: strParam('nominal', ACTS),
  crew: numParam(3, { min: 1, max: 12 }),
  t: numParam(24, { min: 0.01 }),
  tu: strParam('h', TOOL_UNIT_SETS.time) } as const

export function MetabolicLoadTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const tS = toSi(p.t, p.tu)
  const act = p.activity as MetabolicActivity

  const res = useMemo(() => {
    const b = metabolicBudget(act, tS, p.crew)
    if (!b) return null
    const rq = respiratoryQuotient(b.o2Kg, b.co2Kg)
    return { b, rq, rates: METABOLIC_RATES[act] }
  }, [act, p.crew, tS])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.activity')}
            value={p.activity}
            onChange={(e) => setP({ activity: e.target.value })}
            options={ACTS.map((a) => ({
              value: a,
              label: t(`fields.activity_${a}`) }))}
          />
          <UiField
            label={t('fields.crew_size')}
            type="number"
            min={1}
            max={12}
            value={p.crew}
            onChange={(e) => setP({ crew: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.duration')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.tu}
            value={p.t}
            min={0}
            onValueChange={(t) => setP({ t })}
            onUnitChange={(tu, t) => setP({ tu, t })}
          />
          <p className="font-mono text-[10px] leading-relaxed text-subtle">
            {t('fields.note_metabolic_ochmo', {
              o2: ISS_DAY_O2_KG,
              co2: ISS_DAY_CO2_KG,
            })}
          </p>
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_duration_crew')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.o_consumed')}
              si={res.b.o2Kg}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.co_produced')}
              si={res.b.co2Kg}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.h_o_metabolic_insensible_order')}
              si={res.b.h2oKg}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={4}
            />
            <ResultCard
              label={t('fields.heat_load_avg')}
              si={res.b.heatAvgW}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={1}
            />
            <ResultCard
              label={t('fields.heat_energy')}
              si={res.b.heatJ}
              category="energy"
              unitId="kJ"
              unitIds={TOOL_UNIT_SETS.energy}
              digits={1}
            />
            <ResultCard
              label={t('fields.rq_mol_co_mol_o')}
              value={res.rq != null ? formatNumber(res.rq, 3) : ': '}
            />
            <ResultCard
              label={t('fields.duration')}
              si={tS}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
            />
            <ResultCard
              label={t('fields.o_rate_per_crew')}
              si={res.rates.o2KgS}
              category="massFlow"
              unitId="kgps"
              unitIds={TOOL_UNIT_SETS.massFlow}
              digits={6}
            />
          </div>
        )
      }
      code={<CodeExport formulaId="metabolic-load" values={{ tS, crew: p.crew, t: p.t, activity: p.activity, tu: p.tu }} />}
    />
  )
}
