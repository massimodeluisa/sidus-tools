import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { OrbitDiagram } from '@/components/viz/OrbitDiagram'
import {
  apsidesWithSpeeds,
  BODIES,
  getBody,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  // Default LEO-ish a above Earth surface (km)
  a: numParam(6778.137, { min: 0.001 }),
  au: strParam('km', TOOL_UNIT_SETS.length),
  e: numParam(0.05, { min: 0, max: 0.999 }),
} as const

export function ApsidesTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const body = getBody(p.body)
  const a_m = toSi(p.a, p.au)

  const results = useMemo(() => {
    if (!(a_m > 0) || !Number.isFinite(p.e)) return null
    return apsidesWithSpeeds(body.mu, a_m, p.e)
  }, [a_m, body.mu, p.e])

  const surfaceHit =
    results != null && results.rp > 0 && results.rp < body.radius

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.semi_major_axis')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.au}
            value={p.a}
            min={0}
            onValueChange={(a) => setP({ a })}
            onUnitChange={(au, a) => setP({ au, a })}
          />
          <UiField
            label={t('fields.eccentricity')}
            type="number"
            min={0}
            max={0.999}
            step="any"
            value={p.e}
            onChange={(ev) => setP({ e: Number(ev.target.value) })}
            hint={t('fields.hint_apsides_e', {
              R: (body.radius / 1000).toFixed(0),
            })}
          />
          {surfaceHit ? (
            <p className="border border-warn/40 bg-warn/10 px-3 py-2 font-mono text-[11px] leading-relaxed text-warn">
              {t('fields.apsides_surface_warn', { a: p.a, au: p.au, e: p.e })}
            </p>
          ) : null}
        </ParamsGrid>
      }
      results={
        results ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.periapsis_r_p')}
              si={results.rp}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={3}
              accent
            />
            <ResultCard
              label={t('fields.apoapsis_r_a')}
              si={results.ra}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={3}
            />
            <ResultCard
              label={t('fields.periapsis_speed_v_p')}
              si={results.vp}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.apoapsis_speed_v_a')}
              si={results.va}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.body_radius_r')}
              si={body.radius}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={1}
            />
            <ResultCard
              label={t('fields.r_p_vs_r')}
              value={surfaceHit ? 'intersects surface' : 'clear of surface'}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.need_a_e_ellipse')}</p>
        )
      }
      preview={
        results ? (
          <OrbitDiagram
            mode="ellipse"
            bodyR={body.radius}
            r1={a_m}
            e={p.e}
            animate
            defaultHeight={260}
          />
        ) : null
      }
      code={<CodeExport formulaId="apsides" values={{ a_m, mu: body.mu, R: body.radius, a: p.a, e: p.e, body: p.body }} />}
    />
  )
}
