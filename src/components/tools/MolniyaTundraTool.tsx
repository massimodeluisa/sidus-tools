import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  EARTH_MU,
  EARTH_RADIUS,
  TOOL_UNIT_SETS,
  heoOrbitFromPerigee,
  toSi,
  type HeoClass,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const KINDS = ['molniya', 'tundra'] as const

const SCHEMA = {
  kind: strParam('molniya', KINDS),
  h: numParam(1000, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  dwell: numParam(30, { min: 1, max: 89 }),
  du: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function MolniyaTundraTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const h = toSi(p.h, p.hu)
    const dwellHalf = toSi(p.dwell, p.du)
    return heoOrbitFromPerigee({
      kind: p.kind as HeoClass,
      perigeeAlt: h,
      dwellHalfAngle: dwellHalf,
    })
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.heo_class')}
            value={p.kind}
            onChange={(e) => setP({ kind: e.target.value })}
            options={KINDS.map((id) => ({
              value: id,
              label: id === 'molniya' ? t('fields.heo_molniya') : t('fields.heo_tundra'),
            }))}
          />
          <UiUnitField
            label={t('fields.periapsis_altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
          />
          <UiUnitField
            label={t('fields.dwell_half')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.du}
            value={p.dwell}
            min={1}
            onValueChange={(dwell) => setP({ dwell })}
            onUnitChange={(du, dwell) => setP({ du, dwell })}
          />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.period')}
              si={res.period}
              category="time"
              unitId="h"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.critical_inclination')}
              si={res.inclination}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={4}
            />
            <ResultCard label={t('fields.eccentricity')} value={res.e.toPrecision(6)} />
            <ResultCard
              label={t('fields.apoapsis_altitude')}
              si={res.ra - EARTH_RADIUS}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.altitude}
              digits={2}
            />
            <ResultCard
              label={t('fields.apogee_dwell')}
              si={res.dwell}
              category="time"
              unitId="h"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={3}
            />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="molniya-tundra"
          values={{
            kind: p.kind === 'tundra' ? 1 : 0,
            h: toSi(p.h, p.hu),
            mu: EARTH_MU,
            R: EARTH_RADIUS,
          }}
        />
      }
    />
  )
}
