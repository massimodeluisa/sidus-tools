import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  dynamicPressure,
  isaAtmosphere,
  machNumber,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  h: numParam(10_000, { min: 0 }),
  hu: strParam('m', TOOL_UNIT_SETS.altitude),
  v: numParam(300, { min: 0 }),
  vu: strParam('mps', TOOL_UNIT_SETS.velocity),
} as const

export function DynamicPressureTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const h = toSi(p.h, p.hu)
  const v = toSi(p.v, p.vu)

  const res = useMemo(() => {
    const isa = isaAtmosphere(h)
    if (!isa) return null
    const q = dynamicPressure(isa.rho, v)
    const M = machNumber(v, isa.a)
    return { isa, q, M }
  }, [h, v])

  return (
    <ToolShell
      parameters={
        <ParamsGrid variant="pair">
          <UiUnitField
            label={t('fields.altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
            hint={t('fields.hint_isa_0_32')}
          />
          <UiUnitField
            label={t('fields.airspeed')}
            category="velocity"
            unitIds={TOOL_UNIT_SETS.velocity}
            unitId={p.vu}
            value={p.v}
            min={0}
            onValueChange={(v) => setP({ v })}
            onUnitChange={(vu, v) => setP({ vu, v })}
          />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.altitude_isa_range')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.dynamic_pressure')}
              si={res.q}
              category="pressure"
              unitId="Pa"
              unitIds={TOOL_UNIT_SETS.pressure}
              digits={1}
              accent
            />
            <ResultCard
              label={t('fields.density')}
              si={res.isa.rho}
              category="density"
              unitId="kgm3"
              unitIds={TOOL_UNIT_SETS.density}
              digits={4}
            />
            <ResultCard
              label={t('fields.temperature')}
              si={res.isa.T}
              category="temperature"
              unitId="K"
              unitIds={TOOL_UNIT_SETS.temperature}
              digits={2}
            />
            <ResultCard
              label={t('fields.pressure')}
              si={res.isa.p}
              category="pressure"
              unitId="Pa"
              unitIds={TOOL_UNIT_SETS.pressure}
              digits={0}
            />
            <ResultCard
              label={t('fields.mach')}
              value={res.M != null ? formatNumber(res.M, 3) : ': '}
            />
            <ResultCard label={t('fields.isa_layer')} value={res.isa.layer} />
            <ResultCard
              label={t('fields.speed_of_sound')}
              si={res.isa.a}
              category="velocity"
              unitId="mps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={1}
            />
          </div>
        )
      }
      code={<CodeExport formulaId="dynamic-pressure" values={{ h, v }} />}
    />
  )
}
