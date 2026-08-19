import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  AU,
  EARTH_MU,
  EARTH_RADIUS,
  MOON_E3,
  MOON_I3_RAD,
  MOON_MU,
  MOON_SMA_M,
  SUN_E3,
  SUN_I3_RAD,
  SUN_MU,
  TOOL_UNIT_SETS,
  lunisolarRates,
  toSi,
} from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const BODIES = ['moon', 'sun'] as const

const PRESET = {
  moon: { i3: (MOON_I3_RAD * 180) / Math.PI, e3: MOON_E3 },
  sun: { i3: (SUN_I3_RAD * 180) / Math.PI, e3: SUN_E3 },
} as const

const SCHEMA = {
  body: strParam('moon', BODIES),
  h: numParam(20200, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  e: numParam(0.005, { min: 0, max: 0.99 }),
  i: numParam(55),
  iu: strParam('deg', TOOL_UNIT_SETS.angle),
  i3: numParam(PRESET.moon.i3),
  i3u: strParam('deg', TOOL_UNIT_SETS.angle),
  e3: numParam(PRESET.moon.e3, { min: 0, max: 0.99 }),
} as const

export function LunisolarRatesTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const a = EARTH_RADIUS + toSi(p.h, p.hu)
    const third = p.body === 'sun' ? { mu3: SUN_MU, d3: AU } : { mu3: MOON_MU, d3: MOON_SMA_M }
    return lunisolarRates({
      a,
      e: p.e,
      iRad: toSi(p.i, p.iu),
      mu: EARTH_MU,
      i3: toSi(p.i3, p.i3u),
      e3: p.e3,
      ...third,
    })
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.third_body')}
            value={p.body}
            onChange={(e) => {
              const body = e.target.value as (typeof BODIES)[number]
              const preset = body === 'sun' ? PRESET.sun : PRESET.moon
              setP({ body, i3: preset.i3, e3: preset.e3, i3u: 'deg' })
            }}
            options={BODIES.map((id) => ({
              value: id,
              label: id === 'moon' ? t('fields.body_moon') : t('fields.body_sun'),
            }))}
          />
          <UiUnitField label={t('fields.orbit_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
          <UiField label={t('fields.eccentricity')} type="number" min={0} max={0.99} step="any" value={p.e} onChange={(e) => setP({ e: Number(e.target.value) })} />
          <UiUnitField label={t('fields.target_inclination')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.iu} value={p.i} onValueChange={(i) => setP({ i })} onUnitChange={(iu, i) => setP({ iu, i })} />
          <UiUnitField label={t('fields.third_inclination')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.i3u} value={p.i3} min={0} onValueChange={(i3) => setP({ i3 })} onUnitChange={(i3u, i3) => setP({ i3u, i3 })} />
          <UiField label={t('fields.third_ecc')} type="number" min={0} max={0.99} step="any" value={p.e3} onChange={(e) => setP({ e3: Number(e.target.value) })} />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.raan_rate')}
              value={formatNumber(res.raanRate * 86400 * (180 / Math.PI), 6)}
              unit="deg/d"
              accent
            />
            <ResultCard
              label={t('fields.argp_rate')}
              value={formatNumber(res.argpRate * 86400 * (180 / Math.PI), 6)}
              unit="deg/d"
            />
            <ResultCard label={t('fields.kozai_theta')} value={formatNumber(res.kozaiTheta, 6)} />
            <ResultCard label={t('fields.p2_factor')} value={formatNumber(res.p2, 6)} />
            <ResultCard label={t('fields.e3_avg')} value={formatNumber(res.e3Fac, 6)} />
            {res.argpPeriod != null ? (
              <ResultCard label={t('fields.argp_period')} si={res.argpPeriod} category="time" unitId="yr" unitIds={TOOL_UNIT_SETS.timePretty} digits={3} />
            ) : null}
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="lunisolar-rates"
          values={{
            a: EARTH_RADIUS + toSi(p.h, p.hu),
            e: p.e,
            inc: toSi(p.i, p.iu),
            i3_rad: toSi(p.i3, p.i3u),
            e3: p.e3,
            mu: EARTH_MU,
            mu3: p.body === 'sun' ? SUN_MU : MOON_MU,
            d3: p.body === 'sun' ? AU : MOON_SMA_M,
          }}
        />
      }
    />
  )
}
