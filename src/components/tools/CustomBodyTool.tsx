import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  G,
  SOLAR_MASS,
  circularOrbitVelocity,
  escapeVelocity,
  fromSi,
  localGravity,
  muFromMass,
  sphereOfInfluence,
  surfaceGravity,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  M: numParam(5.9722e24, { min: 1e10 }),
  Mu: strParam('kg', TOOL_UNIT_SETS.mass),
  R: numParam(6378.137, { min: 0.001 }),
  Ru: strParam('km', TOOL_UNIT_SETS.length),
  h: numParam(0, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  aParent: numParam(1, { min: 0.001 }),
  aPu: strParam('au', TOOL_UNIT_SETS.length),
  Mparent: numParam(1.98847e30, { min: 1e20 }),
} as const

export function CustomBodyTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const M = toSi(p.M, p.Mu)
  const Mparent = toSi(p.Mparent, p.Mu)
  const R = toSi(p.R, p.Ru)
  const h = toSi(p.h, p.hu)
  const aP = toSi(p.aParent, p.aPu)

  const res = useMemo(() => {
    const mu = muFromMass(M)
    if (mu == null || !(R > 0)) return null
    const r = R + h
    const g = surfaceGravity(mu, R)
    const gLoc = localGravity(mu, r)
    const vesc = escapeVelocity(mu, r)
    const vc = circularOrbitVelocity(mu, r)
    const soi = sphereOfInfluence(aP, M, Mparent)
    return { mu, g, gLoc, vesc, vc, r, soi, massRatio: M / SOLAR_MASS }
  }, [M, Mparent, R, h, aP])

  function changeMassUnit(Mu: string) {
    setP({
      Mu,
      M: fromSi(toSi(p.M, p.Mu), Mu),
      Mparent: fromSi(toSi(p.Mparent, p.Mu), Mu),
    })
  }

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.mass_m')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.Mu}
            value={p.M}
            min={1e10}
            onValueChange={(M) => setP({ M })}
            onUnitChange={(Mu) => changeMassUnit(Mu)}
            hint={t('fields.hint_body_mass')}
          />
          <UiUnitField
            label={t('fields.mean_radius_r')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.Ru}
            value={p.R}
            min={0.001}
            onValueChange={(R) => setP({ R })}
            onUnitChange={(Ru, R) => setP({ Ru, R })}
          />
          <UiUnitField
            label={t('fields.altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
          />
          <UiUnitField
            label={t('fields.orbital_a_about_primary')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.aPu}
            value={p.aParent}
            min={0.001}
            onValueChange={(aParent) => setP({ aParent })}
            onUnitChange={(aPu, aParent) => setP({ aPu, aParent })}
            hint={t('fields.hint_soi_parent')}
          />
          <UiUnitField
            label={t('fields.primary_mass')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.Mu}
            value={p.Mparent}
            min={1e20}
            onValueChange={(Mparent) => setP({ Mparent })}
            onUnitChange={(Mu) => changeMassUnit(Mu)}
            hint={t('fields.hint_solar_mass')}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard label={t('fields.gm')} value={res.mu.toExponential(6)} unit="m³/s²" accent />
            {res.g != null ? (
              <ResultCard
                label={t('fields.g_surface')}
                si={res.g}
                category="accel"
                unitId="mps2"
                unitIds={TOOL_UNIT_SETS.accel}
                digits={4}
              />
            ) : null}
            <ResultCard
              label={t('fields.v_esc_r')}
              si={res.vesc}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.v_circ_r')}
              si={res.vc}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.g_local_r')}
              si={res.gLoc}
              category="accel"
              unitId="mps2"
              unitIds={TOOL_UNIT_SETS.accel}
              digits={4}
            />
            {res.soi != null ? (
              <ResultCard
                label={t('fields.r_soi')}
                si={res.soi}
                category="length"
                unitId="km"
                unitIds={TOOL_UNIT_SETS.length}
                digits={2}
              />
            ) : null}
            <ResultCard label={t('fields.m_m_sun')} value={res.massRatio.toExponential(4)} />
            <ResultCard label={t('fields.g_used_2')} value={G.toExponential(4)} unit="m³/(kg·s²)" />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_mass_or_radius')}</p>
        )
      }
      code={
        <CodeExport
          formulaId="custom-body"
          values={{
            M,
            M_primary: Mparent,
            Mparent,
            R,
            r: R + h,
            a: aP,
            m: M,
            h,
            aP,
          }}
        />
      }
    />
  )
}
