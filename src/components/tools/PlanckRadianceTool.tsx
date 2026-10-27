import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { TOOL_UNIT_SETS, planckSpectralRadiance, toSi } from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/use-tool-search-params'

export const PLANCK_SCHEMA = {
  lam: numParam(500, { min: 0 }),
  lamu: strParam('nm', TOOL_UNIT_SETS.wavelength),
  // Display-unit temperature. Do not clamp at 0: °C and °F are negative for T_K > 0.
  T: numParam(5800),
  Tu: strParam('K', TOOL_UNIT_SETS.temperature),
} as const

export function PlanckRadianceTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(PLANCK_SCHEMA)
  const res = useMemo(() => {
    const lam = toSi(p.lam, p.lamu)
    const T = toSi(p.T, p.Tu)
    return planckSpectralRadiance(lam, T)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.lam')}
            category="length"
            unitIds={TOOL_UNIT_SETS.wavelength}
            unitId={p.lamu}
            value={p.lam}
            min={0}
            onValueChange={(lam) => setP({ lam })}
            onUnitChange={(lamu, lam) => setP({ lamu, lam })}
          />
          <UiUnitField
            label={t('fields.temperature')}
            category="temperature"
            unitIds={TOOL_UNIT_SETS.temperature}
            unitId={p.Tu}
            value={p.T}
            min={p.Tu === 'K' ? 0 : undefined}
            onValueChange={(T) => setP({ T })}
            onUnitChange={(Tu, T) => setP({ Tu, T })}
          />
        </ParamsGrid>
      }
      results={
        res == null ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.planck_b')}
              value={formatNumber(res, 6)}
              unit="W/(m²·sr·m)"
              accent
            />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="planck-radiance"
          values={{ lam: toSi(p.lam, p.lamu), T: toSi(p.T, p.Tu) }}
        />
      }
    />
  )
}
