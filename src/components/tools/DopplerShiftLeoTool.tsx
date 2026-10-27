import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  toSi,
  fromSi,
  dopplerShiftHz,
  twoWayDopplerHz,
  rangeRateFromClockOffset,
  twoWayRangeRateFromClockOffset,
  circularHorizonRangeRate,
  overheadDopplerRateHz,
  DEFAULT_LAUNCH_SITE,
  SAMPLE_ISS_TLE,
  parseTle,
  passDopplerPoints,
} from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { useDebounced } from '@/lib/use-debounced'
import { numParam, strParam, useToolSearchParams } from '@/lib/use-tool-search-params'

const SCHEMA = {
  f0: numParam(2200000000, { min: 1 }),
  vr: numParam(1000),
  vru: strParam('mps', TOOL_UNIT_SETS.velocity),
  dff: numParam(0),
  halt_km: numParam(420, { min: 1, max: 100000 }),
  lat: numParam(DEFAULT_LAUNCH_SITE.latDeg, { min: -90, max: 90 }),
  lon: numParam(DEFAULT_LAUNCH_SITE.lonDeg),
  h_m: numParam(DEFAULT_LAUNCH_SITE.heightM, { min: 0 }),
} as const

export function DopplerShiftLeoTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const [tle, setTle] = useState(SAMPLE_ISS_TLE)
  const dTle = useDebounced(tle, 200)
  const dLat = useDebounced(p.lat, 200)
  const dLon = useDebounced(p.lon, 200)
  const dH = useDebounced(p.h_m, 200)
  const dF0 = useDebounced(p.f0, 200)
  const res = useMemo(() => {
    const vr = toSi(p.vr, p.vru)
    const fd = dopplerShiftHz(p.f0, vr)
    const fd2 = twoWayDopplerHz(p.f0, vr)
    const rdot = rangeRateFromClockOffset(p.dff)
    const rdot2 = twoWayRangeRateFromClockOffset(p.dff)
    const altitudeM = p.halt_km * 1000
    const horizon = circularHorizonRangeRate(altitudeM)
    const horizonFd = horizon == null ? null : dopplerShiftHz(p.f0, horizon)
    const fdot = overheadDopplerRateHz(p.f0, altitudeM)
    if (fd == null || fd2 == null || rdot == null || rdot2 == null) return null
    return { fd, fd2, rdot, rdot2, horizon, horizonFd, fdot }
  }, [p])

  const latValid = Number.isFinite(dLat) && dLat >= -90 && dLat <= 90
  const passDoppler = useMemo(() => {
    const parsed = parseTle(dTle)
    if (!parsed.ok || !latValid) return { parsed, points: null as ReturnType<typeof passDopplerPoints> }
    const epochMs = (parsed.satrec.jdsatepoch - 2440587.5) * 86400000
    const points = passDopplerPoints({
      satrec: parsed.satrec,
      observer: { latDeg: dLat, lonDeg: dLon, heightM: dH },
      f0: dF0,
      start: new Date(epochMs),
      horizonH: 24,
      stepS: 30,
      minElDeg: 10,
      refineS: 1,
    })
    return { parsed, points }
  }, [dF0, dH, dLat, dLon, dTle, latValid])

  function onUseHorizonRate() {
    const horizon = circularHorizonRangeRate(p.halt_km * 1000)
    if (horizon == null) return
    const shown = fromSi(horizon, p.vru)
    setP({ vr: Math.round(shown * 1000) / 1000 })
  }

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField
            label={t('fields.disc_f0')}
            tip={t('fields.tip_disc_f0')}
            type="number"
            min={1}
            step="any"
            value={p.f0}
            onChange={(e) => setP({ f0: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.disc_vr')}
            tip={t('fields.tip_disc_vr')}
            hint={t('fields.hint_disc_vr')}
            category="velocity"
            unitIds={TOOL_UNIT_SETS.velocity}
            unitId={p.vru}
            value={p.vr}
            onValueChange={(vr) => setP({ vr })}
            onUnitChange={(vru, vr) => setP({ vru, vr })}
          />
          <UiField
            label={t('fields.clock_frac_freq')}
            tip={t('fields.tip_clock_frac')}
            type="number"
            step="any"
            value={p.dff}
            onChange={(e) => setP({ dff: Number(e.target.value) })}
            hint={t('fields.hint_clock_frac')}
          />
          <UiField
            label={t('fields.alt_for_doppler')}
            tip={t('fields.tip_alt_doppler')}
            hint={t('fields.hint_alt_doppler')}
            unit="km"
            type="number"
            min={1}
            step="any"
            value={p.halt_km}
            onChange={(e) => setP({ halt_km: Number(e.target.value) })}
          />
          <label className="col-span-full block min-w-0 space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {t('fields.tle')}
            </span>
            <textarea
              value={tle}
              onChange={(e) => setTle(e.target.value)}
              spellCheck={false}
              rows={4}
              className="w-full resize-y border border-border bg-bg px-3 py-2 font-mono text-base leading-relaxed text-fg outline-none focus:border-border-strong"
            />
          </label>
          <UiField
            label={t('fields.site_lat')}
            tip={t('fields.tip_lat')}
            unit="°"
            type="number"
            min={-90}
            max={90}
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
          <div className="col-span-full">
            <button
              type="button"
              onClick={onUseHorizonRate}
              className="inline-flex h-9 items-center border border-border-strong bg-bg-elevated px-3 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:text-fg"
            >
              {t('fields.use_horizon_rate')}
            </button>
          </div>
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.disc_fd')}
              tip={t('fields.tip_disc_fd')}
              value={formatNumber(res.fd, 4)}
              unit="Hz"
              accent
            />
            <ResultCard
              label={t('fields.two_way_doppler')}
              tip={t('fields.tip_two_way_doppler')}
              value={formatNumber(res.fd2, 4)}
              unit="Hz"
            />
            <ResultCard
              label={t('fields.range_rate_error')}
              tip={t('fields.tip_range_rate_one_way')}
              si={res.rdot}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={6}
            />
            <ResultCard
              label={t('fields.range_rate_error_two_way')}
              tip={t('fields.tip_range_rate_two_way')}
              si={res.rdot2}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={6}
            />
            {res.horizonFd != null ? (
              <ResultCard
                label={t('fields.horizon_doppler')}
                tip={t('fields.tip_horizon_doppler')}
                value={formatNumber(res.horizonFd, 4)}
                unit="Hz"
              />
            ) : null}
            {res.fdot != null ? (
              <ResultCard
                label={t('fields.doppler_rate_tca')}
                tip={t('fields.tip_doppler_rate_tca')}
                value={formatNumber(res.fdot, 4)}
                unit="Hz/s"
              />
            ) : null}
            {!latValid ? (
              <p className="col-span-full font-mono text-sm text-muted">{t('fields.invalid_latitude')}</p>
            ) : !passDoppler.parsed.ok ? (
              <p className="col-span-full font-mono text-sm text-muted">{passDoppler.parsed.error}</p>
            ) : passDoppler.points ? (
              <>
                <ResultCard
                  label={t('fields.pass_fd_aos')}
                  tip={t('fields.tip_pass_fd_aos')}
                  value={formatNumber(passDoppler.points.aos.shiftHz, 4)}
                  unit="Hz"
                />
                <ResultCard
                  label={t('fields.pass_fd_closest')}
                  tip={t('fields.tip_pass_fd_closest')}
                  value={formatNumber(passDoppler.points.closest.shiftHz, 4)}
                  unit="Hz"
                />
                <ResultCard
                  label={t('fields.pass_fd_los')}
                  tip={t('fields.tip_pass_fd_los')}
                  value={formatNumber(passDoppler.points.los.shiftHz, 4)}
                  unit="Hz"
                />
              </>
            ) : (
              <p className="col-span-full font-mono text-sm text-muted">{t('fields.pass_doppler_none')}</p>
            )}
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="doppler-shift-leo"
          values={{ ...p, vr: toSi(p.vr, p.vru) }}
        />
      }
    />
  )
}
