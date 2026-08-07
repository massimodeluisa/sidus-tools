import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  ebN0FromCn0,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  cn0: numParam(50,{min:0.000001}),
  rb: numParam(1000,{min:1}),
} as const

export function TtcEbnoTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    const lin=10**(p.cn0/10);const eb=ebN0FromCn0(lin,p.rb);return eb!=null?{eb,ebDb:10*Math.log10(eb)}:null
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.cn0')} type="number" min={0.000001}  step="any" value={p.cn0} onChange={(e)=>setP({cn0:Number(e.target.value)})} />
          <UiField label={t('fields.disc_rb')} type="number" min={1}  step="any" value={p.rb} onChange={(e)=>setP({rb:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.ebn0')} value={formatNumber(res.eb,6)} accent />
            <ResultCard label={t('fields.ebn0_db')} value={formatNumber(res.ebDb,4)} unit="dB" />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="ttc-ebno"
          values={{ ...p }}
        />
      }
    />
  )
}
