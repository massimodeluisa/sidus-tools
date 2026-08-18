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
  magneticTorque,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  m: numParam(10,{min:1e-9}),
  B: numParam(0.00003,{min:1e-12}),
  ang: numParam(90,{min:0}),
  angu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function MagneticTorqueTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const ang=toSi(p.ang,p.angu)
    return magneticTorque(p.m,p.B,ang)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.disc_m')} type="number" min={1e-9}  step="any" value={p.m} onChange={(e)=>setP({m:Number(e.target.value)})} />
          <UiField label={t('fields.disc_b')} type="number" min={1e-12}  step="any" value={p.B} onChange={(e)=>setP({B:Number(e.target.value)})} />
          <UiUnitField label={t('fields.ang')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.angu} value={p.ang} min={0} onValueChange={(ang)=>setP({ang})} onUnitChange={(angu,ang)=>setP({angu,ang})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.tau')} value={formatNumber(res,6)} unit="N·m" accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="magnetic-torque"
          values={{ ...p, ang: toSi(p.ang, p.angu) }}
        />
      }
    />
  )
}
