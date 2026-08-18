import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { BODIES, fromSi, getBody, orbitalPeriod, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'
const SCHEMA = { body: strParam('earth', BODIES.map(b=>b.id)), h1: numParam(400,{min:0}), h2: numParam(410,{min:0}), hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const
export function RelativePeriodTool() {
  const { t } = useTranslation()
  const [p,setP]=useToolSearchParams(SCHEMA)
  const body=getBody(p.body)
  const r1=body.radius+toSi(p.h1,p.hu); const r2=body.radius+toSi(p.h2,p.hu)
  const res=useMemo(()=>{ if(r1===r2) return null; const T1=orbitalPeriod(body.mu,r1); const T2=orbitalPeriod(body.mu,r2); return {T1,T2,dT:T2-T1,beats:1/Math.abs(1/T1-1/T2)} },[body.mu,r1,r2])
  function changeAltitudeUnit(hu: string) {
    setP({
      hu,
      h1: fromSi(toSi(p.h1, p.hu), hu),
      h2: fromSi(toSi(p.h2, p.hu), hu),
    })
  }
  return <ToolShell parameters={<ParamsGrid><BodySelect value={p.body} onChange={b=>setP({body:b})}/><UiUnitField label={t('fields.h1')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h1} min={0} onValueChange={h1=>setP({h1})} onUnitChange={(hu)=>changeAltitudeUnit(hu)}/><UiUnitField label={t('fields.h2')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h2} min={0} onValueChange={h2=>setP({h2})} onUnitChange={(hu)=>changeAltitudeUnit(hu)}/></ParamsGrid>}
    results={res?<div className="sidus-results"><ResultCard label={t('fields.t_4')} si={Math.abs(res.dT)} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} accent/><ResultCard label={t('fields.beat_synodic')} si={res.beats} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4}/><ResultCard label={t('fields.t1')} si={res.T1} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4}/><ResultCard label={t('fields.t2')} si={res.T2} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4}/></div>:<p className="font-mono text-sm text-muted">{t('fields.need_different_altitudes')}</p>}
    code={<CodeExport formulaId="relative-period" values={{ h1: toSi(p.h1, p.hu), h2: toSi(p.h2, p.hu), mu: body.mu, R: body.radius, body: p.body }} />}/>
}
