import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { UiSelect } from '@/components/shared/UiSelect'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  getBody,
  HELIO_SMA_M,
  patchedConicDeparture,
  TOOL_UNIT_SETS,
  toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const TARGETS = Object.keys(HELIO_SMA_M)

const SCHEMA = {
  planet: strParam('earth', BODIES.map((b) => b.id)),
  target: strParam('mars', TARGETS),
  h: numParam(200, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

export function PatchedConicDepartTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const planet = getBody(p.planet)
  const rPlanet = HELIO_SMA_M[p.planet]
  const rTarget = HELIO_SMA_M[p.target]

  const res = useMemo(() => {
    if (rPlanet == null || rTarget == null || rPlanet === rTarget) return null
    if (planet.type === 'moon' || planet.type === 'star') return null
    return patchedConicDeparture({
      rParkM: planet.radius + toSi(p.h, p.hu),
      muPlanet: planet.mu,
      rPlanetHelioM: rPlanet,
      rTargetHelioM: rTarget })
  }, [p.h, p.hu, p.target, planet, rPlanet, rTarget])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect
            value={p.planet}
            onChange={(planet) => setP({ planet })}
            label={t('fields.departure_planet')}
          />
          <UiSelect
            label={t('fields.heliocentric_target')}
            value={p.target}
            onChange={(e) => setP({ target: e.target.value })}
            options={TARGETS.map((id) => ({ value: id, label: id }))}
          />
          <UiUnitField
            label={t('fields.parking_altitude')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.h}
            min={0}
            onValueChange={(h) => setP({ h })}
            onUnitChange={(hu, h) => setP({ hu, h })}
          />
          <p className="text-xs leading-relaxed text-muted">
            {t('fields.patched_conic_note')}{' '}
            <Link
              to="/tools/porkchop-earth-mars"
              className="text-signal underline-offset-2 hover:underline"
            >
              {t('fields.patched_conic_window_link')}
            </Link>
            .
          </p>
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard label={t('fields.v')} si={res.vInf} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} accent />
            <ResultCard
              label={t('fields.c3')}
              si={res.c3}
              category="specificEnergy"
              unitId="km2ps2"
              unitIds={TOOL_UNIT_SETS.c3}
              digits={3}
              accent
            />
            <ResultCard label={t('fields.v_parking_hyperbola')} si={res.dvPark} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.v_circ_park_2')} si={res.vCircPark} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.v_p_hyperbola')} si={res.vHypPeri} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard
              label={t('fields.ideal_phase')}
              si={res.phaseRad} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={2}
            />
            <ResultCard
              label={t('fields.synodic_window')}
              si={res.tSynS != null ? res.tSynS : NaN} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4}
            />
            <ResultCard label={t('fields.helio_tof')} si={res.hohmann.tof} category="time" unitId="pretty" unitIds={TOOL_UNIT_SETS.timePretty} digits={4} />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">
            {t('fields.need_patched_conic')}
          </p>
        )
      }
      code={
        <CodeExport
          formulaId="patched-conic-depart"
          values={{
            mu: planet.mu,
            R: planet.radius,
            h: toSi(p.h, p.hu),
            v_inf: res?.vInf,
            planet: p.planet,
            target: p.target,
          }}
        />
      }
    />
  )
}
