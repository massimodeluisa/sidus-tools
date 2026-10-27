import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { TOOL_UNIT_SETS, toSi, saastamoinenTropoDelay } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/use-tool-search-params'

/** Page pressures are hPa. The core and the export take pascals. */
const HPA_TO_PA = 100

const SCHEMA = {
  elev: numParam(30, { min: 0 }),
  elevu: strParam('deg', TOOL_UNIT_SETS.angle),
  p: numParam(1013.25, { min: 0 }),
  T: numParam(288.15, { min: 0 }),
  Tu: strParam('K', TOOL_UNIT_SETS.temperature),
  e: numParam(11, { min: 0 }),
} as const

export function GnssTroposphereDelayTool() {
  const { t } = useTranslation()
  const [params, setParams] = useToolSearchParams(SCHEMA)
  const si = useMemo(() => {
    const elev = toSi(params.elev, params.elevu)
    const pPa = params.p * HPA_TO_PA
    const tK = toSi(params.T, params.Tu)
    const ePa = params.e * HPA_TO_PA
    return { elev, pPa, tK, ePa }
  }, [params])
  const res = useMemo(
    () => saastamoinenTropoDelay(si.elev, si.pPa, si.tK, si.ePa),
    [si],
  )

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.elev')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={params.elevu} value={params.elev} min={0} hint={t('fields.tropo_elev_domain')} onValueChange={(elev) => setParams({ elev })} onUnitChange={(elevu, elev) => setParams({ elevu, elev })} />
          <UiField label={t('fields.total_pressure')} unit="hPa" type="number" min={0} step="any" value={params.p} onChange={(event) => setParams({ p: Number(event.target.value) })} />
          <UiUnitField label={t('fields.temperature')} category="temperature" unitIds={TOOL_UNIT_SETS.temperature} unitId={params.Tu} value={params.T} min={0} onValueChange={(T) => setParams({ T })} onUnitChange={(Tu, T) => setParams({ Tu, T })} />
          <UiField label={t('fields.vapour_partial_pressure')} unit="hPa" type="number" min={0} step="any" value={params.e} onChange={(event) => setParams({ e: Number(event.target.value) })} />
        </ParamsGrid>
      }
      results={
        <>
          {res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
            <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
          ) : (
            <div className="sidus-results">
              <ResultCard label={t('fields.delay')} si={res} category="length" unitId="m" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
            </div>
          )}
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">{t('fields.tropo_subtract_hint')}</p>
        </>
      }
      code={
        res == null ? null : (
          <CodeExport
            formulaId="gnss-troposphere-delay"
            values={{ elev: si.elev, p: si.pPa, T: si.tK, e: si.ePa }}
          />
        )
      }
    />
  )
}
