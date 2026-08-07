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
  dopplerShiftHz,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  f0: numParam(2200000000,{min:1}),
  vr: numParam(1000,{min:0}),
  vru: strParam('mps', TOOL_UNIT_SETS.velocity),
} as const

export function DopplerShiftLeoTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const vr=toSi(p.vr,p.vru)
    return dopplerShiftHz(p.f0,vr)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_f0')} type="number" min={1}  step="any" value={p.f0} onChange={(e)=>setP({f0:Number(e.target.value)})} />
          <UiUnitField label={t('fields.disc_vr')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vru} value={p.vr} min={0} onValueChange={(vr)=>setP({vr})} onUnitChange={(vru,vr)=>setP({vru,vr})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.disc_fd')} value={formatNumber(res,4)} unit="Hz" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="doppler-shift-leo"
          values={{ ...p, vr: toSi(p.vr, p.vru) }}
        />
      }
    />
  )
}
