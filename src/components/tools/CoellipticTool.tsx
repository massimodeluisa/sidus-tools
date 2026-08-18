import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  coellipticDrift,
  getBody,
  timeForPhaseGain,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  da: numParam(10, { min: -10000 }),
  dau: strParam('km', TOOL_UNIT_SETS.length),
  dth: numParam(30),
  dthu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function CoellipticTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a = body.radius + toSi(p.h, p.hu)
  const da = toSi(p.da, p.dau)
  const dthRad = toSi(p.dth, p.dthu)
  const res = useMemo(() => {
    const d = coellipticDrift(body.mu, a, da)
    if (!d) return null
    const t = timeForPhaseGain(d.nRel, dthRad)
    return { ...d, t }
  }, [body.mu, a, da, dthRad])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.reference_altitude')}
            tip={t('fields.tip_coell_ht')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
          />
          <UiUnitField
            label={t('fields.a_chaser_target')}
            tip={t('fields.tip_coell_da')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.dau}
            value={p.da}
            onValueChange={(da) => setP({ da })}
            onUnitChange={(dau, da) => setP({ dau, da })}
          />
          <UiUnitField
            label={t('fields.phase_gain')}
            tip={t('fields.tip_coell_phase')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.dthu}
            value={p.dth}
            onValueChange={(dth) => setP({ dth })}
            onUnitChange={(dthu, dth) => setP({ dthu, dth })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.n_rel')}
              tip={t('fields.tip_coell_dn')}
              value={res.nRel.toExponential(4)}
              unit="rad/s"
              accent
            />
            <ResultCard
              label={t('fields.n_target_2')}
              tip={t('fields.tip_coell_n')}
              value={res.n.toExponential(4)}
              unit="rad/s"
            />
            {res.periodRel != null ? (
              <ResultCard
                label={t('fields.f_360_relative_period')}
                tip={t('fields.tip_coell_synodic')}
                si={res.periodRel}
                category="time"
                unitId="pretty"
                unitIds={TOOL_UNIT_SETS.timePretty}
                digits={4}
              />
            ) : null}
            {res.t != null ? (
              <ResultCard
                label={t('fields.time_for')}
                tip={t('fields.tip_coell_tof')}
                si={res.t}
                category="time"
                unitId="pretty"
                unitIds={TOOL_UNIT_SETS.timePretty}
                digits={4}
              />
            ) : null}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.need_nonzero_da')}</p>
        )
      }
      code={
        <CodeExport
          formulaId="coelliptic"
          values={{
            da,
            h: toSi(p.h, p.hu),
            dthRad,
            mu: body.mu,
            R: body.radius,
            body: p.body,
          }}
        />
      }
    />
  )
}
