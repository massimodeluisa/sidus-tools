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
  massRatioForDeltaV,
  propellantForDeltaV,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

// Stage-class: Isp 320 s, Δv 3.2 km/s, dry 5 t (upper-stage educational)
const SCHEMA = {
  isp: numParam(320, { min: 0.001 }),
  dv: numParam(3200, { min: 0 }),
  dvu: strParam('mps', TOOL_UNIT_SETS.velocity),
  mf: numParam(5000, { min: 0.001 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
} as const

const DV_CHIPS = [
  { labelKey: 'fields.preset_leo_insert' as const, isp: 320, dvMps: 3200 },
  { labelKey: 'fields.preset_gto_raise' as const, isp: 450, dvMps: 2500 },
  { labelKey: 'fields.preset_geo_sk_15y' as const, isp: 220, dvMps: 750 },
  { labelKey: 'fields.preset_ion_leo_geo' as const, isp: 1600, dvMps: 4000 },
] as const

export function PropellantMassTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const dv = toSi(p.dv, p.dvu)
  const mf = toSi(p.mf, p.mu)
  const res = useMemo(() => {
    const prop = propellantForDeltaV(p.isp, dv, mf)
    const ratio = massRatioForDeltaV(p.isp, dv)
    return prop && ratio ? { ...prop, ratio } : null
  }, [p.isp, dv, mf])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.isp')} type="number" value={p.isp} onChange={(e) => setP({ isp: Number(e.target.value) })} unit="s" />
          <UiUnitField label={t('fields.required_v')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.dvu} value={p.dv} min={0} onValueChange={(dv) => setP({ dv })} onUnitChange={(dvu, dv) => setP({ dvu, dv })} />
          <UiUnitField label={t('fields.dry_mass_m_f')} category="mass" unitIds={TOOL_UNIT_SETS.mass} unitId={p.mu} value={p.mf} min={0.001} onValueChange={(mf) => setP({ mf })} onUnitChange={(mu, mf) => setP({ mu, mf })} />
          <FieldPresets label={t('common.presets')}>
            {DV_CHIPS.map((pr) => (
              <PresetChip
                key={pr.labelKey}
                onClick={() => setP({ isp: pr.isp, dv: fromSi(pr.dvMps, p.dvu) })}
              >
                {t(pr.labelKey)}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard label={t('fields.propellant')} si={res.prop} category="mass" unitId="kg" unitIds={TOOL_UNIT_SETS.mass} digits={2} accent />
            <ResultCard label={t('fields.wet_mass_m')} si={res.m0} category="mass" unitId="kg" unitIds={TOOL_UNIT_SETS.mass} digits={2} />
            <ResultCard label={t('fields.mass_ratio_m_m_f')} value={res.ratio.toFixed(4)} />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_isp_dv_dry')}</p>
        )
      }
      code={<CodeExport formulaId="propellant-mass" values={{ dv, mf, isp: p.isp }} />}
    />
  )
}
