import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldNote } from '@/components/shared/Field'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  ballisticCoefficient,
  circularOrbitVelocity,
  dragDeltaVPerRev,
  exponentialDensity,
  getBody,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('earth', BODIES.map((b) => b.id)),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  m: numParam(500, { min: 0.001 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  Cd: numParam(2.2, { min: 0.001 }),
  A: numParam(5, { min: 0.001 }),
  Au: strParam('m2', TOOL_UNIT_SETS.area),
  // Thermosphere-class exponential: ρ0 chosen so ρ(400 km) ≈ 2×10⁻¹² kg/m³
  // with H ≈ 60 km  (ρ = ρ0 exp(−h/H) ⇒ ρ0 ≈ 2e-12 · exp(400/60) ≈ 1.6e-9).
  rho0: numParam(1.6e-9, { min: 0 }),
  rhou: strParam('kgm3', TOOL_UNIT_SETS.density),
  // Thermosphere scale height class (not tropospheric 8.5 km)
  H: numParam(60, { min: 0.001 }),
  Hu: strParam('km', TOOL_UNIT_SETS.altitude),
} as const

export function BallisticDragTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const h = toSi(p.h, p.hu)
  const m = toSi(p.m, p.mu)
  const A = toSi(p.A, p.Au)
  const rho0 = toSi(p.rho0, p.rhou)
  const H = toSi(p.H, p.Hu)
  const r = body.radius + h
  const res = useMemo(() => {
    const beta = ballisticCoefficient(m, p.Cd, A)
    const rho = exponentialDensity(h, rho0, H)
    if (beta == null || rho == null) return null
    const v = circularOrbitVelocity(body.mu, r)
    const dv = dragDeltaVPerRev(rho, v, r, beta)
    return { beta, rho, v, dv }
  }, [body.mu, r, h, m, p.Cd, A, rho0, H])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
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
            label={t('fields.mass')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.m}
            min={0.001}
            onValueChange={(m) => setP({ m })}
            onUnitChange={(mu, m) => setP({ mu, m })}
          />
          <UiField
            label={t('fields.drag_coeff')}
            type="number"
            value={p.Cd}
            min={0.001}
            step="any"
            onChange={(e) => setP({ Cd: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.area_a')}
            category="area"
            unitIds={TOOL_UNIT_SETS.area}
            unitId={p.Au}
            value={p.A}
            min={0.001}
            onValueChange={(A) => setP({ A })}
            onUnitChange={(Au, A) => setP({ Au, A })}
          />
          <UiUnitField
            label={t('fields.rho0_ref')}
            category="density"
            unitIds={TOOL_UNIT_SETS.density}
            unitId={p.rhou}
            value={p.rho0}
            min={0}
            onValueChange={(rho0) => setP({ rho0 })}
            onUnitChange={(rhou, rho0) => setP({ rhou, rho0 })}
          />
          <UiUnitField
            label={t('fields.scale_height')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.Hu}
            value={p.H}
            min={0.001}
            onValueChange={(H) => setP({ H })}
            onUnitChange={(Hu, H) => setP({ Hu, H })}
          />
          <FieldNote>{t('fields.ballistic_drag_note')}</FieldNote>
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.beta_ballistic')}
              value={res.beta.toFixed(2)}
              unit="kg/m²"
              accent
            />
            <ResultCard
              label={t('fields.rho_at_h')}
              si={res.rho}
              category="density"
              unitId="kgm3"
              unitIds={TOOL_UNIT_SETS.density}
              digits={4}
            />
            <ResultCard
              label={t('fields.v_circ')}
              si={res.v}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            {res.dv != null ? (
              <ResultCard
                label={t('fields.dv_per_rev')}
                si={res.dv}
                category="velocity"
                unitId="mps"
                unitIds={TOOL_UNIT_SETS.velocity}
                digits={4}
              />
            ) : null}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        )
      }
      code={
        <CodeExport
          formulaId="ballistic-drag"
          values={{
            h,
            m,
            A,
            rho0,
            H,
            r,
            mu: body.mu,
            R: body.radius,
            Cd: p.Cd,
            body: p.body,
          }}
        />
      }
    />
  )
}
