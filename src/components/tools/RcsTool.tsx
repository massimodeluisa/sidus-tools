import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { impulseBit, rcsDeltaV, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  F: numParam(22, { min: 0.001 }),
  Fu: strParam('N', TOOL_UNIT_SETS.force),
  t: numParam(1, { min: 0.001 }),
  tu: strParam('s', TOOL_UNIT_SETS.time),
  m: numParam(500, { min: 0.001 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  tmin: numParam(0.02, { min: 0.0001 }),
  tminu: strParam('s', TOOL_UNIT_SETS.time),
} as const

export function RcsTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const F = toSi(p.F, p.Fu)
  const burnS = toSi(p.t, p.tu)
  const m = toSi(p.m, p.mu)
  const tmin = toSi(p.tmin, p.tminu)
  const res = useMemo(() => {
    const dv = rcsDeltaV(F, burnS, m)
    const ib = impulseBit(F, tmin)
    return dv != null && ib != null ? { dv, ib, I: F * burnS } : null
  }, [F, burnS, m, tmin])
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
            label={t('fields.burn_time')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.tu}
            value={p.t}
            min={0.001}
            onValueChange={(t) => setP({ t })}
            onUnitChange={(tu, t) => setP({ tu, t })}
          />
          <UiUnitField
            label={t('fields.spacecraft_mass')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.m}
            min={0.001}
            onValueChange={(m) => setP({ m })}
            onUnitChange={(mu, m) => setP({ mu, m })}
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
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.v_3')}
              si={res.dv}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.impulse_i_f_t')}
              si={res.I}
              category="impulse"
              unitId="Ns"
              unitIds={TOOL_UNIT_SETS.impulse}
              digits={3}
            />
            <ResultCard
              label={t('fields.impulse_bit')}
              si={res.ib}
              category="impulse"
              unitId="Ns"
              unitIds={TOOL_UNIT_SETS.impulse}
              digits={4}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        )
      }
      code={
        <CodeExport
          formulaId="rcs"
          values={{ F, t: burnS, m, tmin, Fu: p.Fu, tu: p.tu, tminu: p.tminu }}
        />
      }
    />
  )
}
