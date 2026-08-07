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
  orbitLifetimeRough,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  rho: numParam(1e-12, { min: 1e-20 }),
  beta: numParam(100, { min: 0.001 }),
  v: numParam(7.5, { min: 0 }),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity),
  H: numParam(50, { min: 0 }),
  Hu: strParam('km', TOOL_UNIT_SETS.length),
  // Circular radius ~ LEO Earth (educational default)
  a: numParam(6778, { min: 0.001 }),
  au: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function OrbitLifetimeRoughTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const v = toSi(p.v, p.vu)
    const H = toSi(p.H, p.Hu)
    const a = toSi(p.a, p.au)
    return orbitLifetimeRough(p.rho, p.beta, v, H, a)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField
            label={t('fields.rho')}
            type="number"
            min={1e-20}
            step="any"
            value={p.rho}
            onChange={(e) => setP({ rho: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.beta')}
            type="number"
            min={0.001}
            step="any"
            value={p.beta}
            onChange={(e) => setP({ beta: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.disc_v_2')}
            category="velocity"
            unitIds={TOOL_UNIT_SETS.velocity}
            unitId={p.vu}
            value={p.v}
            min={0}
            onValueChange={(v) => setP({ v })}
            onUnitChange={(vu, v) => setP({ vu, v })}
          />
          <UiUnitField
            label={t('fields.disc_h_2')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.Hu}
            value={p.H}
            min={0}
            onValueChange={(H) => setP({ H })}
            onUnitChange={(Hu, H) => setP({ Hu, H })}
          />
          <UiUnitField
            label={t('fields.semi_major_axis')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.au}
            value={p.a}
            min={0.001}
            onValueChange={(a) => setP({ a })}
            onUnitChange={(au, a) => setP({ au, a })}
          />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.tlife')}
              si={res}
              category="time"
              unitId="s"
              unitIds={TOOL_UNIT_SETS.time}
              digits={4}
              accent
            />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="orbit-lifetime-rough"
          values={{
            ...p,
            v: toSi(p.v, p.vu),
            H: toSi(p.H, p.Hu),
            a: toSi(p.a, p.au),
          }}
        />
      }
    />
  )
}
