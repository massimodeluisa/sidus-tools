import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiSelect } from '@/components/shared/UiSelect'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  EARTH_MU,
  TOOL_UNIT_SETS,
  gibbs,
  herrickGibbs,
  positionArcs,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const METHODS = ['herrick', 'gibbs'] as const

const SCHEMA = {
  method: strParam('herrick', METHODS),
  x1: numParam(6723.121),
  y1: numParam(-2213.520),
  z1: numParam(0),
  x2: numParam(7078.137),
  y2: numParam(0),
  z2: numParam(0),
  x3: numParam(6451.132),
  y3: numParam(2912.546),
  z3: numParam(0),
  t1: numParam(-300),
  t2: numParam(0),
  t3: numParam(400),
} as const

export function HerrickGibbsTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const pack = useMemo(() => {
    const r1: [number, number, number] = [p.x1 * 1000, p.y1 * 1000, p.z1 * 1000]
    const r2: [number, number, number] = [p.x2 * 1000, p.y2 * 1000, p.z2 * 1000]
    const r3: [number, number, number] = [p.x3 * 1000, p.y3 * 1000, p.z3 * 1000]
    const hg = herrickGibbs({ r1, r2, r3, t1: p.t1, t2: p.t2, t3: p.t3, mu: EARTH_MU })
    const gb = gibbs({ r1, r2, r3, mu: EARTH_MU })
    const arcs = positionArcs(r1, r2, r3)
    const active = p.method === 'gibbs' ? gb : hg
    const other = p.method === 'gibbs' ? hg : gb
    if (!active || !arcs) return null
    return { active, other, arcs }
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.od_method')}
            value={p.method}
            onChange={(e) => setP({ method: e.target.value })}
            options={METHODS.map((id) => ({
              value: id,
              label: id === 'gibbs' ? t('fields.od_gibbs') : t('fields.od_herrick'),
            }))}
          />
          <UiField label={t('fields.r1x')} type="number" value={p.x1} onChange={(e) => setP({ x1: Number(e.target.value) })} />
          <UiField label={t('fields.r1y')} type="number" value={p.y1} onChange={(e) => setP({ y1: Number(e.target.value) })} />
          <UiField label={t('fields.r1z')} type="number" value={p.z1} onChange={(e) => setP({ z1: Number(e.target.value) })} />
          <UiField label={t('fields.r2x')} type="number" value={p.x2} onChange={(e) => setP({ x2: Number(e.target.value) })} />
          <UiField label={t('fields.r2y')} type="number" value={p.y2} onChange={(e) => setP({ y2: Number(e.target.value) })} />
          <UiField label={t('fields.r2z')} type="number" value={p.z2} onChange={(e) => setP({ z2: Number(e.target.value) })} />
          <UiField label={t('fields.r3x')} type="number" value={p.x3} onChange={(e) => setP({ x3: Number(e.target.value) })} />
          <UiField label={t('fields.r3y')} type="number" value={p.y3} onChange={(e) => setP({ y3: Number(e.target.value) })} />
          <UiField label={t('fields.r3z')} type="number" value={p.z3} onChange={(e) => setP({ z3: Number(e.target.value) })} />
          <UiField label={t('fields.hg_t1')} type="number" value={p.t1} onChange={(e) => setP({ t1: Number(e.target.value) })} />
          <UiField label={t('fields.hg_t2')} type="number" value={p.t2} onChange={(e) => setP({ t2: Number(e.target.value) })} />
          <UiField label={t('fields.hg_t3')} type="number" value={p.t3} onChange={(e) => setP({ t3: Number(e.target.value) })} />
        </ParamsGrid>
      }
      results={
        !pack ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.v2_mag')} si={pack.active.v2n} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.hg_v2x')} si={pack.active.v2[0]} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.hg_v2y')} si={pack.active.v2[1]} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.hg_v2z')} si={pack.active.v2[2]} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            {pack.other ? (
              <ResultCard label={t('fields.od_v2_other')} si={pack.other.v2n} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            ) : null}
            <ResultCard
              label={t('fields.arc_12')}
              si={pack.arcs.theta12}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={3}
            />
            <ResultCard
              label={t('fields.arc_23')}
              si={pack.arcs.theta23}
              category="angle"
              unitId="deg"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={3}
            />
            <p className="col-span-full font-mono text-xs leading-relaxed text-muted">
              {pack.arcs.recommend === 'gibbs' ? t('fields.od_recommend_gibbs') : t('fields.od_recommend_herrick')}
            </p>
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="herrick-gibbs"
          values={{
            r1x: p.x1 * 1000,
            r1y: p.y1 * 1000,
            r1z: p.z1 * 1000,
            r2x: p.x2 * 1000,
            r2y: p.y2 * 1000,
            r2z: p.z2 * 1000,
            r3x: p.x3 * 1000,
            r3y: p.y3 * 1000,
            r3z: p.z3 * 1000,
            t1: p.t1,
            t2: p.t2,
            t3: p.t3,
            mu: EARTH_MU,
          }}
        />
      }
    />
  )
}
