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
  isentropicNozzle,
  isentropicExitVelocity,
  ispFromExitVelocity,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  gamma: numParam(1.2,{min:1.01}),
  R: numParam(350,{min:1}),
  Tc: numParam(3500,{min:0}),
  Tcu: strParam('K', TOOL_UNIT_SETS.temperature),
  pepc: numParam(0.01,{min:0.000001}),
} as const

export function IsentropicNozzleTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const Tc=toSi(p.Tc,p.Tcu)
    const n=isentropicNozzle({gamma:p.gamma,peOverPc:p.pepc});const ve=isentropicExitVelocity(p.gamma,p.R,Tc,p.pepc);const isp=ve!=null?ispFromExitVelocity(ve):null;return n&&ve!=null&&isp!=null?{...n,ve,isp}:null
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.gamma')} type="number" min={1.01}  step="any" value={p.gamma} onChange={(e)=>setP({gamma:Number(e.target.value)})} />
          <UiField label={t('fields.disc_r')} type="number" min={1}  step="any" value={p.R} onChange={(e)=>setP({R:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_tc')} category="temperature" unitIds={TOOL_UNIT_SETS.temperature} unitId={p.Tcu} value={p.Tc} min={0} onValueChange={(Tc)=>setP({Tc})} onUnitChange={(Tcu,Tc)=>setP({Tcu,Tc})} />
          <UiField label={t('fields.pepc')} type="number" min={0.000001}  step="any" value={p.pepc} onChange={(e)=>setP({pepc:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_me')} value={formatNumber(res.Me,6)} accent />
            <ResultCard label={t('fields.ae_at')} value={formatNumber(res.areaRatio,6)} />
            <ResultCard label={t('fields.disc_ve')} si={res.ve} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.isp')} value={formatNumber(res.isp,4)} unit="s" />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="isentropic-nozzle"
          values={{ ...p, Tc: toSi(p.Tc, p.Tcu) }}
        />
      }
    />
  )
}
