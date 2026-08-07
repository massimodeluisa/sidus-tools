import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiSelect } from '@/components/shared/UiSelect'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { OrbitScene3D, hohmannArc } from '@/components/viz/OrbitScene3D'
import {
  HELIO_SMA_M,
  SUN_MU,
  heliocentricHohmann,
  hohmannPhaseAngle,
  heliocentricSynodic,
  TOOL_UNIT_SETS,
} from '@/lib/physics'
import { strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const PLANETS = Object.keys(HELIO_SMA_M)

const SCHEMA = {
  from: strParam('earth', PLANETS),
  to: strParam('mars', PLANETS) } as const

export function HelioHohmannTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const r1 = HELIO_SMA_M[p.from]
  const r2 = HELIO_SMA_M[p.to]

  const res = useMemo(() => {
    if (r1 == null || r2 == null || r1 === r2) return null
    const h = heliocentricHohmann(r1, r2)
    const phase = hohmannPhaseAngle(r1, r2)
    const tSyn = heliocentricSynodic(r1, r2)
    if (!h || phase == null) return null
    return { h, phase, tSyn }
  }, [r1, r2])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.departure_body_heliocentric')}
            value={p.from}
            onChange={(e) => setP({ from: e.target.value })}
            options={PLANETS.map((id) => ({ value: id, label: id }))}
          />
          <UiSelect
            label={t('fields.arrival_body_heliocentric')}
            value={p.to}
            onChange={(e) => setP({ to: e.target.value })}
            options={PLANETS.map((id) => ({ value: id, label: id }))}
          />
          <p className="text-xs leading-relaxed text-muted">
            {t('fields.helio_note')}
          </p>
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.v_helio')} si={res.h.dv1} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.v_helio_2')} si={res.h.dv2} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard label={t('fields.delta_v_total')} si={res.h.dvTotal} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.tof')} si={res.h.tof} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
            <ResultCard
              label={t('fields.ideal_phase_angle')}
              si={res.phase} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={2}
            />
            <ResultCard
              label={t('fields.synodic_period')}
              si={res.tSyn != null ? res.tSyn : NaN} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4}
            />
            <ResultCard
              label={t('fields.r_4')}
              si={r1}
              category="length"
              unitId="au"
              unitIds={TOOL_UNIT_SETS.length}
              digits={4}
            />
            <ResultCard
              label={t('fields.r_5')}
              si={r2}
              category="length"
              unitId="au"
              unitIds={TOOL_UNIT_SETS.length}
              digits={4}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.need_two_planets')}</p>
        )
      }
      preview={
        res && r1 && r2 ? (
          <OrbitScene3D
            bodyR={0.05 * Math.min(r1, r2)}
            bodyColor="#e8d5a3"
            radii={[r1, r2]}
            arcs={hohmannArc(r1, r2)}
            height={280}
          />
        ) : null
      }
      code={
        <CodeExport
          formulaId="helio-hohmann"
          values={{
            r1: r1 ?? 0,
            r2: r2 ?? 0,
            mu: SUN_MU,
            from: p.from,
            to: p.to,
          }}
        />
      }
    />
  )
}
