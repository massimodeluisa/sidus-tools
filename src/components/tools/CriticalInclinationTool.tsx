import { TOOL_UNIT_SETS } from '@/lib/physics'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'

// Critical inclination for frozen argp: cos² i = 1/5 ⇒ i ≈ 63.43° or 116.57°
export function CriticalInclinationTool() {
  const { t } = useTranslation()
  const res = useMemo(() => {
    const i1 = Math.acos(Math.sqrt(0.2))
    const i2 = Math.PI - i1
    return { i1, i2 }
  }, [])
  return (
    <ToolShell
      parameters={
        <p className="font-mono text-sm text-muted">
          {t('fields.no_inputs_critical_i')}
        </p>
      }
      results={
        <div className="sidus-results">
          <ResultCard
            label={`${t('fields.critical_inclination')} (${t('fields.prograde')})`}
            si={res.i1}
            category="angle"
            unitId="deg"
            unitIds={TOOL_UNIT_SETS.angle}
            digits={4}
            accent
          />
          <ResultCard
            label={`${t('fields.critical_inclination')} (${t('fields.retrograde')})`}
            si={res.i2}
            category="angle"
            unitId="deg"
            unitIds={TOOL_UNIT_SETS.angle}
            digits={4}
          />
          <ResultCard label={t('fields.cos_i_1_5')} value="0.2" />
        </div>
      }
      code={
        <CodeExport formulaId="critical-inclination" values={{ cos2_i: 0.2 }} />
      }
    />
  )
}
