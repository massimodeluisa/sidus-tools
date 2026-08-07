import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, fromSi, getBody, orbitalPeriod, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  dh: numParam(-10),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  phase: numParam(180),
  phaseu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function RendezvousPhasingSimpleTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const r = body.radius + toSi(p.h, p.hu)
  const r2 = body.radius + toSi(p.h + p.dh, p.hu)
  const phaseRad = toSi(p.phase, p.phaseu)
  const res = useMemo(() => {
    if (!(r > body.radius) || !(r2 > body.radius) || r === r2) return null
    const T1 = orbitalPeriod(body.mu, r)
    const T2 = orbitalPeriod(body.mu, r2)
    if (T1 == null || T2 == null) return null
    const dT = T2 - T1
    const phi = Math.abs(phaseRad)
    const N = (phi / (2 * Math.PI)) * (T1 / Math.abs(dT))
    const t = N * T2
    return { T1, T2, dT, N, t }
  }, [body, r, r2, phaseRad])
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
            onUnitChange={(hu) =>
              setP({
                hu,
                h: fromSi(toSi(p.h, p.hu), hu),
                dh: fromSi(toSi(p.dh, p.hu), hu),
              })
            }
          />
          <UiUnitField
            label={t('fields.chaser_h')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.dh}
            onValueChange={(dh) => setP({ dh })}
            onUnitChange={(hu) =>
              setP({
                hu,
                h: fromSi(toSi(p.h, p.hu), hu),
                dh: fromSi(toSi(p.dh, p.hu), hu),
              })
            }
            hint={t('fields.hint_neg_lower_faster')}
          />
          <UiUnitField
            label={t('fields.phase_to_catch')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.phaseu}
            value={p.phase}
            onValueChange={(phase) => setP({ phase })}
            onUnitChange={(phaseu, phase) => setP({ phaseu, phase })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.catch_up_time')}
              si={res.t}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
              accent
            />
            <ResultCard label={t('fields.chaser_revs_n')} value={res.N.toFixed(2)} />
            <ResultCard
              label={t('fields.t_per_rev')}
              si={Math.abs(res.dT)}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
            />
            <ResultCard
              label={t('fields.t_target')}
              si={res.T1}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.need_nonzero_alt_offset')}</p>
        )
      }
      code={
        <CodeExport
          formulaId="rendezvous-catchup"
          values={{ r, r2, phaseRad, mu: body.mu, R: body.radius, body: p.body }}
        />
      }
    />
  )
}
