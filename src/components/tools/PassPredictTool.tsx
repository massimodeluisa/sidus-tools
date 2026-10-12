import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  bundledStationByCatnr,
  CELESTRAK_CATALOG_URL,
  readStoredTle,
  searchCelestrak,
  tleText,
  writeStoredTle,
} from '@/lib/celestrak'
import { compassOctant, type CompassOctant } from '@/lib/compass'
import { passToIcs } from '@/lib/pass-ics'
import { useDebounced } from '@/lib/use-debounced'
import type { SatRec } from 'satellite.js'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { LaunchSitePresets } from '@/components/shared/LaunchSitePresets'
import { UiField } from '@/components/shared/UiField'
import { UiUtcField } from '@/components/shared/UiUtcField'
import { UiSelect } from '@/components/shared/UiSelect'
import { Chip } from '@/components/shared/Chip'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { PassSkyPlot } from '@/components/tools/PassSkyPlot'
import { OrbitScene3D, type ScenePointMarker } from '@/components/viz/OrbitScene3D'
import { GlobeMap } from '@/components/viz/GlobeMap'
import type { GlobeSatellite, GlobeTrackPoint } from '@/components/viz/globe/types'
import {
  DEFAULT_LAUNCH_SITE,
  EARTH_RADIUS,
  eciSiToEcefSi,
  eciSiToGeodetic,
  findPasses,
  lookAnglesFromEci,
  observerEciPosition,
  parseTle,
  propagateEci,
  SAMPLE_ISS_TLE,
  samplePassLookAngles,
  sunEciSi,
  TOOL_UNIT_SETS,
  topocentricSezSi,
  type GeodeticDeg,
  type PassWindow,
  type Vec3,
} from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import {
  browserTimeZone,
  formatCountdown,
  formatInZone,
  isValidTimeZone,
  listTimeZones,
} from '@/lib/timezone'
import { resolveUtcParam } from '@/lib/utc-input'
import { numParam, strParam, useToolSearchParams } from '@/lib/use-tool-search-params'

const SCHEMA = {
  lat: numParam(DEFAULT_LAUNCH_SITE.latDeg),
  lon: numParam(DEFAULT_LAUNCH_SITE.lonDeg),
  h_m: numParam(DEFAULT_LAUNCH_SITE.heightM, { min: 0 }),
  minEl: numParam(10, { min: 0, max: 80 }),
  hours: numParam(24, { min: 1, max: 72 }),
  at: strParam(''),
  tz: strParam(''),
  mark: strParam('aos', ['now', 'aos', 'peak']),
  view: strParam('map', ['3d', 'map']),
  vis: strParam('0', ['0', '1']),
  sat: strParam('25544'),
} as const

const TRAIL_HALF_SPAN_S = 46 * 60
const TRAIL_STEP_S = 30
const TRAIL_BUCKET_MS = 30_000
const SEARCH_STEP_S = 20
const SEARCH_DEBOUNCE_MS = 200
const PASS_LIST_MAX = 8
/** Looked up when the field is left empty: the satellite this tool opens on. */
const DEFAULT_CATNR = '25544'
const TLE_STALE_DAYS = 14

const COMPASS_KEY: Record<CompassOctant, `fields.compass_${CompassOctant}`> = {
  n: 'fields.compass_n',
  ne: 'fields.compass_ne',
  e: 'fields.compass_e',
  se: 'fields.compass_se',
  s: 'fields.compass_s',
  sw: 'fields.compass_sw',
  w: 'fields.compass_w',
  nw: 'fields.compass_nw',
}

/** Live countdown as "H h M min S s", omitting leading zero units. */
function formatHms(ms: number): string {
  const c = formatCountdown(Math.max(0, ms))
  if (c.h > 0) return `${c.h} h ${c.m} min ${c.s} s`
  if (c.m > 0) return `${c.m} min ${c.s} s`
  return `${c.s} s`
}

function seedTle(catnr: string): string {
  const stored = readStoredTle(catnr)
  if (stored && parseTle(stored).ok) return stored
  const bundled = bundledStationByCatnr(catnr)
  if (bundled) return tleText(bundled)
  return SAMPLE_ISS_TLE
}

function tleEpochMs(satrec: SatRec): number {
  return (satrec.jdsatepoch - 2440587.5) * 86400000
}

function downloadText(filename: string, body: string, mime: string) {
  const blob = new Blob([body], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/** Full-width font-mono kicker for a PARAMETERS section. */
function SectionKicker({ children }: { children: string }) {
  return (
    <p className="col-span-full font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
      {children}
    </p>
  )
}

/**
 * Millisecond clock owned by this node. The parent used to setState every
 * animation frame, which reconciled the map and the 3D scene with it.
 */
function LiveClock({ active, zone, locale }: { active: boolean; zone: string; locale: string }) {
  const { t } = useTranslation()
  const [ms, setMs] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = () => {
      setMs(Date.now())
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
  if (!active) return null
  const date = new Date(ms)
  const fmt = formatInZone(date, zone, locale)
  const frac = String(date.getMilliseconds()).padStart(3, '0')
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex h-5 items-center border border-border-strong bg-surface px-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-signal">
        {t('fields.live')}
      </span>
      <span className="font-mono text-xs tabular text-muted">
        {fmt.time}.{frac}
      </span>
    </span>
  )
}

export function PassPredictTool() {
  const { t, i18n } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const [tle, setTle] = useState(() => seedTle(p.sat || DEFAULT_CATNR))
  const [satQuery, setSatQuery] = useState('')
  const [tzFilter, setTzFilter] = useState('')
  const [geoError, setGeoError] = useState('')
  const [tleFetchError, setTleFetchError] = useState('')
  const [fetchingTle, setFetchingTle] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [rollForwardMs, setRollForwardMs] = useState<number | null>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const tleTouch = useRef(0)

  const dLat = useDebounced(p.lat, SEARCH_DEBOUNCE_MS)
  const dLon = useDebounced(p.lon, SEARCH_DEBOUNCE_MS)
  const dH = useDebounced(p.h_m, SEARCH_DEBOUNCE_MS)
  const dMinEl = useDebounced(p.minEl, SEARCH_DEBOUNCE_MS)
  const dHours = useDebounced(p.hours, SEARCH_DEBOUNCE_MS)
  const dAt = useDebounced(p.at, SEARCH_DEBOUNCE_MS)
  const dTle = useDebounced(tle, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const catnr = (p.sat || DEFAULT_CATNR).trim()
    const touchAtStart = tleTouch.current
    let cancelled = false
    const seeded = seedTle(catnr)
    if (tleTouch.current === touchAtStart) setTle(seeded)
    void (async () => {
      try {
        const [record] = await searchCelestrak(catnr)
        if (cancelled || !record || tleTouch.current !== touchAtStart) return
        const text = tleText(record)
        writeStoredTle(record.catnr, text)
        setTle(text)
      } catch {
        /* Seeded copy (stored, bundled stations.txt, or the sample) stays. */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [p.sat])

  const parsedLive = useMemo(() => parseTle(tle), [tle])
  const parsed = useMemo(() => parseTle(dTle), [dTle])
  const startLive = useMemo(() => resolveUtcParam(p.at), [p.at])
  const start = useMemo(() => resolveUtcParam(dAt), [dAt])
  const startPinned = p.at.trim() !== ''

  useEffect(() => {
    setRollForwardMs(null)
  }, [start])

  const effectiveStart = useMemo(() => {
    if (!startPinned && rollForwardMs != null && rollForwardMs > start.getTime()) {
      return new Date(rollForwardMs)
    }
    return start
  }, [start, rollForwardMs, startPinned])

  const searchObserver = useMemo<GeodeticDeg>(
    () => ({ latDeg: dLat, lonDeg: dLon, heightM: dH }),
    [dLat, dLon, dH],
  )

  const passes = useMemo(() => {
    if (!parsed.ok) return []
    return findPasses({
      satrec: parsed.satrec,
      observer: searchObserver,
      start: effectiveStart,
      horizonH: dHours,
      stepS: SEARCH_STEP_S,
      refineS: 1,
      minElDeg: dMinEl,
      favorableLightingOnly: p.vis === '1',
      maxCount: PASS_LIST_MAX,
    })
  }, [dHours, dMinEl, p.vis, parsed, effectiveStart, searchObserver])

  const pass: PassWindow | null = passes[Math.min(selectedIdx, Math.max(0, passes.length - 1))] ?? null

  useEffect(() => {
    setSelectedIdx(0)
  }, [dLat, dLon, dH, dMinEl, dHours, dAt, p.vis, dTle, rollForwardMs])

  useEffect(() => {
    if (startPinned || !passes[0]) return
    if (nowMs >= passes[0].los.getTime()) {
      setRollForwardMs(passes[0].los.getTime() + SEARCH_STEP_S * 1000)
    }
  }, [nowMs, passes, startPinned])

  const zone = p.tz !== '' && isValidTimeZone(p.tz) ? p.tz : browserTimeZone()

  const zoneOptions = useMemo(() => {
    const query = tzFilter.trim().toLowerCase()
    const zones = listTimeZones().filter((z) => z !== 'UTC')
    const filtered = query ? zones.filter((z) => z.toLowerCase().includes(query)) : zones
    if (p.tz && p.tz !== 'UTC' && !filtered.includes(p.tz)) filtered.unshift(p.tz)
    return [
      { value: '', label: t('fields.tz_browser', { tz: browserTimeZone() }) },
      { value: 'UTC', label: 'UTC' },
      ...filtered.map((z) => ({ value: z, label: z })),
    ]
  }, [t, tzFilter, p.tz])

  const staleTleDays = useMemo(() => {
    if (!parsedLive.ok) return null
    const ageDays = Math.abs(nowMs - tleEpochMs(parsedLive.satrec)) / 86400000
    return ageDays > TLE_STALE_DAYS ? Math.round(ageDays) : null
  }, [parsedLive, nowMs])

  const tleEpochLabel = useMemo(() => {
    if (!parsedLive.ok) return ''
    const fmt = formatInZone(new Date(tleEpochMs(parsedLive.satrec)), 'UTC', i18n.language)
    return `${fmt.date} ${fmt.time} UTC`
  }, [parsedLive, i18n.language])

  const localFmt = useMemo(() => {
    if (!pass) return null
    return {
      aos: formatInZone(pass.aos, zone, i18n.language),
      los: formatInZone(pass.los, zone, i18n.language),
      peak: formatInZone(pass.maxElAt, zone, i18n.language),
    }
  }, [pass, zone, i18n.language])

  const bearings = useMemo(() => {
    if (!pass || !parsed.ok) return null
    const at = (date: Date) => {
      const state = propagateEci(parsed.satrec, date)
      if (!state) return null
      return lookAnglesFromEci(searchObserver, state.r, date)
    }
    const label = (date: Date) => {
      const look = at(date)
      if (!look) return ''
      const deg = ((look.azimuthRad * 180) / Math.PI + 360) % 360
      return `${t(COMPASS_KEY[compassOctant(look.azimuthRad)])} ${formatNumber(deg, 0)}°`
    }
    return {
      aos: label(pass.aos),
      peak: label(pass.maxElAt),
      los: label(pass.los),
      aosRad: at(pass.aos)?.azimuthRad ?? null,
      peakRad: at(pass.maxElAt)?.azimuthRad ?? null,
      losRad: at(pass.los)?.azimuthRad ?? null,
    }
  }, [pass, parsed, searchObserver, t])

  const skySamples = useMemo(() => {
    if (!pass || !parsed.ok) return []
    const step = Math.max(2, Math.round(pass.durationS / 120))
    return samplePassLookAngles(parsed.satrec, searchObserver, pass.aos, pass.los, step)
  }, [pass, parsed, searchObserver])

  const passStarted = pass ? nowMs >= pass.aos.getTime() : false
  const pinnedPast = Boolean(pass && startPinned && nowMs >= pass.los.getTime())

  const headline = useMemo(() => {
    if (!pass || !localFmt || !bearings) return ''
    const el = `${formatNumber(pass.maxElDeg, 1)}°`
    const vars = {
      date: localFmt.aos.date,
      aos: localFmt.aos.time,
      los: localFmt.los.time,
      tz: localFmt.aos.zoneAbbr,
      el,
      peak: localFmt.peak.time,
      aosAz: bearings.aos,
      peakAz: bearings.peak,
      losAz: bearings.los,
    }
    if (passStarted) return t('fields.pass_headline_now', vars)
    const c = formatCountdown(pass.aos.getTime() - nowMs)
    const countdown = c.h > 0 ? `${c.h} h ${c.m} min` : `${c.m} min`
    return t('fields.pass_headline', { ...vars, countdown })
  }, [pass, localFmt, bearings, passStarted, nowMs, t])

  const countdownLine = useMemo(() => {
    if (!pass) return ''
    if (nowMs < pass.aos.getTime()) {
      return t('fields.count_to_pass', {
        aos: formatHms(pass.aos.getTime() - nowMs),
        los: formatHms(pass.los.getTime() - nowMs),
      })
    }
    if (nowMs >= pass.los.getTime()) return ''
    return t('fields.count_in_pass', { los: formatHms(pass.los.getTime() - nowMs) })
  }, [pass, nowMs, t])

  const lightingLine = useMemo(() => {
    if (!pass || !parsed.ok) return ''
    if (pass.favorableLighting && pass.favorableLightingAt) {
      const vfmt = formatInZone(pass.favorableLightingAt, zone, i18n.language)
      return t('fields.pass_lighting_favorable', {
        name: parsed.name,
        time: `${vfmt.time} ${vfmt.zoneAbbr}`,
      })
    }
    return t('fields.pass_lighting_not_favorable', { name: parsed.name })
  }, [pass, parsed, zone, i18n.language, t])

  const rawMark = p.mark === 'now' || p.mark === 'peak' ? p.mark : 'aos'
  const effectiveMark: 'now' | 'aos' | 'peak' = pass ? rawMark : 'now'
  const satLabel = parsed.ok ? parsed.name.trim() || t('fields.marker_iss') : t('fields.marker_iss')

  const trailCenterMs =
    effectiveMark === 'aos' && pass
      ? pass.aos.getTime()
      : effectiveMark === 'peak' && pass
        ? pass.maxElAt.getTime()
        : Math.floor(nowMs / TRAIL_BUCKET_MS) * TRAIL_BUCKET_MS

  const trackSplit = useMemo(() => {
    if (effectiveMark === 'aos' && pass) return pass.aos
    if (effectiveMark === 'peak' && pass) return pass.maxElAt
    return new Date(trailCenterMs)
  }, [effectiveMark, pass, trailCenterMs])

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

  const flownTrack = useMemo(() => {
    const split = trackSplit.getTime()
    const idx = trailPoints.findIndex((pt) => pt.tMs > split)
    const cut = idx === -1 ? trailPoints.length : idx
    return trailPoints.slice(0, cut).map((pt) => pt.r)
  }, [trailPoints, trackSplit])

  const upcomingTrack = useMemo(() => {
    const split = trackSplit.getTime()
    const idx = trailPoints.findIndex((pt) => pt.tMs > split)
    if (idx === -1) return []
    return trailPoints.slice(Math.max(0, idx - 1)).map((pt) => pt.r)
  }, [trailPoints, trackSplit])

  const markedState = useMemo(() => {
    if (!parsed.ok || effectiveMark === 'now') return null
    return propagateEci(parsed.satrec, trackSplit)
  }, [parsed, effectiveMark, trackSplit])

  const sezAt = effectiveMark === 'now' ? new Date(nowMs) : trackSplit
  const sezState = useMemo(() => {
    if (!parsed.ok) return null
    return propagateEci(parsed.satrec, sezAt)
  }, [parsed, sezAt])

  const sez = useMemo(() => {
    if (!sezState) return null
    const satEcef = eciSiToEcefSi(sezState.r, sezAt)
    return topocentricSezSi({ latDeg: p.lat, lonDeg: p.lon, heightM: p.h_m }, satEcef)
  }, [sezState, sezAt, p.lat, p.lon, p.h_m])

  const sunAt =
    effectiveMark === 'now' ? new Date(Math.floor(nowMs / 60_000) * 60_000) : trackSplit

  const subsolar = useMemo(() => {
    const g = eciSiToGeodetic(sunEciSi(sunAt), sunAt)
    return g ?? { latDeg: 0, lonDeg: 0, heightM: 0 }
  }, [sunAt])

  const issGeo = useMemo(
    () => (markedState ? eciSiToGeodetic(markedState.r, trackSplit) : null),
    [markedState, trackSplit],
  )

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
        label: satLabel,
        color: 'rgba(184,165,90,0.95)',
        positions: globeTrack,
        splitAt: trackSplit,
        livePosition:
          effectiveMark === 'now' || !issGeo
            ? undefined
            : {
                lon: issGeo.lonDeg,
                lat: issGeo.latDeg,
                altKm: issGeo.heightM / 1000,
                date: trackSplit,
              },
        positionAt: globePositionAt,
      },
    ]
  }, [globeTrack, trackSplit, issGeo, globePositionAt, satLabel, effectiveMark])

  const liveSceneMarkers = useCallback((): ScenePointMarker[] => {
    if (!parsed.ok) return []
    const date = new Date()
    const st = propagateEci(parsed.satrec, date)
    const obs = observerEciPosition({ latDeg: p.lat, lonDeg: p.lon, heightM: p.h_m }, date)
    const markers: ScenePointMarker[] = []
    if (st) markers.push({ r: st.r, label: satLabel, color: 'rgba(184,165,90,0.95)' })
    markers.push({ r: obs, label: t('fields.marker_you'), color: '#f5f5f5' })
    return markers
  }, [parsed, p.lat, p.lon, p.h_m, satLabel, t])

  const staticMarkers = useMemo<ScenePointMarker[]>(() => {
    if (!markedState) return []
    const obs = observerEciPosition(
      { latDeg: p.lat, lonDeg: p.lon, heightM: p.h_m },
      trackSplit,
    )
    return [
      { r: markedState.r, label: satLabel, color: 'rgba(184,165,90,0.95)' },
      { r: obs, label: t('fields.marker_you'), color: '#f5f5f5' },
    ]
  }, [markedState, p.lat, p.lon, p.h_m, trackSplit, satLabel, t])

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
    try {
      const query = satQuery.trim() || p.sat || DEFAULT_CATNR
      const [record] = await searchCelestrak(query)
      if (!record) {
        setTleFetchError(t('fields.tle_fetch_failed'))
        return
      }
      const text = tleText(record)
      writeStoredTle(record.catnr, text)
      tleTouch.current += 1
      setTle(text)
      if (record.catnr !== p.sat) setP({ sat: record.catnr })
    } catch {
      setTleFetchError(t('fields.tle_fetch_failed'))
    } finally {
      setFetchingTle(false)
    }
  }

  function onExportIcs() {
    if (!pass || !localFmt || !bearings || !parsed.ok) return
    const body = passToIcs({
      uid: `${parsed.name}-${pass.aos.toISOString()}@sidus.tools`,
      title: t('fields.ics_summary', {
        name: parsed.name.trim(),
        el: `${formatNumber(pass.maxElDeg, 1)}°`,
      }),
      description: t('fields.ics_body', {
        aosAz: bearings.aos,
        aos: `${localFmt.aos.time} ${localFmt.aos.zoneAbbr}`,
        el: `${formatNumber(pass.maxElDeg, 1)}°`,
        peakAz: bearings.peak,
        peak: `${localFmt.peak.time} ${localFmt.peak.zoneAbbr}`,
        losAz: bearings.los,
        los: `${localFmt.los.time} ${localFmt.los.zoneAbbr}`,
      }),
      start: pass.aos,
      end: pass.los,
    })
    downloadText(`pass-${pass.aos.toISOString().slice(0, 16)}.ics`, body, 'text/calendar')
  }

  const showResults = parsedLive.ok && parsed.ok && pass && localFmt && bearings

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
              onChange={(e) => {
                tleTouch.current += 1
                setTle(e.target.value)
              }}
              spellCheck={false}
              rows={4}
              className="w-full resize-y border border-border bg-bg px-3 py-2 font-mono text-base leading-relaxed text-fg outline-none focus:border-border-strong"
            />
          </label>
          {tleEpochLabel ? (
            <p className="col-span-full font-mono text-[10px] text-subtle">
              {t('fields.tle_epoch', { date: tleEpochLabel })}
              {' · '}
              {t('fields.sat_catnr', { sat: p.sat || DEFAULT_CATNR })}
            </p>
          ) : null}
          <div className="col-span-full flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={satQuery}
              onChange={(e) => setSatQuery(e.target.value)}
              placeholder={t('fields.sat_query_placeholder')}
              spellCheck={false}
              aria-label={t('fields.tip_sat_query')}
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
            tip={t('fields.tip_lat')}
            unit="°"
            type="number"
            step="any"
            value={p.lat}
            onChange={(e) => setP({ lat: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.site_lon')}
            tip={t('fields.tip_lon')}
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
            tip={t('fields.tip_height')}
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
            onSelect={(site) => setP({ lat: site.latDeg, lon: site.lonDeg, h_m: site.heightM })}
          />

          <SectionKicker>{t('fields.sec_pass')}</SectionKicker>
          <UiField
            label={t('fields.min_elevation')}
            tip={t('fields.tip_min_el')}
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
            tip={t('fields.tip_horizon')}
            unit="h"
            type="number"
            min={1}
            max={72}
            value={p.hours}
            onChange={(e) => setP({ hours: Number(e.target.value) })}
          />
          <div className="col-span-full flex flex-wrap items-center gap-2">
            <Chip active={p.vis === '1'} onClick={() => setP({ vis: p.vis === '1' ? '0' : '1' })}>
              {t('fields.only_favorable_lighting')}
            </Chip>
          </div>

          <SectionKicker>{t('fields.sec_time')}</SectionKicker>
          <UiUtcField
            label={t('fields.start_utc_iso')}
            value={p.at}
            onChange={(at) => setP({ at })}
            resolved={startLive}
          />
          {startPinned ? (
            <div className="col-span-full">
              <button
                type="button"
                onClick={() => {
                  setRollForwardMs(null)
                  setP({ at: '' })
                }}
                className="inline-flex h-9 items-center border border-border-strong bg-bg-elevated px-3 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-fg"
              >
                {t('fields.search_from_now')}
              </button>
            </div>
          ) : null}
          <UiField
            label={t('fields.tz_filter')}
            tip={t('fields.tip_tz_filter')}
            value={tzFilter}
            placeholder={t('fields.tz_filter_placeholder')}
            onChange={(e) => setTzFilter(e.target.value)}
          />
          <UiSelect
            label={t('fields.display_tz')}
            tip={t('fields.tip_display_tz')}
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
        !parsedLive.ok ? (
          <p className="font-mono text-sm text-muted">{parsedLive.error}</p>
        ) : !showResults ? (
          <p className="font-mono text-sm text-muted">
            {t('fields.no_pass_above', { el: formatNumber(dMinEl, 1), hours: dHours })}
          </p>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-sm text-fg">{headline}</p>
              <LiveClock active={effectiveMark === 'now'} zone={zone} locale={i18n.language} />
            </div>
            {countdownLine ? <p className="font-mono text-sm text-fg">{countdownLine}</p> : null}
            {pinnedPast ? (
              <p className="font-mono text-[11px] leading-relaxed text-warn">{t('fields.pass_pinned_past')}</p>
            ) : null}
            <p className="font-mono text-sm text-muted">{lightingLine}</p>
            <div className="sidus-results">
              <ResultCard
                label={t('fields.aos_local')}
                tip={t('fields.tip_aos')}
                value={`${localFmt.aos.time} ${localFmt.aos.zoneAbbr}`}
                accent
              />
              <ResultCard
                label={t('fields.los_local')}
                tip={t('fields.tip_los')}
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
                tip={t('fields.tip_max_el_at')}
                value={`${localFmt.peak.time} ${localFmt.peak.zoneAbbr}`}
              />
              <ResultCard
                label={t('fields.duration')}
                tip={t('fields.tip_pass_duration')}
                si={pass.durationS}
                category="time"
                unitId="pretty"
                unitIds={TOOL_UNIT_SETS.timePretty}
                digits={4}
              />
              <ResultCard label={t('fields.az_aos')} tip={t('fields.tip_az')} value={bearings.aos} />
              <ResultCard label={t('fields.az_peak')} tip={t('fields.tip_az')} value={bearings.peak} />
              <ResultCard label={t('fields.az_los')} tip={t('fields.tip_az')} value={bearings.los} />
            </div>
            <p className="font-mono text-[10px] text-subtle">
              {t('fields.pass_utc_line', {
                aos: pass.aos.toISOString(),
                los: pass.los.toISOString(),
              })}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onExportIcs}
                className="inline-flex h-9 items-center border border-border-strong bg-bg-elevated px-3 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-fg"
              >
                {t('fields.export_ics')}
              </button>
            </div>
            {passes.length > 1 ? (
              <div className="min-w-0 overflow-x-auto">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {t('fields.pass_list')}
                </p>
                <table className="w-full min-w-[36rem] border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="text-left text-subtle">
                      <th className="px-2 py-1 font-normal">{t('fields.aos_local')}</th>
                      <th className="px-2 py-1 font-normal">{t('fields.los_local')}</th>
                      <th className="px-2 py-1 font-normal">{t('fields.max_elevation')}</th>
                      <th className="px-2 py-1 font-normal">{t('fields.duration')}</th>
                      <th className="px-2 py-1 font-normal">{t('fields.pass_col_lighting')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passes.map((row, index) => {
                      const aos = formatInZone(row.aos, zone, i18n.language)
                      const los = formatInZone(row.los, zone, i18n.language)
                      const selected = index === Math.min(selectedIdx, passes.length - 1)
                      return (
                        <tr key={row.aos.toISOString()} className={selected ? 'bg-bg-elevated text-fg' : 'text-muted'}>
                          <td className="px-2 py-1" colSpan={5}>
                            <button
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setSelectedIdx(index)}
                              className="grid w-full grid-cols-5 text-left"
                            >
                              <span>
                                {aos.time} {aos.zoneAbbr}
                              </span>
                              <span>
                                {los.time} {los.zoneAbbr}
                              </span>
                              <span>{formatNumber(row.maxElDeg, 1)}°</span>
                              <span>{formatHms(row.durationS * 1000)}</span>
                              <span>
                                {row.favorableLighting
                                  ? t('fields.pass_lighting_yes')
                                  : t('fields.pass_lighting_no')}
                              </span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
            <PassSkyPlot
              samples={skySamples}
              caption={t('fields.sky_track_caption')}
              north={t('fields.compass_n')}
              east={t('fields.compass_e')}
              south={t('fields.compass_s')}
              west={t('fields.compass_w')}
            />
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
                  tickLive={effectiveMark === 'now'}
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
                  height={340}
                />
              ) : (
                <OrbitScene3D
                  bodyR={EARTH_RADIUS}
                  liveMarkers={effectiveMark === 'now' ? liveSceneMarkers : undefined}
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
                  pointMarkers={effectiveMark === 'now' ? [] : staticMarkers}
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
            sat: p.sat,
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
