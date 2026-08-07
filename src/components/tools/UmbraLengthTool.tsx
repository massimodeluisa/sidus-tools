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
  umbraLength,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  d: numParam(1,{min:0}),
  du: strParam('au', TOOL_UNIT_SETS.length),
  Rs: numParam(696000,{min:0}),
  Rsu: strParam('km', TOOL_UNIT_SETS.length),
  Rb: numParam(6378,{min:0}),
  Rbu: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function UmbraLengthTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const d=toSi(p.d,p.du)
    const Rs=toSi(p.Rs,p.Rsu)
    const Rb=toSi(p.Rb,p.Rbu)
    return umbraLength(d,Rs,Rb)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_d_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.du} value={p.d} min={0} onValueChange={(d)=>setP({d})} onUnitChange={(du,d)=>setP({du,d})} />
          <UiUnitField label={t('fields.disc_rs')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.Rsu} value={p.Rs} min={0} onValueChange={(Rs)=>setP({Rs})} onUnitChange={(Rsu,Rs)=>setP({Rsu,Rs})} />
          <UiUnitField label={t('fields.disc_rb_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.Rbu} value={p.Rb} min={0} onValueChange={(Rb)=>setP({Rb})} onUnitChange={(Rbu,Rb)=>setP({Rbu,Rb})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_l')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="umbra-length"
          values={{ ...p, d: toSi(p.d, p.du), Rs: toSi(p.Rs, p.Rsu), Rb: toSi(p.Rb, p.Rbu) }}
        />
      }
    />
  )
}
