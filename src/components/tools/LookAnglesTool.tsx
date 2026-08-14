import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { LaunchSitePresets } from '@/components/shared/LaunchSitePresets'
import { UiField } from '@/components/shared/UiField'
import { UiUtcField } from '@/components/shared/UiUtcField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  DEFAULT_LAUNCH_SITE,
  lookAnglesFromEci,
  parseTle,
  propagateEci,
  SAMPLE_ISS_TLE,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { resolveUtcParam } from '@/lib/utcInput'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  lat: numParam(DEFAULT_LAUNCH_SITE.latDeg),
  lon: numParam(DEFAULT_LAUNCH_SITE.lonDeg),
  h_m: numParam(DEFAULT_LAUNCH_SITE.heightM, { min: 0 }),
  at: strParam(''),
} as const

export function LookAnglesTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const [tle, setTle] = useState(SAMPLE_ISS_TLE)

  const parsed = useMemo(() => parseTle(tle), [tle])
  const atDate = useMemo(() => resolveUtcParam(p.at), [p.at])

  const look = useMemo(() => {
    if (!parsed.ok) return null
    const st = propagateEci(parsed.satrec, atDate)
    if (!st) return null
    return lookAnglesFromEci(
      { latDeg: p.lat, lonDeg: p.lon, heightM: p.h_m },
      st.r,
      atDate,
    )
  }, [atDate, p.h_m, p.lat, p.lon, parsed])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <label className="col-span-full block min-w-0 space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {t('fields.tle')}
            </span>
            <textarea
              value={tle}
              onChange={(e) => setTle(e.target.value)}
              spellCheck={false}
              rows={4}
              className="w-full resize-y border border-border bg-bg px-3 py-2 font-mono text-xs leading-relaxed text-fg outline-none focus:border-border-strong"
            />
          </label>
          <UiField
            label={t('fields.site_lat')}
            unit="°"
            type="number"
            step="any"
            value={p.lat}
            onChange={(e) => setP({ lat: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.site_lon')}
            unit="°"
            type="number"
            step="any"
            value={p.lon}
            onChange={(e) => setP({ lon: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.site_height')}
            unit="m"
            type="number"
            min={0}
            step="any"
            value={p.h_m}
            onChange={(e) => setP({ h_m: Number(e.target.value) })}
          />
          <LaunchSitePresets
            latDeg={p.lat}
            lonDeg={p.lon}
            onSelect={(site) =>
              setP({ lat: site.latDeg, lon: site.lonDeg, h_m: site.heightM })
            }
          />
          <UiUtcField
            label={t('fields.time_utc_iso')}
            value={p.at}
            onChange={(at) => setP({ at })}
            resolved={atDate}
          />
        </ParamsGrid>
      }
      results={
        !parsed.ok ? (
          <p className="font-mono text-sm text-muted">{parsed.error}</p>
        ) : !look ? (
          <p className="font-mono text-sm text-muted">{t('fields.no_look_angles')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.azimuth')}
              si={look.azimuthRad}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={3}
              accent
            />
            <ResultCard
              label={t('fields.elevation')}
              si={look.elevationRad}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={3}
              accent
            />
            <ResultCard
              label={t('fields.range')}
              si={look.rangeM}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={3}
            />
            <ResultCard
              label={t('fields.above_horizon')}
              value={look.elevationRad > 0 ? 'yes' : 'no'}
            />
            <ResultCard
              label={t('fields.el_raw')}
              si={look.elevationRad}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={4}
            />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="look-angles"
          values={{ lat: toSi(p.lat, 'deg'), lon: toSi(p.lon, 'deg'), h_m: p.h_m, at: p.at }}
        />
      }
    />
  )
}
