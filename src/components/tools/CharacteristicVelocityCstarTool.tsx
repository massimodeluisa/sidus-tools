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
  characteristicVelocity,
  idealCstar,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

// Defaults yield η_c* ≈ 0.85–0.95 (measured ≤ ideal). Avoid c*_meas > c*_ideal.
// pc·At/mdot ≈ 1.45 km/s; ideal ≈ 1.71 km/s for γ=1.2, R=350, Tc=3500 K.
const SCHEMA = {
  pc: numParam(70,{min:0}),
  pcu: strParam('bar', TOOL_UNIT_SETS.pressure),
  At: numParam(0.05,{min:1e-9}),
  mdot: numParam(250,{min:1e-9}),
  gamma: numParam(1.2,{min:1.01}),
  R: numParam(350,{min:1}),
  Tc: numParam(3500,{min:0}),
  Tcu: strParam('K', TOOL_UNIT_SETS.temperature),
} as const

export function CharacteristicVelocityCstarTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const pc=toSi(p.pc,p.pcu)
    const Tc=toSi(p.Tc,p.Tcu)
    const cMeas=characteristicVelocity(pc,p.At,p.mdot);const cId=idealCstar(p.gamma,p.R,Tc);return cMeas!=null&&cId!=null?{cMeas,cId,eta:cMeas/cId}:null
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_pc')} category="pressure" unitIds={TOOL_UNIT_SETS.pressure} unitId={p.pcu} value={p.pc} min={0} onValueChange={(pc)=>setP({pc})} onUnitChange={(pcu,pc)=>setP({pcu,pc})} />
          <UiField label={t('fields.disc_at')} type="number" min={1e-9}  step="any" value={p.At} onChange={(e)=>setP({At:Number(e.target.value)})} />
          <UiField label={t('fields.mdot')} type="number" min={1e-9}  step="any" value={p.mdot} onChange={(e)=>setP({mdot:Number(e.target.value)})} />
          <UiField label={t('fields.gamma')} type="number" min={1.01}  step="any" value={p.gamma} onChange={(e)=>setP({gamma:Number(e.target.value)})} />
          <UiField label={t('fields.disc_r')} type="number" min={1}  step="any" value={p.R} onChange={(e)=>setP({R:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_tc')} category="temperature" unitIds={TOOL_UNIT_SETS.temperature} unitId={p.Tcu} value={p.Tc} min={0} onValueChange={(Tc)=>setP({Tc})} onUnitChange={(Tcu,Tc)=>setP({Tcu,Tc})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.c_meas')} si={res.cMeas} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.c_ideal')} si={res.cId} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.eta')} value={formatNumber(res.eta,6)} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="characteristic-velocity-cstar"
          values={{ ...p, pc: toSi(p.pc, p.pcu), Tc: toSi(p.Tc, p.Tcu) }}
        />
      }
    />
  )
}
