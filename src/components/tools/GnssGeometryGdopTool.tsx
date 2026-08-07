import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  gnssDopFromUnitVectors,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  ux1: numParam(1),
  uy1: numParam(0),
  uz1: numParam(0.5),
  ux2: numParam(-0.5),
  uy2: numParam(0.866),
  uz2: numParam(0.5),
  ux3: numParam(-0.5),
  uy3: numParam(-0.866),
  uz3: numParam(0.5),
  ux4: numParam(0),
  uy4: numParam(0),
  uz4: numParam(1),
} as const

export function GnssGeometryGdopTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    
    return gnssDopFromUnitVectors([[p.ux1,p.uy1,p.uz1],[p.ux2,p.uy2,p.uz2],[p.ux3,p.uy3,p.uz3],[p.ux4,p.uy4,p.uz4]])
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.ux1')} type="number"   step="any" value={p.ux1} onChange={(e)=>setP({ux1:Number(e.target.value)})} />
          <UiField label={t('fields.uy1')} type="number"   step="any" value={p.uy1} onChange={(e)=>setP({uy1:Number(e.target.value)})} />
          <UiField label={t('fields.uz1')} type="number"   step="any" value={p.uz1} onChange={(e)=>setP({uz1:Number(e.target.value)})} />
          <UiField label={t('fields.ux2')} type="number"   step="any" value={p.ux2} onChange={(e)=>setP({ux2:Number(e.target.value)})} />
          <UiField label={t('fields.uy2')} type="number"   step="any" value={p.uy2} onChange={(e)=>setP({uy2:Number(e.target.value)})} />
          <UiField label={t('fields.uz2')} type="number"   step="any" value={p.uz2} onChange={(e)=>setP({uz2:Number(e.target.value)})} />
          <UiField label={t('fields.ux3')} type="number"   step="any" value={p.ux3} onChange={(e)=>setP({ux3:Number(e.target.value)})} />
          <UiField label={t('fields.uy3')} type="number"   step="any" value={p.uy3} onChange={(e)=>setP({uy3:Number(e.target.value)})} />
          <UiField label={t('fields.uz3')} type="number"   step="any" value={p.uz3} onChange={(e)=>setP({uz3:Number(e.target.value)})} />
          <UiField label={t('fields.ux4')} type="number"   step="any" value={p.ux4} onChange={(e)=>setP({ux4:Number(e.target.value)})} />
          <UiField label={t('fields.uy4')} type="number"   step="any" value={p.uy4} onChange={(e)=>setP({uy4:Number(e.target.value)})} />
          <UiField label={t('fields.uz4')} type="number"   step="any" value={p.uz4} onChange={(e)=>setP({uz4:Number(e.target.value)})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.gdop')} value={formatNumber(res.gdop,6)} accent />
            <ResultCard label={t('fields.pdop')} value={formatNumber(res.pdop,6)} />
            <ResultCard label={t('fields.hdop')} value={formatNumber(res.hdop,6)} />
            <ResultCard label={t('fields.vdop')} value={formatNumber(res.vdop,6)} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="gnss-geometry-gdop"
          values={{ ...p }}
        />
      }
    />
  )
}
