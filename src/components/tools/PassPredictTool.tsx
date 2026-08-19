import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { OrbitScene3D } from '@/components/viz/OrbitScene3D'
import { GlobeMap } from '@/components/viz/GlobeMap'
import type { GlobeSatellite, GlobeTrackPoint } from '@/components/viz/globe/types'
import {
  DEFAULT_LAUNCH_SITE,
  EARTH_RADIUS,
  eciSiToEcefSi,
  eciSiToGeodetic,
  findNextPass,
  observerEciPosition,
  parseTle,
  propagateEci,
  SAMPLE_ISS_TLE,
  sunEciSi,
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
  view: strParam('3d', ['3d', 'map']),
  vis: strParam('0', ['0', '1']),
} as const

const TRAIL_HALF_SPAN_S = 46 * 60
const TRAIL_STEP_S = 30
const TRAIL_BUCKET_MS = 30_000
const SEARCH_STEP_S = 20
const LIVE_MARKER_INTERVAL_MS = 100
const CELESTRAK_GP_URL = 'https://celestrak.org/NORAD/elements/gp.php'
const CELESTRAK_CATALOG_URL = 'https://celestrak.org/NORAD/elements/'
const CELESTRAK_FETCH_TIMEOUT_MS = 10_000
const TLE_STALE_DAYS = 14

/** Live countdown as "H h M min S s", omitting leading zero units. */
function formatHms(ms: number): string {
  const c = formatCountdown(Math.max(0, ms))
  if (c.h > 0) return `${c.h} h ${c.m} min ${c.s} s`
  if (c.m > 0) return `${c.m} min ${c.s} s`
  return `${c.s} s`
}

/** Full-width font-mono kicker for a PARAMETERS section. */
function SectionKicker({ children }: { children: string }) {
  return (
    <p className="col-span-full font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
      {children}
    </p>
  )
}

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
  const [rollForwardMs, setRollForwardMs] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const parsed = useMemo(() => parseTle(tle), [tle])
  const start = useMemo(() => resolveUtcParam(p.at), [p.at])

  // Once a found pass's LOS has elapsed, the search re-anchors to LOS + one
  // search step so the next window rolls in automatically (see the effect
  // below). Reset whenever the user re-anchors the search explicitly.
  useEffect(() => {
    setRollForwardMs(null)
  }, [start])

  const effectiveStart = useMemo(() => {
    if (rollForwardMs != null && rollForwardMs > start.getTime()) return new Date(rollForwardMs)
    return start
  }, [start, rollForwardMs])

  const pass = useMemo(() => {
    if (!parsed.ok) return null
    return findNextPass({
      satrec: parsed.satrec,
      observer: { latDeg: p.lat, lonDeg: p.lon, heightM: p.h_m },
      start: effectiveStart,
      horizonH: p.hours,
      stepS: SEARCH_STEP_S,
      refineS: 1,
      minElDeg: p.minEl,
      visibleOnly: p.vis === '1',
    })
  }, [p.h_m, p.hours, p.lat, p.lon, p.minEl, p.vis, parsed, effectiveStart])

  useEffect(() => {
    if (!pass) return
    if (nowMs >= pass.los.getTime()) {
      setRollForwardMs(pass.los.getTime() + SEARCH_STEP_S * 1000)
    }
  }, [nowMs, pass])

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

  // Live AOS/LOS countdown, ticking every 1 s. `pass` rolls forward on its
  // own (see the roll-forward effect above) once its LOS elapses, so this
  // only ever needs to distinguish BEFORE (now < aos) from DURING (aos <= now
  // < los); the post-LOS instant is a single tick that resolves itself.
  const countdownLine = useMemo(() => {
    if (!pass) return ''
    if (nowMs < pass.aos.getTime()) {
      return t('fields.count_to_pass', {
        aos: formatHms(pass.aos.getTime() - nowMs),
        los: formatHms(pass.los.getTime() - nowMs),
      })
    }
    return t('fields.count_in_pass', { los: formatHms(pass.los.getTime() - nowMs) })
  }, [pass, nowMs, t])

  const visibilityLine = useMemo(() => {
    if (!pass) return ''
    if (pass.visible && pass.visibleAt) {
      const vfmt = formatInZone(pass.visibleAt, zone, i18n.language)
      return t('fields.pass_visible', { time: `${vfmt.time} ${vfmt.zoneAbbr}` })
    }
    return t('fields.pass_not_visible')
  }, [pass, zone, i18n.language, t])

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

  const trailPoints = useMemo(() => {
    if (!parsed.ok) return []
    const pts: { r: Vec3; tMs: number }[] = []
    for (let dt = -TRAIL_HALF_SPAN_S; dt <= TRAIL_HALF_SPAN_S; dt += TRAIL_STEP_S) {
      const tMs = trailCenterMs + dt * 1000
      const st = propagateEci(parsed.satrec, new Date(tMs))
      if (st) pts.push({ r: st.r, tMs })
    }
    return pts
  }, [parsed, trailCenterMs])

  const trail = useMemo(() => trailPoints.map((pt) => pt.r), [trailPoints])

  // Direction encoding: already-flown (solid) vs not-yet-flown (dashed) about
  // the marked instant. The two segments share their boundary point so the
  // solid/dashed pieces connect with no visible gap.
  const flownTrack = useMemo(() => {
    const idx = trailPoints.findIndex((pt) => pt.tMs > instant.getTime())
    const cut = idx === -1 ? trailPoints.length : idx
    return trailPoints.slice(0, cut).map((pt) => pt.r)
  }, [trailPoints, instant])

  const upcomingTrack = useMemo(() => {
    const idx = trailPoints.findIndex((pt) => pt.tMs > instant.getTime())
    if (idx === -1) return []
    return trailPoints.slice(Math.max(0, idx - 1)).map((pt) => pt.r)
  }, [trailPoints, instant])

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

  // World-map data: ground tracks + subsolar point, in lat/lon (deg).
  const subsolar = useMemo(() => {
    const g = eciSiToGeodetic(sunEciSi(instant), instant)
    return g ?? { latDeg: 0, lonDeg: 0, heightM: 0 }
  }, [instant])

  const issGeo = useMemo(
    () => (issState ? eciSiToGeodetic(issState.r, instant) : null),
    [issState, instant],
  )

  // Globe view: the same propagated trail the 3D view uses, as lon/lat/alt.
  const globeTrack = useMemo(() => {
    const out: GlobeTrackPoint[] = []
    for (const pt of trailPoints) {
      const date = new Date(pt.tMs)
      const g = eciSiToGeodetic(pt.r, date)
      if (!g) continue
      out.push({ lon: g.lonDeg, lat: g.latDeg, altKm: g.heightM / 1000, date })
    }
    return out
  }, [trailPoints])

  // Per-frame provider for the globe's follow chase: propagates at the
  // requested instant instead of interpolating the 30 s trail samples.
  const globePositionAt = useCallback(
    (date: Date): GlobeTrackPoint | null => {
      if (!parsed.ok) return null
      const st = propagateEci(parsed.satrec, date)
      if (!st) return null
      const g = eciSiToGeodetic(st.r, date)
      if (!g) return null
      return { lon: g.lonDeg, lat: g.latDeg, altKm: g.heightM / 1000, date }
    },
    [parsed],
  )

  const globeSatellites = useMemo<GlobeSatellite[]>(() => {
    if (globeTrack.length < 2) return []
    return [
      {
        id: 'sat',
        label: t('fields.marker_iss'),
        color: 'rgba(184,165,90,0.95)',
        positions: globeTrack,
        splitAt: instant,
        livePosition: issGeo
          ? {
              lon: issGeo.lonDeg,
              lat: issGeo.latDeg,
              altKm: issGeo.heightM / 1000,
              date: instant,
            }
          : undefined,
        positionAt: globePositionAt,
      },
    ]
  }, [globeTrack, instant, issGeo, globePositionAt, t])

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
          <SectionKicker>{t('fields.sec_satellite')}</SectionKicker>
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

          <SectionKicker>{t('fields.sec_observer')}</SectionKicker>
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
          <LaunchSitePresets
            latDeg={p.lat}
            lonDeg={p.lon}
            label={t('fields.observer_presets')}
            onSelect={(site) =>
              setP({ lat: site.latDeg, lon: site.lonDeg, h_m: site.heightM })
            }
          />

          <SectionKicker>{t('fields.sec_pass')}</SectionKicker>
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
          <div className="col-span-full flex flex-wrap items-center gap-2">
            <Chip active={p.vis === '1'} onClick={() => setP({ vis: p.vis === '1' ? '0' : '1' })}>
              {t('fields.only_visible')}
            </Chip>
          </div>

          <SectionKicker>{t('fields.sec_time')}</SectionKicker>
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
            <p className="font-mono text-sm text-fg">{countdownLine}</p>
            <p className="font-mono text-sm text-muted">{visibilityLine}</p>
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
              <Chip active={p.view === 'map'} onClick={() => setP({ view: 'map' })}>
                MAP
              </Chip>
            </div>
            <div className="min-h-0 flex-1">
              {p.view === 'map' ? (
                <GlobeMap
                  satellites={globeSatellites}
                  observer={{
                    lat: p.lat,
                    lon: p.lon,
                    label: t('fields.marker_you'),
                    color: '#f5f5f5',
                  }}
                  subsolar={{ latDeg: subsolar.latDeg, lonDeg: subsolar.lonDeg }}
                  title={t('fields.title_pass_globe')}
                  caption={t('fields.subtitle_pass_globe')}
                />
              ) : (
                <OrbitScene3D
                  bodyR={EARTH_RADIUS}
                  tracks={[
                    ...(flownTrack.length > 1
                      ? [{ points: flownTrack, color: 'rgba(184,165,90,0.95)', width: 1.5 }]
                      : []),
                    ...(upcomingTrack.length > 1
                      ? [
                          {
                            points: upcomingTrack,
                            color: 'rgba(184,165,90,0.95)',
                            width: 1.5,
                            dash: [6, 4],
                          },
                        ]
                      : []),
                  ]}
                  pointMarkers={[
                    ...(issMarker
                      ? [{ r: issMarker.r, label: issMarker.label, color: 'rgba(184,165,90,0.95)' }]
                      : []),
                    { r: obsMarker.r, label: obsMarker.label, color: '#f5f5f5' },
                  ]}
                  height={340}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {t('fields.live_links')}
              </span>
              <a
                href="https://www.youtube.com/@NASA/streams"
                target="_blank"
                rel="noopener"
                className="font-mono text-[10px] text-signal hover:underline"
              >
                {t('fields.live_nasa_yt')}
              </a>
              <a
                href="https://www.youtube.com/playlist?list=PL2aBZuCeDwlQMf6xMgQAUAY_nbHAgW5jz"
                target="_blank"
                rel="noopener"
                className="font-mono text-[10px] text-signal hover:underline"
              >
                {t('fields.live_nasa_iss_playlist')}
              </a>
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
