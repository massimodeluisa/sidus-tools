import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { G0, TOOL_UNIT_SETS, thrustToWeight, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  F: numParam(7600, { min: 0 }),
  Fu: strParam('kN', TOOL_UNIT_SETS.force),
  m: numParam(550, { min: 0 }),
  mu: strParam('t', TOOL_UNIT_SETS.mass),
} as const

export function ThrustToWeightTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const F = toSi(p.F, p.Fu)
    const m = toSi(p.m, p.mu)
    return thrustToWeight(F, m)
  }, [p])

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
            min={0}
            onValueChange={(F) => setP({ F })}
            onUnitChange={(Fu, F) => setP({ Fu, F })}
          />
          <UiUnitField
            label={t('fields.mass')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.m}
            min={0}
            onValueChange={(m) => setP({ m })}
            onUnitChange={(mu, m) => setP({ mu, m })}
          />
        </ParamsGrid>
      }
      results={
        res == null ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.tw_ratio')} value={res.toPrecision(5)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="thrust-to-weight"
          values={{ F: toSi(p.F, p.Fu), m: toSi(p.m, p.mu), g0: G0 }}
        />
      }
    />
  )
}
