import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, escapeVelocity, getBody, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'
const SCHEMA = { body: strParam('jupiter', BODIES.map(b=>b.id)), h: numParam(100000,{min:0}), hu: strParam('km', TOOL_UNIT_SETS.altitude), vinf: numParam(10,{min:0}), vu: strParam('kmps', TOOL_UNIT_SETS.velocity) } as const
export function FlybySpeedTool() {
  const { t } = useTranslation()
  const [p,setP]=useToolSearchParams(SCHEMA); const body=getBody(p.body)
  const r=body.radius+toSi(p.h,p.hu); const vinf=toSi(p.vinf,p.vu)
  const res=useMemo(()=>{ if(!(r>0)||!(vinf>=0)) return null; const vesc=escapeVelocity(body.mu,r); const vp=Math.sqrt(vinf*vinf+vesc*vesc); return {vesc,vp}},[body.mu,r,vinf])
  return <ToolShell parameters={<ParamsGrid><BodySelect value={p.body} onChange={body=>setP({body})}/><UiUnitField label={t('fields.flyby_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={h=>setP({h})} onUnitChange={(hu,h)=>setP({hu,h})}/><UiUnitField label={t('fields.v')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.vinf} min={0} onValueChange={vinf=>setP({vinf})} onUnitChange={(vu,vinf)=>setP({vu,vinf})}/></ParamsGrid>}
    results={res?<div className="grid gap-3 sm:grid-cols-2"><ResultCard label={t('fields.v_p_periapsis')} si={res.vp} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent/><ResultCard label={t('fields.v_esc_at_peri')} si={res.vesc} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4}/></div>:<p className="font-mono text-sm text-muted">{t('fields.invalid_flyby')}</p>}
    code={<CodeExport formulaId="flyby-speed" values={{ r, mu: body.mu, R: body.radius, vinf, body: p.body }} />}/>
}
