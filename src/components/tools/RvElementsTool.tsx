import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { UiVector3, vec3ToTuple, type Vec3 as UiVec } from '@/components/shared/UiVector3'
import {
  BODIES,
  deg,
  elementsToRv,
  getBody,
  rad,
  rvToElements,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  mode: strParam('rv2el', ['rv2el', 'el2rv'] as const),
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  // LEO-like state (m, m/s): circular equatorial ~400 km
  rx: numParam(6_778_137),
  ry: numParam(0),
  rz: numParam(0),
  vx: numParam(0),
  vy: numParam(7668.6),
  vz: numParam(0),
  // elements: a km, e, angles deg
  a_km: numParam(6778.137),
  e: numParam(0.001),
  i_deg: numParam(51.6),
  raan_deg: numParam(0),
  argp_deg: numParam(0),
  nu_deg: numParam(0),
  ang: strParam('deg', ['deg', 'rad'] as const),
} as const

export function RvElementsTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const toDeg = p.ang === 'deg'

  const rVec: UiVec = { x: p.rx, y: p.ry, z: p.rz }
  const vVec: UiVec = { x: p.vx, y: p.vy, z: p.vz }

  const result = useMemo(() => {
    if (p.mode === 'rv2el') {
      const el = rvToElements(vec3ToTuple(rVec), vec3ToTuple(vVec), body.mu)
      if (!el) return { err: 'cannot_form_elements' as const }
      return { err: null as null, kind: 'el' as const, el }
    }
    const a = p.a_km * 1000
    const i = toDeg ? rad(p.i_deg) : p.i_deg
    const raan = toDeg ? rad(p.raan_deg) : p.raan_deg
    const argp = toDeg ? rad(p.argp_deg) : p.argp_deg
    const nu = toDeg ? rad(p.nu_deg) : p.nu_deg
    const st = elementsToRv(
      { a, e: p.e, i, raan, argp, nu },
      body.mu,
    )
    if (!st) return { err: 'cannot_form_state' as const }
    return { err: null as null, kind: 'rv' as const, st }
  }, [body.mu, p, rVec, toDeg, vVec])

  // Round-trip check when in rv2el
  const roundTrip = useMemo(() => {
    if (!result || result.err || result.kind !== 'el') return null
    const back = elementsToRv(result.el, body.mu)
    if (!back) return null
    const dr = Math.hypot(
      back.r[0] - p.rx,
      back.r[1] - p.ry,
      back.r[2] - p.rz,
    )
    const dv = Math.hypot(
      back.v[0] - p.vx,
      back.v[1] - p.vy,
      back.v[2] - p.vz,
    )
    return { dr, dv }
  }, [body.mu, p.rx, p.ry, p.rz, p.vx, p.vy, p.vz, result])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.mode')}
            value={p.mode}
            onChange={(e) => setP({ mode: e.target.value })}
            options={[
              { value: 'rv2el', label: t('fields.mode_rv2el') },
              { value: 'el2rv', label: t('fields.mode_el2rv') },
            ]}
          />
          <BodySelect
            value={p.body}
            onChange={(body) => setP({ body })}
          />
          <UiSelect
            label={t('fields.angle_unit')}
            value={p.ang}
            onChange={(e) => setP({ ang: e.target.value })}
            options={[
              { value: 'deg', label: t('fields.degrees') },
              { value: 'rad', label: t('fields.radians') },
            ]}
          />
          {p.mode === 'rv2el' ? (
            <>
              <UiVector3
                label={t('fields.position_r')}
                unit="m"
                value={rVec}
                onChange={(v) => setP({ rx: v.x, ry: v.y, rz: v.z })}
              />
              <UiVector3
                label={t('fields.velocity_v_2')}
                unit="m/s"
                value={vVec}
                onChange={(v) => setP({ vx: v.x, vy: v.y, vz: v.z })}
              />
            </>
          ) : (
            <div className="sidus-results">
              <UiField
                label={t('fields.a')}
                unit="km"
                type="number"
                step="any"
                value={p.a_km}
                onChange={(e) => setP({ a_km: Number(e.target.value) })}
              />
              <UiField
                label={t('fields.e')}
                type="number"
                step="any"
                min={0}
                value={p.e}
                onChange={(e) => setP({ e: Number(e.target.value) })}
              />
              <UiField
                label={t('fields.i')}
                unit={toDeg ? 'deg' : 'rad'}
                type="number"
                step="any"
                value={p.i_deg}
                onChange={(e) => setP({ i_deg: Number(e.target.value) })}
              />
              <UiField
                label={t('fields.raan_2')}
                unit={toDeg ? 'deg' : 'rad'}
                type="number"
                step="any"
                value={p.raan_deg}
                onChange={(e) => setP({ raan_deg: Number(e.target.value) })}
              />
              <UiField
                label={t('fields.argp')}
                unit={toDeg ? 'deg' : 'rad'}
                type="number"
                step="any"
                value={p.argp_deg}
                onChange={(e) => setP({ argp_deg: Number(e.target.value) })}
              />
              <UiField
                label={t('fields.true_anomaly_2')}
                unit={toDeg ? 'deg' : 'rad'}
                type="number"
                step="any"
                value={p.nu_deg}
                onChange={(e) => setP({ nu_deg: Number(e.target.value) })}
              />
            </div>
          )}
        </ParamsGrid>
      }
      results={
        !result || result.err ? (
          <p className="font-mono text-sm text-muted">
            {result?.err ? t(`fields.${result.err}`) : t('fields.invalid_params')}
          </p>
        ) : result.kind === 'el' ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.a')}
              value={formatNumber(result.el.a / 1000, 4)}
              unit="km"
              accent
            />
            <ResultCard label={t('fields.e')} value={formatNumber(result.el.e, 6)} />
            <ResultCard
              label={t('fields.i')}
              value={formatNumber(toDeg ? deg(result.el.i) : result.el.i, 4)}
              unit={toDeg ? 'deg' : 'rad'}
            />
            <ResultCard
              label={t('fields.f__6')}
              value={formatNumber(toDeg ? deg(result.el.raan) : result.el.raan, 4)}
              unit={toDeg ? 'deg' : 'rad'}
            />
            <ResultCard
              label={t('fields.f__3')}
              value={formatNumber(toDeg ? deg(result.el.argp) : result.el.argp, 4)}
              unit={toDeg ? 'deg' : 'rad'}
            />
            <ResultCard
              label={t('fields.f__7')}
              value={formatNumber(toDeg ? deg(result.el.nu) : result.el.nu, 4)}
              unit={toDeg ? 'deg' : 'rad'}
            />
            <ResultCard
              label={t('fields.energy')}
              value={formatNumber(result.el.energy, 3)}
              unit="J/kg"
            />
            {roundTrip ? (
              <ResultCard
                label={t('fields.round_trip_r_v')}
                value={`${formatNumber(roundTrip.dr, 4)} m · ${formatNumber(roundTrip.dv, 4)} m/s`}
              />
            ) : null}
          </div>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.r_x_r_y_r_z')}
              value={`${formatNumber(result.st.r[0], 2)}, ${formatNumber(result.st.r[1], 2)}, ${formatNumber(result.st.r[2], 2)}`}
              unit="m"
              accent
            />
            <ResultCard
              label={t('fields.v_x_v_y_v_z')}
              value={`${formatNumber(result.st.v[0], 4)}, ${formatNumber(result.st.v[1], 4)}, ${formatNumber(result.st.v[2], 4)}`}
              unit="m/s"
            />
            <ResultCard
              label={t('fields.r')}
              value={formatNumber(
                Math.hypot(result.st.r[0], result.st.r[1], result.st.r[2]) / 1000,
                4,
              )}
              unit="km"
            />
            <ResultCard
              label={t('fields.v_2')}
              value={formatNumber(
                Math.hypot(result.st.v[0], result.st.v[1], result.st.v[2]) / 1000,
                4,
              )}
              unit="km/s"
            />
          </div>
        )
      }
      code={<CodeExport formulaId="rv-elements" values={{ mu: body.mu, rx: p.rx, ry: p.ry, rz: p.rz, vx: p.vx, vy: p.vy, vz: p.vz, a_km: p.a_km, e: p.e, i_deg: p.i_deg, raan_deg: p.raan_deg, argp_deg: p.argp_deg, nu_deg: p.nu_deg, mode: p.mode, body: p.body, ang: p.ang }} />}
    />
  )
}
