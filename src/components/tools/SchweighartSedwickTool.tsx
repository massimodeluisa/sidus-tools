import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { EARTH_J2, EARTH_MU, EARTH_RADIUS, TOOL_UNIT_SETS, schweighartSedwick, toSi } from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  h: numParam(700, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  i: numParam(51.6),
  iu: strParam('deg', TOOL_UNIT_SETS.angle),
  x: numParam(1000),
  z: numParam(500),
  xu: strParam('m', TOOL_UNIT_SETS.lengthSmall),
  dt: numParam(600, { min: 0 }),
  tu: strParam('s', TOOL_UNIT_SETS.time),
} as const

export function SchweighartSedwickTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const a = EARTH_RADIUS + toSi(p.h, p.hu)
    return schweighartSedwick({
      a,
      iRad: toSi(p.i, p.iu),
      state0: { x: toSi(p.x, p.xu), y: 0, z: toSi(p.z, p.xu), vx: 0, vy: 0.2, vz: 0 },
      dt: toSi(p.dt, p.tu),
    })
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField label={t('fields.orbit_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
          <UiUnitField label={t('fields.target_inclination')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.iu} value={p.i} onValueChange={(i) => setP({ i })} onUnitChange={(iu, i) => setP({ iu, i })} />
          <UiUnitField label={t('fields.rel_x')} category="length" unitIds={TOOL_UNIT_SETS.lengthSmall} unitId={p.xu} value={p.x} onValueChange={(x) => setP({ x })} onUnitChange={(xu, x) => setP({ xu, x })} />
          <UiUnitField label={t('fields.rel_z')} category="length" unitIds={TOOL_UNIT_SETS.lengthSmall} unitId={p.xu} value={p.z} onValueChange={(z) => setP({ z })} onUnitChange={(xu, z) => setP({ xu, z })} />
          <UiField label={t('fields.disc_t_2')} type="number" min={0} value={p.dt} onChange={(e) => setP({ dt: Number(e.target.value) })} />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.ss_s')} value={formatNumber(res.s, 6)} accent />
            <ResultCard label={t('fields.n_bar')} value={formatNumber(res.nBar, 6)} unit="rad/s" />
            <ResultCard label={t('fields.ss_z')} si={res.state.z} category="length" unitId="m" unitIds={TOOL_UNIT_SETS.lengthSmall} digits={3} />
            <ResultCard label={t('fields.cw_z')} si={res.cw.z} category="length" unitId="m" unitIds={TOOL_UNIT_SETS.lengthSmall} digits={3} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="schweighart-sedwick"
          values={{
            a: EARTH_RADIUS + toSi(p.h, p.hu),
            inc: toSi(p.i, p.iu),
            mu: EARTH_MU,
            j2: EARTH_J2,
            Rb: EARTH_RADIUS,
          }}
        />
      }
    />
  )
}
