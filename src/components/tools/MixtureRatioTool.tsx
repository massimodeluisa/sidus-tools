import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  mixtureRatio,
  totalMassFlow,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

/** Defaults = LOX/LH2-class O/F ≈ 6 (mdot units arbitrary; ratio is scale-free). */
const SCHEMA = {
  mox: numParam(60,{min:0}),
  mfuel: numParam(10,{min:0}),
} as const

const MIX_PRESETS = [
  { labelKey: 'fields.preset_lox_rp1' as const, mox: 2.3, mfuel: 1 },
  { labelKey: 'fields.preset_lox_ch4' as const, mox: 3.5, mfuel: 1 },
  { labelKey: 'fields.preset_lox_lh2' as const, mox: 6.0, mfuel: 1 },
  { labelKey: 'fields.preset_n2o4_mmh' as const, mox: 2.0, mfuel: 1 },
] as const

export function MixtureRatioTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    const r=mixtureRatio(p.mox,p.mfuel);const mdot=totalMassFlow(p.mox,p.mfuel);return r!=null&&mdot!=null?{r,mdot}:null
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.mox')} type="number" min={0}  step="any" value={p.mox} onChange={(e)=>setP({mox:Number(e.target.value)})} />
          <UiField label={t('fields.mfuel')} type="number" min={0}  step="any" value={p.mfuel} onChange={(e)=>setP({mfuel:Number(e.target.value)})} />
          <FieldPresets label={t('common.presets')}>
            {MIX_PRESETS.map((pr) => (
              <PresetChip key={pr.labelKey} onClick={() => setP({ mox: pr.mox, mfuel: pr.mfuel })}>
                {t(pr.labelKey)}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.o_f')} value={formatNumber(res.r,6)} accent />
            <ResultCard label={t('fields.mdot')} value={formatNumber(res.mdot,6)} unit="kg/s" />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="mixture-ratio"
          values={{ ...p }}
        />
      }
    />
  )
}
