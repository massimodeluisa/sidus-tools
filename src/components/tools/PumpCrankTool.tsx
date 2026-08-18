import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { TOOL_UNIT_SETS, getBody, pumpCrankFlyby, toSi } from '@/lib/physics'
import { BodySelect } from '@/components/shared/BodySelect'
import { formatNumber } from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam('mars'),
  vinf: numParam(3, { min: 0 }),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity),
  h: numParam(300, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  pump: numParam(25),
  crank: numParam(15),
  au: strParam('deg', TOOL_UNIT_SETS.angle),
  vp: numParam(24.13, { min: 0 }),
  vpu: strParam('kmps', TOOL_UNIT_SETS.velocity),
} as const

export function PumpCrankTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const res = useMemo(() => {
    return pumpCrankFlyby({
      vInf: toSi(p.vinf, p.vu),
      mu: body.mu,
      rp: body.radius + toSi(p.h, p.hu),
      pump: toSi(p.pump, p.au),
      crank: toSi(p.crank, p.au),
      vPlanet: toSi(p.vp, p.vpu),
    })
  }, [p, body])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField label={t('fields.vinf')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vu} value={p.vinf} min={0} onValueChange={(vinf) => setP({ vinf })} onUnitChange={(vu, vinf) => setP({ vu, vinf })} />
          <UiUnitField label={t('fields.periapsis_altitude')} category="length" unitIds={TOOL_UNIT_SETS.altitude} unitId={p.hu} value={p.h} min={0} onValueChange={(h) => setP({ h })} onUnitChange={(hu, h) => setP({ hu, h })} />
          <UiUnitField label={t('fields.pump')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.au} value={p.pump} onValueChange={(pump) => setP({ pump })} onUnitChange={(au, pump) => setP({ au, pump })} />
          <UiUnitField label={t('fields.crank')} category="angle" unitIds={TOOL_UNIT_SETS.angle} unitId={p.au} value={p.crank} onValueChange={(crank) => setP({ crank })} onUnitChange={(au, crank) => setP({ au, crank })} />
          <UiUnitField label={t('fields.v_planet')} category="velocity" unitIds={TOOL_UNIT_SETS.velocity} unitId={p.vpu} value={p.vp} min={0} onValueChange={(vp) => setP({ vp })} onUnitChange={(vpu, vp) => setP({ vpu, vp })} />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.turn_flyby')} si={res.turn} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={3} accent />
            <ResultCard label={t('fields.eccentricity')} value={formatNumber(res.e, 6)} />
            <ResultCard label={t('fields.vinf_out')} si={res.vInfOutMag} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.dv_helio')} si={res.dvHelio} category="velocity" unitId="kmps" unitIds={TOOL_UNIT_SETS.velocity} digits={4} />
            <ResultCard label={t('fields.energy_gain')} si={res.energyGain} category="specificEnergy" unitId="km2ps2" unitIds={TOOL_UNIT_SETS.c3} digits={4} />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="pump-crank"
          values={{
            vinf: toSi(p.vinf, p.vu),
            mu: body.mu,
            rp: body.radius + toSi(p.h, p.hu),
            pump: toSi(p.pump, p.au),
            crank: toSi(p.crank, p.au),
          }}
        />
      }
    />
  )
}
