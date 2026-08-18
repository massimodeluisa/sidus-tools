import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  alongTrackFromDeltaM,
  deltaMFromAlongTrack,
  getBody,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  dy: numParam(10, { min: 0 }),
  dyu: strParam('km', TOOL_UNIT_SETS.length),
  dM: numParam(0.5),
  dMu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function AlongTrackTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a = body.radius + toSi(p.h, p.hu)
  const dy = toSi(p.dy, p.dyu)
  const dM = toSi(p.dM, p.dMu)
  const res = useMemo(() => {
    const dMfromY = deltaMFromAlongTrack(a, dy)
    const yFromM = alongTrackFromDeltaM(a, dM)
    return { dMfromY, yFromM }
  }, [a, dy, dM])
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
          />
          <UiUnitField
            label={t('fields.along_track_y')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.dyu}
            value={p.dy}
            min={0}
            onValueChange={(dy) => setP({ dy })}
            onUnitChange={(dyu, dy) => setP({ dyu, dy })}
          />
          <UiUnitField
            label={t('fields.m_2')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.dMu}
            value={p.dM}
            onValueChange={(dM) => setP({ dM })}
            onUnitChange={(dMu, dM) => setP({ dMu, dM })}
          />
        </ParamsGrid>
      }
      results={
        res.dMfromY != null && res.yFromM != null ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.m_from_y')}
              si={res.dMfromY}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.y_from_m')}
              si={res.yFromM}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={3}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_inputs')}</p>
        )
      }
      code={
        <CodeExport
          formulaId="along-track"
          values={{ dy, dM, h: toSi(p.h, p.hu), mu: body.mu, R: body.radius, body: p.body }}
        />
      }
    />
  )
}
