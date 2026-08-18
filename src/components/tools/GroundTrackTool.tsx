import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, EARTH_ROTATION_RATE, getBody, groundTrackShiftPerOrbit, meanMotionFromAltitude, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(500, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
} as const

export function GroundTrackTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const h = toSi(p.h, p.hu)
  const res = useMemo(() => {
    const m = meanMotionFromAltitude(h, body.mu, body.radius)
    if (!m) return null
    const dL = groundTrackShiftPerOrbit(m.period)
    return { ...m, dL, dLdeg: dL != null ? (dL * 180) / Math.PI : null, revsDay: 86400 / m.period }
  }, [h, body])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} hint={t('fields.hint_ground_track')} />
      </ParamsGrid>}
      results={res && res.dLdeg != null ? <div className="sidus-results">
        <ResultCard label={t('fields.lon_rev_earth_rot')} si={res.dL!} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} accent />
        <ResultCard label={t('fields.revs_day_2')} value={res.revsDay.toFixed(3)} />
        <ResultCard label={t('fields.period')} si={res.period} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
        <ResultCard label={t('fields.earth')} value={EARTH_ROTATION_RATE.toExponential(4)} unit="rad/s" />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.invalid_altitude')}</p>}
      code={<CodeExport formulaId="ground-track" values={{ h, mu: body.mu, R: body.radius, body: p.body }} />}
    />
  )
}
