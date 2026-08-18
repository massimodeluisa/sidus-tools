import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { OrbitScene3D } from '@/components/viz/OrbitScene3D'
import {
  BODIES,
  EARTH_MASS,
  getBody,
  surfaceAccess,
  TOOL_UNIT_SETS,
  toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam(
    'moon',
    BODIES.map((b) => b.id),
  ),
  h: numParam(100, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

export function SurfaceAccessTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)

  const res = useMemo(() => {
    const park = toSi(p.h, p.hu)
    // Moon: Laplace SOI about Earth; planets may use catalog soi field
    const aParent = body.id === 'moon' ? 384_400_000 : undefined
    return surfaceAccess({
      body,
      parkAltitudeM: park,
      parentMassKg: body.id === 'moon' ? EARTH_MASS : undefined,
      aAboutParentM: aParent })
  }, [body, p.h, p.hu])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.parking_altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.surface_g')}
              si={res.g}
              category="accel"
              unitId="mps2"
              unitIds={TOOL_UNIT_SETS.accel}
              digits={3}
              accent
            />
            <ResultCard label={t('fields.v_esc_surface')} si={res.vEsc} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.v_circ_park')} si={res.vCirc} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.v_circ_esc_park')} si={res.dvCircToEsc} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.period_park')} si={res.periodPark} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard
              label={t('fields.soi_approx')}
              value={res.rSoi != null ? `${(res.rSoi / 1000).toExponential(3)}` : ': '}
              unit={res.rSoi != null ? 'km' : undefined}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_body_altitude')}</p>
        )
      }
      preview={
        res ? (
          <OrbitScene3D
            bodyR={body.radius}
            bodyColor={body.color}
            radii={[res.rPark]}
            height={280}
          />
        ) : null
      }
      code={
        <CodeExport
          formulaId="surface-access"
          values={{
            mu: body.mu,
            R: body.radius,
            r_park: body.radius + toSi(p.h, p.hu),
            h: p.h,
            body: p.body,
          }}
        />
      }
    />
  )
}
