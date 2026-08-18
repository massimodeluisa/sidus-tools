import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { dragForce, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  rho: numParam(1e-12, { min: 0 }),
  rhou: strParam('kgm3', TOOL_UNIT_SETS.density),
  v: numParam(7.6, { min: 0 }),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity),
  Cd: numParam(2.2, { min: 0.001 }),
  A: numParam(5, { min: 0.001 }),
  Au: strParam('m2', TOOL_UNIT_SETS.area),
  m: numParam(500, { min: 0.001 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
} as const

export function DragForceTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const rho = toSi(p.rho, p.rhou)
  const v = toSi(p.v, p.vu)
  const A = toSi(p.A, p.Au)
  const m = toSi(p.m, p.mu)
  const res = useMemo(() => {
    const F = dragForce(rho, v, p.Cd, A)
    if (F == null || !(m > 0)) return null
    return { F, a: F / m }
  }, [rho, v, p.Cd, A, m])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.density')}
            category="density"
            unitIds={TOOL_UNIT_SETS.density}
            unitId={p.rhou}
            value={p.rho}
            min={0}
            onValueChange={(rho) => setP({ rho })}
            onUnitChange={(rhou, rho) => setP({ rhou, rho })}
          />
          <UiUnitField
            label={t('fields.velocity_v')}
            category="velocity"
            unitIds={TOOL_UNIT_SETS.velocity}
            unitId={p.vu}
            value={p.v}
            min={0}
            onValueChange={(v) => setP({ v })}
            onUnitChange={(vu, v) => setP({ vu, v })}
          />
          <UiField
            label={t('fields.drag_coeff')}
            type="number"
            value={p.Cd}
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
            label={t('fields.mass_for_accel')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.m}
            min={0.001}
            onValueChange={(m) => setP({ m })}
            onUnitChange={(mu, m) => setP({ mu, m })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.drag_force')}
              si={res.F}
              category="force"
              unitId="N"
              unitIds={TOOL_UNIT_SETS.force}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.accel_f_m')}
              si={res.a}
              category="accel"
              unitId="mps2"
              unitIds={TOOL_UNIT_SETS.accel}
              digits={4}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_drag_inputs')}</p>
        )
      }
      code={<CodeExport formulaId="drag-force" values={{ rho, v, A, m, Cd: p.Cd }} />}
    />
  )
}
