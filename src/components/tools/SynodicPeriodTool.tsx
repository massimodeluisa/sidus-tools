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
  fromSi,
  getBody,
  orbitalPeriod,
  synodicPeriod,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h1: numParam(400, { min: 0 }),
  h2: numParam(800, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
} as const

export function SynodicPeriodTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const r1 = body.radius + toSi(p.h1, p.hu)
  const r2 = body.radius + toSi(p.h2, p.hu)
  const res = useMemo(() => {
    const Tsyn = synodicPeriod(body.mu, r1, r2)
    if (Tsyn == null) return null
    return { Tsyn, T1: orbitalPeriod(body.mu, r1), T2: orbitalPeriod(body.mu, r2) }
  }, [body.mu, r1, r2])

  function changeAltitudeUnit(hu: string) {
    setP({
      hu,
      h1: fromSi(toSi(p.h1, p.hu), hu),
      h2: fromSi(toSi(p.h2, p.hu), hu),
    })
  }

  return (
    <ToolShell
      parameters={<ParamsGrid>
        <BodySelect value={p.body} onChange={(body) => setP({ body })} />
        <UiUnitField label={t('fields.orbit1_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h1} min={0} onValueChange={(h1) => setP({ h1 })} onUnitChange={(hu) => changeAltitudeUnit(hu)} />
        <UiUnitField label={t('fields.orbit2_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h2} min={0} onValueChange={(h2) => setP({ h2 })} onUnitChange={(hu) => changeAltitudeUnit(hu)} />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.t_synodic')} si={res.Tsyn} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} accent />
        <ResultCard label={t('fields.t')} si={res.T1} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
        <ResultCard label={t('fields.t_2')} si={res.T2} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.need_two_different_radii')}</p>}
      code={<CodeExport formulaId="synodic-period" values={{ r1, r2, mu: body.mu, R: body.radius, h1: p.h1, h2: p.h2, body: p.body }} />}
    />
  )
}
