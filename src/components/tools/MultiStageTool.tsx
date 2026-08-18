import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { fromSi, G0, multiStageDeltaV, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  isp1: numParam(280, { min: 1 }),
  m01: numParam(100_000, { min: 1 }),
  mf1: numParam(30_000, { min: 1 }),
  isp2: numParam(310, { min: 1 }),
  m02: numParam(25_000, { min: 1 }),
  mf2: numParam(8_000, { min: 1 }),
  isp3: numParam(450, { min: 1 }),
  m03: numParam(6_000, { min: 1 }),
  mf3: numParam(2_500, { min: 1 }),
  mu: strParam('kg', TOOL_UNIT_SETS.mass),
  stages: numParam(2, { min: 1, max: 3 }),
} as const

export function MultiStageTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const n = Math.min(3, Math.max(1, Math.floor(p.stages)))

  const results = useMemo(() => {
    const stages = [
      { ve: p.isp1 * G0, m0: toSi(p.m01, p.mu), mf: toSi(p.mf1, p.mu) },
      { ve: p.isp2 * G0, m0: toSi(p.m02, p.mu), mf: toSi(p.mf2, p.mu) },
      { ve: p.isp3 * G0, m0: toSi(p.m03, p.mu), mf: toSi(p.mf3, p.mu) },
    ].slice(0, n)
    return multiStageDeltaV(stages)
  }, [n, p.isp1, p.isp2, p.isp3, p.m01, p.m02, p.m03, p.mf1, p.mf2, p.mf3, p.mu])

  function changeMassUnit(mu: string) {
    setP({
      mu,
      m01: fromSi(toSi(p.m01, p.mu), mu),
      mf1: fromSi(toSi(p.mf1, p.mu), mu),
      m02: fromSi(toSi(p.m02, p.mu), mu),
      mf2: fromSi(toSi(p.mf2, p.mu), mu),
      m03: fromSi(toSi(p.m03, p.mu), mu),
      mf3: fromSi(toSi(p.mf3, p.mu), mu),
    })
  }

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField
            label={t('fields.active_stages')}
            type="number"
            min={1}
            max={3}
            value={p.stages}
            onChange={(e) => setP({ stages: Number(e.target.value) })}
          />
          {[1, 2, 3].slice(0, n).map((i) => {
            const isp = i === 1 ? p.isp1 : i === 2 ? p.isp2 : p.isp3
            const m0 = i === 1 ? p.m01 : i === 2 ? p.m02 : p.m03
            const mf = i === 1 ? p.mf1 : i === 2 ? p.mf2 : p.mf3
            const setIsp = (v: number) =>
              setP(i === 1 ? { isp1: v } : i === 2 ? { isp2: v } : { isp3: v })
            const setM0 = (v: number) =>
              setP(i === 1 ? { m01: v } : i === 2 ? { m02: v } : { m03: v })
            const setMf = (v: number) =>
              setP(i === 1 ? { mf1: v } : i === 2 ? { mf2: v } : { mf3: v })
            return (
              <div key={i} className="space-y-3 border border-border p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {t('fields.stage_n', { n: i })}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <UiField
                    label={t('fields.isp')}
                    unit="s"
                    type="number"
                    min={1}
                    step="any"
                    value={isp}
                    onChange={(e) => setIsp(Number(e.target.value))}
                  />
                  <UiUnitField
                    label={t('fields.m')}
                    category="mass"
                    unitIds={TOOL_UNIT_SETS.mass}
                    unitId={p.mu}
                    value={m0}
                    min={1}
                    onValueChange={setM0}
                    onUnitChange={(mu) => changeMassUnit(mu)}
                  />
                  <UiUnitField
                    label={t('fields.m_f')}
                    category="mass"
                    unitIds={TOOL_UNIT_SETS.mass}
                    unitId={p.mu}
                    value={mf}
                    min={1}
                    onValueChange={setMf}
                    onUnitChange={(mu) => changeMassUnit(mu)}
                  />
                </div>
              </div>
            )
          })}
          <p className="font-mono text-[10px] leading-relaxed text-subtle">
            {t('fields.note_multistage')}
          </p>
        </ParamsGrid>
      }
      results={
        !results ? (
          <p className="font-mono text-sm text-muted">{t('fields.need_m0_mf_isp')}</p>
        ) : (
          <div className="sidus-results">
            {results.dv.map((d, i) => (
              <ResultCard
                key={i}
                label={`Δv stage ${i + 1}`}
                si={d}
                category="velocity"
                unitId="kmps"
                unitIds={TOOL_UNIT_SETS.velocity}
                digits={4}
              />
            ))}
            <ResultCard
              label={t('fields.delta_v_total')}
              si={results.dvTotal}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard label={t('fields.stages')} value={String(n)} />
            <ResultCard
              label={t('fields.g_used')}
              si={G0}
              category="accel"
              unitId="mps2"
              unitIds={TOOL_UNIT_SETS.accel}
              digits={5}
            />
          </div>
        )
      }
      code={<CodeExport formulaId="multi-stage" values={{ isp1: p.isp1, m01: p.m01, mf1: p.mf1, isp2: p.isp2, m02: p.m02, mf2: p.mf2, isp3: p.isp3, m03: p.m03, mf3: p.mf3, stages: p.stages }} />}
    />
  )
}
