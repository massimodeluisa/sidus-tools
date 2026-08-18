import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  applyDcm,
  euler321ToQuat,
  quatToDcm,
  quatToEuler321,
  toSi,
} from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const MODES = ['euler', 'quat'] as const

const SCHEMA = {
  mode: strParam('euler', MODES),
  yaw: numParam(90),
  pitch: numParam(0),
  roll: numParam(0),
  au: strParam('deg', TOOL_UNIT_SETS.angle),
  qw: numParam(0.707106781),
  qx: numParam(0),
  qy: numParam(0),
  qz: numParam(0.707106781),
} as const

export function QuaternionEulerTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const q =
      p.mode === 'quat'
        ? { w: p.qw, x: p.qx, y: p.qy, z: p.qz }
        : euler321ToQuat(toSi(p.yaw, p.au), toSi(p.pitch, p.au), toSi(p.roll, p.au))
    if (!q) return null
    const dcm = quatToDcm(q)
    const eu = quatToEuler321(q)
    if (!dcm || !eu) return null
    const xhat = applyDcm(dcm, [1, 0, 0])
    return { q, dcm, eu, xhat }
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.mode')}
            value={p.mode}
            onChange={(e) => setP({ mode: e.target.value })}
            options={MODES.map((id) => ({
              value: id,
              label: id === 'euler' ? t('fields.mode_euler') : t('fields.mode_quat'),
            }))}
          />
          {p.mode === 'euler' ? (
            <>
              <UiUnitField
                label={t('fields.yaw')}
                category="angle"
                unitIds={TOOL_UNIT_SETS.angle}
                unitId={p.au}
                value={p.yaw}
                onValueChange={(yaw) => setP({ yaw })}
                onUnitChange={(au, yaw) => setP({ au, yaw })}
              />
              <UiUnitField
                label={t('fields.pitch')}
                category="angle"
                unitIds={TOOL_UNIT_SETS.angle}
                unitId={p.au}
                value={p.pitch}
                onValueChange={(pitch) => setP({ pitch })}
                onUnitChange={(au, pitch) => setP({ au, pitch })}
              />
              <UiUnitField
                label={t('fields.roll')}
                category="angle"
                unitIds={TOOL_UNIT_SETS.angle}
                unitId={p.au}
                value={p.roll}
                onValueChange={(roll) => setP({ roll })}
                onUnitChange={(au, roll) => setP({ au, roll })}
              />
            </>
          ) : (
            <>
              <UiField label={t('fields.qw')} type="number" value={p.qw} onChange={(e) => setP({ qw: Number(e.target.value) })} />
              <UiField label={t('fields.qx')} type="number" value={p.qx} onChange={(e) => setP({ qx: Number(e.target.value) })} />
              <UiField label={t('fields.qy')} type="number" value={p.qy} onChange={(e) => setP({ qy: Number(e.target.value) })} />
              <UiField label={t('fields.qz')} type="number" value={p.qz} onChange={(e) => setP({ qz: Number(e.target.value) })} />
            </>
          )}
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.qw')} value={formatNumber(res.q.w, 6)} accent />
            <ResultCard label={t('fields.qx')} value={formatNumber(res.q.x, 6)} />
            <ResultCard label={t('fields.qy')} value={formatNumber(res.q.y, 6)} />
            <ResultCard label={t('fields.qz')} value={formatNumber(res.q.z, 6)} />
            <ResultCard
              label={t('fields.yaw')}
              si={res.eu.yaw}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={4}
            />
            <ResultCard
              label={t('fields.pitch')}
              si={res.eu.pitch}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={4}
            />
            <ResultCard
              label={t('fields.roll')}
              si={res.eu.roll}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={4}
            />
            <ResultCard
              label={t('fields.xhat_after')}
              value={`${formatNumber(res.xhat[0], 4)}, ${formatNumber(res.xhat[1], 4)}, ${formatNumber(res.xhat[2], 4)}`}
            />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="quaternion-euler"
          values={{
            yaw: toSi(p.yaw, p.au),
            pitch: toSi(p.pitch, p.au),
            roll: toSi(p.roll, p.au),
          }}
        />
      }
    />
  )
}
