import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldNote } from '@/components/shared/Field'
import { UiVector3 } from '@/components/shared/UiVector3'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { losRangeRate, TOOL_UNIT_SETS } from '@/lib/physics'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  x: numParam(1000),
  y: numParam(5000),
  z: numParam(200),
  vx: numParam(-1),
  vy: numParam(0.5),
  vz: numParam(0.1),
} as const

export function LosRangeRateTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(
    () => losRangeRate([p.x, p.y, p.z], [p.vx, p.vy, p.vz]),
    [p.x, p.y, p.z, p.vx, p.vy, p.vz],
  )
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <FieldNote>{t('fields.note_los_frame')}</FieldNote>
          <UiVector3
            label={t('fields.position_r')}
            unit="m"
            value={{ x: p.x, y: p.y, z: p.z }}
            onChange={(v) => setP({ x: v.x, y: v.y, z: v.z })}
          />
          <UiVector3
            label={t('fields.velocity_v')}
            unit="m/s"
            value={{ x: p.vx, y: p.vy, z: p.vz }}
            onChange={(v) => setP({ vx: v.x, vy: v.y, vz: v.z })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.range_2')}
              si={res.range}
              category="length"
              unitId="m"
              unitIds={TOOL_UNIT_SETS.length}
              digits={2}
              accent
            />
            <ResultCard
              label={t('fields.range_rate')}
              si={res.rangeRate}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.r_must_nonzero')}</p>
        )
      }
      code={<CodeExport formulaId="los-range-rate" values={{ x: p.x, vx: p.vx }} />}
    />
  )
}
