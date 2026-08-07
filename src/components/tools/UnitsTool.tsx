import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiSelect } from '@/components/shared/UiSelect'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  convertAllInCategory,
  getUnit,
  UNIT_CATEGORIES,
  unitsForCategory,
  type UnitCategory,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const CAT_IDS = UNIT_CATEGORIES.map((c) => c.id)

const SCHEMA = {
  cat: strParam('length', CAT_IDS),
  from: strParam('km'),
  value: numParam(1),
} as const

export function UnitsTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const cat = p.cat as UnitCategory
  const units = unitsForCategory(cat)
  const fromId = units.some((u) => u.id === p.from) ? p.from : units[0]?.id ?? 'm'

  const results = useMemo(() => {
    if (!Number.isFinite(p.value)) return []
    return convertAllInCategory(p.value, fromId, cat)
  }, [cat, fromId, p.value])

  const fromUnit = getUnit(fromId)
  const codeValues = useMemo(
    () => ({
      value: p.value,
      from: fromId,
      cat,
      fromToBase: fromUnit?.toBase ?? 1,
      fromOffset: fromUnit?.offset ?? 0,
    }),
    [cat, fromId, fromUnit?.offset, fromUnit?.toBase, p.value],
  )

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.category')}
            value={cat}
            onChange={(e) => {
              const next = e.target.value as UnitCategory
              const first = unitsForCategory(next)[0]
              setP({ cat: next, from: first.id, value: 1 })
            }}
            options={UNIT_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
          />
          <UiSelect
            label={t('fields.from_unit')}
            value={fromId}
            onChange={(e) => setP({ from: e.target.value })}
            options={units.map((u) => ({ value: u.id, label: u.label }))}
          />
          <UiField
            label={t('fields.value')}
            type="number"
            step="any"
            value={p.value}
            onChange={(e) => setP({ value: Number(e.target.value) })}
          />
        </ParamsGrid>
      }
      results={
        <div className="grid gap-2">
          {results.map((r) => (
            <ResultCard
              key={r.id}
              label={r.label}
              value={formatNumber(r.value, 8)}
              accent={r.id === fromId}
            />
          ))}
          {results.length === 0 ? (
            <p className="font-mono text-sm text-muted">{t('fields.enter_finite_value')}</p>
          ) : null}
        </div>
      }
      code={<CodeExport formulaId="units" values={codeValues} />}
    />
  )
}
