import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { LaunchSitePresets } from '@/components/shared/LaunchSitePresets'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  DEFAULT_LAUNCH_SITE,
  fromSi,
  TOOL_UNIT_SETS,
  toSi,
  saastamoinenTropoDelay,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  elev: numParam(30,{min:0}),
  elevu: strParam('deg', TOOL_UNIT_SETS.angle),
  lat: numParam(DEFAULT_LAUNCH_SITE.latDeg,{min:0}),
  latu: strParam('deg', TOOL_UNIT_SETS.angle),
  h: numParam(DEFAULT_LAUNCH_SITE.heightM,{min:0}),
  hu: strParam('m', TOOL_UNIT_SETS.length),
} as const

export function GnssTroposphereDelayTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const elev=toSi(p.elev,p.elevu)
    const lat=toSi(p.lat,p.latu)
    const h=toSi(p.h,p.hu)
    return saastamoinenTropoDelay(elev,lat,h)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.elev')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.elevu} value={p.elev} min={0} onValueChange={(elev)=>setP({elev})} onUnitChange={(elevu,elev)=>setP({elevu,elev})} />
          <UiUnitField label={t('fields.lat')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.latu} value={p.lat} min={0} onValueChange={(lat)=>setP({lat})} onUnitChange={(latu,lat)=>setP({latu,lat})} />
          <UiUnitField label={t('fields.disc_h')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.hu} value={p.h} min={0} onValueChange={(h)=>setP({h})} onUnitChange={(hu,h)=>setP({hu,h})} />
          <LaunchSitePresets
            latDeg={(toSi(p.lat, p.latu) * 180) / Math.PI}
            onSelect={(site) =>
              setP({
                lat: fromSi((site.latDeg * Math.PI) / 180, p.latu),
                h: fromSi(site.heightM, p.hu),
              })
            }
          />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.delay')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="gnss-troposphere-delay"
          values={{ ...p, elev: toSi(p.elev, p.elevu), lat: toSi(p.lat, p.latu), h: toSi(p.h, p.hu) }}
        />
      }
    />
  )
}
