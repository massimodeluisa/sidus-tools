import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { fromSi, saastamoinenTropoDelay, toSi, TOOL_UNIT_SETS } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/use-tool-search-params'

const SCHEMA = {
  elev: numParam(30),
  elevu: strParam('deg', TOOL_UNIT_SETS.angle),
  pHpa: numParam(1013.25, { min: 0 }),
  tK: numParam(288.15, { min: 0 }),
  eHpa: numParam(11, { min: 0 }),
} as const

export function GnssTroposphereDelayTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const elevRad = useMemo(() => toSi(p.elev, p.elevu), [p.elev, p.elevu])
  const delayM = useMemo(
    () => saastamoinenTropoDelay(elevRad, p.pHpa * 100, p.tK, p.eHpa * 100),
    [elevRad, p.pHpa, p.tK, p.eHpa],
  )

  return (
    <ToolShell
      parameters={
        <>
          <p className="mb-3 text-xs text-muted">{t('fields.tropo_model_hint')}</p>
          <ParamsGrid>
            <UiUnitField
              label={t('fields.elev')}
              category="angle"
              unitIds={TOOL_UNIT_SETS.angle}
              unitId={p.elevu}
              value={p.elev}
              min={fromSi((5 * Math.PI) / 180, p.elevu)}
              max={fromSi(Math.PI / 2, p.elevu)}
              onValueChange={(elev) => setP({ elev })}
              onUnitChange={(elevu, elev) => setP({ elevu, elev })}
            />
            <UiField
              label={t('fields.tropo_pressure_hpa')}
              unit="hPa"
              type="number"
              min={0}
              step="any"
              value={p.pHpa}
              onChange={(e) => setP({ pHpa: Number(e.target.value) })}
            />
            <UiField
              label={t('fields.tropo_temp_k')}
              unit="K"
              type="number"
              min={0}
              step="any"
              value={p.tK}
              onChange={(e) => setP({ tK: Number(e.target.value) })}
            />
            <UiField
              label={t('fields.tropo_vapor_hpa')}
              unit="hPa"
              type="number"
              min={0}
              max={p.pHpa}
              step="any"
              value={p.eHpa}
              onChange={(e) => setP({ eHpa: Number(e.target.value) })}
            />
          </ParamsGrid>
        </>
      }
      results={
        delayM == null ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.delay')}
              si={delayM}
              category="length"
              unitId="m"
              unitIds={TOOL_UNIT_SETS.length}
              digits={4}
              accent
            />
          </div>
        )
      }
      code={
        delayM == null ? null : (
          <CodeExport
            formulaId="gnss-troposphere-delay"
            values={{
              elev: elevRad,
              pressurePa: p.pHpa * 100,
              tK: p.tK,
              vaporPressurePa: p.eHpa * 100,
            }}
          />
        )
      }
    />
  )
}
