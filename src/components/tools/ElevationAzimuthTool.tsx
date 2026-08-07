import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { BodySelect } from '@/components/shared/BodySelect'
import { LaunchSitePresets } from '@/components/shared/LaunchSitePresets'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  DEFAULT_LAUNCH_SITE,
  fromSi,
  getBody,
  topocentricElAz,
  TOOL_UNIT_SETS,
  toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  body: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  // CCSFS pad → nearby LEO pass geometry (heights share hu = km)
  slat: numParam(DEFAULT_LAUNCH_SITE.latDeg),
  slon: numParam(DEFAULT_LAUNCH_SITE.lonDeg),
  sh: numParam(DEFAULT_LAUNCH_SITE.heightM / 1000, { min: 0 }),
  tlat: numParam(28.6),
  tlon: numParam(-80.5),
  th: numParam(400, { min: 0 }),
  au: strParam('deg', TOOL_UNIT_SETS.angle),
  hu: strParam('km', TOOL_UNIT_SETS.altitude) } as const

export function ElevationAzimuthTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const body = getBody(p.body)

  const res = useMemo(() => {
    return topocentricElAz(
      toSi(p.slat, p.au),
      toSi(p.slon, p.au),
      toSi(p.sh, p.hu),
      toSi(p.tlat, p.au),
      toSi(p.tlon, p.au),
      toSi(p.th, p.hu),
      body.radius,
    )
  }, [body.radius, p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <BodySelect value={p.body} onChange={(body) => setP({ body })} />
          <p className="font-mono text-[10px] uppercase tracking-wide text-subtle">{t('fields.site')}</p>
          <UiUnitField
            label={t('fields.site_latitude')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.au}
            value={p.slat}
            onValueChange={(slat) => setP({ slat })}
            onUnitChange={(au, slat) =>
              setP({
                au,
                slat,
                slon: fromSi(toSi(p.slon, p.au), au),
                tlat: fromSi(toSi(p.tlat, p.au), au),
                tlon: fromSi(toSi(p.tlon, p.au), au) })
            }
          />
          <UiUnitField
            label={t('fields.site_longitude')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.au}
            value={p.slon}
            onValueChange={(slon) => setP({ slon })}
            onUnitChange={(au, slon) => setP({ au, slon })}
          />
          <UiUnitField
            label={t('fields.site_height')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.sh}
            min={0}
            onValueChange={(sh) => setP({ sh })}
            onUnitChange={(hu, sh) =>
              setP({ hu, sh, th: fromSi(toSi(p.th, p.hu), hu) })
            }
          />
          <LaunchSitePresets
            latDeg={(toSi(p.slat, p.au) * 180) / Math.PI}
            lonDeg={(toSi(p.slon, p.au) * 180) / Math.PI}
            onSelect={(site) =>
              setP({
                slat: fromSi((site.latDeg * Math.PI) / 180, p.au),
                slon: fromSi((site.lonDeg * Math.PI) / 180, p.au),
                sh: fromSi(site.heightM, p.hu),
              })
            }
          />
          <p className="font-mono text-[10px] uppercase tracking-wide text-subtle">{t('fields.target')}</p>
          <UiUnitField
            label={t('fields.target_latitude')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.au}
            value={p.tlat}
            onValueChange={(tlat) => setP({ tlat })}
            onUnitChange={(au, tlat) => setP({ au, tlat })}
          />
          <UiUnitField
            label={t('fields.target_longitude')}
            category="angle"
            unitIds={TOOL_UNIT_SETS.angle}
            unitId={p.au}
            value={p.tlon}
            onValueChange={(tlon) => setP({ tlon })}
            onUnitChange={(au, tlon) => setP({ au, tlon })}
          />
          <UiUnitField
            label={t('fields.target_height')}
            category="length"
            unitIds={TOOL_UNIT_SETS.altitude}
            unitId={p.hu}
            value={p.th}
            min={0}
            onValueChange={(th) => setP({ th })}
            onUnitChange={(hu, th) => setP({ hu, th })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.elevation')}
              si={res.el} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={3}
              accent
            />
            <ResultCard
              label={t('fields.azimuth_n_e')}
              si={res.az} category="angle" unitId="deg" unitIds={TOOL_UNIT_SETS.angle} digits={3}
              accent
            />
            <ResultCard label={t('fields.slant_range')} si={res.range} category="length" unitId="km" unitIds={TOOL_UNIT_SETS.length} digits={3} />
            <ResultCard label={t('fields.east_north_up')} value={`${(res.east / 1000).toFixed(2)} / ${(res.north / 1000).toFixed(2)} / ${(res.up / 1000).toFixed(2)}`} unit="km" />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_geometry')}</p>
        )
      }
      code={<CodeExport formulaId="elevation-azimuth" values={{ R: body.radius, slat: p.slat, slon: p.slon, sh: p.sh, tlat: p.tlat, tlon: p.tlon, th: p.th, body: p.body }} />}
    />
  )
}
