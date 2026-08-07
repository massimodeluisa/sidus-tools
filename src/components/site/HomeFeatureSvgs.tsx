/**
 * Animated SVG infographics for the production home capability cards.
 *
 * Craft motion uses SMIL <animateMotion><mpath/></animateMotion> on closed paths.
 * Geometry is textbook two-body (circular rings + Hohmann transfer ellipse), not
 * decorative flattened ovals.
 */

import { useId } from 'react'

/** Closed circle as two 180° arcs (center cx,cy; radius r). */
function circlePath(cx: number, cy: number, r: number): string {
  const l = cx - r
  const right = cx + r
  return `M${l},${cy} A${r},${r} 0 1,1 ${right},${cy} A${r},${r} 0 1,1 ${l},${cy}`
}

/**
 * Kepler ellipse about focus (fx,fy): r = a(1−e²)/(1+e cos ν), sampled for SVG path.
 * Periapsis along +x. SVG y increases down → flip sin.
 */
function keplerEllipsePath(
  fx: number,
  fy: number,
  a: number,
  e: number,
  samples = 96,
): string {
  if (!(a > 0) || e < 0 || e >= 1) return ''
  const p = a * (1 - e * e)
  const pts: string[] = []
  for (let i = 0; i <= samples; i++) {
    const nu = (2 * Math.PI * i) / samples
    const r = p / (1 + e * Math.cos(nu))
    const x = fx + r * Math.cos(nu)
    const y = fy - r * Math.sin(nu)
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  pts.push('Z')
  return pts.join(' ')
}

/** Half transfer: ν from 0 (peri) to π (apo). */
function keplerArcPath(
  fx: number,
  fy: number,
  a: number,
  e: number,
  nu0: number,
  nu1: number,
  samples = 64,
): string {
  if (!(a > 0) || e < 0 || e >= 1) return ''
  const p = a * (1 - e * e)
  const pts: string[] = []
  for (let i = 0; i <= samples; i++) {
    const nu = nu0 + ((nu1 - nu0) * i) / samples
    const r = p / (1 + e * Math.cos(nu))
    const x = fx + r * Math.cos(nu)
    const y = fy - r * Math.sin(nu)
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

function OrbitCraft({
  pathId,
  duration,
  size = 3,
  className = 'fill-fg',
  begin = '0s',
  opacity,
}: {
  pathId: string
  duration: string
  size?: number
  className?: string
  begin?: string
  opacity?: number
}) {
  return (
    <circle r={size} className={className} opacity={opacity}>
      <animateMotion
        dur={duration}
        begin={begin}
        repeatCount="indefinite"
        rotate="0"
        calcMode="linear"
      >
        <mpath href={`#${pathId}`} xlinkHref={`#${pathId}`} />
      </animateMotion>
    </circle>
  )
}

/** LEO + higher circular coplanar orbits about a small body (true circles). */
export function OrbitSvg({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const idLeo = `${uid}-leo`
  const idMeo = `${uid}-meo`
  const cx = 80
  const cy = 52
  const rBody = 11
  const rLeo = 28
  const rMeo = 46
  const pathLeo = circlePath(cx, cy, rLeo)
  const pathMeo = circlePath(cx, cy, rMeo)

  return (
    <svg
      className={className}
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden
    >
      <defs>
        <path id={idLeo} d={pathLeo} fill="none" />
        <path id={idMeo} d={pathMeo} fill="none" />
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" className="text-signal" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft field */}
      <circle cx={cx} cy={cy} r="54" fill={`url(#${uid}-glow)`} />

      {/* Body */}
      <circle
        cx={cx}
        cy={cy}
        r={rBody}
        className="fill-surface stroke-border-strong"
        strokeWidth="1.15"
      />
      <circle cx={cx} cy={cy} r="2.2" className="fill-fg" opacity="0.85" />
      {/* Simple terminator / continents sketch */}
      <path
        d={`M${cx - 7} ${cy - 4}c3-2.5 8-3 12-1M${cx - 6} ${cy + 5}c4 1.5 9 1 13-1.5`}
        className="stroke-muted"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Orbits: true circles, LEO solid / outer dashed */}
      <use
        href={`#${idLeo}`}
        className="stroke-signal"
        strokeWidth="1.35"
        opacity="0.9"
      />
      <use
        href={`#${idMeo}`}
        className="stroke-muted"
        strokeWidth="1.05"
        opacity="0.55"
        strokeDasharray="3.5 3.5"
      />

      {/* Scale ticks on LEO (subtle) */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x1 = cx + (rLeo - 2.5) * Math.cos(rad)
        const y1 = cy - (rLeo - 2.5) * Math.sin(rad)
        const x2 = cx + (rLeo + 2.5) * Math.cos(rad)
        const y2 = cy - (rLeo + 2.5) * Math.sin(rad)
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="stroke-signal"
            strokeWidth="0.9"
            opacity="0.35"
          />
        )
      })}

      <OrbitCraft pathId={idLeo} duration="5.2s" size={2.8} className="fill-fg" />
      <OrbitCraft
        pathId={idMeo}
        duration="9.5s"
        size={2.1}
        className="fill-signal"
        begin="-3s"
        opacity={0.85}
      />

      <text
        x={cx + rLeo + 6}
        y={cy + 3}
        className="fill-muted"
        style={{ fontSize: 6.5, fontFamily: 'IBM Plex Mono, ui-monospace, monospace' }}
        opacity="0.7"
      >
        LEO
      </text>
      <text
        x={cx + rMeo + 5}
        y={cy + 3}
        className="fill-muted"
        style={{ fontSize: 6.5, fontFamily: 'IBM Plex Mono, ui-monospace, monospace' }}
        opacity="0.55"
      >
        higher
      </text>
    </svg>
  )
}

/**
 * Hohmann transfer: two circular rings + transfer ellipse about the focus (body).
 * Δv₁ at periapsis (inner), Δv₂ at apoapsis (outer).
 */
export function TransferSvg({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const idXfer = `${uid}-xfer`
  const idFull = `${uid}-full`
  // Body left of card center so transfer ellipse has room
  const fx = 62
  const fy = 52
  const r1 = 18
  const r2 = 40
  const a = (r1 + r2) / 2
  const e = Math.abs(r2 - r1) / (r1 + r2)
  // Peri on +x: r_p = r1, apo on −x: r_a = r2 when r2>r1
  const periX = fx + r1
  const apoX = fx - r2
  const pathXfer = keplerArcPath(fx, fy, a, e, 0, Math.PI, 72)
  const pathFull = keplerEllipsePath(fx, fy, a, e, 100)

  return (
    <svg
      className={className}
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden
    >
      <defs>
        <path id={idXfer} d={pathXfer} fill="none" />
        <path id={idFull} d={pathFull} fill="none" />
        <radialGradient id={`${uid}-g`} cx="40%" cy="50%" r="55%">
          <stop offset="0%" stopColor="currentColor" className="text-warn" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={fx} cy={fy} r="48" fill={`url(#${uid}-g)`} />

      {/* Circular parks */}
      <circle
        cx={fx}
        cy={fy}
        r={r1}
        className="stroke-signal"
        strokeWidth="1.2"
        opacity="0.85"
      />
      <circle
        cx={fx}
        cy={fy}
        r={r2}
        className="stroke-ok"
        strokeWidth="1.15"
        opacity="0.75"
      />

      {/* Ghost full transfer ellipse + solid half flown */}
      <use href={`#${idFull}`} className="stroke-warn" strokeWidth="0.9" opacity="0.22" />
      <use href={`#${idXfer}`} className="stroke-warn" strokeWidth="1.55" opacity="0.95" />

      {/* Line of apsides */}
      <line
        x1={apoX}
        y1={fy}
        x2={periX}
        y2={fy}
        className="stroke-subtle"
        strokeWidth="0.75"
        strokeDasharray="2 3"
        opacity="0.5"
      />

      {/* Body */}
      <circle
        cx={fx}
        cy={fy}
        r="7.5"
        className="fill-surface stroke-border-strong"
        strokeWidth="1.1"
      />
      <circle cx={fx} cy={fy} r="1.6" className="fill-fg" opacity="0.8" />

      {/* Burn nodes */}
      <circle cx={periX} cy={fy} r="3.4" className="fill-warn stroke-bg" strokeWidth="1">
        <animate attributeName="opacity" values="0.55;1;0.55" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={apoX} cy={fy} r="3.4" className="fill-ok stroke-bg" strokeWidth="1">
        <animate
          attributeName="opacity"
          values="0.55;1;0.55"
          dur="2s"
          begin="1s"
          repeatCount="indefinite"
        />
      </circle>

      <OrbitCraft pathId={idXfer} duration="5.5s" size={2.5} className="fill-fg" />

      <text
        x={periX}
        y={fy - 9}
        textAnchor="middle"
        className="fill-warn"
        style={{ fontSize: 7, fontFamily: 'IBM Plex Mono, ui-monospace, monospace' }}
        opacity="0.9"
      >
        Δv₁
      </text>
      <text
        x={apoX}
        y={fy - 9}
        textAnchor="middle"
        className="fill-ok"
        style={{ fontSize: 7, fontFamily: 'IBM Plex Mono, ui-monospace, monospace' }}
        opacity="0.9"
      >
        Δv₂
      </text>
      <text
        x={fx + r1 * 0.15}
        y={fy + r1 + 10}
        textAnchor="middle"
        className="fill-muted"
        style={{ fontSize: 6, fontFamily: 'IBM Plex Mono, ui-monospace, monospace' }}
        opacity="0.55"
      >
        Hohmann
      </text>
    </svg>
  )
}

export function AgentsSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="36" cy="50" r="9" className="fill-surface stroke-signal" strokeWidth="1.2" />
      <circle cx="80" cy="28" r="7" className="fill-surface stroke-border-strong" strokeWidth="1.1" />
      <circle cx="80" cy="72" r="7" className="fill-surface stroke-border-strong" strokeWidth="1.1" />
      <circle cx="124" cy="50" r="9" className="fill-surface stroke-signal" strokeWidth="1.2" />
      <line x1="45" y1="45" x2="73" y2="31" className="stroke-muted" strokeWidth="1.1" opacity="0.55" />
      <line x1="45" y1="55" x2="73" y2="69" className="stroke-muted" strokeWidth="1.1" opacity="0.55" />
      <line x1="87" y1="31" x2="115" y2="45" className="stroke-muted" strokeWidth="1.1" opacity="0.55" />
      <line x1="87" y1="69" x2="115" y2="55" className="stroke-muted" strokeWidth="1.1" opacity="0.55" />

      <circle r="2.5" className="fill-fg">
        <animateMotion
          dur="2.6s"
          repeatCount="indefinite"
          path="M36,50 L80,28 L124,50"
          calcMode="linear"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.08;0.88;1"
          dur="2.6s"
          repeatCount="indefinite"
        />
      </circle>
      <circle r="2" className="fill-signal">
        <animateMotion
          dur="3.2s"
          begin="0.8s"
          repeatCount="indefinite"
          path="M36,50 L80,72 L124,50"
          calcMode="linear"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.08;0.88;1"
          dur="3.2s"
          begin="0.8s"
          repeatCount="indefinite"
        />
      </circle>
      <text
        x="36"
        y="53"
        textAnchor="middle"
        className="fill-subtle"
        style={{ fontSize: 7, fontFamily: 'IBM Plex Mono, monospace' }}
      >
        UI
      </text>
      <text
        x="124"
        y="53"
        textAnchor="middle"
        className="fill-subtle"
        style={{ fontSize: 7, fontFamily: 'IBM Plex Mono, monospace' }}
      >
        MCP
      </text>
    </svg>
  )
}

export function SiUnitsSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="18"
        y="28"
        width="48"
        height="40"
        rx="3"
        className="fill-surface stroke-border-strong"
        strokeWidth="1.2"
      />
      <rect
        x="94"
        y="28"
        width="48"
        height="40"
        rx="3"
        className="fill-surface stroke-signal"
        strokeWidth="1.2"
      />
      <text
        x="42"
        y="52"
        textAnchor="middle"
        className="fill-muted"
        style={{ fontSize: 12, fontFamily: 'IBM Plex Mono, monospace' }}
      >
        km
      </text>
      <text
        x="118"
        y="52"
        textAnchor="middle"
        className="fill-signal"
        style={{ fontSize: 12, fontFamily: 'IBM Plex Mono, monospace' }}
      >
        m
      </text>
      <path
        d="M72 48 H88 M82 42 L92 48 L82 54"
        className="stroke-muted"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
        opacity="0.75"
      />
    </svg>
  )
}
