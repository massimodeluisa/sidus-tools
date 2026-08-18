import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  toSi,
  laserSpotRadius,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  R: numParam(1000,{min:0}),
  Ru: strParam('km', TOOL_UNIT_SETS.length),
  theta: numParam(0.01,{min:0}),
  thetau: strParam('mrad', TOOL_UNIT_SETS.angle),
} as const

export function LaserPointingJitterTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const R=toSi(p.R,p.Ru)
    const theta=toSi(p.theta,p.thetau)
    return laserSpotRadius(R,theta)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.disc_r')} category="length" unitIds={TOOL_UNIT_SETS.length} unitId={p.Ru} value={p.R} min={0} onValueChange={(R)=>setP({R})} onUnitChange={(Ru,R)=>setP({Ru,R})} />
          <UiUnitField label={t('fields.theta')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.thetau} value={p.theta} min={0} onValueChange={(theta)=>setP({theta})} onUnitChange={(thetau,theta)=>setP({thetau,theta})} />
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.spot')} si={res} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="laser-pointing-jitter"
          values={{ ...p, R: toSi(p.R, p.Ru), theta: toSi(p.theta, p.thetau) }}
        />
      }
    />
  )
}
