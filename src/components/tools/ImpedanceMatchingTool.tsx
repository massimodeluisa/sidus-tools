import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  reflectionCoeff,
  vswrFromGamma,
  returnLossDb,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  z0: numParam(50,{min:0.01}),
  zL: numParam(75,{min:0}),
} as const

export function ImpedanceMatchingTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    const g=reflectionCoeff(p.z0,p.zL);if(g==null)return null;const vswr=vswrFromGamma(g);const rl=returnLossDb(g);if(vswr==null||rl==null)return null;return{g,vswr,rl}
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_z0')} type="number" min={0.01}  step="any" value={p.z0} onChange={(e)=>setP({z0:Number(e.target.value)})} />
          <UiField label={t('fields.disc_zl')} type="number" min={0}  step="any" value={p.zL} onChange={(e)=>setP({zL:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.gamma_2')} value={formatNumber(res.g,6)} accent />
            <ResultCard label={t('fields.vswr')} value={formatNumber(res.vswr,6)} />
            <ResultCard label={t('fields.disc_rl')} value={formatNumber(res.rl,4)} unit="dB" />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="impedance-matching"
          values={{ ...p }}
        />
      }
    />
  )
}
