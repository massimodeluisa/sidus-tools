import { useMemo } from 'react'
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
  circularOrbitVelocity,
  getBody,
  planeChangeDeltaV,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  mode: strParam('altitude', ['altitude', 'speed'] as const),
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  h: numParam(400, { min: 0 }),
  hu: strParam('km', TOOL_UNIT_SETS.altitude),
  v: numParam(7.67, { min: 0 }),
  vu: strParam('kmps', TOOL_UNIT_SETS.velocity),
  di: numParam(28.5),
  diu: strParam('deg', TOOL_UNIT_SETS.angle),
} as const

export function PlaneChangeTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const body = getBody(p.body)
  const results = useMemo(() => {
    const diRad = toSi(p.di, p.diu)
    if (!Number.isFinite(diRad)) return null
    let v: number
    if (p.mode === 'altitude') {
      const h_m = toSi(p.h, p.hu)
      if (!Number.isFinite(h_m) || h_m < 0) return null
      const r = body.radius + h_m
      v = circularOrbitVelocity(body.mu, r)
    } else {
      v = toSi(p.v, p.vu)
      if (!Number.isFinite(v) || v <= 0) return null
    }
    const dv = planeChangeDeltaV(v, diRad)
    return { v, dv }
  }, [body, p.di, p.diu, p.h, p.hu, p.mode, p.v, p.vu])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiSelect
            label={t('fields.input_mode')}
            value={p.mode}
            onChange={(e) => setP({ mode: e.target.value })}
            options={[
              { value: 'altitude', label: t('fields.mode_alt_to_speed') },
              { value: 'speed', label: t('fields.mode_speed_direct') },
            ]}
          />
          {p.mode === 'altitude' ? (
            <>
              <BodySelect
            value={p.body}
            onChange={(body) => setP({ body })}
          />
              <UiUnitField
                label={t('fields.altitude')}
                category="length"
                unitIds={TOOL_UNIT_SETS.altitude}
                unitId={p.hu}
                value={p.h}
                min={0}
                onValueChange={(h) => setP({ h })}
                onUnitChange={(hu, h) => setP({ hu, h })}
              />
            </>
          ) : (
            <UiUnitField
              label={t('fields.orbital_speed')}
              category="velocity"
              unitIds={TOOL_UNIT_SETS.velocity}
              unitId={p.vu}
              value={p.v}
              min={0}
              onValueChange={(v) => setP({ v })}
              onUnitChange={(vu, v) => setP({ vu, v })}
            />
          )}
          <UiUnitField
            label={t('fields.inclination_change_i')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.diu}
            value={p.di}
            onValueChange={(di) => setP({ di })}
            onUnitChange={(diu, di) => setP({ diu, di })}
            hint={t('fields.hint_plane_change_pure')}
          />
        </ParamsGrid>
      }
      results={
        results ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.orbital_speed_used')}
              si={results.v}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            <ResultCard
              label={t('fields.v_plane_change')}
              si={results.dv}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        )
      }
      code={<CodeExport formulaId="plane-change" values={{ v: results?.v, di_deg: p.di }} />}
    />
  )
}
