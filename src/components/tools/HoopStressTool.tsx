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
  hoopStress,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  press: numParam(10,{min:0}),
  pressu: strParam('bar', TOOL_UNIT_SETS.pressure),
  rad: numParam(0.5,{min:0.000001}),
  thk: numParam(0.005,{min:1e-9}),
} as const

export function HoopStressTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const press=toSi(p.press,p.pressu)
    return hoopStress(press,p.rad,p.thk)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.press')} category="pressure" unitIds={TOOL_UNIT_SETS.pressure} unitId={p.pressu} value={p.press} min={0} onValueChange={(press)=>setP({press})} onUnitChange={(pressu,press)=>setP({pressu,press})} />
          <UiField label={t('fields.rad')} type="number" min={0.000001}  step="any" value={p.rad} onChange={(e)=>setP({rad:Number(e.target.value)})} />
          <UiField label={t('fields.thk')} type="number" min={1e-9}  step="any" value={p.thk} onChange={(e)=>setP({thk:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.sigma')} value={formatNumber(res,4)} unit="Pa" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="hoop-stress"
          values={{ ...p, press: toSi(p.press, p.pressu) }}
        />
      }
    />
  )
}
