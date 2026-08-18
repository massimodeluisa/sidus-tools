import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { EARTH_MU, EARTH_RADIUS, orbitalPeriod, ssoInclination, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'
const SCHEMA = {
  h: numParam(600, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const
export function SunSyncPeriodTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const a = EARTH_RADIUS + toSi(p.h, p.hu)
  const res = useMemo(() => {
    const i = ssoInclination(a)
    if (i == null) return null
    const T = orbitalPeriod(EARTH_MU, a)
    return { i, T, revs: 86400 / T }
  }, [a])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <UiUnitField label={t('fields.altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
      </ParamsGrid>}
      results={res ? <div className="sidus-results">
        <ResultCard label={t('fields.i_sso')} si={res.i} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={3} accent />
        <ResultCard label={t('fields.period')} si={res.T} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
        <ResultCard label={t('fields.revs_day')} value={res.revs.toFixed(3)} />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.no_real_sso')}</p>}
      code={<CodeExport formulaId="sso-period" values={{ h: toSi(p.h, p.hu) }} />}
    />
  )
}
