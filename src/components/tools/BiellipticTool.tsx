import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { FieldNote, FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { OrbitDiagram } from '@/components/viz/OrbitDiagram'
import { OrbitPreviewStack } from '@/components/viz/OrbitPreviewStack'
import { OrbitScene3D, biellipticArcs } from '@/components/viz/OrbitScene3D'
import {
  biellipticTransfer,
  BODIES,
  fromSi,
  getBody,
  hohmannTransfer,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

/**
 * Defaults chosen for a readable true-scale diagram:
 * LEO-class → GEO-class via a high intermediate apoapsis.
 * Extreme needle-like ellipses (e→1) still work: use the “Large ratio” preset.
 */
const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  h1: numParam(2_000, { min: 0 }),
  h2: numParam(35_786, { min: 0 }),
  hb: numParam(120_000, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

export function BiellipticTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const body = getBody(p.body)
  const h1_m = toSi(p.h1, p.hu)
  const h2_m = toSi(p.h2, p.hu)
  const hb_m = toSi(p.hb, p.hu)
  const r1 = body.radius + h1_m
  const r2 = body.radius + h2_m
  const rb = body.radius + hb_m
  const minHb = Math.max(h1_m, h2_m) + 1000
  const validRb = rb > Math.max(r1, r2) + 1e-6

  const results = useMemo(() => {
    if (![h1_m, h2_m, hb_m].every(Number.isFinite) || h1_m < 0 || h2_m < 0 || hb_m < 0) {
      return null
    }
    if (!validRb) {
      return {
        error: `h_b must exceed max(h₁,h₂) ≈ ${formatNumber(fromSi(minHb, p.hu), 1)} ${p.hu} (classic bielliptic).` as const }
    }
    const bi = biellipticTransfer(body.mu, r1, r2, rb)
    const ho = hohmannTransfer(body.mu, r1, r2)
    return {
      error: null as null,
      bi,
      ho,
      savings: ho.dvTotal - bi.dvTotal }
  }, [body.mu, h1_m, h2_m, hb_m, minHb, p.hu, r1, r2, rb, validRb])

  function changeUnit(hu: string, changed: 'h1' | 'h2' | 'hb', val: number) {
    setP({
      hu,
      h1: changed === 'h1' ? val : fromSi(toSi(p.h1, p.hu), hu),
      h2: changed === 'h2' ? val : fromSi(toSi(p.h2, p.hu), hu),
      hb: changed === 'hb' ? val : fromSi(toSi(p.hb, p.hu), hu) })
  }

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect
            value={p.body}
            onChange={(body) => setP({ body })}
          />
          <UiUnitField
            label={t('fields.initial_altitude_h')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h1}
            min={0}
            onValueChange={(h1) => setP({ h1 })}
            onUnitChange={(hu, h1) => changeUnit(hu, 'h1', h1)}
          />
          <UiUnitField
            label={t('fields.final_altitude_h')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h2}
            min={0}
            onValueChange={(h2) => setP({ h2 })}
            onUnitChange={(hu, h2) => changeUnit(hu, 'h2', h2)}
          />
          <UiUnitField
            label={t('fields.intermediate_apoapsis_h_b')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.hb}
            min={0}
            onValueChange={(hb) => setP({ hb })}
            onUnitChange={(hu, hb) => changeUnit(hu, 'hb', hb)}
            hint={t('fields.hint_bielliptic_hb')}
          />
          {!validRb ? (
            <FieldNote className="border-warn/40 bg-warn/10 text-warn">
              {t('fields.note_bielliptic_hb')}
            </FieldNote>
          ) : null}
          <FieldPresets label={t('common.presets')}>
            <PresetChip
              onClick={() =>
                setP({
                  h1: fromSi(3_000_000, p.hu),
                  h2: fromSi(25_000_000, p.hu),
                  hb: fromSi(90_000_000, p.hu),
                })
              }
            >
              HEO nested (diagram-clear)
            </PresetChip>
            <PresetChip
              onClick={() =>
                setP({
                  h1: fromSi(300_000, p.hu),
                  h2: fromSi(35_786_000, p.hu),
                  hb: fromSi(200_000_000, p.hu),
                })
              }
            >
              LEO → GEO via high r_b
            </PresetChip>
            <PresetChip
              onClick={() =>
                setP({
                  h1: fromSi(200_000, p.hu),
                  h2: fromSi(100_000_000, p.hu),
                  hb: fromSi(300_000_000, p.hu),
                })
              }
            >
              Large ratio (true scale)
            </PresetChip>
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        !results ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : results.error ? (
          <p className="font-mono text-sm leading-relaxed text-warn">{results.error}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.bielliptic_v')}
              si={results.bi.dvTotal}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.hohmann_v')}
              si={results.ho.dvTotal}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.v_vs_hohmann')}
              si={results.savings}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard label={t('fields.bielliptic_tof')} si={results.bi.tof} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard
              label={t('fields.burn_1')}
              si={results.bi.dv1}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={3}
            />
            <ResultCard
              label={t('fields.burn_2')}
              si={results.bi.dv2}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={3}
            />
            <ResultCard
              label={t('fields.burn_3')}
              si={results.bi.dv3}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={3}
            />
            <ResultCard label={t('fields.hohmann_tof')} si={results.ho.tof} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
          </div>
        )
      }
      preview={
        <OrbitPreviewStack
          diagramMinHeight={300}
          diagram={
            <OrbitDiagram
              mode="bielliptic"
              bodyR={body.radius}
              r1={r1}
              r2={r2}
              rb={rb}
              animate={validRb}
            />
          }
          scene3d={
            <OrbitScene3D
              bodyR={body.radius}
              bodyColor={body.color}
              radii={
                validRb
                  ? [r1, r2, rb]
                  : [r1, r2].filter((x) => Number.isFinite(x) && x > 0)
              }
              arcs={validRb ? biellipticArcs(r1, r2, rb) : undefined}
              height={280}
            />
          }
        />
      }
      code={<CodeExport formulaId="bielliptic" values={{ h1_m, h2_m, hb_m, r1, r2, rb, mu: body.mu, R: body.radius, h1: p.h1, h2: p.h2, hb: p.hb, body: p.body }} />}
    />
  )
}
