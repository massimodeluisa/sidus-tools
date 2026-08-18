import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  TOOL_UNIT_SETS,
  eirpDbW,
  eirpLinear,
  figureOfMeritGT,
  figureOfMeritGTDb,
  toSi,
} from '@/lib/physics'
import { formatNumber } from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  P: numParam(10, { min: 0 }),
  Pu: strParam('W', TOOL_UNIT_SETS.power),
  G: numParam(100, { min: 0 }),
  Tsys: numParam(150, { min: 0 }),
  Tu: strParam('K', TOOL_UNIT_SETS.temperature),
} as const

export function EirpGtTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const P = toSi(p.P, p.Pu)
    const Tsys = toSi(p.Tsys, p.Tu)
    const eirp = eirpLinear(P, p.G)
    const eirpDb = eirpDbW(P, p.G)
    const gt = figureOfMeritGT(p.G, Tsys)
    const gtDb = figureOfMeritGTDb(p.G, Tsys)
    if (eirp == null || eirpDb == null || gt == null || gtDb == null) return null
    return { eirp, eirpDb, gt, gtDb }
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.tx_power')}
            category="power"
            unitIds={TOOL_UNIT_SETS.power}
            unitId={p.Pu}
            value={p.P}
            min={0}
            onValueChange={(P) => setP({ P })}
            onUnitChange={(Pu, P) => setP({ Pu, P })}
          />
          <UiField
            label={t('fields.disc_g')}
            type="number"
            value={p.G}
            min={0}
            onChange={(e) => setP({ G: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.tsys')}
            category="temperature"
            unitIds={TOOL_UNIT_SETS.temperature}
            unitId={p.Tu}
            value={p.Tsys}
            min={0}
            onValueChange={(Tsys) => setP({ Tsys })}
            onUnitChange={(Tu, Tsys) => setP({ Tu, Tsys })}
          />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard
              label={t('fields.eirp')}
              si={res.eirp}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={4}
              accent
            />
            <ResultCard label={t('fields.eirp_dbw')} value={formatNumber(res.eirpDb, 4)} unit="dBW" />
            <ResultCard label={t('fields.gt_figure')} value={formatNumber(res.gt, 4)} unit="1/K" />
            <ResultCard label={t('fields.gt_db')} value={formatNumber(res.gtDb, 4)} unit="dB/K" />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="eirp-gt"
          values={{ P: toSi(p.P, p.Pu), G: p.G, Tsys: toSi(p.Tsys, p.Tu) }}
        />
      }
    />
  )
}
