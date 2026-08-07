import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  EARTH_RADIUS,
  fromSi,
  ssoInclination,
  ssoPeriod,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  h: numParam(550, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

/** Typical sun-sync bus altitudes (m). */
const SSO_CHIPS = [
  { labelKey: 'fields.preset_landsat_705' as const, m: 705_000 },
  { labelKey: 'fields.preset_sentinel_786' as const, m: 786_000 },
  { labelKey: 'fields.preset_sso_550' as const, m: 550_000 },
  { labelKey: 'fields.preset_sso_800' as const, m: 800_000 },
] as const

export function SsoTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const h = toSi(p.h, p.hu)
  const a = EARTH_RADIUS + h

  const res = useMemo(() => {
    const i = ssoInclination(a)
    const T = ssoPeriod(a)
    return { i, T, a }
  }, [a])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
            hint={t('fields.hint_sso_alt')}
          />
          <FieldPresets label={t('common.presets')}>
            {SSO_CHIPS.map((pr) => (
              <PresetChip key={pr.labelKey} onClick={() => setP({ h: fromSi(pr.m, p.hu) })}>
                {t(pr.labelKey)}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        res.i == null || res.T == null ? (
          <p className="font-mono text-sm text-muted">{t('fields.need_alt_above_surface')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.sso_inclination')}
              si={res.i}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={3}
              accent
            />
            <ResultCard label={t('fields.period')} si={res.T} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard
              label={t('fields.semi_major_axis')}
              si={res.a}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={2}
            />
            <ResultCard
              label={t('fields.i_raw')}
              si={((res.i * 180) / Math.PI * Math.PI) / 180} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4}
            />
          </div>
        )
      }
      code={<CodeExport formulaId="sso" values={{ h }} />}
    />
  )
}
