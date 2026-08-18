import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { TOOL_UNIT_SETS, triadQuest } from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  w1x: numParam(0),
  w1y: numParam(1),
  w1z: numParam(0),
  w2x: numParam(0),
  w2y: numParam(0),
  w2z: numParam(1),
  v1x: numParam(1),
  v1y: numParam(0),
  v1z: numParam(0),
  v2x: numParam(0),
  v2y: numParam(0),
  v2z: numParam(1),
} as const

export function QuestAttitudeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(
    () =>
      triadQuest({
        w1: [p.w1x, p.w1y, p.w1z],
        w2: [p.w2x, p.w2y, p.w2z],
        v1: [p.v1x, p.v1y, p.v1z],
        v2: [p.v2x, p.v2y, p.v2z],
      }),
    [p],
  )

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField label={t('fields.w1x')} type="number" value={p.w1x} onChange={(e) => setP({ w1x: Number(e.target.value) })} />
          <UiField label={t('fields.w1y')} type="number" value={p.w1y} onChange={(e) => setP({ w1y: Number(e.target.value) })} />
          <UiField label={t('fields.w1z')} type="number" value={p.w1z} onChange={(e) => setP({ w1z: Number(e.target.value) })} />
          <UiField label={t('fields.w2x')} type="number" value={p.w2x} onChange={(e) => setP({ w2x: Number(e.target.value) })} />
          <UiField label={t('fields.w2y')} type="number" value={p.w2y} onChange={(e) => setP({ w2y: Number(e.target.value) })} />
          <UiField label={t('fields.w2z')} type="number" value={p.w2z} onChange={(e) => setP({ w2z: Number(e.target.value) })} />
          <UiField label={t('fields.v1x')} type="number" value={p.v1x} onChange={(e) => setP({ v1x: Number(e.target.value) })} />
          <UiField label={t('fields.v1y')} type="number" value={p.v1y} onChange={(e) => setP({ v1y: Number(e.target.value) })} />
          <UiField label={t('fields.v1z')} type="number" value={p.v1z} onChange={(e) => setP({ v1z: Number(e.target.value) })} />
          <UiField label={t('fields.v2x')} type="number" value={p.v2x} onChange={(e) => setP({ v2x: Number(e.target.value) })} />
          <UiField label={t('fields.v2y')} type="number" value={p.v2y} onChange={(e) => setP({ v2y: Number(e.target.value) })} />
          <UiField label={t('fields.v2z')} type="number" value={p.v2z} onChange={(e) => setP({ v2z: Number(e.target.value) })} />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.triad_qw')} value={formatNumber(res.triad.w, 6)} accent />
            <ResultCard label={t('fields.triad_qx')} value={formatNumber(res.triad.x, 6)} />
            <ResultCard label={t('fields.quest_qw')} value={formatNumber(res.quest.w, 6)} />
            <ResultCard label={t('fields.quest_qx')} value={formatNumber(res.quest.x, 6)} />
            <ResultCard label={t('fields.residual_triad')} si={res.residualTriad} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} />
            <ResultCard label={t('fields.residual_quest')} si={res.residualQuest} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4} />
          </div>
        )
      }
      code={<CodeExport formulaId="quest-attitude" values={{ ...p }} />}
    />
  )
}
