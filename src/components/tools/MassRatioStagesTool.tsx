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

const SCHEMA = {
  R: numParam(3, { min: 1.01 }),
  N: numParam(3, { min: 1 }),
  eps: numParam(0.1, { min: 0, max: 0.5 }),
  payload: numParam(1000, { min: 0.001 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
} as const

export function MassRatioStagesTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const payload = toSi(p.payload, p.mu)
  const res = useMemo(() => {
    const n = Math.round(p.N)
    const grossOverPayload = p.R ** n
    const gross = payload * grossOverPayload
    return { n, grossOverPayload, gross }
  }, [p.N, p.R, payload])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField
            label={t('fields.stage_mass_ratio_r_m0_mf')}
            type="number"
            value={p.R}
            min={1.01}
            step={0.01}
            onChange={(e) => setP({ R: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.stages_n')}
            type="number"
            value={p.N}
            min={1}
            onChange={(e) => setP({ N: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.payload_mass')}
            category="mass"
            unitIds={TOOL_UNIT_SETS.mass}
            unitId={p.mu}
            value={p.payload}
            min={0.001}
            onValueChange={(payload) => setP({ payload })}
            onUnitChange={(mu, payload) => setP({ mu, payload })}
          />
          <UiField
            label={t('fields.structural_info')}
            type="number"
            value={p.eps}
            min={0}
            max={0.5}
            step={0.01}
            onChange={(e) => setP({ eps: Number(e.target.value) })}
            hint={t('fields.hint_mass_ratio_design')}
          />
        </ParamsGrid>
      }
      results={
        <div className="sidus-results">
          <ResultCard label={t('fields.gross_payload_ideal')} value={res.grossOverPayload.toFixed(2)} accent />
          <ResultCard
            label={t('fields.gross_mass')}
            si={res.gross}
            category="mass"
            unitId="kg"
            unitIds={TOOL_UNIT_SETS.mass}
            digits={0}
          />
          <ResultCard label={t('fields.stages')} value={String(res.n)} />
        </div>
      }
      code={<CodeExport formulaId="mass-ratio-stack" values={{ payload, R: p.R, N: p.N, eps: p.eps }} />}
    />
  )
}
