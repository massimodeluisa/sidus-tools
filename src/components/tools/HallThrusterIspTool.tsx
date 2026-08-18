import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  hallExitVelocity,
  ispFromExitVelocity,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  V: numParam(300,{min:1}),
  mIon: numParam(2.18e-25,{min:1e-30}),
} as const

export function HallThrusterIspTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    const ve=hallExitVelocity(p.V,p.mIon);const isp=ve!=null?ispFromExitVelocity(ve):null;return ve!=null&&isp!=null?{ve,isp}:null
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_v')} type="number" min={1}  step="any" value={p.V} onChange={(e)=>setP({V:Number(e.target.value)})} />
          <UiField label={t('fields.mion')} type="number" min={1e-30}  step="any" value={p.mIon} onChange={(e)=>setP({mIon:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_ve')} si={res.ve} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.isp')} value={formatNumber(res.isp,4)} unit="s" />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="hall-thruster-isp"
          values={{ ...p }}
        />
      }
    />
  )
}
