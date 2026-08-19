import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { FunctionPlot } from '@/components/viz/FunctionPlot'
import {
  formatNumber,
} from '@/lib/physics/format'
import { numParam, strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const PRESETS = [
  { label: 'sin(x)', expr: 'sin(x)', xMin: -10, xMax: 10 },
  { label: '1/x', expr: '1/x', xMin: -5, xMax: 5 },
  { label: 'x^2', expr: 'x*x', xMin: -5, xMax: 5 },
  { label: 'exp(-x^2)', expr: 'exp(-x*x)', xMin: -3, xMax: 3 },
  { label: '√(μ/r)', expr: 'sqrt(3.986e14/x)', xMin: 6.5e6, xMax: 5e7 },
  { label: 'ln(m0/x)', expr: '330*9.80665*log(5e5/x)', xMin: 5e4, xMax: 5e5 },
]

export function compile(expr: string): ((x: number) => number) | null {
  try {
    const body = expr
      .replace(/\^/g, '**')
      .replace(/\blog\b/g, 'Math.log')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bpi\b/gi, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
    // eslint-disable-next-line no-new-func -- intentional sandboxed math eval for offline plotter
    const fn = new Function('x', `"use strict"; return (${body});`) as (x: number) => number
    const test = fn(1)
    if (typeof test !== 'number') return null
    return fn
  } catch {
    return null
  }
}

const SCHEMA = {
  expr: strParam('sin(x)'),
  xmin: numParam(-10),
  xmax: numParam(10),
  n: numParam(200, { min: 20, max: 1000 }),
} as const

export function PlotterTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const { points, error, stats } = useMemo(() => {
    const fn = compile(p.expr)
    if (!fn) return { points: [], error: 'invalid_expression', stats: null }
    if (![p.xmin, p.xmax].every(Number.isFinite) || p.xmax <= p.xmin) {
      return { points: [], error: 'invalid_x_range', stats: null }
    }
    const n = Math.min(1000, Math.max(20, Math.floor(p.n) || 200))
    const step = (p.xmax - p.xmin) / (n - 1)
    const rows: { x: number; y: number }[] = []
    let yMin = Infinity
    let yMax = -Infinity
    for (let i = 0; i < n; i++) {
      const x = p.xmin + step * i
      if (p.xmin < 0 && p.xmax > 0 && Math.abs(x) < step * 1e-9) continue
      try {
        const y = fn(x)
        if (Number.isFinite(y) && Math.abs(y) < 1e300) {
          rows.push({ x, y })
          yMin = Math.min(yMin, y)
          yMax = Math.max(yMax, y)
        }
      } catch {
        /* skip singular samples */
      }
    }
    return {
      points: rows,
      error: rows.length < 2 ? 'too_few_samples' : null,
      stats: rows.length >= 2 ? { yMin, yMax, n: rows.length } : null,
    }
  }, [p.expr, p.n, p.xmax, p.xmin])

  return (
    <ToolShell
      parameters={
        <ParamsGrid>
          <div className="col-span-full min-w-0">
            <UiField
              label={t('fields.f_x')}
              value={p.expr}
              onChange={(e) => setP({ expr: e.target.value })}
              spellCheck={false}
              placeholder={t('fields.placeholder_plotter')}
              hint={t('fields.hint_plotter_funcs')}
            />
          </div>
          <UiField
            label={t('fields.x_min')}
            type="number"
            step="any"
            value={p.xmin}
            onChange={(e) => setP({ xmin: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.x_max')}
            type="number"
            step="any"
            value={p.xmax}
            onChange={(e) => setP({ xmax: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.points')}
            type="number"
            min={20}
            max={1000}
            value={p.n}
            onChange={(e) => setP({ n: Number(e.target.value) })}
          />
          <FieldPresets label={t('common.presets')}>
            {PRESETS.map((pr) => (
              <PresetChip
                key={pr.label}
                onClick={() =>
                  setP({ expr: pr.expr, xmin: pr.xMin, xmax: pr.xMax })
                }
              >
                {pr.label}
              </PresetChip>
            ))}
          </FieldPresets>
        </ParamsGrid>
      }
      results={
        error ? (
          <p className="font-mono text-sm text-muted">{t(`fields.${error}`)}</p>
        ) : stats ? (
          <div className="sidus-results">
            <ResultCard label={t('fields.samples')} value={String(stats.n)} accent />
            <ResultCard label={t('fields.y_min')} value={formatNumber(stats.yMin, 6)} />
            <ResultCard label={t('fields.y_max')} value={formatNumber(stats.yMax, 6)} />
            <ResultCard
              label={t('fields.x_span')}
              value={`${formatNumber(p.xmin, 4)} … ${formatNumber(p.xmax, 4)}`}
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.no_data')}</p>
        )
      }
      preview={
        <FunctionPlot points={points} xLabel="x" yLabel="f(x)" defaultHeight={280} />
      }
      code={<CodeExport formulaId="plotter" values={{ xmin: p.xmin, xmax: p.xmax, n: p.n, expr: p.expr }} />}
    />
  )
}
