import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { UiUnitField } from '@/components/shared/UiUnitField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  linkBudget,
  TOOL_UNIT_SETS,
  toSi,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  /** Tx power in `ptu` */
  pt: numParam(10, { min: 1e-6 }),
  ptu: strParam('W', TOOL_UNIT_SETS.power),
  gt: numParam(30),
  gr: numParam(30),
  /** Frequency in `fu` (default GHz for readability) */
  f: numParam(12, { min: 1e-12 }),
  fu: strParam('GHz', TOOL_UNIT_SETS.frequency),
  range: numParam(1000, { min: 0.001 }),
  ru: strParam('km', TOOL_UNIT_SETS.length),
  loss: numParam(2, { min: 0 }),
  tsys: numParam(290, { min: 1 }),
  tsu: strParam('K', TOOL_UNIT_SETS.temperature),
  req: numParam(50),
} as const

export function LinkBudgetTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const ptW = toSi(p.pt, p.ptu)
  const freqHz = toSi(p.f, p.fu)
  const rangeM = toSi(p.range, p.ru)
  const tSysK = toSi(p.tsys, p.tsu)

  const res = useMemo(
    () =>
      linkBudget({
        ptW,
        gtDbi: p.gt,
        grDbi: p.gr,
        freqHz,
        rangeM,
        otherLossDb: p.loss,
        tSysK,
        requiredCn0DbHz: p.req,
      }),
    [freqHz, p.gr, p.gt, p.loss, ptW, p.req, tSysK, rangeM],
  )

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiUnitField
            label={t('fields.tx_power')}
            category="power"
            unitIds={TOOL_UNIT_SETS.power}
            unitId={p.ptu}
            value={p.pt}
            min={0}
            onValueChange={(pt) => setP({ pt })}
            onUnitChange={(ptu, pt) => setP({ ptu, pt })}
          />
          <UiField
            label={t('fields.gt_dbi')}
            unit="dBi"
            type="number"
            step="any"
            value={p.gt}
            onChange={(e) => setP({ gt: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.gr_dbi')}
            unit="dBi"
            type="number"
            step="any"
            value={p.gr}
            onChange={(e) => setP({ gr: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.frequency')}
            category="frequency"
            unitIds={TOOL_UNIT_SETS.frequency}
            unitId={p.fu}
            value={p.f}
            min={0}
            onValueChange={(f) => setP({ f })}
            onUnitChange={(fu, f) => setP({ fu, f })}
            hint={t('fields.hint_rf_band')}
          />
          <UiUnitField
            label={t('fields.slant_range')}
            category="length"
            unitIds={TOOL_UNIT_SETS.length}
            unitId={p.ru}
            value={p.range}
            min={0}
            onValueChange={(range) => setP({ range })}
            onUnitChange={(ru, range) => setP({ ru, range })}
          />
          <UiField
            label={t('fields.other_losses')}
            unit="dB"
            type="number"
            min={0}
            step="any"
            value={p.loss}
            onChange={(e) => setP({ loss: Number(e.target.value) })}
          />
          <UiUnitField
            label={t('fields.tsys')}
            category="temperature"
            unitIds={TOOL_UNIT_SETS.temperature}
            unitId={p.tsu}
            value={p.tsys}
            min={0}
            onValueChange={(tsys) => setP({ tsys })}
            onUnitChange={(tsu, tsys) => setP({ tsu, tsys })}
          />
          <UiField
            label={t('fields.required_cn0')}
            unit="dB-Hz"
            type="number"
            step="any"
            value={p.req}
            onChange={(e) => setP({ req: Number(e.target.value) })}
          />
        </ParamsGrid>
      }
      results={
        !res ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_rf_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.eirp')} value={formatNumber(res.eirpDbw, 2)} unit="dBW" accent />
            <ResultCard label={t('fields.fspl')} value={formatNumber(res.lfsDb, 2)} unit="dB" />
            <ResultCard label={t('fields.p_r')} value={formatNumber(res.prDbw, 2)} unit="dBW" accent />
            <ResultCard
              label={t('fields.p_r')}
              si={res.prW}
              category="power"
              unitId="W"
              unitIds={TOOL_UNIT_SETS.power}
              digits={3}
            />
            <ResultCard
              label={t('fields.c_n')}
              value={res.cn0DbHz != null ? formatNumber(res.cn0DbHz, 2) : ': '}
              unit="dB-Hz"
            />
            <ResultCard
              label={t('fields.link_margin')}
              value={res.marginDb != null ? formatNumber(res.marginDb, 2) : ': '}
              unit="dB"
              accent
            />
            <ResultCard
              label={t('fields.f_')}
              si={res.wavelengthM}
              category="length"
              unitId="m"
              unitIds={TOOL_UNIT_SETS.length}
              digits={4}
            />
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="link-budget"
          values={{
            // SI + both snake_case (python) and camelCase (js) free vars
            ptW,
            pt_w: ptW,
            gtDbi: p.gt,
            gt_dbi: p.gt,
            grDbi: p.gr,
            gr_dbi: p.gr,
            freqHz,
            f_hz: freqHz,
            fHz: freqHz,
            freqMHz: freqHz / 1e6,
            rangeM,
            range_m: rangeM,
            range_km: rangeM / 1000,
            rangeKm: rangeM / 1000,
            otherLossDb: p.loss,
            other_loss_db: p.loss,
            tSysK,
            t_sys_k: tSysK,
            requiredCn0: p.req,
            required_cn0_dbhz: p.req,
            // raw UI keys (enrichLiveValues also maps these)
            pt: p.pt,
            gt: p.gt,
            gr: p.gr,
            f: p.f,
            range: p.range,
            loss: p.loss,
            tsys: p.tsys,
            req: p.req,
          }}
        />
      }
    />
  )
}
