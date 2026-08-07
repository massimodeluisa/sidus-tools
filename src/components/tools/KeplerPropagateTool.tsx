import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { UiVector3, type Vec3 as UiVec } from '@/components/shared/UiVector3'
import { TrajectoryPlot } from '@/components/viz/TrajectoryPlot'
import {
  BODIES,
  getBody,
  keplerPropagate,
  keplerTrail,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatDuration,
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  rx: numParam(6_778_137),
  ry: numParam(0),
  rz: numParam(0),
  vx: numParam(0),
  vy: numParam(7668.6),
  vz: numParam(0),
  dt: numParam(3600),
  dtu: strParam('s', TOOL_UNIT_SETS.time),
  steps: numParam(80, { min: 8, max: 400 }) } as const

export function KeplerPropagateTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)

  const r0: UiVec = { x: p.rx, y: p.ry, z: p.rz }
  const v0: UiVec = { x: p.vx, y: p.vy, z: p.vz }

  const state0 = useMemo(
    () => ({
      r: [p.rx, p.ry, p.rz] as [number, number, number],
      v: [p.vx, p.vy, p.vz] as [number, number, number] }),
    [p.rx, p.ry, p.rz, p.vx, p.vy, p.vz],
  )

  const dt_s = toSi(p.dt, p.dtu)

  const prop = useMemo(() => {
    if (!Number.isFinite(dt_s)) return null
    return keplerPropagate(body.mu, state0, dt_s)
  }, [body.mu, dt_s, state0])

  const trail = useMemo(() => {
    if (!Number.isFinite(dt_s)) return []
    return keplerTrail(body.mu, state0, dt_s, Math.floor(p.steps))
  }, [body.mu, dt_s, p.steps, state0])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect
            value={p.body}
            onChange={(body) => setP({ body })}
          />
          <UiVector3
            label={t('fields.r_8')}
            unit="m"
            value={r0}
            onChange={(v) => setP({ rx: v.x, ry: v.y, rz: v.z })}
          />
          <UiVector3
            label={t('fields.v_9')}
            unit="m/s"
            value={v0}
            onChange={(v) => setP({ vx: v.x, vy: v.y, vz: v.z })}
          />
          <UiUnitField
            label={t('fields.t_3')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.dtu}
            value={p.dt}
            onValueChange={(dt) => setP({ dt })}
            onUnitChange={(dtu, dt) => setP({ dtu, dt })}
            hint={formatDuration(Math.abs(dt_s))}
          />
          <UiField
            label={t('fields.trail_samples')}
            type="number"
            min={8}
            max={400}
            value={p.steps}
            onChange={(e) => setP({ steps: Number(e.target.value) })}
          />
        </ParamsGrid>
      }
      results={
        !prop ? (
          <p className="font-mono text-sm text-muted">
            {t('fields.kepler_prop_failed')}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.r_m')}
              value={`${formatNumber(prop.r[0], 2)}, ${formatNumber(prop.r[1], 2)}, ${formatNumber(prop.r[2], 2)}`}
              accent
            />
            <ResultCard
              label={t('fields.v_m_s')}
              value={`${formatNumber(prop.v[0], 4)}, ${formatNumber(prop.v[1], 4)}, ${formatNumber(prop.v[2], 4)}`}
            />
            <ResultCard
              label={t('fields.r')}
              si={Math.hypot(...prop.r)}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={4}
            />
            <ResultCard
              label={t('fields.v_2')}
              si={Math.hypot(...prop.v)}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard label={t('fields.t_3')} si={Math.abs(dt_s)} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard label={t('fields.trail_points')} value={String(trail.length)} />
          </div>
        )
      }
      preview={
        <TrajectoryPlot
          points={trail}
          bodyR={body.radius}
          markers={[
            { r: state0.r, label: 't₀' },
            ...(prop ? [{ r: prop.r, label: 't₀+Δt' }] : []),
          ]}
          title={t('fields.title_kepler_trail')}
          subtitle={t('fields.subtitle_kepler_trail')}
          defaultHeight={260}
        />
      }
      code={<CodeExport formulaId="kepler-propagate" values={{ dt_s, mu: body.mu, R: body.radius, rx: p.rx, ry: p.ry, rz: p.rz, vx: p.vx, vy: p.vy, vz: p.vz, dt: p.dt, steps: p.steps, body: p.body, dtu: p.dtu }} />}
    />
  )
}
