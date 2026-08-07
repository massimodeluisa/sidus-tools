import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  fromSi,
  TOOL_UNIT_SETS,
  toSi,
  geoPropellantBudget,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

// 2 t dry GEO sat, hydrazine SK ~50 m/s/yr, 15 yr life (classic educational)
const SCHEMA = {
  mdry: numParam(2000,{min:0}),
  mdryu: strParam('kg', TOOL_UNIT_SETS.mass),
  isp: numParam(220,{min:1}),
  dvY: numParam(50,{min:0}),
  dvYu: strParam('mps', TOOL_UNIT_SETS.velocity),
  life: numParam(15,{min:0.1}),
} as const

const GEO_PROP_CHIPS = [
  { labelKey: 'fields.preset_chem_sk_15y' as const, isp: 220, dvY: 50, life: 15 },
  { labelKey: 'fields.preset_chem_sk_10y' as const, isp: 220, dvY: 50, life: 10 },
  { labelKey: 'fields.preset_ep_sk_15y' as const, isp: 1600, dvY: 50, life: 15 },
  { labelKey: 'fields.preset_ep_tight' as const, isp: 1600, dvY: 30, life: 15 },
] as const

export function GeoPropellantBudgetTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const mdry=toSi(p.mdry,p.mdryu)
    const dvY=toSi(p.dvY,p.dvYu)
    return geoPropellantBudget(mdry,p.isp,dvY,p.life)
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.mdry')} category="mass" unitIds={TOOL_UNIT_SETS.mass} unitId={p.mdryu} value={p.mdry} min={0} onValueChange={(mdry)=>setP({mdry})} onUnitChange={(mdryu,mdry)=>setP({mdryu,mdry})} />
          <UiField label={t('fields.isp')} type="number" min={1}  step="any" value={p.isp} onChange={(e)=>setP({isp:Number(e.target.value)})} />
          <UiUnitField label={t('fields.dvy')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.dvYu} value={p.dvY} min={0} onValueChange={(dvY)=>setP({dvY})} onUnitChange={(dvYu,dvY)=>setP({dvYu,dvY})} />
          <UiField label={t('fields.life')} type="number" min={0.1}  step="any" value={p.life} onChange={(e)=>setP({life:Number(e.target.value)})} />
          <FieldPresets label={t('common.presets')}>
            {GEO_PROP_CHIPS.map((pr) => (
              <PresetChip
                key={pr.labelKey}
                onClick={() =>
                  setP({
                    isp: pr.isp,
                    dvY: fromSi(pr.dvY, p.dvYu),
                    life: pr.life,
                  })
                }
              >
                {t(pr.labelKey)}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        res == null || (typeof res === 'number' && !Number.isFinite(res)) ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.mprop')} si={res.mProp} category="mass" unitId="kg" unitIds={TOOL_UNIT_SETS.mass} digits={4} accent />
            <ResultCard label={t('fields.disc_m0')} si={res.m0} category="mass" unitId="kg" unitIds={TOOL_UNIT_SETS.mass} digits={4} />
            <ResultCard label={t('fields.dvtot')} si={res.dvTotal} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="geo-propellant-budget"
          values={{ ...p, mdry: toSi(p.mdry, p.mdryu), dvY: toSi(p.dvY, p.dvYu) }}
        />
      }
    />
  )
}
