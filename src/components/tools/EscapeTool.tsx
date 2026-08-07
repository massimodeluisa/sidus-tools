import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { BodySelect } from '@/components/shared/BodySelect'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { OrbitDiagram } from '@/components/viz/OrbitDiagram'
import { OrbitPreviewStack } from '@/components/viz/OrbitPreviewStack'
import { OrbitScene3D } from '@/components/viz/OrbitScene3D'
import {
  BODIES,
  circularOrbitVelocity,
  EARTH_ALTITUDE_CHIPS,
  escapeVelocity,
  fromSi,
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
  // Surface escape (classic educational default)
  h: numParam(0, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
} as const

function altitudeChipKey(m: number): string {
  if (m === 200_000) return 'fields.preset_leo_200'
  if (m === 400_000) return 'fields.preset_iss_400'
  if (m === 700_000) return 'fields.preset_sso_700'
  return 'fields.preset_geo_35786'
}

const ESCAPE_CHIPS = [
  { labelKey: 'fields.preset_surface', m: 0 },
  ...EARTH_ALTITUDE_CHIPS.map((c) => ({
    labelKey: altitudeChipKey(c.m),
    m: c.m,
  })),
]

export function EscapeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const body = getBody(p.body)
  const h_m = toSi(p.h, p.hu)

  const results = useMemo(() => {
    if (!Number.isFinite(h_m) || h_m < 0) return null
    const r = body.radius + h_m
    if (!(r > 0)) return null
    const vesc = escapeVelocity(body.mu, r)
    const vcirc = circularOrbitVelocity(body.mu, r)
    return { r, vesc, vcirc, ratio: vesc / vcirc }
  }, [body, h_m])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
            hint={t('fields.surface_hint')}
          />
          <FieldPresets label={t('common.presets')}>
            {ESCAPE_CHIPS.map((pr) => (
              <PresetChip key={pr.labelKey} onClick={() => setP({ h: fromSi(pr.m, p.hu) })}>
                {t(pr.labelKey)}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        results ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.escape_velocity')}
              si={results.vesc}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.circular_velocity')}
              si={results.vcirc}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.ratio_vesc_vc')}
              value={results.ratio.toFixed(4)}
              unit="(√2)"
            />
            <ResultCard
              label={t('fields.radius')}
              si={results.r}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={2}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        )
      }
      preview={
        results ? (
          <OrbitPreviewStack
            diagram={
              <OrbitDiagram
                mode="escape"
                bodyR={body.radius}
                r1={results.r}
                animate={false}
              />
            }
            scene3d={
              <OrbitScene3D
                bodyR={body.radius}
                bodyColor={body.color}
                escapePeriapsis={results.r}
                showEscapeCircularRef
                height={240}
              />
            }
          />
        ) : null
      }
      code={
        <CodeExport
          formulaId="escape"
          values={{
            h_m,
            mu: body.mu,
            R: body.radius,
            r: results?.r ?? body.radius + h_m,
            body: p.body,
          }}
        />
      }
    />
  )
}
