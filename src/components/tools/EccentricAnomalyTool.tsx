import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

function nuFromE(E: number, e: number) {
  const c = (Math.cos(E) - e) / (1 - e * Math.cos(E))
  return Math.acos(Math.min(1, Math.max(-1, c))) * (Math.sin(E) >= 0 ? 1 : -1)
}

const SCHEMA = {
  e: numParam(0.2, { min: 0, max: 0.999 }),
  E: numParam(60),
  Eu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function EccentricAnomalyTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const Er = toSi(p.E, p.Eu)
  const res = useMemo(() => {
    const M = Er - p.e * Math.sin(Er)
    const nu = nuFromE(Er, p.e)
    return { M, nu }
  }, [p.e, Er])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField
            label={t('fields.e')}
            type="number"
            value={p.e}
            min={0}
            max={0.999}
            step={0.001}
            onChange={(e) => setP({ e: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.eccentric_anomaly_e')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.Eu}
            value={p.E}
            onValueChange={(E) => setP({ E })}
            onUnitChange={(Eu, E) => setP({ Eu, E })}
          />
        </ParamsGrid>
      }
      results={
        <div className="sidus-results">
          <ResultCard
            label={t('fields.mean_anomaly_m')}
            si={res.M}
            category="angle"
            unitId="deg"
            unitIds={TOOL_UNIT_SETS.angle}
            digits={4}
            accent
          />
          <ResultCard
            label={t('fields.true_anomaly')}
            si={res.nu}
            category="angle"
            unitId="deg"
            unitIds={TOOL_UNIT_SETS.angle}
            digits={4}
          />
        </div>
      }
      code={<CodeExport formulaId="eccentric-anomaly" values={{ e: p.e, E: Er, Ea: Er }} />}
    />
  )
}
