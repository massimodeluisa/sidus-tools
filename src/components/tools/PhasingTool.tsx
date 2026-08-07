import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  getBody,
  phasingOrbit,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(420, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  phase: numParam(30),
  pu: strParam('deg', TOOL_UNIT_SETS.angle),
  n: numParam(1, { min: 1, max: 20 }) } as const

export function PhasingTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const h = toSi(p.h, p.hu)
  const phase = toSi(p.phase, p.pu)
  const r = body.radius + h

  const res = useMemo(() => {
    const nRevs = Math.max(1, Math.floor(p.n))
    return phasingOrbit(body.mu, r, phase, nRevs)
  }, [body.mu, p.n, phase, r])

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
          />
          <UiUnitField
            label={t('fields.phase_gain')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.pu}
            value={p.phase}
            onValueChange={(phase) => setP({ phase })}
            onUnitChange={(pu, phase) => setP({ pu, phase })}
            hint={t('fields.hint_phasing_sign')}
          />
          <UiField
            label={t('fields.phasing_revs')}
            type="number"
            min={1}
            max={20}
            value={p.n}
            onChange={(e) => setP({ n: Number(e.target.value) })}
          />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_phasing_inputs')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.phase_a')}
              si={res.aPhase}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={3}
              accent
            />
            <ResultCard label={t('fields.phase_period')} si={res.tPhase} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard label={t('fields.target_period')} si={res.tTarget} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard
              label={t('fields.v_round_trip')}
              si={res.dvTotal}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={3}
              accent
            />
            <ResultCard
              label={t('fields.v_one_way_enter')}
              si={res.dv1 + res.dv2}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={3}
            />
            <ResultCard
              label={t('fields.a_2')}
              si={res.aPhase - r}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={3}
            />
            <ResultCard
              label={t('fields.note')}
              value={formatNumber((phase * 180) / Math.PI, 2) + '° over N revs'}
            />
          </div>
        )
      }
      code={<CodeExport formulaId="phasing" values={{ h, phase, r, mu: body.mu, R: body.radius, n: p.n, body: p.body }} />}
    />
  )
}
