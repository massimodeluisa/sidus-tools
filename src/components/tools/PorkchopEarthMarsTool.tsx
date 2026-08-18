import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  AU,
  EARTH_HELIO_L0,
  J2000_UNIX_S,
  MARS_HELIO_L0,
  MARS_SMA_M,
  SUN_MU,
  TOOL_UNIT_SETS,
  porkchopEarthMarsGrid,
} from '@/lib/physics'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  dep: strParam('2026-11-01'),
  depSpan: numParam(400, { min: 40, max: 900 }),
  depStep: numParam(20, { min: 5, max: 60 }),
  tofMin: numParam(120, { min: 40, max: 500 }),
  tofMax: numParam(360, { min: 80, max: 600 }),
  tofStep: numParam(20, { min: 5, max: 60 }),
} as const

function parseDayStart(isoDate: string): number | null {
  const t = Date.parse(`${isoDate}T00:00:00Z`)
  return Number.isFinite(t) ? t / 1000 : null
}

export function PorkchopEarthMarsTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const depStart = parseDayStart(p.dep)
    if (depStart == null) return null
    const depStep = p.depStep * 86400
    const depCount = Math.max(2, Math.floor(p.depSpan / p.depStep) + 1)
    const tofMin = p.tofMin * 86400
    const tofStep = p.tofStep * 86400
    const tofCount = Math.max(2, Math.floor((p.tofMax - p.tofMin) / p.tofStep) + 1)
    return porkchopEarthMarsGrid({
      depStart,
      depCount,
      depStep,
      tofMin,
      tofCount,
      tofStep,
    })
  }, [p])

  const neighbor = res?.cells.find((c) => c !== res.bestDv && c.dvTot !== res.bestDv?.dvTot)

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <UiField
            label={t('fields.dep_date')}
            type="text"
            value={p.dep}
            onChange={(e) => setP({ dep: e.target.value })}
          />
          <UiField
            label={t('fields.dep_span_d')}
            type="number"
            value={p.depSpan}
            min={40}
            onChange={(e) => setP({ depSpan: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.dep_step_d')}
            type="number"
            value={p.depStep}
            min={5}
            onChange={(e) => setP({ depStep: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.tof_min_d')}
            type="number"
            value={p.tofMin}
            min={40}
            onChange={(e) => setP({ tofMin: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.tof_max_d')}
            type="number"
            value={p.tofMax}
            min={80}
            onChange={(e) => setP({ tofMax: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.tof_step_d')}
            type="number"
            value={p.tofStep}
            min={5}
            onChange={(e) => setP({ tofStep: Number(e.target.value) })}
          />
        </ParamsGrid>
      }
      results={
        !res || !res.bestDv ? (
          <p className="font-mono text-sm text-muted">{t('fields.invalid_params')}</p>
        ) : (
          <div className="sidus-results">
            <ResultCard label={t('fields.grid_cells')} value={String(res.cells.length)} />
            <ResultCard
              label={t('fields.porkchop_min_dv')}
              si={res.bestDv.dvTot}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
              accent
            />
            <ResultCard
              label={t('fields.porkchop_min_c3')}
              si={res.bestC3!.c3}
              category="specificEnergy"
              unitId="km2ps2"
              unitIds={TOOL_UNIT_SETS.c3}
              digits={4}
            />
            <ResultCard
              label={t('fields.best_dep')}
              value={new Date(res.bestDv.tDep * 1000).toISOString().slice(0, 10)}
            />
            <ResultCard
              label={t('fields.best_arr')}
              value={new Date(res.bestDv.tArr * 1000).toISOString().slice(0, 10)}
            />
            {neighbor ? (
              <ResultCard
                label={t('fields.neighbor_dv')}
                si={neighbor.dvTot}
                category="velocity"
                unitId="kmps"
                unitIds={TOOL_UNIT_SETS.velocity}
                digits={4}
              />
            ) : null}
            <p className="col-span-full font-mono text-xs leading-relaxed text-muted">
              {t('fields.porkchop_chain_note')}{' '}
              <Link
                to="/tools/patched-conic-depart"
                className="text-signal underline-offset-2 hover:underline"
              >
                {t('fields.porkchop_chain_link')}
              </Link>
              .
            </p>
          </div>
        )
      }
      code={
        <CodeExport
          formulaId="porkchop-earth-mars"
          values={{
            mu: SUN_MU,
            aE: AU,
            aM: MARS_SMA_M,
            LE0: EARTH_HELIO_L0,
            LM0: MARS_HELIO_L0,
            t0: J2000_UNIX_S,
            tDep: res?.bestDv?.tDep ?? 0,
            tArr: res?.bestDv?.tArr ?? 0,
            v1x: res?.bestDv?.v1[0] ?? 0,
            v1y: res?.bestDv?.v1[1] ?? 0,
            v1z: res?.bestDv?.v1[2] ?? 0,
          }}
        />
      }
    />
  )
}
