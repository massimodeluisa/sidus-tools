import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  cwMeanMotion,
  cwPropagate,
  cwTwoImpulseToOrigin,
  getBody,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'
import { BodySelect } from '@/components/shared/BodySelect'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(420, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  x: numParam(1000),
  y: numParam(0),
  z: numParam(0),
  tf: numParam(1800, { min: 1 }),
  tfu: strParam('s', TOOL_UNIT_SETS.time) } as const

export function CwRendezvousTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const h = toSi(p.h, p.hu)
  const a = body.radius + h
  const tf = toSi(p.tf, p.tfu)

  const res = useMemo(() => {
    const n = cwMeanMotion(body.mu, a)
    if (n == null) return null
    const burn = cwTwoImpulseToOrigin(n, { x: p.x, y: p.y, z: p.z }, tf)
    if (!burn) return null
    const mid = cwPropagate(
      n,
      { x: p.x, y: p.y, z: p.z, vx: burn.v0[0], vy: burn.v0[1], vz: burn.v0[2] },
      tf / 2,
    )
    const dv1 = Math.hypot(...burn.dv1)
    const dv2 = Math.hypot(...burn.dv2)
    return { n, burn, mid, dv1, dv2, dvTotal: dv1 + dv2 }
  }, [a, body.mu, p.x, p.y, p.z, tf])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.target_altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
            hint={t('fields.hint_cw_lvlh', {
              km: ((body.radius + h) / 1000).toFixed(0),
            })}
          />
          <p className="col-span-full font-mono text-[10px] text-subtle">
            {t('fields.note_cw_init_state')}
          </p>
          <UiField
            label={t('fields.x')}
            unit="m"
            type="number"
            step="any"
            value={p.x}
            onChange={(e) => setP({ x: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.y')}
            unit="m"
            type="number"
            step="any"
            value={p.y}
            onChange={(e) => setP({ y: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.z')}
            unit="m"
            type="number"
            step="any"
            value={p.z}
            onChange={(e) => setP({ z: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.transfer_time')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.tfu}
            value={p.tf}
            min={0}
            onValueChange={(tf) => setP({ tf })}
            onUnitChange={(tfu, tf) => setP({ tfu, tf })}
          />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">
            {t('fields.cw_cannot_solve')}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.v_7')}
              si={res.dv1}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={3}
              accent
            />
            <ResultCard
              label={t('fields.v_8')}
              si={res.dv2}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={3}
            />
            <ResultCard
              label={t('fields.v_total')}
              si={res.dvTotal}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={3}
              accent
            />
            <ResultCard label={t('fields.t_f')} si={tf} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard
              label={t('fields.v_lvlh')}
              value={`${formatNumber(res.burn.dv1[0], 2)}, ${formatNumber(res.burn.dv1[1], 2)}, ${formatNumber(res.burn.dv1[2], 2)}`}
              unit="m/s"
            />
            <ResultCard
              label={t('fields.n_target')}
              value={formatNumber(res.n, 6)}
              unit="rad/s"
            />
            {res.mid ? (
              <ResultCard
                label={t('fields.pos_t_f_2')}
                value={`${formatNumber(res.mid.x, 1)}, ${formatNumber(res.mid.y, 1)}, ${formatNumber(res.mid.z, 1)}`}
                unit="m"
              />
            ) : null}
            <ResultCard
              label={t('fields.note')}
              value="CW linear · circular target · docking class"
            />
          </div>
        )
      }
      code={<CodeExport formulaId="cw-rendezvous" values={{ h, tf, a, mu: body.mu, R: body.radius, x: p.x, y: p.y, z: p.z, body: p.body, tfu: p.tfu }} />}
    />
  )
}
