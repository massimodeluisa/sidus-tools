import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  toSi,
  geoStationkeepingDvYear,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  ns: numParam(45,{min:0}),
  nsu: strParam('mps', TOOL_UNIT_SETS.velocity),
  ew: numParam(5,{min:0}),
  ewu: strParam('mps', TOOL_UNIT_SETS.velocity),
} as const

export function GeoStationkeepingDvTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const ns=toSi(p.ns,p.nsu)
    const ew=toSi(p.ew,p.ewu)
    return geoStationkeepingDvYear(ns,ew)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_ns')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.nsu} value={p.ns} min={0} onValueChange={(ns)=>setP({ns})} onUnitChange={(nsu,ns)=>setP({nsu,ns})} />
          <UiUnitField label={t('fields.disc_ew')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.ewu} value={p.ew} min={0} onValueChange={(ew)=>setP({ew})} onUnitChange={(ewu,ew)=>setP({ewu,ew})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.dvns')} si={res.dVNS} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.dvew')} si={res.dVEW} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.dvyear')} si={res.dVYear} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="geo-stationkeeping-dv"
          values={{ ...p, ns: toSi(p.ns, p.nsu), ew: toSi(p.ew, p.ewu) }}
        />
      }
    />
  )
}
