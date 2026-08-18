import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
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
  localGravity,
  orbitalPeriod,
  specificEnergyCircular,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

const PRESETS_M = EARTH_ALTITUDE_CHIPS

export function CircularOrbitTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const body = getBody(p.body)
  const h_m = toSi(p.h, p.hu)
  const r = body.radius + h_m

  const results = useMemo(() => {
    if (!Number.isFinite(h_m) || h_m < 0 || !(r > 0)) return null
    const v = circularOrbitVelocity(body.mu, r)
    const T = orbitalPeriod(body.mu, r)
    const g = localGravity(body.mu, r)
    const e = specificEnergyCircular(body.mu, r)
    const vesc = escapeVelocity(body.mu, r)
    return { v, T, g, e, vesc }
  }, [body.mu, h_m, r])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect
            value={p.body}
            onChange={(body) => setP({ body })}
          />
          <UiUnitField
            label={t('fields.altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
            hint={`Body radius: ${formatNumber(body.radius / 1000, 1)} km`}
          />
          <FieldPresets label={t('common.presets')}>
            {PRESETS_M.map((pr) => (
              <PresetChip key={pr.m} onClick={() => setP({ h: fromSi(pr.m, p.hu) })}>
                {pr.label}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        results ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.orbital_speed')}
              si={results.v}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard label={t('fields.period')} si={results.T} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard
              label={t('fields.orbital_radius')}
              si={r}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={2}
            />
            <ResultCard
              label={t('fields.local_g')}
              si={results.g}
              category="accel"
              unitId="mps2"
              unitIds={['mps2', 'g']}
              digits={4}
            />
            <ResultCard
              label={t('fields.specific_energy_2')}
              si={results.e}
              category="specificEnergy"
              unitId="Jpkg"
              unitIds={TOOL_UNIT_SETS.specificEnergy}
              digits={3}
            />
            <ResultCard
              label={t('fields.escape_at_r')}
              si={results.vesc}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.enter_valid_altitude')}</p>
        )
      }
      preview={
        <OrbitPreviewStack
          diagram={
            <OrbitDiagram
              mode="circular"
              bodyR={body.radius}
              r1={Math.max(r, body.radius * 1.01)}
              animate
            />
          }
          scene3d={
            <OrbitScene3D
              bodyR={body.radius}
              bodyColor={body.color}
              radii={[Math.max(r, body.radius * 1.01)]}
              height={240}
            />
          }
        />
      }
      code={<CodeExport formulaId="circular-orbit" values={{ h: h_m, mu: body.mu, R: body.radius, body: p.body }} />}
    />
  )
}
