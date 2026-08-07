import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { EARTH_MU, EARTH_RADIUS, geoRadius, lightTime, lightTimeRoundTrip, TOOL_UNIT_SETS } from '@/lib/physics'
export function CommDelayGeoTool() {
  const { t } = useTranslation()
  const res = useMemo(() => {
    const a = geoRadius(EARTH_MU)!
    const h = a - EARTH_RADIUS
    // nadir slant ≈ h for GEO approx; better: range from surface point under sat = h
    const t = lightTime(h)!
    const rtt = lightTimeRoundTrip(h)!
    return { a, h, t, rtt }
  }, [])
  return (
    <ToolShell
      parameters={<p className="font-mono text-sm text-muted">{t('fields.note_comm_delay_geo')}</p>}
      results={<div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.one_way_nadir')} si={res.t} category="time" unitId="ms" unitIds={TOOL_UNIT_SETS.timePretty} digits={3} accent />
        <ResultCard label={t('fields.rtt')} si={res.rtt} category="time" unitId="ms" unitIds={TOOL_UNIT_SETS.timePretty} digits={3} />
        <ResultCard label={t('fields.geo_altitude')} si={res.h} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.altitude} digits={1} />
      </div>}
      code={<CodeExport formulaId="geo-light-time" values={{ mu: EARTH_MU, R: EARTH_RADIUS }} />}
    />
  )
}
