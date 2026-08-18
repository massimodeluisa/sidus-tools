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
import { OrbitScene3D, hohmannArc } from '@/components/viz/OrbitScene3D'
import {
  BODIES,
  EARTH_TRANSFER_PRESETS,
  fromSi,
  getBody,
  hohmannTransfer,
  TOOL_UNIT_SETS,
  toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  h1: numParam(200, { min: 0 }),
  h2: numParam(35786, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

const HOHMANN_CHIPS = EARTH_TRANSFER_PRESETS.filter((p) =>
  p.id === 'iss-geo' || p.id === 'leo-meo' || p.id === 'leo-gps',
)

export function HohmannTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const body = getBody(p.body)
  const h1_m = toSi(p.h1, p.hu)
  const h2_m = toSi(p.h2, p.hu)
  const r1 = body.radius + h1_m
  const r2 = body.radius + h2_m

  const results = useMemo(() => {
    if (![h1_m, h2_m].every(Number.isFinite) || h1_m < 0 || h2_m < 0 || r1 === r2)
      return null
    return hohmannTransfer(body.mu, r1, r2)
  }, [body.mu, h1_m, h2_m, r1, r2])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect
            value={p.body}
            onChange={(body) => setP({ body })}
          />
          <UiUnitField
            label={t('fields.initial_altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h1}
            min={0}
            onValueChange={(h1) => setP({ h1 })}
            onUnitChange={(hu, h1) =>
              setP({
                hu,
                h1,
                h2: fromSi(toSi(p.h2, p.hu), hu) })
            }
          />
          <UiUnitField
            label={t('fields.final_altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h2}
            min={0}
            onValueChange={(h2) => setP({ h2 })}
            onUnitChange={(hu, h2) =>
              setP({
                hu,
                h2,
                h1: fromSi(toSi(p.h1, p.hu), hu) })
            }
          />
          <FieldPresets label={t('common.presets')}>
            {HOHMANN_CHIPS.map((pr) => (
              <PresetChip
                key={pr.id}
                onClick={() =>
                  setP({
                    h1: fromSi(pr.h1, p.hu),
                    h2: fromSi(pr.h2, p.hu),
                  })
                }
              >
                {t(
                  pr.id === 'iss-geo'
                    ? 'fields.preset_iss_geo'
                    : pr.id === 'leo-meo'
                      ? 'fields.preset_leo_meo'
                      : pr.id === 'leo-gps'
                        ? 'fields.preset_leo_gps'
                        : 'fields.preset_leo_geo',
                )}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        results ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.dv1')}
              si={results.dv1}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.dv2')}
              si={results.dv2}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.delta_v_total')}
              si={results.dvTotal}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard label={t('fields.time_of_flight')} si={results.tof} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard
              label={t('fields.transfer_a')}
              si={results.a}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={3}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_altitudes')}</p>
        )
      }
      preview={
        <OrbitPreviewStack
          diagram={
            <OrbitDiagram
              mode="hohmann"
              bodyR={body.radius}
              r1={Math.max(r1, body.radius * 1.01)}
              r2={Math.max(r2, body.radius * 1.01)}
              animate
            />
          }
          scene3d={
            <OrbitScene3D
              bodyR={body.radius}
              bodyColor={body.color}
              radii={[Math.max(r1, body.radius * 1.01), Math.max(r2, body.radius * 1.01)]}
              arcs={hohmannArc(r1, r2)}
              height={260}
            />
          }
        />
      }
      code={
        <CodeExport
          formulaId="hohmann"
          values={{
            h1: h1_m,
            h2: h2_m,
            mu: body.mu,
            R: body.radius,
            body: p.body,
          }}
        />
      }
    />
  )
}
