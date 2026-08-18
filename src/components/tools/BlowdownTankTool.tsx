import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  toSi,
  blowdownPressureIsothermal,
  blowdownPressureIsentropic,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  p1: numParam(20,{min:0}),
  p1u: strParam('bar', TOOL_UNIT_SETS.pressure),
  V1: numParam(0.02,{min:1e-9}),
  V2: numParam(0.05,{min:1e-9}),
  gamma: numParam(1.4,{min:1.01}),
  mode: strParam('isothermal', ["isothermal","isentropic"] as const),
} as const

export function BlowdownTankTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const p1=toSi(p.p1,p.p1u)
    return p.mode==='isentropic'?blowdownPressureIsentropic(p1,p.V1,p.V2,p.gamma):blowdownPressureIsothermal(p1,p.V1,p.V2)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_p1')} category="pressure" unitIds={TOOL_UNIT_SETS.pressure} unitId={p.p1u} value={p.p1} min={0} onValueChange={(p1)=>setP({p1})} onUnitChange={(p1u,p1)=>setP({p1u,p1})} />
          <UiField label={t('fields.disc_v1')} type="number" min={1e-9}  step="any" value={p.V1} onChange={(e)=>setP({V1:Number(e.target.value)})} />
          <UiField label={t('fields.disc_v2')} type="number" min={1e-9}  step="any" value={p.V2} onChange={(e)=>setP({V2:Number(e.target.value)})} />
          <UiField label={t('fields.gamma')} type="number" min={1.01}  step="any" value={p.gamma} onChange={(e)=>setP({gamma:Number(e.target.value)})} />
          <UiSelect label={t('fields.disc_mode')} value={p.mode} onChange={(e)=>setP({mode:e.target.value})} options={[{value:'isothermal',label:t('fields.isothermal')},{value:'isentropic',label:t('fields.isentropic')}]} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_p2')} value={formatNumber(res,4)} unit="Pa" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="blowdown-tank"
          values={{ ...p, p1: toSi(p.p1, p.p1u) }}
        />
      }
    />
  )
}
