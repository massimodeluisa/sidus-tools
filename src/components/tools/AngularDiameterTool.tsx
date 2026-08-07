import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, angularDiameter, getBody, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('moon', BODIES.map((b) => b.id)),
  d: numParam(384400, { min: 0.001 }),
  du: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function AngularDiameterTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const d = toSi(p.d, p.du)
  const a = useMemo(() => angularDiameter(body.radius, d), [body.radius, d])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.distance')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.du} value={p.d} min={0.001} onValueChange={(d) => setP({ d })} onUnitChange={(du, d) => setP({ du, d })} />
      </ParamsGrid>}
      results={a != null ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.angular_diameter')} si={a} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} accent />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.distance_exceed_radius')}</p>}
      code={<CodeExport formulaId="angular-diameter" values={{ d, R: body.radius, body: p.body, du: p.du }} />}
    />
  )
}
