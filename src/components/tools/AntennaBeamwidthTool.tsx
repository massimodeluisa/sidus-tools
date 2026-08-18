import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { antennaBeamwidth, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  f: numParam(12, { min: 0.001 }),
  fu: strParam('GHz', TOOL_UNIT_SETS.frequency),
  D: numParam(3, { min: 0.001 }),
  Du: strParam('m', TOOL_UNIT_SETS.lengthSmall),
  k: numParam(70, { min: 1 }),
} as const

export function AntennaBeamwidthTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const fHz = toSi(p.f, p.fu)
  const D = toSi(p.D, p.Du)
  const th = useMemo(() => antennaBeamwidth(fHz, D, p.k), [fHz, D, p.k])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.frequency')}
            category="frequency"
            unitIds={TOOL_UNIT_SETS.frequency}
            unitId={p.fu}
            value={p.f}
            min={0.001}
            onValueChange={(f) => setP({ f })}
            onUnitChange={(fu, f) => setP({ fu, f })}
          />
          <UiUnitField
            label={t('fields.diameter_d')}
            category="length"
            unitIds={TOOL_UNIT_SETS.lengthSmall}
            unitId={p.Du}
            value={p.D}
            min={0.001}
            onValueChange={(D) => setP({ D })}
            onUnitChange={(Du, D) => setP({ Du, D })}
          />
          <UiField
            label={t('fields.k_deg_factor')}
            type="number"
            value={p.k}
            onChange={(e) => setP({ k: Number(e.target.value) })}
            hint={t('fields.hint_beam_k')}
          />
        </ParamsGrid>
      }
      results={
        th != null ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.hpbw')}
              si={th}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={3}
              accent
            />
            <ResultCard
              label={t('fields.f_')}
              si={fHz > 0 ? 299_792_458 / fHz : NaN}
              category="length"
              unitId="cm"
              unitIds={TOOL_UNIT_SETS.lengthSmall}
              digits={3}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_antenna_inputs')}</p>
        )
      }
      code={<CodeExport formulaId="antenna-beamwidth" values={{ fHz, D, f: fHz, k: p.k }} />}
    />
  )
}
