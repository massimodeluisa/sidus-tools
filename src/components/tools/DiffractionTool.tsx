import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { diffractionResolution, TOOL_UNIT_SETS, toSi } from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  f: numParam(10, { min: 0.001 }),
  fu: strParam('GHz', TOOL_UNIT_SETS.frequency),
  D: numParam(1, { min: 0.001 }),
  Du: strParam('m', TOOL_UNIT_SETS.lengthSmall),
  range: numParam(400, { min: 0 }),
  ru: strParam('km', TOOL_UNIT_SETS.length),
} as const

export function DiffractionTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const fHz = toSi(p.f, p.fu)
  const D = toSi(p.D, p.Du)
  const range = toSi(p.range, p.ru)
  const res = useMemo(
    () => diffractionResolution(fHz, D, range || undefined),
    [fHz, D, range],
  )
  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.frequency')}
            category="frequency"
            unitIds={TOOL_UNIT_SETS.frequency}
            unitId={p.fu}
            value={p.f}
            min={0.001}
            onValueChange={(f) => setP({ f })}
            onUnitChange={(fu, f) => setP({ fu, f })}
          />
          <UiUnitField
            label={t('fields.aperture_d')}
            category="length"
            unitIds={TOOL_UNIT_SETS.lengthSmall}
            unitId={p.Du}
            value={p.D}
            min={0.001}
            onValueChange={(D) => setP({ D })}
            onUnitChange={(Du, D) => setP({ Du, D })}
          />
          <UiUnitField
            label={t('fields.range_for_gsd')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.ru}
            value={p.range}
            min={0}
            onValueChange={(range) => setP({ range })}
            onUnitChange={(ru, range) => setP({ ru, range })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.f_1_22_d')}
              si={res.thetaRad}
              category="angle"
              unitId="arcsec"
              unitIds={TOOL_UNIT_SETS.angle}
              digits={3}
              accent
            />
            {res.gsdM != null ? (
              <ResultCard
                label={t('fields.gsd_range')}
                si={res.gsdM}
                category="length"
                unitId="m"
                unitIds={TOOL_UNIT_SETS.length}
                digits={2}
              />
            ) : null}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_aperture')}</p>
        )
      }
      code={<CodeExport formulaId="diffraction" values={{ fHz, D, range, f: fHz }} />}
    />
  )
}
