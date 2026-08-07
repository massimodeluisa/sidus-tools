import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { batteryEndurance, batteryEnergyJ, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  C: numParam(50, { min: 0.001 }),
  V: numParam(28, { min: 0.001 }),
  P: numParam(200, { min: 0.001 }),
  Pu: strParam('W', TOOL_UNIT_SETS.power),
} as const

export function BatteryTool() {
  const { t } = useTranslation()
  const { t: tr } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const P = toSi(p.P, p.Pu)
  const res = useMemo(() => {
    const E = batteryEnergyJ(p.C, p.V)
    if (E == null) return null
    const t = batteryEndurance(E, P)
    return { E, t }
  }, [p.C, p.V, P])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField
            label={t('fields.capacity')}
            type="number"
            value={p.C}
            onChange={(e) => setP({ C: Number(e.target.value) })}
            unit="Ah"
          />
          <UiField
            label={t('fields.bus_voltage')}
            type="number"
            value={p.V}
            onChange={(e) => setP({ V: Number(e.target.value) })}
            unit="V"
          />
          <UiUnitField
            label={t('fields.load_power')}
            category="power"
            unitIds={TOOL_UNIT_SETS.power}
            unitId={p.Pu}
            value={p.P}
            min={0.001}
            onValueChange={(P) => setP({ P })}
            onUnitChange={(Pu, P) => setP({ Pu, P })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.stored_energy')}
              si={res.E}
              category="energy"
              unitId="Wh"
              unitIds={TOOL_UNIT_SETS.energy}
              digits={1}
              accent
            />
            <ResultCard
              label={tr('fields.energy')}
              si={res.E}
              category="energy"
              unitId="MJ"
              unitIds={TOOL_UNIT_SETS.energy}
              digits={3}
            />
            {res.t != null ? (
              <ResultCard
                label={t('fields.endurance_at_load')}
                si={res.t}
                category="time"
                unitId="pretty"
                unitIds={TOOL_UNIT_SETS.timePretty}
                digits={4}
              />
            ) : null}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_battery_inputs')}</p>
        )
      }
      code={<CodeExport formulaId="battery" values={{ P, C: p.C, V: p.V, Pu: p.Pu }} />}
    />
  )
}
