import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  EARTH_ALTITUDE_CHIPS,
  fromSi,
  getBody,
  meanMotionFromAltitude,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

export function MeanMotionTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const h = toSi(p.h, p.hu)
  const res = useMemo(() => meanMotionFromAltitude(h, body.mu, body.radius), [h, body])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
        <FieldPresets label={t('common.presets')}>
          {EARTH_ALTITUDE_CHIPS.map((pr) => (
            <PresetChip key={pr.label} onClick={() => setP({ h: fromSi(pr.m, p.hu) })}>
              {pr.label}
            </PresetChip>
          ))}
        </FieldPresets>
      </ParamsGrid>}
      results={res ? <div className="sidus-results">
        <ResultCard label={t('fields.mean_motion_n')} value={res.n.toExponential(6)} unit="rad/s" accent />
        <ResultCard label={t('fields.n')} value={(res.n * 86400).toFixed(4)} unit="rad/day" />
        <ResultCard label={t('fields.period')} si={res.period} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
        <ResultCard label={t('fields.v_circ')} si={res.v} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
        <ResultCard label={t('fields.a')} si={res.a} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={2} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.invalid_altitude')}</p>}
      code={<CodeExport formulaId="mean-motion" values={{ h, mu: body.mu, R: body.radius, body: p.body }} />}
    />
  )
}
