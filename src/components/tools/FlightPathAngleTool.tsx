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
  flightPathAngle,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  e: numParam(0.2,{min:0}),
  nu: numParam(45,{min:0}),
  nuu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function FlightPathAngleTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const nu=toSi(p.nu,p.nuu)
    return flightPathAngle(p.e,nu)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_e')} type="number" min={0}  step="any" value={p.e} onChange={(e)=>setP({e:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_nu')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.nuu} value={p.nu} min={0} onValueChange={(nu)=>setP({nu})} onUnitChange={(nuu,nu)=>setP({nuu,nu})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.phi')} si={res} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="flight-path-angle"
          values={{ ...p, nu: toSi(p.nu, p.nuu) }}
        />
      }
    />
  )
}
