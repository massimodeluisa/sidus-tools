import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { exponentialDensity, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  h: numParam(100_000, { min: 0 }),
  hu: strParam('m', TOOL_UNIT_SETS.altitude),
  rho0: numParam(1.225, { min: 0 }),
  rhou: strParam('kgm3', TOOL_UNIT_SETS.density),
  H: numParam(8500, { min: 1 }),
  Hu: strParam('m', TOOL_UNIT_SETS.length),
} as const

export function ScaleHeightTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const h = toSi(p.h, p.hu)
  const rho0 = toSi(p.rho0, p.rhou)
  const H = toSi(p.H, p.Hu)
  const rho = useMemo(() => exponentialDensity(h, rho0, H), [h, rho0, H])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
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
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.Hu}
            value={p.H}
            min={1}
            onValueChange={(H) => setP({ H })}
            onUnitChange={(Hu, H) => setP({ Hu, H })}
            hint={t('fields.hint_scale_height')}
          />
        </ParamsGrid>
      }
      results={
        rho != null ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.rho_at_h')}
              si={rho}
              category="density"
              unitId="kgm3"
              unitIds={TOOL_UNIT_SETS.density}
              digits={4}
              accent
            />
            <ResultCard label={t('fields.f__8')} value={(rho / rho0).toExponential(4)} />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_inputs')}</p>
        )
      }
      code={<CodeExport formulaId="scale-height" values={{ h, rho0, H }} />}
    />
  )
}
