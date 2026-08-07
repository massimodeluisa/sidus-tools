import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import {
  BODIES,
  circularOrbitVelocity,
  EARTH_MU,
  EARTH_RADIUS,
  escapeVelocity,
  hohmannTransfer,
  linkBudget,
  rocketDeltaV,
} from '@/lib/physics'
import { cn } from '@/lib/utils'

type MetricRow = { label: string; value: string; unit?: string }

type SlideBase = {
  id: string
  toolId: string
  kicker: string
  title: string
  blurb: string
  footnote: string
}

type Slide = SlideBase & { rows: MetricRow[]; runKey: string }

/** Uniform random in [min, max). */
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randInt(min: number, maxInclusive: number): number {
  return Math.floor(rand(min, maxInclusive + 1))
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

const SLIDE_META: SlideBase[] = [
  {
    id: 'circular',
    toolId: 'circular-orbit',
    kicker: '01 · Orbital',
    title: 'Circular orbit',
    blurb: 'Two-body circular velocity at a random LEO altitude.',
    footnote: 'circularOrbitVelocity(μ, r)',
  },
  {
    id: 'hohmann',
    toolId: 'hohmann',
    kicker: '02 · Transfer',
    title: 'Hohmann transfer',
    blurb: 'Coplanar transfer between two random circular radii.',
    footnote: 'hohmannTransfer(μ, r₁, r₂)',
  },
  {
    id: 'escape',
    toolId: 'escape',
    kicker: '03 · Escape',
    title: 'Surface escape',
    blurb: 'Impulsive escape speed at a random planetary surface.',
    footnote: 'escapeVelocity(μ, R)',
  },
  {
    id: 'rocket',
    toolId: 'rocket-equation',
    kicker: '04 · Propulsion',
    title: 'Rocket equation',
    blurb: 'Ideal Δv from Isp and mass ratio (no gravity loss).',
    footnote: 'rocketDeltaV(Isp, m0, mf)',
  },
  {
    id: 'sgp4',
    toolId: 'sgp4',
    kicker: '05 · Satellite',
    title: 'SGP4 / TLE',
    blurb: 'Propagate NORAD TLE with satellite.js (TEME-class).',
    footnote: 'twoline2satrec · propagate',
  },
  {
    id: 'link',
    toolId: 'link-budget',
    kicker: '06 · RF',
    title: 'Link budget',
    blurb: 'Friis free-space path loss + margins (educational).',
    footnote: 'link budget · pure SI chain',
  },
]

function generateRows(slideId: string): MetricRow[] {
  switch (slideId) {
    case 'circular': {
      // LEO / MEO-ish educational altitudes
      const hKm = randInt(250, 1200)
      const r = EARTH_RADIUS + hKm * 1000
      const v = circularOrbitVelocity(EARTH_MU, r) ?? 0
      const T = (2 * Math.PI * Math.sqrt(r ** 3 / EARTH_MU)) / 60
      return [
        { label: 'h', value: String(hKm), unit: 'km' },
        { label: 'v_circ', value: (v / 1000).toFixed(3), unit: 'km/s' },
        { label: 'T', value: T.toFixed(1), unit: 'min' },
      ]
    }
    case 'hohmann': {
      const h1 = randInt(300, 800)
      const h2 = randInt(1000, 36_000)
      const r1 = EARTH_RADIUS + h1 * 1000
      const r2 = EARTH_RADIUS + Math.max(h2, h1 + 200) * 1000
      const h = hohmannTransfer(EARTH_MU, Math.min(r1, r2), Math.max(r1, r2))
      return [
        { label: 'Δv₁', value: (h.dv1 / 1000).toFixed(3), unit: 'km/s' },
        { label: 'Δv₂', value: (h.dv2 / 1000).toFixed(3), unit: 'km/s' },
        { label: 'TOF', value: (h.tof / 3600).toFixed(2), unit: 'h' },
      ]
    }
    case 'escape': {
      const body = pick(BODIES.filter((b) => b.mu > 0 && b.radius > 0))
      const vesc = escapeVelocity(body.mu, body.radius)
      const vc = vesc / Math.SQRT2
      return [
        { label: 'body', value: body.name.slice(0, 8) },
        { label: 'v_esc', value: (vesc / 1000).toFixed(3), unit: 'km/s' },
        { label: 'v_c', value: (vc / 1000).toFixed(3), unit: 'km/s' },
      ]
    }
    case 'rocket': {
      const isp = randInt(260, 460)
      const ratio = rand(2.2, 9.5)
      const m0 = 100_000
      const mf = m0 / ratio
      const dv = rocketDeltaV(isp, m0, mf)
      return [
        { label: 'Isp', value: String(isp), unit: 's' },
        { label: 'm₀/m_f', value: ratio.toFixed(2), unit: '-' },
        { label: 'Δv', value: (dv / 1000).toFixed(2), unit: 'km/s' },
      ]
    }
    case 'sgp4': {
      const cats = ['LEO', 'MEO', 'GEO', 'HEO'] as const
      const libs = ['satellite.js', 'SGP4', 'SDP4'] as const
      return [
        { label: 'lib', value: pick(libs) },
        { label: 'band', value: pick(cats) },
        { label: 'epoch', value: `${randInt(2020, 2026)}.${String(randInt(1, 365)).padStart(3, '0')}` },
      ]
    }
    case 'link': {
      const ptW = rand(1, 80)
      const gt = rand(0, 45)
      const gr = rand(10, 50)
      const fHz = rand(1.5e9, 30e9)
      const rangeM = rand(400e3, 40_000e3)
      const loss = rand(0.5, 4)
      const tsys = rand(80, 400)
      const req = rand(40, 60)
      const lb = linkBudget({
        ptW,
        gtDbi: gt,
        grDbi: gr,
        freqHz: fHz,
        rangeM,
        otherLossDb: loss,
        tSysK: tsys,
        requiredCn0DbHz: req,
      })
      return [
        { label: 'f', value: (fHz / 1e9).toFixed(2), unit: 'GHz' },
        { label: 'range', value: (rangeM / 1000).toFixed(0), unit: 'km' },
        {
          label: 'margin',
          value: lb?.marginDb != null ? lb.marginDb.toFixed(1) : ': ',
          unit: 'dB',
        },
      ]
    }
    default:
      return []
  }
}

function buildSlide(index: number): Slide {
  const base = SLIDE_META[index % SLIDE_META.length]!
  const rows = generateRows(base.id)
  return {
    ...base,
    rows,
    runKey: `${base.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }
}

/** Longer dwell so typewriter + reading time fit before switch. */
const INTERVAL_MS = 12_000
const TYPE_MS = 48
const ROW_STAGGER_MS = 160

/**
 * Types value digits first, then unit (muted) at the end: terminal chrome.
 */
function TypeMetric({
  value,
  unit,
  runKey,
  delayMs = 0,
}: {
  value: string
  unit?: string
  runKey: string
  delayMs?: number
}) {
  const unitText = unit ?? ''
  const total = value.length + unitText.length
  const [n, setN] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    setN(0)
    setStarted(false)
    const startT = window.setTimeout(() => setStarted(true), delayMs)
    return () => window.clearTimeout(startT)
  }, [runKey, value, unit, delayMs])

  useEffect(() => {
    if (!started) return
    setN(0)
    if (total === 0) return
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setN(i)
      if (i >= total) window.clearInterval(id)
    }, TYPE_MS)
    return () => window.clearInterval(id)
  }, [started, runKey, value, unit, total])

  const vShow = value.slice(0, Math.min(n, value.length))
  const uShow =
    n > value.length ? unitText.slice(0, n - value.length) : ''
  const typing = started && n < total

  return (
    <p className="mt-1 min-h-[1.5rem] font-mono text-base tabular text-fg sm:text-lg">
      <span>{vShow}</span>
      {uShow ? (
        <span className="ml-1 text-[11px] text-muted sm:text-xs">{uShow}</span>
      ) : null}
      {typing ? (
        <span
          className="ml-0.5 inline-block w-[0.5ch] animate-pulse bg-signal/80 align-baseline"
          style={{ height: '0.85em' }}
          aria-hidden
        />
      ) : null}
    </p>
  )
}

export function ToolExampleCarousel({ className }: { className?: string }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tick, setTick] = useState(0)
  const n = SLIDE_META.length

  // Rebuild random metrics whenever the slide index changes (or remount tick)
  const slide = useMemo(() => buildSlide(i), [i, tick])

  const go = useCallback(
    (dir: -1 | 1) => {
      setI((cur) => (cur + dir + n) % n)
    },
    [n],
  )

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setI((cur) => (cur + 1) % n)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [paused, n, i])

  return (
    <div
      className={cn(
        'flex h-full min-h-[22rem] min-w-0 flex-col border border-border-strong bg-bg/85 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-border)_80%,transparent),0_28px_90px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md sm:min-h-[26rem] lg:min-h-[28rem]',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false)
      }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5 sm:px-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          tools · live examples
        </span>
        <div className="flex items-center gap-1">
          <span className="mr-1 font-mono text-[10px] tabular text-muted">
            {String(i + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}
          </span>
          <button
            type="button"
            aria-label={paused ? 'Play carousel' : 'Pause carousel'}
            onClick={() => setPaused((p) => !p)}
            className="inline-flex size-7 items-center justify-center border border-border text-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <button
            type="button"
            aria-label="Previous tool"
            onClick={() => go(-1)}
            className="inline-flex size-7 items-center justify-center border border-border text-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Next tool"
            onClick={() => go(1)}
            className="inline-flex size-7 items-center justify-center border border-border text-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6" key={slide.runKey}>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
          {slide.kicker}
        </p>
        <h3 className="mt-2 font-display text-2xl font-medium tracking-tight text-fg">
          {slide.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[15px]">{slide.blurb}</p>

        <div className="mt-5 grid grid-cols-3 gap-px border border-border bg-border">
          {slide.rows.map((r, rowIdx) => (
            <div key={`${r.label}-${rowIdx}`} className="bg-bg-elevated/95 px-3 py-4 sm:px-3.5 sm:py-5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-subtle">
                {r.label}
              </p>
              <TypeMetric
                value={r.value}
                unit={r.unit}
                runKey={slide.runKey}
                delayMs={rowIdx * ROW_STAGGER_MS}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 border border-border bg-bg/60 px-3 py-2.5">
          <p className="font-mono text-[10px] leading-relaxed text-subtle">
            <span className="text-muted">fn </span>
            {slide.footnote}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex gap-1.5" role="tablist" aria-label="Carousel slides">
            {SLIDE_META.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={idx === i}
                aria-label={`Show ${s.title}`}
                onClick={() => {
                  setI(idx)
                  setTick((t) => t + 1)
                }}
                className={cn(
                  'h-1.5 w-6 transition-colors',
                  idx === i ? 'bg-signal' : 'bg-border-strong hover:bg-muted',
                )}
              />
            ))}
          </div>
          <Link
            to={`/tools/${slide.toolId}`}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-signal no-underline hover:underline"
          >
            Open tool
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="h-0.5 w-full shrink-0 overflow-hidden bg-border">
        <div
          key={`${slide.runKey}-${paused}`}
          className={cn(
            'h-full bg-signal/80',
            paused ? 'w-full opacity-30' : 'w-full animate-carousel-progress',
          )}
          style={
            paused
              ? undefined
              : ({ animationDuration: `${INTERVAL_MS}ms` } as React.CSSProperties)
          }
        />
      </div>
    </div>
  )
}
