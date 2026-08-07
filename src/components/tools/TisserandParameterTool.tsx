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
  tisserandParameter,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  a: numParam(1.2,{min:0}),
  au: strParam('au', TOOL_UNIT_SETS.length),
  e: numParam(0.2,{min:0}),
  i: numParam(5,{min:0}),
  iu: strParam('deg', TOOL_UNIT_SETS.angle),
  ap: numParam(1,{min:0}),
  apu: strParam('au', TOOL_UNIT_SETS.length),
} as const

export function TisserandParameterTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const a=toSi(p.a,p.au)
    const i=toSi(p.i,p.iu)
    const ap=toSi(p.ap,p.apu)
    return tisserandParameter(a,p.e,i,ap)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_a_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.au} value={p.a} min={0} onValueChange={(a)=>setP({a})} onUnitChange={(au,a)=>setP({au,a})} />
          <UiField label={t('fields.disc_e')} type="number" min={0}  step="any" value={p.e} onChange={(e)=>setP({e:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_i_2')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.iu} value={p.i} min={0} onValueChange={(i)=>setP({i})} onUnitChange={(iu,i)=>setP({iu,i})} />
          <UiUnitField label={t('fields.disc_ap')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.apu} value={p.ap} min={0} onValueChange={(ap)=>setP({ap})} onUnitChange={(apu,ap)=>setP({apu,ap})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_t')} value={formatNumber(res,6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="tisserand-parameter"
          values={{ ...p, a: toSi(p.a, p.au), i: toSi(p.i, p.iu), ap: toSi(p.ap, p.apu) }}
        />
      }
    />
  )
}
