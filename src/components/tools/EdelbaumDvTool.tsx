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
  edelbaumDv,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  v1: numParam(7.7,{min:0}),
  v1u: strParam('kmps', TOOL_UNIT_SETS.velocity),
  v2: numParam(3.1,{min:0}),
  v2u: strParam('kmps', TOOL_UNIT_SETS.velocity),
  di: numParam(28,{min:0}),
  diu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function EdelbaumDvTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const v1=toSi(p.v1,p.v1u)
    const v2=toSi(p.v2,p.v2u)
    const di=toSi(p.di,p.diu)
    return edelbaumDv(v1,v2,di)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_v1_2')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.v1u} value={p.v1} min={0} onValueChange={(v1)=>setP({v1})} onUnitChange={(v1u,v1)=>setP({v1u,v1})} />
          <UiUnitField label={t('fields.disc_v2_2')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.v2u} value={p.v2} min={0} onValueChange={(v2)=>setP({v2})} onUnitChange={(v2u,v2)=>setP({v2u,v2})} />
          <UiUnitField label={t('fields.disc_di_2')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.diu} value={p.di} min={0} onValueChange={(di)=>setP({di})} onUnitChange={(diu,di)=>setP({diu,di})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_dv')} si={res} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="edelbaum-dv"
          values={{ ...p, v1: toSi(p.v1, p.v1u), v2: toSi(p.v2, p.v2u), di: toSi(p.di, p.diu) }}
        />
      }
    />
  )
}
