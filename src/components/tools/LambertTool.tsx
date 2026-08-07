import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldNote } from '@/components/shared/Field'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { TrajectoryPlot } from '@/components/viz/TrajectoryPlot'
import {
  BODIES,
  coplanarRadii,
  fromSi,
  getBody,
  keplerPropagate,
  keplerTrail,
  lambertSolve,
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
  r1: numParam(6778, { min: 0.001 }),
  r2: numParam(42164, { min: 0.001 }),
  lu: strParam('km', TOOL_UNIT_SETS.length),
  angle: numParam(90, { min: 0.1, max: 179.9 }),
  au: strParam('deg', TOOL_UNIT_SETS.angle),
  tof: numParam(20_000, { min: 0.001 }),
  tu: strParam('s', TOOL_UNIT_SETS.time),
  way: strParam('short', ['short', 'long'] as const),
} as const

export function LambertTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)

  const r1_m = toSi(p.r1, p.lu)
  const r2_m = toSi(p.r2, p.lu)
  const ang_rad = toSi(p.angle, p.au)
  const tof_s = toSi(p.tof, p.tu)

  const geom = useMemo(() => {
    if (!(r1_m > 0) || !(r2_m > 0) || !(ang_rad > 0)) return null
    return coplanarRadii(r1_m, r2_m, ang_rad)
  }, [ang_rad, r1_m, r2_m])

  const sol = useMemo(() => {
    if (!geom || !(tof_s > 0)) return null
    return lambertSolve(body.mu, geom.r1, geom.r2, tof_s, p.way === 'short')
  }, [body.mu, geom, p.way, tof_s])

  const trail = useMemo(() => {
    if (!sol || !geom) return []
    const state0 = { r: geom.r1, v: sol.v1 }
    return keplerTrail(body.mu, state0, tof_s, 96)
  }, [body.mu, geom, sol, tof_s])

  const check = useMemo(() => {
    if (!sol || !geom) return null
    const end = keplerPropagate(body.mu, { r: geom.r1, v: sol.v1 }, tof_s)
    if (!end) return null
    const dr = Math.hypot(
      end.r[0] - geom.r2[0],
      end.r[1] - geom.r2[1],
      end.r[2] - geom.r2[2],
    )
    return { dr, v2prop: end.v }
  }, [body.mu, geom, sol, tof_s])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.r_6')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.lu}
            value={p.r1}
            min={0}
            onValueChange={(r1) => setP({ r1 })}
            onUnitChange={(lu, r1) =>
              setP({
                lu,
                r1,
                r2: fromSi(toSi(p.r2, p.lu), lu),
              })
            }
            reserveHint={false}
          />
          <UiUnitField
            label={t('fields.r_7')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.lu}
            value={p.r2}
            min={0}
            onValueChange={(r2) => setP({ r2 })}
            onUnitChange={(lu, r2) =>
              setP({
                lu,
                r2,
                r1: fromSi(toSi(p.r1, p.lu), lu),
              })
            }
            reserveHint={false}
          />
          <UiUnitField
            label={t('fields.transfer_angle')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.au}
            value={p.angle}
            min={0}
            onValueChange={(angle) => setP({ angle })}
            onUnitChange={(au, angle) => setP({ au, angle })}
            reserveHint={false}
          />
          <UiUnitField
            label={t('fields.tof')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.tu}
            value={p.tof}
            min={0}
            onValueChange={(tof) => setP({ tof })}
            onUnitChange={(tu, tof) => setP({ tu, tof })}
            hint={Number.isFinite(tof_s) ? formatDuration(tof_s) : undefined}
          />
          <UiSelect
            label={t('fields.way')}
            value={p.way}
            onChange={(e) => setP({ way: e.target.value })}
            options={[
              { value: 'short', label: t('fields.mode_short_way') },
              { value: 'long', label: t('fields.mode_long_way') },
            ]}
            reserveHint={false}
          />
          {/* Model note after inputs, full width (not wedged mid-form) */}
          <FieldNote>{t('fields.note_lambert')}</FieldNote>
        </ParamsGrid>
      }
      results={
        !sol ? (
          <p className="font-mono text-sm text-muted">
            {t('fields.no_lambert_solution')}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.v_5')}
              si={Math.hypot(sol.v1[0], sol.v1[1], sol.v1[2])}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.v_6')}
              si={Math.hypot(sol.v2[0], sol.v2[1], sol.v2[2])}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.v_components')}
              value={`${formatNumber(sol.v1[0], 2)}, ${formatNumber(sol.v1[1], 2)}, ${formatNumber(sol.v1[2], 2)}`}
              unit="m/s"
            />
            <ResultCard
              label={t('fields.v_components_2')}
              value={`${formatNumber(sol.v2[0], 2)}, ${formatNumber(sol.v2[1], 2)}, ${formatNumber(sol.v2[2], 2)}`}
              unit="m/s"
            />
            <ResultCard
              label={t('fields.transfer_a')}
              si={sol.a}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={3}
            />
            <ResultCard label={t('fields.transfer_e')} value={formatNumber(sol.e, 5)} />
            <ResultCard
              label={t('fields.used')}
              si={sol.dnu}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={3}
            />
            {check ? (
              <ResultCard
                label={t('fields.arrival_r_check')}
                si={check.dr}
                category="length"
                unitId="m"
                unitIds={TOOL_UNIT_SETS.length}
                digits={2}
              />
            ) : null}
          </div>
        )
      }
      preview={
        geom ? (
          <TrajectoryPlot
            points={trail}
            bodyR={body.radius}
            markers={[
              { r: geom.r1, label: 'r₁' },
              { r: geom.r2, label: 'r₂' },
            ]}
            title={t('fields.title_lambert_arc')}
            subtitle={t('fields.subtitle_lambert_arc')}
            defaultHeight={260}
          />
        ) : null
      }
      code={<CodeExport formulaId="lambert" values={{ r1_m, r2_m, ang_rad, tof_s, mu: body.mu, R: body.radius, r1: p.r1, r2: p.r2, angle: p.angle, tof: p.tof, body: p.body, tu: p.tu, way: p.way }} />}
    />
  )
}
