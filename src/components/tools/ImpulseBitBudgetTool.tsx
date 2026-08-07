import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { impulseBit, rcsDeltaV, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  F: numParam(1, { min: 0.001 }),
  Fu: strParam('N', TOOL_UNIT_SETS.force),
  tmin: numParam(0.02, { min: 0.0001 }),
  tminu: strParam('s', TOOL_UNIT_SETS.time),
  m: numParam(200, { min: 0.001 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  pulses: numParam(100, { min: 1 }),
} as const

export function ImpulseBitBudgetTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const F = toSi(p.F, p.Fu)
  const tmin = toSi(p.tmin, p.tminu)
  const m = toSi(p.m, p.mu)
  const res = useMemo(() => {
    const ib = impulseBit(F, tmin)
    if (ib == null) return null
    const dvBit = rcsDeltaV(F, tmin, m)
    const totalI = ib * p.pulses
    const totalDv = dvBit != null ? dvBit * p.pulses : null
    return { ib, dvBit, totalI, totalDv }
  }, [F, tmin, m, p.pulses])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.thrust')}
            category="force"
            unitIds={TOOL_UNIT_SETS.force}
            unitId={p.Fu}
            value={p.F}
            min={0.001}
            onValueChange={(F) => setP({ F })}
            onUnitChange={(Fu, F) => setP({ Fu, F })}
          />
          <UiUnitField
            label={t('fields.min_pulse')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.tminu}
            value={p.tmin}
            min={0.0001}
            onValueChange={(tmin) => setP({ tmin })}
            onUnitChange={(tminu, tmin) => setP({ tminu, tmin })}
          />
          <UiUnitField
            label={t('fields.mass')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.m}
            min={0.001}
            onValueChange={(m) => setP({ m })}
            onUnitChange={(mu, m) => setP({ mu, m })}
          />
          <UiField
            label={t('fields.number_of_pulses')}
            type="number"
            value={p.pulses}
            min={1}
            onChange={(e) => setP({ pulses: Number(e.target.value) })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.impulse_bit')}
              si={res.ib}
              category="impulse"
              unitId="Ns"
              unitIds={TOOL_UNIT_SETS.impulse}
              digits={5}
              accent
            />
            {res.dvBit != null ? (
              <ResultCard
                label={t('fields.v_per_bit')}
                si={res.dvBit}
                category="velocity"
                unitId="mps"
                unitIds={TOOL_UNIT_SETS.velocity}
                digits={3}
              />
            ) : null}
            <ResultCard
              label={t('fields.total_impulse')}
              si={res.totalI}
              category="impulse"
              unitId="Ns"
              unitIds={TOOL_UNIT_SETS.impulse}
              digits={3}
            />
            {res.totalDv != null ? (
              <ResultCard
                label={t('fields.total_v')}
                si={res.totalDv}
                category="velocity"
                unitId="mps"
                unitIds={TOOL_UNIT_SETS.velocity}
                digits={4}
              />
            ) : null}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_inputs')}</p>
        )
      }
      code={
        <CodeExport
          formulaId="impulse-budget"
          values={{ F, t_min: tmin, tmin, N: p.pulses, pulses: p.pulses, m }}
        />
      }
    />
  )
}
