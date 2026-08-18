import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  EARTH_J2,
  EARTH_J3,
  EARTH_RADIUS,
  TOOL_UNIT_SETS,
  frozenEccentricityJ2J3,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  a: numParam(7178, { min: 0 }),
  au: strParam('km', TOOL_UNIT_SETS.length),
  i: numParam(98, { min: 0, max: 180 }),
  iu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function FrozenOrbitTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const a = toSi(p.a, p.au)
    const i = toSi(p.i, p.iu)
    return frozenEccentricityJ2J3(a, i)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.semi_major_axis')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.au}
            value={p.a}
            min={0}
            onValueChange={(a) => setP({ a })}
            onUnitChange={(au, a) => setP({ au, a })}
          />
          <UiUnitField
            label={t('fields.target_inclination')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.iu}
            value={p.i}
            min={0}
            onValueChange={(i) => setP({ i })}
            onUnitChange={(iu, i) => setP({ iu, i })}
          />
        </ParamsGrid>
      }
      results={
        res == null ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.frozen_e')} value={res.toPrecision(6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="frozen-orbit"
          values={{
            a: toSi(p.a, p.au),
            inc: toSi(p.i, p.iu),
            j2: EARTH_J2,
            j3: EARTH_J3,
            Rb: EARTH_RADIUS,
          }}
        />
      }
    />
  )
}
