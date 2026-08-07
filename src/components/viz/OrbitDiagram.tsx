/**
 * Orbit diagram: **uniform scale** (circles stay circular).
 * Polar Kepler equation about the focus (body centre):
 *   r(ν) = a(1−e²)/(1+e cos ν)
 * Screen: +x right, +y up (SVG y flipped).
 */

import { useId, useMemo, useState } from 'react'
import { useElementSize } from './useElementSize'
import { useVizViewport } from './useVizViewport'
import { VizControls } from './VizControls'

export type OrbitDiagramProps = {
  mode: 'circular' | 'hohmann' | 'bielliptic' | 'escape' | 'ellipse'
  /** Central-body equatorial radius [m]. */
  bodyR: number
  /**
   * Primary radius [m]:
   * - circular / escape: orbit radius
   * - hohmann / bielliptic: r₁
   * - ellipse: semi-major axis a
   */
  r1: number
  r2?: number
  rb?: number
  /** Eccentricity for mode=ellipse (0 ≤ e < 1). */
  e?: number
  className?: string
  animate?: boolean
  defaultHeight?: number
}

type Layer = {
  id: string
  d: string
  stroke: string
  width: number
  dash?: string
  opacity?: number
  label: string
  detail: string
}

const SAMPLES = 180
/** Dense sampling for high-e transfer legs (smooth near periapsis). */
const SAMPLES_TRANSFER = 256

function fmtKm(m: number): string {
  if (!Number.isFinite(m)) return ': '
  const km = m / 1000
  if (Math.abs(km) >= 1e5) return `${km.toExponential(2)} km`
  return `${km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km`
}

/** Uniform m → px scale from body + orbit radii. */
function makeScale(bodyR: number, radii: number[], size: number, pad: number) {
  const positive = radii.filter((r) => Number.isFinite(r) && r > 0)
  const maxR = Math.max(bodyR * 1.05, ...positive, 1)
  const avail = size / 2 - pad
  const k = avail / maxR
  return {
    k,
    bodyPx: Math.max(4, bodyR * k),
    maxR,
    /** Physical radius [m] → pixel length */
    px: (r: number) => r * k,
  }
}

/**
 * Sample Keplerian polar curve about the focus (fx, fy).
 * ν measured from periapsis (+x). SVG y increases down → flip sin.
 * For e ≥ 1 use open branch (closed=false); p = a(1−e²) only for e<1.
 */
function sampleEllipseAtFocus(
  a: number,
  eRaw: number,
  fx: number,
  fy: number,
  k: number,
  nu0 = 0,
  nu1 = 2 * Math.PI,
  closed = true,
  samples = SAMPLES,
): string {
  if (!(k > 0)) return ''
  const e = eRaw
  const n = Math.max(8, samples)
  // Parabola e=1: r = 2 rp / (1+cos ν) with a unused; pass rp as a when e≈1
  const pts: string[] = []
  if (Math.abs(e - 1) < 1e-9 || e >= 1) {
    // Parabola: interpret `a` as periapsis radius rp
    const rp = a
    if (!(rp > 0)) return ''
    for (let i = 0; i <= n; i++) {
      const nu = nu0 + ((nu1 - nu0) * i) / n
      const den = 1 + Math.cos(nu)
      if (den < 1e-4) continue
      const r = (2 * rp) / den
      if (!(r > 0) || !Number.isFinite(r) || r > rp * 14) continue
      const x = fx + k * r * Math.cos(nu)
      const y = fy - k * r * Math.sin(nu)
      pts.push(`${pts.length === 0 ? 'M' : 'L'}${x.toFixed(3)},${y.toFixed(3)}`)
    }
    return pts.join(' ')
  }
  if (!(a > 0)) return ''
  const ecc = Math.min(0.999999, Math.max(0, e))
  const p = a * (1 - ecc * ecc)
  if (!(p > 0)) return ''
  for (let i = 0; i <= n; i++) {
    const nu = nu0 + ((nu1 - nu0) * i) / n
    const r = p / (1 + ecc * Math.cos(nu))
    if (!(r > 0) || !Number.isFinite(r)) continue
    const x = fx + k * r * Math.cos(nu)
    const y = fy - k * r * Math.sin(nu) // +y physics → −y SVG
    pts.push(`${pts.length === 0 ? 'M' : 'L'}${x.toFixed(3)},${y.toFixed(3)}`)
  }
  if (closed && pts.length > 2 && Math.abs(nu1 - nu0 - 2 * Math.PI) < 1e-9) {
    pts.push('Z')
  }
  return pts.join(' ')
}

function sampleCircle(radiusM: number, fx: number, fy: number, k: number): string {
  if (!(radiusM > 0) || !(k > 0)) return ''
  return sampleEllipseAtFocus(radiusM, 0, fx, fy, k)
}

export function OrbitDiagram({
  mode,
  bodyR,
  r1,
  r2,
  rb,
  e = 0,
  className = '',
  animate = true,
  defaultHeight: _dh,
}: OrbitDiagramProps) {
  void _dh
  const uid = useId().replace(/:/g, '')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [tip, setTip] = useState<{
    x: number
    y: number
    label: string
    detail: string
  } | null>(null)

  const { ref, width, height, ready } = useElementSize<HTMLDivElement>(40, 40)
  // Square drawing space so geometry is isotropic even if the card is wide.
  const S = Math.max(120, Math.floor(Math.min(width || 300, height || 300)))
  const CX = S / 2
  const CY = S / 2
  const PAD = S * 0.1

  const extents = useMemo(() => {
    const rs: number[] = [Math.max(bodyR, 1)]
    if (mode === 'ellipse') {
      const a = r1
      const ecc = Math.min(0.999, Math.max(0, e))
      if (a > 0) {
        rs.push(a * (1 + ecc))
        rs.push(Math.max(a * (1 - ecc), 1))
      }
    } else if (mode === 'escape') {
      // Frame open parabola branch out to ~5.5× periapsis
      if (r1 > 0) {
        rs.push(r1)
        rs.push(r1 * 5.5)
      }
    } else {
      if (r1 > 0) rs.push(r1)
      if (r2 && r2 > 0) rs.push(r2)
      if (rb && rb > 0) rs.push(rb)
    }
    return rs
  }, [bodyR, e, mode, r1, r2, rb])

  const { k, bodyPx, maxR } = useMemo(
    () => makeScale(bodyR, extents, S, PAD),
    [PAD, S, bodyR, extents],
  )

  /** True-scale LEO often sits on the limb when r_b ≫ r₁: surface note for the user. */
  const leoNearLimb =
    mode === 'bielliptic' &&
    bodyR > 0 &&
    r1 > bodyR &&
    maxR > 0 &&
    (r1 - bodyR) / maxR < 0.02

  /** Periapsis radius of primary ellipse / orbit (for validity). */
  const rpCheck = useMemo(() => {
    if (mode === 'ellipse') {
      const ecc = Math.min(0.999, Math.max(0, e))
      return r1 > 0 ? r1 * (1 - ecc) : 0
    }
    if (mode === 'circular' || mode === 'escape') return r1
    if (mode === 'hohmann' || mode === 'bielliptic') return Math.min(r1, r2 ?? r1)
    return r1
  }, [e, mode, r1, r2])

  const intersectsSurface = bodyR > 0 && rpCheck > 0 && rpCheck < bodyR

  const layers = useMemo((): Layer[] => {
    const list: Layer[] = []
    const addCircle = (
      id: string,
      r: number | undefined,
      stroke: string,
      width: number,
      label: string,
      detail: string,
      dash?: string,
      opacity = 0.9,
    ) => {
      if (!(r && r > 0)) return
      const d = sampleCircle(r, CX, CY, k)
      if (d) list.push({ id, d, stroke, width, dash, opacity, label, detail })
    }

    if (mode === 'circular') {
      addCircle(
        'orbit',
        r1,
        'var(--color-signal)',
        1.75,
        'Circular orbit',
        `r = ${fmtKm(r1)} from body centre (circular ⇒ e = 0)`,
      )
    }

    if (mode === 'escape' && r1 > 0) {
      // Dashed circular reference (v_c at same r) + open parabola (e=1, peri at r)
      addCircle(
        'circ-ref',
        r1,
        'var(--color-muted)',
        1.25,
        'Circular reference (v_c)',
        `Same r: v_c = √(μ/r) · dashed: not the escape path`,
        '5 4',
      )
      const dPar = sampleEllipseAtFocus(
        r1, // periapsis radius
        1, // parabola
        CX,
        CY,
        k,
        -2.35,
        2.35,
        false,
      )
      if (dPar) {
        list.push({
          id: 'escape-parabola',
          d: dPar,
          stroke: 'var(--color-signal)',
          width: 2,
          label: 'Escape parabola (e = 1)',
          detail: `Energy 0 at r = ${fmtKm(r1)} · r(ν)=2r/(1+cos ν) · leaves well`,
        })
      }
    }

    if (mode === 'hohmann' || mode === 'bielliptic') {
      // Distinct rings so r₁ is not lost when it hugs the body limb at true scale.
      addCircle(
        'r1',
        r1,
        'var(--color-signal)',
        mode === 'bielliptic' ? 2.1 : 1.45,
        'Initial orbit (r₁)',
        `Circular · r₁ = ${fmtKm(r1)}`,
      )
      addCircle(
        'r2',
        r2,
        'var(--color-ok)',
        mode === 'bielliptic' ? 1.85 : 1.45,
        'Final orbit (r₂)',
        `Circular · r₂ = ${fmtKm(r2 ?? 0)}`,
      )
    }

    if (mode === 'bielliptic' && rb && rb > 0) {
      addCircle(
        'rb',
        rb,
        'var(--color-subtle)',
        1.25,
        'Intermediate apoapsis (r_b)',
        `Circular locus of r_b = ${fmtKm(rb)}: burn 2 here`,
        '5 5',
        0.75,
      )
    }

    // Hohmann: transfer ellipse with periapsis along +x at min(r1,r2), apo at max.
    if (mode === 'hohmann' && r1 > 0 && r2 && r2 > 0) {
      const a = (r1 + r2) / 2
      const ecc = Math.abs(r2 - r1) / (r1 + r2)
      // Orient so ν=0 is periapsis (smaller radius). If r1>r2, flip by sampling from π.
      const nu0 = r1 <= r2 ? 0 : Math.PI
      const nu1 = r1 <= r2 ? Math.PI : 2 * Math.PI
      const dArc = sampleEllipseAtFocus(a, ecc, CX, CY, k, nu0, nu1, false, SAMPLES_TRANSFER)
      if (dArc) {
        list.push({
          id: 'transfer',
          d: dArc,
          stroke: 'var(--color-warn)',
          width: 2.1,
          opacity: 1,
          label: 'Hohmann transfer (½ ellipse)',
          detail: `a = ${fmtKm(a)} · e = ${ecc.toFixed(4)} · r_p = ${fmtKm(a * (1 - ecc))} · r_a = ${fmtKm(a * (1 + ecc))}`,
        })
      }
    }

    // Bielliptic: two half-ellipses sharing apoapsis on the −x ray (classic coplanar).
    // Ellipse 1: peri r₁ at ν=0 (+x), apo r_b at ν=π (−x). Leg 1: ν=0…π (solid).
    // Ellipse 2: peri r₂ at ν=0 (+x), apo r_b at ν=π (−x). Leg 2: ν=π…2π (dashed).
    // Faint full ellipses (ghosts) show the textbook ovals; solid arcs are the flown legs.
    if (mode === 'bielliptic' && r1 > 0 && r2 && r2 > 0 && rb && rb > Math.max(r1, r2) + 1) {
      const a1 = (r1 + rb) / 2
      const e1 = Math.abs(rb - r1) / (r1 + rb)
      const a2 = (r2 + rb) / 2
      const e2 = Math.abs(rb - r2) / (r2 + rb)
      const ghost1 = sampleEllipseAtFocus(a1, e1, CX, CY, k, 0, 2 * Math.PI, true, SAMPLES_TRANSFER)
      const ghost2 = sampleEllipseAtFocus(a2, e2, CX, CY, k, 0, 2 * Math.PI, true, SAMPLES_TRANSFER)
      const leg1 = sampleEllipseAtFocus(a1, e1, CX, CY, k, 0, Math.PI, false, SAMPLES_TRANSFER)
      const leg2 = sampleEllipseAtFocus(a2, e2, CX, CY, k, Math.PI, 2 * Math.PI, false, SAMPLES_TRANSFER)
      if (ghost1) {
        list.push({
          id: 'ghost1',
          d: ghost1,
          stroke: 'var(--color-warn)',
          width: 1,
          opacity: 0.22,
          label: 'Transfer ellipse 1 (full)',
          detail: `Ghost · a₁ = ${fmtKm(a1)} · e₁ = ${e1.toFixed(4)} · focus at body (not geometric centre)`,
        })
      }
      if (ghost2) {
        list.push({
          id: 'ghost2',
          d: ghost2,
          stroke: 'var(--color-ok)',
          width: 1,
          opacity: 0.2,
          label: 'Transfer ellipse 2 (full)',
          detail: `Ghost · a₂ = ${fmtKm(a2)} · e₂ = ${e2.toFixed(4)} · focus at body`,
        })
      }
      if (leg1) {
        list.push({
          id: 'leg1',
          d: leg1,
          stroke: 'var(--color-warn)',
          width: 2.35,
          label: 'Leg 1 · r₁ → r_b (½ ellipse)',
          detail: `Burn 1 at peri → coast to apo · a₁ = ${fmtKm(a1)} · e₁ = ${e1.toFixed(4)}`,
        })
      }
      if (leg2) {
        list.push({
          id: 'leg2',
          d: leg2,
          stroke: 'var(--color-ok)',
          width: 2.15,
          dash: '8 5',
          label: 'Leg 2 · r_b → r₂ (½ ellipse)',
          detail: `Burn 2 at apo → coast to peri · a₂ = ${fmtKm(a2)} · e₂ = ${e2.toFixed(4)}`,
        })
      }
    }

    if (mode === 'ellipse' && r1 > 0) {
      const ecc = Math.min(0.999, Math.max(0, e))
      const a = r1
      const rp = a * (1 - ecc)
      const ra = a * (1 + ecc)
      const d = sampleEllipseAtFocus(a, ecc, CX, CY, k)
      if (d) {
        list.push({
          id: 'ellipse',
          d,
          stroke: 'var(--color-signal)',
          width: 1.9,
          label: 'Keplerian ellipse',
          detail: `a = ${fmtKm(a)} · e = ${ecc.toFixed(4)} · r_p = ${fmtKm(rp)} · r_a = ${fmtKm(ra)}`,
        })
      }
    }

    return list
  }, [CX, CY, e, k, mode, r1, r2, rb])

  // Static craft anchors + motion path ids for SMIL (when animate).
  const craft = useMemo(() => {
    if (mode === 'escape' && r1 > 0) {
      return { x: CX + k * r1, y: CY, kind: 'escape' as const }
    }
    if (mode === 'ellipse') {
      const ecc = Math.min(0.999, Math.max(0, e))
      const a = r1
      const rp = a * (1 - ecc)
      if (!(rp > 0) || !(a > 0)) return null
      const path = sampleEllipseAtFocus(a, ecc, CX, CY, k, 0, 2 * Math.PI, false)
      return {
        x: CX + k * rp,
        y: CY,
        kind: 'ellipse' as const,
        path,
      }
    }
    if (mode === 'hohmann' && r1 > 0 && r2 && r2 > 0) {
      const a = (r1 + r2) / 2
      const ecc = Math.abs(r2 - r1) / (r1 + r2)
      const nu0 = r1 <= r2 ? 0 : Math.PI
      const nu1 = r1 <= r2 ? Math.PI : 2 * Math.PI
      const path = sampleEllipseAtFocus(a, ecc, CX, CY, k, nu0, nu1, false)
      const rp = Math.min(r1, r2)
      const ra = Math.max(r1, r2)
      return {
        x: CX + k * rp,
        y: CY,
        kind: 'hohmann' as const,
        path,
        burns: [
          {
            x: CX + k * rp,
            y: CY,
            label: 'Δv₁',
            sub: r1 <= r2 ? 'depart r₁' : 'arrive r₁',
          },
          {
            x: CX - k * ra,
            y: CY,
            label: 'Δv₂',
            sub: r1 <= r2 ? 'arrive r₂' : 'depart r₂',
          },
        ],
      }
    }
    if (mode === 'bielliptic' && r1 > 0 && r2 && r2 > 0 && rb && rb > Math.max(r1, r2)) {
      const a1 = (r1 + rb) / 2
      const e1 = Math.abs(rb - r1) / (r1 + rb)
      const a2 = (r2 + rb) / 2
      const e2 = Math.abs(rb - r2) / (r2 + rb)
      const path1 = sampleEllipseAtFocus(a1, e1, CX, CY, k, 0, Math.PI, false, SAMPLES_TRANSFER)
      const path2 = sampleEllipseAtFocus(
        a2,
        e2,
        CX,
        CY,
        k,
        Math.PI,
        2 * Math.PI,
        false,
        SAMPLES_TRANSFER,
      )
      // Combined path for continuous animateMotion (leg1 then leg2)
      const path = [path1, path2.replace(/^M/, 'L')].filter(Boolean).join(' ')
      return {
        x: CX + k * r1,
        y: CY,
        kind: 'bielliptic' as const,
        path,
        // Line of apsides: peri on +x, common apo on −x
        apsides: {
          x0: CX - k * rb,
          x1: CX + k * Math.max(r1, r2),
          y: CY,
        },
        burns: [
          { x: CX + k * r1, y: CY, label: 'Δv₁', sub: 'depart r₁' },
          { x: CX - k * rb, y: CY, label: 'Δv₂', sub: 'apo r_b' },
          { x: CX + k * r2, y: CY, label: 'Δv₃', sub: 'arrive r₂' },
        ],
      }
    }
    if (mode === 'circular' && r1 > 0) {
      return { x: CX + k * r1, y: CY, kind: 'circular' as const }
    }
    if (r1 > 0) return { x: CX + k * r1, y: CY, kind: 'static' as const }
    return null
  }, [CX, CY, e, k, mode, r1, r2, rb])

  // Peri / apo ticks for ellipse
  const apsidesMarks = useMemo(() => {
    if (mode !== 'ellipse' || !(r1 > 0)) return null
    const ecc = Math.min(0.999, Math.max(0, e))
    const rp = r1 * (1 - ecc)
    const ra = r1 * (1 + ecc)
    return {
      peri: { x: CX + k * rp, y: CY },
      apo: { x: CX - k * ra, y: CY }, // ν=π → −x
    }
  }, [CX, CY, e, k, mode, r1])

  const { svgRef, vp, transform, reset, zoomAbout, handlers } = useVizViewport(S, S)

  const biInvalid =
    mode === 'bielliptic' &&
    r1 > 0 &&
    r2 != null &&
    r2 > 0 &&
    rb != null &&
    !(rb > Math.max(r1, r2) + 1)

  const onLayerEnter = (layer: Layer, ev: React.MouseEvent) => {
    setHoverId(layer.id)
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setTip({
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
      label: layer.label,
      detail: layer.detail,
    })
  }

  /** Solid chrome row: legend + zoom: never overlays the SVG plot. */
  const chrome = (
    <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border bg-bg px-2 py-1.5">
      <div className="flex min-w-0 flex-1 flex-wrap content-start gap-x-3 gap-y-1">
        {layers.map((l) => (
          <button
            key={l.id}
            type="button"
            className="inline-flex max-w-full items-center gap-1.5 font-mono text-[10px] text-muted hover:text-fg"
            onMouseEnter={() => setHoverId(l.id)}
            onMouseLeave={() => setHoverId(null)}
            title={l.detail}
          >
            <span
              className="inline-block h-0 w-3 shrink-0 border-t-2"
              style={{
                borderColor: l.stroke.includes('warn')
                  ? 'var(--color-warn)'
                  : l.stroke.includes('ok')
                    ? 'var(--color-ok)'
                    : l.stroke.includes('muted')
                      ? 'var(--color-muted)'
                      : l.stroke.includes('subtle')
                        ? 'var(--color-subtle)'
                        : l.stroke.includes('fg')
                          ? 'var(--color-fg)'
                          : 'var(--color-signal)',
                borderStyle: l.dash ? 'dashed' : 'solid',
                opacity: l.opacity != null && l.opacity < 0.4 ? 0.45 : 1,
              }}
            />
            <span className="truncate">{l.label}</span>
          </button>
        ))}
      </div>
      <div className="shrink-0">
        <VizControls
          variant="bar"
          hint=""
          onZoomIn={() => zoomAbout(1.22)}
          onZoomOut={() => zoomAbout(1 / 1.22)}
          onReset={reset}
          scaleLabel={`${(vp.scale * 100).toFixed(0)}%`}
          className="border-0 bg-transparent p-0"
        />
      </div>
    </div>
  )

  if (biInvalid) {
    return (
      <div className={`flex h-full min-h-0 w-full flex-1 flex-col bg-bg ${className}`}>
        {chrome}
        <div className="px-2 py-4 font-mono text-xs leading-relaxed text-warn">
          Invalid bielliptic: r_b must be higher than both orbits. Raise h_b above max(h₁, h₂).
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative flex h-full min-h-0 w-full flex-1 flex-col bg-bg ${className}`}
    >
      {chrome}
      {intersectsSurface ? (
        <p className="shrink-0 border-b border-warn/40 bg-warn/10 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-warn">
          Warning: periapsis r_p = {fmtKm(rpCheck)} is below body radius R = {fmtKm(bodyR)}: the trajectory intersects the surface (still drawn for geometry).
        </p>
      ) : null}
      {leoNearLimb && !intersectsSurface ? (
        <p className="shrink-0 border-b border-border bg-bg-elevated px-2 py-1.5 font-mono text-[10px] leading-relaxed text-muted">
          True scale: r₁ sits near the limb (h₁ ≪ r_b). The thin gold oval is correct Kepler geometry
          about the focus: not a surface-skimming error. Try the “Clear nested” preset for a
          textbook layout.
        </p>
      ) : null}
      {/* Isolated plot plane: SVG cannot paint under chrome; centered square frame */}
      <div
        ref={ref}
        className="relative z-0 flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden bg-bg"
      >
        {ready ? (
          <div
            className="relative shrink-0"
            style={{ width: S, height: S, maxWidth: '100%', maxHeight: '100%' }}
          >
            <svg
              ref={svgRef}
              data-viz="orbit"
              viewBox={`0 0 ${S} ${S}`}
              width={S}
              height={S}
              className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={`Orbit diagram (${mode})`}
              {...handlers}
            >
              <defs>
                <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="var(--color-fg)" stopOpacity="0.06" />
                  <stop offset="70%" stopColor="var(--color-fg)" stopOpacity="0" />
                </radialGradient>
                <marker
                  id={`arrow-${uid}`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-signal)" />
                </marker>
              </defs>
              <rect width={S} height={S} fill="var(--color-bg)" />
              <g transform={transform}>
                <circle cx={CX} cy={CY} r={S * 0.46} fill={`url(#glow-${uid})`} />
                {/* Central body to true scale */}
                <circle
                  cx={CX}
                  cy={CY}
                  r={bodyPx}
                  fill="var(--color-surface-hover)"
                  stroke="var(--color-fg)"
                  strokeWidth={1.25}
                >
                  <title>{`Central body · R = ${fmtKm(bodyR)}`}</title>
                </circle>
                <circle cx={CX} cy={CY} r={2} fill="var(--color-fg)" />

                {layers.map((layer) => {
                  const active = hoverId === layer.id
                  return (
                    <path
                      key={layer.id}
                      d={layer.d}
                      fill="none"
                      stroke={layer.stroke}
                      strokeWidth={active ? layer.width + 1 : layer.width}
                      strokeDasharray={layer.dash}
                      opacity={
                        hoverId && hoverId !== layer.id
                          ? Math.min(0.25, layer.opacity ?? 1)
                          : (layer.opacity ?? 1)
                      }
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      className="cursor-help"
                      onMouseEnter={(ev) => onLayerEnter(layer, ev)}
                      onMouseMove={(ev) => {
                        const rect = svgRef.current?.getBoundingClientRect()
                        if (!rect || !tip) return
                        setTip((t) =>
                          t
                            ? {
                                ...t,
                                x: ev.clientX - rect.left,
                                y: ev.clientY - rect.top,
                              }
                            : null,
                        )
                      }}
                      onMouseLeave={() => {
                        setHoverId(null)
                        setTip(null)
                      }}
                    >
                      <title>{`${layer.label}\n${layer.detail}`}</title>
                    </path>
                  )
                })}

                {apsidesMarks ? (
                  <>
                    <circle
                      cx={apsidesMarks.peri.x}
                      cy={apsidesMarks.peri.y}
                      r={3}
                      fill="var(--color-signal)"
                    >
                      <title>Periapsis</title>
                    </circle>
                    <circle
                      cx={apsidesMarks.apo.x}
                      cy={apsidesMarks.apo.y}
                      r={3}
                      fill="var(--color-muted)"
                    >
                      <title>Apoapsis</title>
                    </circle>
                  </>
                ) : null}

                {mode === 'escape' && craft != null && r1 > 0 && (
                  <line
                    x1={craft.x}
                    y1={craft.y}
                    x2={craft.x}
                    y2={craft.y - k * r1 * 0.45}
                    stroke="var(--color-signal)"
                    strokeWidth={1.6}
                    markerEnd={`url(#arrow-${uid})`}
                    vectorEffect="non-scaling-stroke"
                  >
                    <title>v_esc direction (tangential at periapsis)</title>
                  </line>
                )}

                {/* Hidden motion paths for animateMotion */}
                {craft && 'path' in craft && craft.path ? (
                  <path
                    id={`motion-${uid}`}
                    d={craft.path}
                    fill="none"
                    stroke="none"
                  />
                ) : null}

                {/* Line of apsides + burn markers for bielliptic */}
                {craft && craft.kind === 'bielliptic' && 'apsides' in craft && craft.apsides ? (
                  <line
                    x1={craft.apsides.x0}
                    y1={craft.apsides.y}
                    x2={craft.apsides.x1}
                    y2={craft.apsides.y}
                    stroke="var(--color-subtle)"
                    strokeWidth={1}
                    strokeDasharray="2 4"
                    opacity={0.55}
                    vectorEffect="non-scaling-stroke"
                  >
                    <title>Line of apsides (peri +x · common apo −x)</title>
                  </line>
                ) : null}
                {craft &&
                (craft.kind === 'bielliptic' || craft.kind === 'hohmann') &&
                craft.burns
                  ? craft.burns.map((b, i) => (
                      <g key={`${b.label}-${i}`}>
                        <circle
                          cx={b.x}
                          cy={b.y}
                          r={4}
                          fill={
                            i === 0
                              ? 'var(--color-warn)'
                              : i === 1
                                ? craft.kind === 'hohmann'
                                  ? 'var(--color-ok)'
                                  : 'var(--color-fg)'
                                : 'var(--color-ok)'
                          }
                          stroke="var(--color-bg)"
                          strokeWidth={1.25}
                        >
                          <title>
                            {b.label}
                            {'sub' in b && b.sub ? ` · ${b.sub}` : ''}
                          </title>
                        </circle>
                        <text
                          x={b.x}
                          y={b.y - 10}
                          textAnchor="middle"
                          fill={
                            i === 0
                              ? 'var(--color-warn)'
                              : craft.kind === 'hohmann'
                                ? 'var(--color-ok)'
                                : 'var(--color-fg)'
                          }
                          fontSize={10}
                          fontFamily="var(--font-mono)"
                          style={{ pointerEvents: 'none' }}
                        >
                          {b.label}
                        </text>
                      </g>
                    ))
                  : null}

                {craft != null && (
                  <g>
                    {animate && craft.kind === 'circular' ? (
                      <g transform={`translate(${CX} ${CY})`}>
                        <g>
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0"
                            to="-360"
                            dur="16s"
                            repeatCount="indefinite"
                          />
                          <circle
                            cx={k * r1}
                            cy={0}
                            r={3.5}
                            fill="var(--color-fg)"
                            stroke="var(--color-bg)"
                            strokeWidth={1}
                          />
                        </g>
                      </g>
                    ) : animate &&
                      (craft.kind === 'hohmann' ||
                        craft.kind === 'bielliptic' ||
                        craft.kind === 'ellipse') &&
                      'path' in craft &&
                      craft.path ? (
                      <circle
                        r={3.5}
                        fill="var(--color-fg)"
                        stroke="var(--color-bg)"
                        strokeWidth={1}
                      >
                        <title>
                          {craft.kind === 'hohmann'
                            ? 'Spacecraft on Hohmann transfer'
                            : craft.kind === 'bielliptic'
                              ? 'Spacecraft on bielliptic path'
                              : 'Spacecraft on ellipse'}
                        </title>
                        <animateMotion
                          dur={
                            craft.kind === 'bielliptic'
                              ? '20s'
                              : craft.kind === 'ellipse'
                                ? '18s'
                                : '12s'
                          }
                          repeatCount="indefinite"
                          rotate="auto"
                        >
                          <mpath href={`#motion-${uid}`} />
                        </animateMotion>
                      </circle>
                    ) : (
                      <circle
                        cx={craft.x}
                        cy={craft.y}
                        r={3.5}
                        fill="var(--color-fg)"
                        stroke="var(--color-bg)"
                        strokeWidth={1}
                      >
                        {mode === 'escape' ? (
                          <title>Periapsis: state at r with v_esc</title>
                        ) : null}
                      </circle>
                    )}
                  </g>
                )}
              </g>
            </svg>
            {tip ? (
              <div
                className="pointer-events-none absolute z-20 max-w-[15rem] border border-border-strong bg-surface px-2 py-1.5 shadow-lg"
                style={{
                  left: Math.max(8, Math.min(tip.x + 12, S - 160)),
                  top: Math.max(8, tip.y - 44),
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-signal">
                  {tip.label}
                </p>
                <p className="mt-0.5 font-mono text-[11px] leading-snug text-muted">
                  {tip.detail}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
