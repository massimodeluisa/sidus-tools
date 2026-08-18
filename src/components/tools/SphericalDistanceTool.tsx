import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  DEFAULT_LAUNCH_SITE,
  fromSi,
  getBody,
  getLaunchSite,
  greatCircleAngle,
  greatCircleDistance,
  initialBearing,
  TOOL_UNIT_SETS,
  toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const KOUROU = getLaunchSite('kourou')!
const VSFB = getLaunchSite('vsfb')!
const BAIKONUR = getLaunchSite('baikonur')!

const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  lat1: numParam(DEFAULT_LAUNCH_SITE.latDeg),
  lon1: numParam(DEFAULT_LAUNCH_SITE.lonDeg),
  lat2: numParam(KOUROU.latDeg),
  lon2: numParam(KOUROU.lonDeg),
  au: strParam('deg', TOOL_UNIT_SETS.angle) } as const

/** Inter-range great-circle demos (point1 → point2). */
const RANGE_PAIRS = [
  { labelKey: 'fields.preset_ccsfs_kourou' as const, a: DEFAULT_LAUNCH_SITE, b: KOUROU },
  { labelKey: 'fields.preset_ccsfs_vsfb' as const, a: DEFAULT_LAUNCH_SITE, b: VSFB },
  { labelKey: 'fields.preset_ccsfs_baikonur' as const, a: DEFAULT_LAUNCH_SITE, b: BAIKONUR },
  { labelKey: 'fields.preset_kourou_sdsc' as const, a: KOUROU, b: getLaunchSite('sdsc')! },
] as const

export function SphericalDistanceTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)
  const lat1 = toSi(p.lat1, p.au)
  const lon1 = toSi(p.lon1, p.au)
  const lat2 = toSi(p.lat2, p.au)
  const lon2 = toSi(p.lon2, p.au)

  const res = useMemo(() => {
    const lat1 = toSi(p.lat1, p.au)
    const lon1 = toSi(p.lon1, p.au)
    const lat2 = toSi(p.lat2, p.au)
    const lon2 = toSi(p.lon2, p.au)
    const ang = greatCircleAngle(lat1, lon1, lat2, lon2)
    const dist = greatCircleDistance(body.radius, lat1, lon1, lat2, lon2)
    const brg = initialBearing(lat1, lon1, lat2, lon2)
    if (ang == null || dist == null || brg == null) return null
    return { ang, dist, brg }
  }, [body.radius, p.au, p.lat1, p.lat2, p.lon1, p.lon2])

  function changeAngleUnit(au: string) {
    setP({
      au,
      lat1: fromSi(toSi(p.lat1, p.au), au),
      lon1: fromSi(toSi(p.lon1, p.au), au),
      lat2: fromSi(toSi(p.lat2, p.au), au),
      lon2: fromSi(toSi(p.lon2, p.au), au) })
  }

  function applyPair(a: typeof DEFAULT_LAUNCH_SITE, b: typeof DEFAULT_LAUNCH_SITE) {
    setP({
      lat1: fromSi((a.latDeg * Math.PI) / 180, p.au),
      lon1: fromSi((a.lonDeg * Math.PI) / 180, p.au),
      lat2: fromSi((b.latDeg * Math.PI) / 180, p.au),
      lon2: fromSi((b.lonDeg * Math.PI) / 180, p.au),
    })
  }

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <UiUnitField
            label={t('fields.latitude_1')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.au}
            value={p.lat1}
            onValueChange={(lat1) => setP({ lat1 })}
            onUnitChange={(au) => changeAngleUnit(au)}
          />
          <UiUnitField
            label={t('fields.longitude_1')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.au}
            value={p.lon1}
            onValueChange={(lon1) => setP({ lon1 })}
            onUnitChange={(au) => changeAngleUnit(au)}
          />
          <UiUnitField
            label={t('fields.latitude_2')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.au}
            value={p.lat2}
            onValueChange={(lat2) => setP({ lat2 })}
            onUnitChange={(au) => changeAngleUnit(au)}
          />
          <UiUnitField
            label={t('fields.longitude_2')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.au}
            value={p.lon2}
            onValueChange={(lon2) => setP({ lon2 })}
            onUnitChange={(au) => changeAngleUnit(au)}
          />
          <FieldPresets label={t('common.presets')}>
            {RANGE_PAIRS.map((pr) => (
              <PresetChip key={pr.labelKey} onClick={() => applyPair(pr.a, pr.b)}>
                {t(pr.labelKey)}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard label={t('fields.great_circle_distance')} si={res.dist} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={3} accent />
            <ResultCard
              label={t('fields.central_angle')}
              si={res.ang} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={4}
            />
            <ResultCard
              label={t('fields.initial_bearing')}
              si={res.brg} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={3}
            />
            <ResultCard label={t('fields.body_r')} si={(body.radius / 1000) * 1000} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={1} />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_lat_lon')}</p>
        )
      }
      code={<CodeExport formulaId="spherical-distance" values={{ lat1, lon1, lat2, lon2, R: body.radius, body: p.body }} />}
    />
  )
}
