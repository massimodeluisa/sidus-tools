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
  EARTH_RADIUS,
  earthRotationBoost,
  fromSi,
  launchAzimuth,
  minInclinationFromLat,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  lat: numParam(DEFAULT_LAUNCH_SITE.latDeg),
  latu: strParam('deg', TOOL_UNIT_SETS.angle),
  i: numParam(51.6),
  iu: strParam('deg', TOOL_UNIT_SETS.angle),
  h: numParam(200, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
} as const

export function LaunchAzimuthTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const lat = toSi(p.lat, p.latu)
  const i = toSi(p.i, p.iu)
  const h = toSi(p.h, p.hu)
  const latDegDisplay = (lat * 180) / Math.PI

  const res = useMemo(() => {
    const az = launchAzimuth(lat, i)
    const iMin = minInclinationFromLat(lat)
    const boost = earthRotationBoost(lat, EARTH_RADIUS + Math.max(0, h))
    return { az, iMin, boost }
  }, [h, i, lat])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.launch_lat')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.latu}
            value={p.lat}
            onValueChange={(lat) => setP({ lat })}
            onUnitChange={(latu, lat) => setP({ latu, lat })}
            hint={t('fields.launch_lat_hint')}
          />
          <UiUnitField
            label={t('fields.target_inclination')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.iu}
            value={p.i}
            onValueChange={(i) => setP({ i })}
            onUnitChange={(iu, i) => setP({ iu, i })}
          />
          <UiUnitField
            label={t('fields.altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
            hint={t('fields.for_rotation_boost')}
          />
          <LaunchSitePresets
            latDeg={latDegDisplay}
            onSelect={(site) => {
              const latRad = (site.latDeg * Math.PI) / 180
              setP({ lat: fromSi(latRad, p.latu) })
            }}
          />
        </ParamsGrid>
      }
      results={
        !res.az ? (
          <p className="font-mono text-sm text-muted">
            {t('fields.launch_az_impossible', {
              imin: formatNumber((res.iMin * 180) / Math.PI, 2),
            })}
          </p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.azimuth_primary')}
              value={formatNumber(res.az.azimuthDeg, 3)}
              unit="° from N"
              accent
            />
            <ResultCard
              label={t('fields.azimuth_alt')}
              value={formatNumber(res.az.complementaryDeg, 3)}
              unit="° from N"
            />
            <ResultCard
              label={t('fields.i_min')}
              si={res.iMin}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={3}
            />
            <ResultCard
              label={t('fields.earth_rotation_boost')}
              si={res.boost}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={2}
            />
          </div>
        )
      }
      code={<CodeExport formulaId="launch-azimuth" values={{ lat, i, h, latu: p.latu, iu: p.iu }} />}
    />
  )
}
