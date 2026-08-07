import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  jacobiConstant,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  x: numParam(0.8),
  y: numParam(0),
  vx: numParam(0),
  vy: numParam(0.2),
  mu: numParam(0.01215,{min:1e-9}),
} as const

export function Cr3bpJacobiTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return jacobiConstant(p.x,p.y,p.vx,p.vy,p.mu)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_x')} type="number"   step="any" value={p.x} onChange={(e)=>setP({x:Number(e.target.value)})} />
          <UiField label={t('fields.disc_y')} type="number"   step="any" value={p.y} onChange={(e)=>setP({y:Number(e.target.value)})} />
          <UiField label={t('fields.disc_vx')} type="number"   step="any" value={p.vx} onChange={(e)=>setP({vx:Number(e.target.value)})} />
          <UiField label={t('fields.disc_vy')} type="number"   step="any" value={p.vy} onChange={(e)=>setP({vy:Number(e.target.value)})} />
          <UiField label={t('fields.disc_mu')} type="number" min={1e-9}  step="any" value={p.mu} onChange={(e)=>setP({mu:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_c')} value={formatNumber(res,6)} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="cr3bp-jacobi"
          values={{ ...p }}
        />
      }
    />
  )
}
