import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { EARTH_MU, EARTH_RADIUS, TOOL_UNIT_SETS, bPlaneTarget, toSi } from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  vx: numParam(3),
  vy: numParam(0.4),
  vz: numParam(0.2),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity),
  h: numParam(2000, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  clock: numParam(30),
  cu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function BPlaneTargetTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const vx = toSi(p.vx, p.vu)
    const vy = toSi(p.vy, p.vu)
    const vz = toSi(p.vz, p.vu)
    const rp = EARTH_RADIUS + toSi(p.h, p.hu)
    return bPlaneTarget({ vInf: [vx, vy, vz], mu: EARTH_MU, rp, clock: toSi(p.clock, p.cu) })
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.vinf_x')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.vx} onValueChange={(vx) => setP({ vx })} onUnitChange={(vu, vx) => setP({ vu, vx })} />
          <UiUnitField label={t('fields.vinf_y')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.vy} onValueChange={(vy) => setP({ vy })} onUnitChange={(vu, vy) => setP({ vu, vy })} />
          <UiUnitField label={t('fields.vinf_z')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.vz} onValueChange={(vz) => setP({ vz })} onUnitChange={(vu, vz) => setP({ vu, vz })} />
          <UiUnitField label={t('fields.periapsis_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
          <UiUnitField label={t('fields.clock_angle')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.cu} value={p.clock} onValueChange={(clock) => setP({ clock })} onUnitChange={(cu, clock) => setP({ cu, clock })} />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.disc_b_2')} si={res.b} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} accent />
            <ResultCard label={t('fields.turn_flyby')} si={res.turn} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={3} />
            <ResultCard label={t('fields.eccentricity')} value={formatNumber(res.e, 6)} />
            <ResultCard label={t('fields.b_dot_t')} si={res.bDotT} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} />
            <ResultCard label={t('fields.b_dot_r')} si={res.bDotR} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={4} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="b-plane-target"
          values={{
            vx: toSi(p.vx, p.vu),
            vy: toSi(p.vy, p.vu),
            vz: toSi(p.vz, p.vu),
            mu: EARTH_MU,
            rp: EARTH_RADIUS + toSi(p.h, p.hu),
            theta: toSi(p.clock, p.cu),
          }}
        />
      }
    />
  )
}
