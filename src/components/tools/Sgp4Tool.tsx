import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldNote, FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiField } from '@/components/shared/UiField'
import { UiUtcField } from '@/components/shared/UiUtcField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { TrajectoryPlot } from '@/components/viz/TrajectoryPlot'
import {
  EARTH_RADIUS,
  groundTrack,
  parseTle,
  propagateEci,
  SAMPLE_ISS_TLE,
  TOOL_UNIT_SETS,
  toSi,
  eciSiToGeodetic,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { resolveUtcParam } from '@/lib/utcInput'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  /** ISO datetime for epoch of propagation (UTC). Empty → now is handled in UI. */
  at: strParam(''),
  minutes: numParam(90, { min: 1 }),
  minutesu: strParam('min', TOOL_UNIT_SETS.time),
  samples: numParam(96, { min: 16, max: 400 }),
} as const

export function Sgp4Tool() {
  const { t } = useTranslation()
  const { t: tr } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const [tle, setTle] = useState(SAMPLE_ISS_TLE)
  const trailDurationS = toSi(p.minutes, p.minutesu)

  const parsed = useMemo(() => parseTle(tle), [tle])
  const atDate = useMemo(() => resolveUtcParam(p.at), [p.at])

  const state = useMemo(() => {
    if (!parsed.ok) return null
    return propagateEci(parsed.satrec, atDate)
  }, [atDate, parsed])

  const geo = useMemo(() => {
    if (!state) return null
    return eciSiToGeodetic(state.r, state.date)
  }, [state])

  const trail = useMemo(() => {
    if (!parsed.ok) return []
    const n = Math.floor(p.samples)
    const durationS = trailDurationS
    const pts: [number, number, number][] = []
    for (let i = 0; i < n; i++) {
      const t = (durationS * i) / (n - 1)
      const d = new Date(atDate.getTime() + t * 1000)
      const st = propagateEci(parsed.satrec, d)
      if (st) pts.push(st.r)
    }
    return pts
  }, [atDate, trailDurationS, p.samples, parsed])

  const track = useMemo(() => {
    if (!parsed.ok) return []
    return groundTrack(
      parsed.satrec,
      atDate,
      trailDurationS,
      Math.min(120, Math.floor(p.samples)),
    )
  }, [atDate, trailDurationS, p.samples, parsed])

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
          <FieldPresets label={tr('common.presets')}>
            <PresetChip onClick={() => setTle(SAMPLE_ISS_TLE)}>{t('fields.load_sample_iss')}</PresetChip>
          </FieldPresets>
          <FieldNote>{t('fields.note_sgp4_tle')}</FieldNote>
          <UiUtcField
            label={t('fields.propagate_at_utc_iso')}
            value={p.at}
            onChange={(at) => setP({ at })}
            resolved={atDate}
          />
          <UiUnitField
            label={t('fields.trail_duration')}
            category="time"
            unitIds={TOOL_UNIT_SETS.time}
            unitId={p.minutesu}
            value={p.minutes}
            min={1}
            onValueChange={(minutes) => setP({ minutes })}
            onUnitChange={(minutesu, minutes) => setP({ minutesu, minutes })}
          />
          <UiField
            label={t('fields.samples')}
            type="number"
            min={16}
            max={400}
            value={p.samples}
            onChange={(e) => setP({ samples: Number(e.target.value) })}
          />
        </ParamsGrid>
      }
      results={
        !parsed.ok ? (
          <p className="font-mono text-sm text-muted">{parsed.error}</p>
        ) : !state ? (
          <p className="font-mono text-sm text-muted">
            {t('fields.propagation_failed')}
          </p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.name')} value={parsed.name} accent />
            <ResultCard
              label={t('fields.r')}
              si={Math.hypot(...state.r)}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={3}
            />
            <ResultCard
              label={t('fields.v_2')}
              si={Math.hypot(...state.v)}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            {geo ? (
              <>
                <ResultCard label={t('fields.latitude')} si={(geo.latDeg * Math.PI) / 180} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} />
                <ResultCard label={t('fields.longitude')} si={(geo.lonDeg * Math.PI) / 180} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} />
                <ResultCard
                  label={tr('fields.altitude')}
                  si={geo.heightM}
                  category="length"
                  unitId="km"
                  unitIds={TOOL_UNIT_SETS.altitude}
                  digits={2}
                />
              </>
            ) : null}
            <ResultCard
              label={t('fields.r_eci')}
              value={`${formatNumber(state.r[0], 1)}, ${formatNumber(state.r[1], 1)}, ${formatNumber(state.r[2], 1)}`}
              unit="m"
            />
            <ResultCard
              label={t('fields.ground_track_pts')}
              value={String(track.length)}
            />
          </div>
        )
      }
      preview={
        trail.length > 1 ? (
          <TrajectoryPlot
            points={trail}
            bodyR={EARTH_RADIUS}
            markers={state ? [{ r: state.r, label: t('fields.marker_now') }] : []}
            title={t('fields.title_sgp4_trail')}
            subtitle={t('fields.subtitle_sgp4_trail')}
            defaultHeight={260}
          />
        ) : null
      }
      code={<CodeExport formulaId="sgp4" values={{ trailDurationS, minutes: p.minutes, samples: p.samples, at: p.at }} />}
    />
  )
}
