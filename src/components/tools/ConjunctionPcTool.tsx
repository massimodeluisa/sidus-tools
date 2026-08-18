import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { TOOL_UNIT_SETS, conjunctionPcReport, toSi } from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const METHODS = ['chan', 'foster'] as const

const SCHEMA = {
  method: strParam('chan', METHODS),
  miss: numParam(50, { min: 0 }),
  mu: strParam('m', TOOL_UNIT_SETS.lengthSmall),
  sx: numParam(80, { min: 0 }),
  sy: numParam(120, { min: 0 }),
  su: strParam('m', TOOL_UNIT_SETS.lengthSmall),
  rad: numParam(15, { min: 0 }),
  ru: strParam('m', TOOL_UNIT_SETS.lengthSmall),
} as const

export function ConjunctionPcTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const miss = toSi(p.miss, p.mu)
    const sx = toSi(p.sx, p.su)
    const sy = toSi(p.sy, p.su)
    const rad = toSi(p.rad, p.ru)
    return conjunctionPcReport(miss, sx, sy, rad)
  }, [p])

  const primary = res ? (p.method === 'foster' ? res.foster : res.chan) : null

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.pc_method')}
            value={p.method}
            onChange={(e) => setP({ method: e.target.value })}
            options={METHODS.map((id) => ({
              value: id,
              label: id === 'foster' ? t('fields.pc_foster') : t('fields.pc_chan'),
            }))}
          />
          <UiUnitField
            label={t('fields.miss_distance')}
            category="length"
            unitIds={TOOL_UNIT_SETS.lengthSmall}
            unitId={p.mu}
            value={p.miss}
            min={0}
            onValueChange={(miss) => setP({ miss })}
            onUnitChange={(mu, miss) => setP({ mu, miss })}
          />
          <UiUnitField
            label={t('fields.sigma_x')}
            category="length"
            unitIds={TOOL_UNIT_SETS.lengthSmall}
            unitId={p.su}
            value={p.sx}
            min={0}
            onValueChange={(sx) => setP({ sx })}
            onUnitChange={(su, sx) => setP({ su, sx })}
          />
          <UiUnitField
            label={t('fields.sigma_y')}
            category="length"
            unitIds={TOOL_UNIT_SETS.lengthSmall}
            unitId={p.su}
            value={p.sy}
            min={0}
            onValueChange={(sy) => setP({ sy })}
            onUnitChange={(su, sy) => setP({ su, sy })}
          />
          <UiUnitField
            label={t('fields.hard_body')}
            category="length"
            unitIds={TOOL_UNIT_SETS.lengthSmall}
            unitId={p.ru}
            value={p.rad}
            min={0}
            onValueChange={(rad) => setP({ rad })}
            onUnitChange={(ru, rad) => setP({ ru, rad })}
          />
        </ParamsGrid>
      }
      results={
        !res || primary == null ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.pc_collision')} value={formatNumber(primary, 6)} accent />
            <ResultCard label={t('fields.pc_chan_value')} value={formatNumber(res.chan, 6)} />
            <ResultCard label={t('fields.pc_foster_value')} value={formatNumber(res.foster, 6)} />
            <ResultCard label={t('fields.pc_r_over_sigma')} value={formatNumber(res.rOverSigma, 4)} />
            <p className="col-span-full font-mono text-xs leading-relaxed text-muted">
              {t('fields.pc_not_cara')}
            </p>
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="conjunction-pc"
          values={{
            miss: toSi(p.miss, p.mu),
            sx: toSi(p.sx, p.su),
            sy: toSi(p.sy, p.su),
            rad: toSi(p.rad, p.ru),
          }}
        />
      }
    />
  )
}
