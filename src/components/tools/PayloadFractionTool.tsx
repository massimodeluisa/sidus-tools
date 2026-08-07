import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { fromSi, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  m0: numParam(500_000, { min: 0.001 }),
  mpl: numParam(10_000, { min: 0 }),
  mprop: numParam(400_000, { min: 0 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
} as const

export function PayloadFractionTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const m0 = toSi(p.m0, p.mu)
  const mpl = toSi(p.mpl, p.mu)
  const mprop = toSi(p.mprop, p.mu)
  const res = useMemo(() => {
    const struct = m0 - mpl - mprop
    if (struct < 0 || !(m0 > 0)) return null
    return { pl: mpl / m0, prop: mprop / m0, st: struct / m0, struct }
  }, [m0, mpl, mprop])

  function changeMassUnit(mu: string) {
    setP({
      mu,
      m0: fromSi(toSi(p.m0, p.mu), mu),
      mpl: fromSi(toSi(p.mpl, p.mu), mu),
      mprop: fromSi(toSi(p.mprop, p.mu), mu),
    })
  }

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.gross_m')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.m0}
            min={0.001}
            onValueChange={(m0) => setP({ m0 })}
            onUnitChange={(mu) => changeMassUnit(mu)}
          />
          <UiUnitField
            label={t('fields.payload')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.mpl}
            min={0}
            onValueChange={(mpl) => setP({ mpl })}
            onUnitChange={(mu) => changeMassUnit(mu)}
          />
          <UiUnitField
            label={t('fields.propellant')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.mprop}
            min={0}
            onValueChange={(mprop) => setP({ mprop })}
            onUnitChange={(mu) => changeMassUnit(mu)}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.payload_fraction')} value={(res.pl * 100).toFixed(2)} unit="%" accent />
            <ResultCard label={t('fields.propellant_fraction')} value={(res.prop * 100).toFixed(2)} unit="%" />
            <ResultCard label={t('fields.structure_other')} value={(res.st * 100).toFixed(2)} unit="%" />
            <ResultCard
              label={t('fields.structure_mass')}
              si={res.struct}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={0}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.need_masses_sum_m0')}</p>
        )
      }
      code={<CodeExport formulaId="payload-fraction" values={{ m0, mpl, mprop }} />}
    />
  )
}
