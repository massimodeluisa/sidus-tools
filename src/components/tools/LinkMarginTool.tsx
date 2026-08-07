import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  linkMarginDb,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  cn0: numParam(55),
  req: numParam(45),
} as const

export function LinkMarginTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return linkMarginDb(p.cn0,p.req)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.cn0')} type="number"   step="any" value={p.cn0} onChange={(e)=>setP({cn0:Number(e.target.value)})} />
          <UiField label={t('fields.req')} type="number"   step="any" value={p.req} onChange={(e)=>setP({req:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.margin')} value={formatNumber(res,4)} unit="dB" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="link-margin"
          values={{ ...p }}
        />
      }
    />
  )
}
