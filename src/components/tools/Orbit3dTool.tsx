import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { OrbitScene3D, hohmannArc } from '@/components/viz/OrbitScene3D'
import {
  BODIES,
  circularOrbitVelocity,
  getBody,
  orbitalPeriod,
  TOOL_UNIT_SETS,
  toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  h1: numParam(400, { min: 0 }),
  h2: numParam(35786, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  showTransfer: strParam('yes', ['yes', 'no'] as const) } as const

/** Dedicated 3D orbit viewer: circular rings + optional Hohmann ellipse. */
export function Orbit3dTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const h1 = toSi(p.h1, p.hu)
  const h2 = toSi(p.h2, p.hu)
  const r1 = body.radius + h1
  const r2 = body.radius + h2

  const stats = useMemo(() => {
    if (!(r1 > body.radius)) return null
    return {
      v1: circularOrbitVelocity(body.mu, r1),
      T1: orbitalPeriod(body.mu, r1),
      v2: r2 > body.radius ? circularOrbitVelocity(body.mu, r2) : null,
      T2: r2 > body.radius ? orbitalPeriod(body.mu, r2) : null }
  }, [body.mu, body.radius, r1, r2])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.orbit1_altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h1}
            min={0}
            onValueChange={(h1) => setP({ h1 })}
            onUnitChange={(hu, h1) => setP({ hu, h1 })}
          />
          <UiUnitField
            label={t('fields.orbit2_altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h2}
            min={0}
            onValueChange={(h2) => setP({ h2 })}
            onUnitChange={(hu, h2) => setP({ hu, h2 })}
          />
        </ParamsGrid>
      }
      results={
        stats ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.v_10')} si={stats.v1} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.t')} si={stats.T1} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            {stats.v2 != null ? (
              <ResultCard label={t('fields.v_11')} si={stats.v2} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            ) : null}
            {stats.T2 != null ? (
              <ResultCard label={t('fields.t_2')} si={stats.T2} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            ) : null}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.altitude_ge_zero')}</p>
        )
      }
      preview={
        <OrbitScene3D
          bodyR={body.radius}
          bodyColor={body.color}
          radii={[r1, r2].filter((r) => r > body.radius)}
          arcs={
            r1 > body.radius && r2 > body.radius && r1 !== r2
              ? hohmannArc(r1, r2)
              : undefined
          }
          height={340}
        />
      }
      code={
        <CodeExport
          formulaId="orbit-3d"
          values={{
            mu: body.mu,
            R: body.radius,
            h1,
            h2,
            body: p.body,
          }}
        />
      }
    />
  )
}
