import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { lightTime, lightTimeRoundTrip, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  range: numParam(1, { min: 0 }),
  ru: strParam('au', TOOL_UNIT_SETS.length),
} as const

export function LightTimeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const r = toSi(p.range, p.ru)
  const res = useMemo(() => {
    const t = lightTime(r)
    const rt = lightTimeRoundTrip(r)
    return t != null && rt != null ? { t, rt, r } : null
  }, [r])
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.range')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.ru}
            value={p.range}
            min={0}
            onValueChange={(range) => setP({ range })}
            onUnitChange={(ru, range) => setP({ ru, range })}
            hint={t('fields.hint_light_time')}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.one_way_light_time')}
              si={res.t}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.round_trip_rtt')}
              si={res.rt}
              category="time"
              unitId="pretty"
              unitIds={TOOL_UNIT_SETS.timePretty}
              digits={4}
            />
            <ResultCard
              label={t('fields.range')}
              si={res.r}
              category="length"
              unitId="au"
              unitIds={TOOL_UNIT_SETS.length}
              digits={6}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_range')}</p>
        )
      }
      code={<CodeExport formulaId="light-time" values={{ r, range: r }} />}
    />
  )
}
