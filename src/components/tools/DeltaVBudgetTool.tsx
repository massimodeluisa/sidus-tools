import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiField } from '@/components/shared/UiField'
import { UiSelect } from '@/components/shared/UiSelect'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  convertById,
  deltaVBudget,
  fromSi,
  getUnit,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const PHASE_KEYS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'] as const

/** Mission profile chips — phase Δv in m/s (SI), converted into the active unit. */
const MISSION_PRESETS = [
  {
    labelKey: 'fields.preset_leo_launch' as const,
    // gravity/drag ≈3.2 + pitch/coast ≈2.5 + circularize ≈1.5 ≈ 7.2 km/s class
    mps: [3200, 2500, 1500, 0, 0, 0],
  },
  {
    labelKey: 'fields.preset_leo_gto' as const,
    mps: [3200, 2500, 1500, 2500, 0, 0],
  },
  {
    labelKey: 'fields.preset_geo_gto_circ' as const,
    mps: [3200, 2500, 1500, 2500, 1800, 0],
  },
  {
    labelKey: 'fields.preset_lunar_tli' as const,
    mps: [3200, 2500, 1500, 3200, 0, 0],
  },
] as const

const SCHEMA = {
  d1: numParam(3200, { min: 0 }),
  d2: numParam(2500, { min: 0 }),
  d3: numParam(1500, { min: 0 }),
  d4: numParam(0, { min: 0 }),
  d5: numParam(0, { min: 0 }),
  d6: numParam(0, { min: 0 }),
  u: strParam('mps', TOOL_UNIT_SETS.velocity),
} as const

export function DeltaVBudgetTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const phasesSi = PHASE_KEYS.map((k) => toSi(p[k], p.u))
  const res = useMemo(() => deltaVBudget(phasesSi), [phasesSi.join(',')])
  const unitShort = getUnit(p.u)?.short ?? p.u

  const unitOptions = TOOL_UNIT_SETS.velocity.map((id) => ({
    value: id,
    label: getUnit(id)?.short ?? id,
  }))

  function changeUnit(nextUnit: string) {
    if (nextUnit === p.u) return
    const patch: Record<string, number | string> = { u: nextUnit }
    for (const k of PHASE_KEYS) {
      patch[k] = convertById(p[k], p.u, nextUnit)
    }
    setP(patch as never)
  }

  function applyMission(mps: readonly number[]) {
    const patch: Record<string, number> = {}
    PHASE_KEYS.forEach((k, i) => {
      patch[k] = fromSi(mps[i] ?? 0, p.u)
    })
    setP(patch as never)
  }

  return (
    <ToolShell
      parameters={
        <div className="space-y-3">
          <p className="font-mono text-[10px] text-subtle">
            {t('tools.delta_v_budget.params_hint')}
          </p>
          <UiSelect
            label={t('fields.velocity_unit')}
            value={p.u}
            options={unitOptions}
            onChange={(e) => changeUnit(e.target.value)}
            hint={t('tools.delta_v_budget.unit_hint')}
          />
          <ParamsGrid>
            {PHASE_KEYS.map((k, i) => (
              <UiField
                key={k}
                label={t('fields.phase_n', { n: i + 1 })}
                type="number"
                min={0}
                value={p[k]}
                onChange={(e) => setP({ [k]: Number(e.target.value) })}
                unit={unitShort}
              />
            ))}
            <FieldPresets label={t('common.presets')}>
              {MISSION_PRESETS.map((pr) => (
                <PresetChip key={pr.labelKey} onClick={() => applyMission(pr.mps)}>
                  {t(pr.labelKey)}
                </PresetChip>
              ))}
            </FieldPresets>
          </ParamsGrid>
        </div>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.total_delta_v')}
              si={res.total}
              category="velocity"
              unitId={p.u === 'kmps' ? 'kmps' : 'mps'}
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={3}
              accent
            />
            <ResultCard label={t('fields.phases_counted')} value={String(res.count)} />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('tools.delta_v_budget.empty')}</p>
        )
      }
      code={
        <CodeExport
          formulaId="delta-v-budget"
          values={{
            d1: phasesSi[0],
            d2: phasesSi[1],
            d3: phasesSi[2],
            d4: phasesSi[3],
            d5: phasesSi[4],
            d6: phasesSi[5],
          }}
        />
      }
    />
  )
}
