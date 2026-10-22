import { useMemo } from 'react'
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
} from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/use-tool-search-params'

const SCHEMA = {
  f0: numParam(2200000000, { min: 1 }),
  vr: numParam(1000),
  vru: strParam('mps', TOOL_UNIT_SETS.velocity),
  dff: numParam(0),
  halt_km: numParam(420, { min: 1, max: 100000 }),
} as const

export function DopplerShiftLeoTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
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
