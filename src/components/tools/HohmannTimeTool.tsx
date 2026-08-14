import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, getBody, hohmannTransfer, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'
const SCHEMA = { body: strParam('earth', BODIES.map(b=>b.id)), h1: numParam(200,{min:0}), h2: numParam(35786,{min:0}), hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const
export function HohmannTimeTool() {
  const { t } = useTranslation()
  const [p,setP]=useToolSearchParams(SCHEMA); const body=getBody(p.body)
  const h1=toSi(p.h1,p.hu); const h2=toSi(p.h2,p.hu)
  const r1=body.radius+h1; const r2=body.radius+h2
  const res=useMemo(()=>{ if(r1===r2) return null; return hohmannTransfer(body.mu,r1,r2)},[body.mu,r1,r2])
  return <ToolShell parameters={<ParamsGrid><BodySelect value={p.body} onChange={body=>setP({body})}/><UiUnitField label={t('fields.h1')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h1} min={0} onValueChange={h1=>setP({h1})} onUnitChange={(hu,h1)=>setP({hu,h1})}/><UiUnitField label={t('fields.h2')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h2} min={0} onValueChange={h2=>setP({h2})} onUnitChange={(hu,h2)=>setP({hu,h2})}/></ParamsGrid>}
    results={res?<div className="grid gap-3 sm:grid-cols-2"><ResultCard label={t('fields.tof')} si={res.tof} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} accent/><ResultCard label={t('fields.delta_v_total')} si={res.dvTotal} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4}/><ResultCard label={t('fields.a_transfer')} si={res.a} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={1}/></div>:<p className="font-mono text-sm text-muted">{t('fields.need_different_radii')}</p>}
    code={<CodeExport formulaId="hohmann-time" values={{ h1, h2, mu: body.mu, R: body.radius, body: p.body }} />}/>
}
