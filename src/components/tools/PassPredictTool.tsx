import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { LaunchSitePresets } from '@/components/shared/LaunchSitePresets'
import { UiField } from '@/components/shared/UiField'
import { UiUtcField } from '@/components/shared/UiUtcField'
import { UiSelect } from '@/components/shared/UiSelect'
import { Chip } from '@/components/shared/Chip'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { TrajectoryPlot } from '@/components/viz/TrajectoryPlot'
import { OrbitScene3D } from '@/components/viz/OrbitScene3D'
import {
  DEFAULT_LAUNCH_SITE,
  EARTH_RADIUS,
  eciSiToEcefSi,
  findNextPass,
  observerEciPosition,
  parseTle,
  propagateEci,
  SAMPLE_ISS_TLE,
  TOOL_UNIT_SETS,
  topocentricSezSi,
  type Vec3,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import {
  browserTimeZone,
  formatCountdown,
  formatInZone,
  isValidTimeZone,
  listTimeZones,
} from '@/lib/timezone'
import { resolveUtcParam } from '@/lib/utcInput'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  lat: numParam(DEFAULT_LAUNCH_SITE.latDeg),
  lon: numParam(DEFAULT_LAUNCH_SITE.lonDeg),
  h_m: numParam(DEFAULT_LAUNCH_SITE.heightM, { min: 0 }),
  minEl: numParam(10, { min: 0, max: 80 }),
  hours: numParam(24, { min: 1, max: 72 }),
  at: strParam(''),
  tz: strParam(''),
  mark: strParam('aos', ['now', 'aos', 'peak']),
  view: strParam('3d', ['3d', '2d']),
} as const

const TRAIL_HALF_SPAN_S = 46 * 60
const TRAIL_STEP_S = 2 * 60
const TRAIL_BUCKET_MS = 30_000
const LIVE_MARKER_INTERVAL_MS = 100
const CELESTRAK_GP_URL = 'https://celestrak.org/NORAD/elements/gp.php'
const CELESTRAK_CATALOG_URL = 'https://celestrak.org/NORAD/elements/'
const CELESTRAK_FETCH_TIMEOUT_MS = 10_000
const TLE_STALE_DAYS = 14

/** First complete (name, line 1, line 2) TLE triple in a CelesTrak TLE-format response. */
function firstTleTriple(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  for (let i = 0; i < lines.length - 2; i++) {
    if (lines[i + 1].startsWith('1 ') && lines[i + 2].startsWith('2 ')) {
      return `${lines[i]}\n${lines[i + 1]}\n${lines[i + 2]}`
    }
  }
  return null
}

export function PassPredictTool() {
  const { t, i18n } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const [tle, setTle] = useState(SAMPLE_ISS_TLE)
  const [satQuery, setSatQuery] = useState('')
  const [geoError, setGeoError] = useState('')
  const [tleFetchError, setTleFetchError] = useState('')
  const [fetchingTle, setFetchingTle] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [liveClockMs, setLiveClockMs] = useState(() => Date.now())
  const [liveMarkerMs, setLiveMarkerMs] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

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
      refineS: 1,
      minElDeg: p.minEl,
    })
  }, [p.h_m, p.hours, p.lat, p.lon, p.minEl, parsed, start])

  const zone = p.tz !== '' && isValidTimeZone(p.tz) ? p.tz : browserTimeZone()

  const zoneOptions = useMemo(() => {
    const zones = listTimeZones().filter((z) => z !== 'UTC')
    return [
      { value: '', label: t('fields.tz_browser', { tz: browserTimeZone() }) },
      { value: 'UTC', label: 'UTC' },
      ...zones.map((z) => ({ value: z, label: z })),
    ]
  }, [t])

  const staleTleDays = useMemo(() => {
    if (!parsed.ok) return null
    const epochMs = (parsed.satrec.jdsatepoch - 2440587.5) * 86400000
    const ageDays = Math.abs(nowMs - epochMs) / 86400000
    return ageDays > TLE_STALE_DAYS ? Math.round(ageDays) : null
  }, [parsed, nowMs])

  const localFmt = useMemo(() => {
    if (!pass) return null
    return {
      aos: formatInZone(pass.aos, zone, i18n.language),
      los: formatInZone(pass.los, zone, i18n.language),
      peak: formatInZone(pass.maxElAt, zone, i18n.language),
    }
  }, [pass, zone, i18n.language])

  const passStarted = pass ? nowMs >= pass.aos.getTime() : false

  const headline = useMemo(() => {
    if (!pass || !localFmt) return ''
    const el = `${formatNumber(pass.maxElDeg, 1)}°`
    const vars = {
      date: localFmt.aos.date,
      aos: localFmt.aos.time,
      los: localFmt.los.time,
      tz: localFmt.aos.zoneAbbr,
      el,
      peak: localFmt.peak.time,
    }
    if (passStarted) return t('fields.pass_headline_now', vars)
    const c = formatCountdown(pass.aos.getTime() - nowMs)
    const countdown = c.h > 0 ? `${c.h} h ${c.m} min` : `${c.m} min`
    return t('fields.pass_headline', { ...vars, countdown })
  }, [pass, localFmt, passStarted, nowMs, t])

  const rawMark = p.mark === 'now' || p.mark === 'peak' ? p.mark : 'aos'
  const effectiveMark: 'now' | 'aos' | 'peak' = pass ? rawMark : 'now'

  // Live clock (ms precision): runs only while the 'now' marker is active.
  useEffect(() => {
    if (effectiveMark !== 'now') return
    let raf = 0
    const tick = () => {
      setLiveClockMs(Date.now())
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [effectiveMark])

  const liveClockText = useMemo(() => {
    if (effectiveMark !== 'now') return null
    const d = new Date(liveClockMs)
    const fmt = formatInZone(d, zone, i18n.language)
    const ms = String(d.getMilliseconds()).padStart(3, '0')
    return `${fmt.time}.${ms}`
  }, [effectiveMark, liveClockMs, zone, i18n.language])

  // Marker positions (ISS + observer): refreshed every 100 ms while live; the
  // trail keeps its own coarser 30 s bucket below.
  useEffect(() => {
    if (effectiveMark !== 'now') return
    setLiveMarkerMs(Date.now())
    const id = setInterval(() => setLiveMarkerMs(Date.now()), LIVE_MARKER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [effectiveMark])

  const instant = useMemo(() => {
    if (effectiveMark === 'aos' && pass) return pass.aos
    if (effectiveMark === 'peak' && pass) return pass.maxElAt
    return new Date(liveMarkerMs)
  }, [effectiveMark, pass, liveMarkerMs])

  const trailCenterMs =
    effectiveMark === 'aos' && pass
      ? pass.aos.getTime()
      : effectiveMark === 'peak' && pass
        ? pass.maxElAt.getTime()
        : Math.floor(nowMs / TRAIL_BUCKET_MS) * TRAIL_BUCKET_MS

  const trail = useMemo(() => {
    if (!parsed.ok) return []
    const pts: Vec3[] = []
    for (let dt = -TRAIL_HALF_SPAN_S; dt <= TRAIL_HALF_SPAN_S; dt += TRAIL_STEP_S) {
      const st = propagateEci(parsed.satrec, new Date(trailCenterMs + dt * 1000))
      if (st) pts.push(st.r)
    }
    return pts
  }, [parsed, trailCenterMs])

  const issState = useMemo(() => {
    if (!parsed.ok) return null
    return propagateEci(parsed.satrec, instant)
  }, [parsed, instant])

  const sez = useMemo(() => {
    if (!issState) return null
    const satEcef = eciSiToEcefSi(issState.r, instant)
    return topocentricSezSi({ latDeg: p.lat, lonDeg: p.lon, heightM: p.h_m }, satEcef)
  }, [issState, instant, p.lat, p.lon, p.h_m])

  const obsR = useMemo(
    () => observerEciPosition({ latDeg: p.lat, lonDeg: p.lon, heightM: p.h_m }, instant),
    [p.lat, p.lon, p.h_m, instant],
  )

  const issMarker = issState ? { r: issState.r, label: t('fields.marker_iss') } : null
  const obsMarker = { r: obsR, label: t('fields.marker_you') }

  function onUseMyLocation() {
    if (!('geolocation' in navigator)) {
      setGeoError(t('fields.geolocation_unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, altitude } = position.coords
        setP({
          lat: Math.round(latitude * 1e4) / 1e4,
          lon: Math.round(longitude * 1e4) / 1e4,
          h_m: Math.max(0, Math.round(altitude ?? 0)),
        })
        setGeoError('')
      },
      () => setGeoError(t('fields.geolocation_denied')),
    )
  }

  async function onFetchSatTle() {
    setFetchingTle(true)
    setTleFetchError('')
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), CELESTRAK_FETCH_TIMEOUT_MS)
    try {
      const query = satQuery.trim()
      const isAllDigits = query !== '' && /^\d+$/.test(query)
      const selector =
        query === ''
          ? 'CATNR=25544'
          : isAllDigits
            ? `CATNR=${query}`
            : `NAME=${encodeURIComponent(query)}`
      const res = await fetch(`${CELESTRAK_GP_URL}?FORMAT=TLE&${selector}`, {
        signal: controller.signal,
      })
      const text = await res.text()
      const triple = res.ok ? firstTleTriple(text) : null
      if (triple) {
        setTle(triple)
      } else {
        setTleFetchError(t('fields.tle_fetch_failed'))
      }
    } catch {
      setTleFetchError(t('fields.tle_fetch_failed'))
    } finally {
      window.clearTimeout(timeoutId)
      setFetchingTle(false)
    }
  }

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
          <div className="col-span-full flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={satQuery}
              onChange={(e) => setSatQuery(e.target.value)}
              placeholder={t('fields.sat_query_placeholder')}
              spellCheck={false}
              className="h-9 min-w-[10rem] flex-1 border border-border bg-bg px-2.5 font-mono text-base text-fg outline-none transition-colors placeholder:text-subtle focus:border-border-strong"
            />
            <button
              type="button"
              onClick={() => void onFetchSatTle()}
              disabled={fetchingTle}
              className="inline-flex h-9 shrink-0 items-center border border-border-strong bg-bg-elevated px-3 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {fetchingTle ? t('fields.fetching') : t('fields.fetch_tle')}
            </button>
            {tleFetchError ? (
              <p className="font-mono text-[10px] leading-relaxed text-subtle">{tleFetchError}</p>
            ) : null}
          </div>
          <a
            href={CELESTRAK_CATALOG_URL}
            target="_blank"
            rel="noopener"
            className="col-span-full font-mono text-[10px] text-signal hover:underline"
          >
            {t('fields.browse_celestrak')}
          </a>
          {staleTleDays !== null ? (
            <p className="col-span-full border border-warn/40 bg-warn/10 px-3 py-2 font-mono text-[11px] leading-relaxed text-warn">
              {t('fields.tle_stale_warning', { days: staleTleDays })}
            </p>
          ) : null}
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
          <div className="col-span-full flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onUseMyLocation}
              className="inline-flex h-9 shrink-0 items-center border border-border-strong bg-bg-elevated px-3 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-fg"
            >
              {t('fields.use_my_location')}
            </button>
            {geoError ? (
              <p className="font-mono text-[10px] leading-relaxed text-subtle">{geoError}</p>
            ) : null}
          </div>
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
            label={t('fields.observer_presets')}
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
          <UiSelect
            label={t('fields.display_tz')}
            options={zoneOptions}
            value={p.tz}
            onChange={(e) => setP({ tz: e.target.value })}
          />
          <p className="col-span-full font-mono text-[10px] leading-relaxed text-subtle">
            {t('fields.note_pass_search')}
          </p>
        </ParamsGrid>
      }
      results={
        !parsed.ok ? (
          <p className="font-mono text-sm text-muted">{parsed.error}</p>
        ) : !pass || !localFmt ? (
          <p className="font-mono text-sm text-muted">
            {t('fields.no_pass_above', { el: formatNumber(p.minEl, 1), hours: p.hours })}
          </p>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-sm text-fg">{headline}</p>
              {effectiveMark === 'now' && liveClockText ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex h-5 items-center border border-border-strong bg-surface px-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-signal">
                    {t('fields.live')}
                  </span>
                  <span className="font-mono text-xs tabular text-muted">{liveClockText}</span>
                </span>
              ) : null}
            </div>
            <div className="sidus-results">
              <ResultCard
                label={t('fields.aos_local')}
                value={`${localFmt.aos.time} ${localFmt.aos.zoneAbbr}`}
                accent
              />
              <ResultCard
                label={t('fields.los_local')}
                value={`${localFmt.los.time} ${localFmt.los.zoneAbbr}`}
              />
              <ResultCard
                label={t('fields.max_elevation')}
                si={(pass.maxElDeg * Math.PI) / 180}
                category="angle"
                unitId="deg"
                unitIds={TOOL_UNIT_SETS.angle}
                digits={2}
                accent
              />
              <ResultCard
                label={t('fields.max_el_at_local')}
                value={`${localFmt.peak.time} ${localFmt.peak.zoneAbbr}`}
              />
              <ResultCard
                label={t('fields.duration')}
                si={pass.durationS}
                category="time"
                unitId="pretty"
                unitIds={TOOL_UNIT_SETS.timePretty}
                digits={4}
              />
            </div>
            <p className="font-mono text-[10px] text-subtle">
              {t('fields.pass_utc_line', {
                aos: pass.aos.toISOString(),
                los: pass.los.toISOString(),
              })}
            </p>
          </div>
        )
      }
      preview={
        parsed.ok && trail.length > 1 ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Chip active={effectiveMark === 'now'} onClick={() => setP({ mark: 'now' })}>
                {t('fields.mark_now')}
              </Chip>
              <Chip
                active={effectiveMark === 'aos'}
                onClick={pass ? () => setP({ mark: 'aos' }) : undefined}
              >
                {t('fields.mark_aos')}
              </Chip>
              <Chip
                active={effectiveMark === 'peak'}
                onClick={pass ? () => setP({ mark: 'peak' }) : undefined}
              >
                {t('fields.mark_peak')}
              </Chip>
              <Chip active={p.view === '3d'} onClick={() => setP({ view: '3d' })}>
                3D
              </Chip>
              <Chip active={p.view === '2d'} onClick={() => setP({ view: '2d' })}>
                2D
              </Chip>
            </div>
            <div className="min-h-0 flex-1">
              {p.view === '2d' ? (
                <TrajectoryPlot
                  points={trail}
                  bodyR={EARTH_RADIUS}
                  markers={issMarker ? [issMarker, obsMarker] : [obsMarker]}
                  title={t('fields.title_pass_viz')}
                  subtitle={t('fields.subtitle_pass_viz')}
                />
              ) : (
                <OrbitScene3D
                  bodyR={EARTH_RADIUS}
                  tracks={[{ points: trail, color: 'rgba(184,165,90,0.95)', width: 1.5 }]}
                  pointMarkers={[
                    ...(issMarker
                      ? [{ r: issMarker.r, label: issMarker.label, color: 'rgba(184,165,90,0.95)' }]
                      : []),
                    { r: obsMarker.r, label: obsMarker.label, color: '#f5f5f5' },
                  ]}
                />
              )}
            </div>
          </div>
        ) : null
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
            tz: zone,
            south: sez?.southM,
            east: sez?.eastM,
            zenith: sez?.zenithM,
            el_min: (p.minEl * Math.PI) / 180,
          }}
        />
      }
    />
  )
}
