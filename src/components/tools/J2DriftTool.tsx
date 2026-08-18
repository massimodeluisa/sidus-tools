import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { FieldNote, FieldPresets, PresetChip } from '@/components/shared/Field'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  EARTH_J2,
  fromSi,
  getBody,
  j2ArgpRate,
  j2RaanRate,
  meanMotion,
  raanPeriodS,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  a: numParam(6778.137, { min: 0.001 }),
  au: strParam('km', TOOL_UNIT_SETS.length),
  e: numParam(0.001, { min: 0, max: 0.999 }),
  i: numParam(51.6),
  iu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function J2DriftTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const a_m = toSi(p.a, p.au)
  const i_rad = toSi(p.i, p.iu)

  // J2 / R_eq meaningful for Earth-like models; other μ still use Earth J2 note
  const rates = useMemo(() => {
    if (!(a_m > body.radius)) return null
    const Om = j2RaanRate(body.mu, a_m, p.e, i_rad, EARTH_J2, body.radius)
    const om = j2ArgpRate(body.mu, a_m, p.e, i_rad, EARTH_J2, body.radius)
    const n = meanMotion(body.mu, a_m)
    if (Om == null || om == null || n == null) return null
    return {
      Om,
      om,
      n,
      Om_deg_day: ((Om * 180) / Math.PI) * 86400,
      om_deg_day: ((om * 180) / Math.PI) * 86400,
      T_raan: raanPeriodS(Om),
    }
  }, [a_m, body.mu, body.radius, i_rad, p.e])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.semi_major_axis')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.au}
            value={p.a}
            min={0}
            onValueChange={(a) => setP({ a })}
            onUnitChange={(au, a) => setP({ au, a })}
          />
          <UiField
            label={t('fields.eccentricity')}
            type="number"
            min={0}
            max={0.999}
            step="any"
            value={p.e}
            onChange={(e) => setP({ e: Number(e.target.value) })}
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

          <FieldPresets label={t('common.presets')}>
            <PresetChip
              onClick={() =>
                setP({
                  a: fromSi(6_778_137, p.au),
                  e: 0.001,
                  i: fromSi((51.6 * Math.PI) / 180, p.iu),
                })
              }
            >
              {t('tools.j2_drift.preset_iss')}
            </PresetChip>
            <PresetChip
              onClick={() =>
                setP({
                  a: fromSi(7_078_137, p.au),
                  e: 0.001,
                  i: fromSi((98.7 * Math.PI) / 180, p.iu),
                })
              }
            >
              {t('tools.j2_drift.preset_sso')}
            </PresetChip>
          </FieldPresets>

          <FieldNote>
            {t('tools.j2_drift.model_note', { j2: EARTH_J2.toExponential(4) })}
          </FieldNote>
        </ParamsGrid>
      }
      results={
        !rates ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.raan')}
              value={formatNumber(rates.Om_deg_day, 5)}
              unit="°/day"
              accent
            />
            <ResultCard
              label={t('fields.arg_periapsis')}
              value={formatNumber(rates.om_deg_day, 5)}
              unit="°/day"
            />
            <ResultCard
              label={t('fields.mean_motion_n')}
              value={formatNumber(((rates.n * 180) / Math.PI) * 86400, 4)}
              unit="°/day"
            />
            <ResultCard
              label={t('fields.raan_period')}
              si={rates.T_raan ? rates.T_raan : NaN}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
            />
            <ResultCard label={t('fields.si')} value={formatNumber(rates.Om, 6)} unit="rad/s" />
            <ResultCard label={t('fields.si_2')} value={formatNumber(rates.om, 6)} unit="rad/s" />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="j2-drift"
          values={{
            a: a_m,
            i: i_rad,
            mu: body.mu,
            R: body.radius,
            e: p.e,
            body: p.body,
          }}
        />
      }
    />
  )
}
