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
  findNextPass,
  parseTle,
  SAMPLE_ISS_TLE,
  TOOL_UNIT_SETS,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { resolveUtcParam } from '@/lib/utcInput'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  lat: numParam(DEFAULT_LAUNCH_SITE.latDeg),
  lon: numParam(DEFAULT_LAUNCH_SITE.lonDeg),
  h_m: numParam(DEFAULT_LAUNCH_SITE.heightM, { min: 0 }),
  minEl: numParam(10, { min: 0, max: 80 }),
  hours: numParam(24, { min: 1, max: 72 }),
  at: strParam(''),
} as const

export function PassPredictTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const [tle, setTle] = useState(SAMPLE_ISS_TLE)

  const parsed = useMemo(() => parseTle(tle), [tle])
  const start = useMemo(() => resolveUtcParam(p.at), [p.at])

  const pass = useMemo(() => {
    if (!parsed.ok) return null
    return findNextPass({
      satrec: parsed.satrec,
      observer: { latDeg: p.lat, lonDeg: p.lon, heightM: p.h_m },
      start,
      horizonH: p.hours,
      stepS: 20,
      minElDeg: p.minEl,
    })
  }, [p.h_m, p.hours, p.lat, p.lon, p.minEl, parsed, start])

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
          <UiField
            label={t('fields.min_elevation')}
            unit="°"
            type="number"
            min={0}
            max={80}
            step="any"
            value={p.minEl}
            onChange={(e) => setP({ minEl: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.search_horizon')}
            unit="h"
            type="number"
            min={1}
            max={72}
            value={p.hours}
            onChange={(e) => setP({ hours: Number(e.target.value) })}
          />
          <LaunchSitePresets
            latDeg={p.lat}
            lonDeg={p.lon}
            onSelect={(site) =>
              setP({ lat: site.latDeg, lon: site.lonDeg, h_m: site.heightM })
            }
          />
          <UiUtcField
            label={t('fields.start_utc_iso')}
            value={p.at}
            onChange={(at) => setP({ at })}
            resolved={start}
          />
          <p className="col-span-full font-mono text-[10px] leading-relaxed text-subtle">
            {t('fields.note_pass_search')}
          </p>
        </ParamsGrid>
      }
      results={
        !parsed.ok ? (
          <p className="font-mono text-sm text-muted">{parsed.error}</p>
        ) : !pass ? (
          <p className="font-mono text-sm text-muted">
            {t('fields.no_pass_above', { el: formatNumber(p.minEl, 1), hours: p.hours })}
          </p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.aos_utc')} value={pass.aos.toISOString()} accent />
            <ResultCard label={t('fields.los_utc')} value={pass.los.toISOString()} />
            <ResultCard
              label={t('fields.max_elevation')}
              si={(pass.maxElDeg * Math.PI) / 180}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={2}
              accent
            />
            <ResultCard label={t('fields.max_el_at')} value={pass.maxElAt.toISOString()} />
            <ResultCard
              label={t('fields.duration')}
              si={pass.durationS}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
            />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="pass-predict"
          values={{
            lat: p.lat,
            lon: p.lon,
            h_m: p.h_m,
            minEl: p.minEl,
            hours: p.hours,
            at: p.at,
          }}
        />
      }
    />
  )
}
