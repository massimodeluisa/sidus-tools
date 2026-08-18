import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, getBody, specificEnergy, TOOL_UNIT_SETS, toSi, visViva } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'
// ISS-class near-circular LEO: a≈r≈6778 km (evaluate energy + vis-viva at same radius)
const SCHEMA = { body: strParam('earth', BODIES.map(b=>b.id)), a: numParam(6778,{min:0.001}), r: numParam(6778,{min:0.001}), lu: strParam('km', TOOL_UNIT_SETS.length) } as const
export function EnergyTool() {
  const { t } = useTranslation()
  const [p,setP]=useToolSearchParams(SCHEMA); const body=getBody(p.body)
  const a=toSi(p.a,p.lu); const r=toSi(p.r,p.lu)
  const res=useMemo(()=>{ if(!(a>0)||!(r>0)||2/r-1/a<0) return null; return { e: specificEnergy(body.mu,a), v: visViva(body.mu,r,a) }},[body.mu,a,r])
  return <ToolShell parameters={<ParamsGrid><BodySelect value={p.body} onChange={body=>setP({body})}/><UiUnitField label={t('fields.a')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.lu} value={p.a} min={0.001} onValueChange={a=>setP({a})} onUnitChange={(lu,a)=>setP({lu,a})}/><UiUnitField label={t('fields.r_2')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.lu} value={p.r} min={0.001} onValueChange={r=>setP({r})} onUnitChange={(lu,r)=>setP({lu,r})}/></ParamsGrid>}
    results={res?<div className="sidus-results"><ResultCard label={t('fields.f_2a')} si={res.e} category="specificEnergy" unitId="MJpkg" unitIds={TOOL_UNIT_SETS.specificEnergy} digits={4} accent/><ResultCard label={t('fields.v_vis_viva')} si={res.v} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4}/></div>:<p className="font-mono text-sm text-muted">{t('fields.need_bound_orbit')}</p>}
    code={<CodeExport formulaId="orbital-energy" values={{ a, mu: body.mu }} />}/>
}
