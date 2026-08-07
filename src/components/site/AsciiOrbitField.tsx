import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  density?: number
  opacity?: number
}

/**
 * Firecrawl-class living field: multi-layer density, dual scan bands, orbit sparks,
 * falling telemetry streams, soft constellation links. Continuous RAF motion.
 */
export function AsciiOrbitField({ className, density = 1, opacity = 0.72 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let alive = true
    let w = 0
    let h = 0
    let dpr = 1
    let t0 = performance.now()

    // Richer charset: Firecrawl “living terminal” feel
    const GLYPHS = [
      '.',
      '·',
      '∙',
      '•',
      ':',
      '+',
      '*',
      '˚',
      '°',
      '×',
      '·',
      '░',
      '▒',
      ':',
      ';',
      '0',
      '1',
    ] as const

    type Cell = {
      x: number
      y: number
      base: number
      phase: number
      speed: number
      g0: number
      ring: boolean
      planet: boolean
    }
    type Spark = {
      angle: number
      radius: number
      speed: number
      life: number
      glyph: string
      trail: number
    }
    type Stream = {
      x: number
      y: number
      vy: number
      len: number
      phase: number
    }

    let cells: Cell[] = []
    let sparks: Spark[] = []
    let streams: Stream[] = []
    let links: { a: number; b: number }[] = []
    let cx = 0
    let cy = 0
    let R = 1
    let pitch = 10

    const rebuild = () => {
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      pitch = Math.max(7, Math.round(9 / density))
      const cols = Math.ceil(w / pitch) + 2
      const rows = Math.ceil(h / pitch) + 2
      // Off-center planet (room for claim text left)
      cx = w * 0.62
      cy = h * 0.48
      R = Math.min(w, h) * 0.28
      const next: Cell[] = []

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * pitch + (j % 2 === 0 ? 0 : pitch * 0.5)
          const y = j * pitch
          const dx = (x - cx) / R
          const dy = (y - cy) / R
          const ry = dy * 1.15
          const r = Math.hypot(dx, ry)

          const n =
            fbm(dx * 2.2 + 3.1, ry * 2.2 - 1.7) * 0.55 +
            fbm(dx * 5.4 - 0.4, ry * 5.4 + 2.2) * 0.32 +
            fbm(dx * 11.0 + t0 * 0.00001, ry * 11.0) * 0.2

          let base = 0
          let ring = false
          let planet = false
          if (r < 1.02) {
            planet = true
            const land = n > 0.05 ? 0.55 + n * 0.45 : 0.12 + Math.max(0, n) * 0.3
            const limb = Math.pow(Math.max(0, 1 - r * 0.92), 0.38)
            // Day/night terminator
            const day = 0.45 + 0.55 * Math.tanh((dx + 0.15) * 2.6)
            base = land * (0.28 + 0.72 * limb) * day
          } else {
            const rings = [1.32, 1.62, 1.95, 2.35]
            let onRing = 0
            for (let ri = 0; ri < rings.length; ri++) {
              onRing += softRing(Math.abs(r - rings[ri]!), 0.032 + ri * 0.004) * (0.95 - ri * 0.15)
            }
            ring = onRing > 0.18
            // Star field + nebula
            const stars = hash2(i * 17.1, j * 13.7) > 0.985 ? 0.45 : 0
            const neb =
              Math.max(0, fbm(dx * 0.8 - 1, ry * 0.8 + 2) * 0.18) *
              Math.exp(-Math.max(0, r - 1.1) * 0.35)
            const fog = Math.exp(-Math.max(0, r - 1.02) * 0.55) * 0.12
            base = Math.min(1, onRing + stars + fog + neb)
          }
          if (base < 0.03) continue

          next.push({
            x,
            y,
            base,
            phase: hash2(i + 0.3, j + 0.7) * Math.PI * 2,
            speed: 0.55 + hash2(j + 2, i + 5) * 1.6,
            g0: Math.floor(hash2(i * 3.1, j * 2.7) * GLYPHS.length) % GLYPHS.length,
            ring,
            planet,
          })
        }
      }
      cells = next

      // More sparks, multi-band, longer trails
      sparks = []
      for (let k = 0; k < 72; k++) {
        const band = k % 4
        const radius = R * (1.32 + band * 0.34)
        sparks.push({
          angle: hash2(k, 9) * Math.PI * 2,
          radius,
          speed: (0.22 + hash2(k, 3) * 0.42) * (band % 2 === 0 ? 1 : -1),
          life: hash2(k, 11),
          glyph: GLYPHS[Math.floor(hash2(k, 7) * GLYPHS.length) % GLYPHS.length]!,
          trail: 3 + Math.floor(hash2(k, 4) * 4),
        })
      }

      // Vertical telemetry rain (Firecrawl “data falling” vibe)
      streams = []
      for (let s = 0; s < Math.floor(w / 28); s++) {
        streams.push({
          x: (s + 0.5) * (w / Math.max(1, Math.floor(w / 28))),
          y: hash2(s, 2) * h,
          vy: 28 + hash2(s, 5) * 55,
          len: 4 + Math.floor(hash2(s, 8) * 10),
          phase: hash2(s, 1) * Math.PI * 2,
        })
      }

      // Sparse constellation links between bright cells
      links = []
      const bright = cells
        .map((c, idx) => ({ c, idx, s: c.base + (c.ring ? 0.3 : 0) }))
        .filter((x) => x.s > 0.55)
        .sort((a, b) => b.s - a.s)
        .slice(0, 40)
      for (let i = 0; i < bright.length; i++) {
        for (let j = i + 1; j < bright.length; j++) {
          const dx = bright[i]!.c.x - bright[j]!.c.x
          const dy = bright[i]!.c.y - bright[j]!.c.y
          const d = Math.hypot(dx, dy)
          if (d > 28 && d < 90 && hash2(i, j) > 0.72) {
            links.push({ a: bright[i]!.idx, b: bright[j]!.idx })
          }
        }
      }
      links = links.slice(0, 28)
    }

    const draw = (now: number) => {
      if (!alive) return
      const t = reduced ? 0 : (now - t0) * 0.001
      ctx.clearRect(0, 0, w, h)
      const fontPx = Math.max(9, Math.round(pitch * 0.92))
      ctx.font = `${fontPx}px "IBM Plex Mono", ui-monospace, Menlo, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Dual scan bands (primary + secondary offset): Firecrawl “render pass”
      const scanY1 = reduced ? h * 0.4 : ((t * 70) % (h + 160)) - 80
      const scanY2 = reduced ? h * 0.7 : ((t * 42 + h * 0.45) % (h + 200)) - 100
      const scanW = 100

      // Soft constellation links under glyphs
      if (!reduced && links.length) {
        ctx.lineWidth = 0.6
        for (const L of links) {
          const a = cells[L.a]
          const b = cells[L.b]
          if (!a || !b) continue
          const pulse = 0.08 + 0.1 * Math.sin(t * 1.6 + a.phase)
          ctx.strokeStyle = `rgba(160, 168, 180, ${pulse})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // Falling streams
      if (!reduced) {
        for (const s of streams) {
          s.y += s.vy * 0.016
          if (s.y > h + 40) s.y = -40
          for (let k = 0; k < s.len; k++) {
            const yy = s.y - k * pitch * 0.85
            const fade = 1 - k / s.len
            const bit = (Math.floor(t * 8 + s.phase * 3 + k) % 2 === 0 ? '1' : '0') as string
            ctx.fillStyle = `rgba(150, 160, 175, ${0.04 + fade * 0.12 * opacity})`
            ctx.fillText(bit, s.x, yy)
          }
        }
      }

      for (const c of cells) {
        const wave =
          0.5 +
          0.5 * Math.sin(t * c.speed * 2.1 + c.phase + c.x * 0.014 + c.y * 0.009)
        const wave2 =
          0.65 + 0.35 * Math.sin(t * 1.05 - c.x * 0.022 + c.y * 0.016 + c.phase * 1.3)
        const dy1 = c.y - scanY1
        const dy2 = c.y - scanY2
        const scanBoost =
          Math.exp(-(dy1 * dy1) / (2 * scanW * scanW)) * 0.95 +
          Math.exp(-(dy2 * dy2) / (2 * (scanW * 0.7) * (scanW * 0.7))) * 0.55
        const flow = reduced
          ? 0
          : Math.sin(t * 0.85 + c.phase) * 2.6 + Math.cos(t * 0.5 + c.x * 0.012) * 1.6

        let a = c.base * wave * wave2 * opacity * (0.7 + scanBoost)
        if (c.ring) a *= 0.85 + 0.4 * Math.sin(t * 2.6 + c.phase)
        if (c.planet) a *= 0.95 + 0.08 * Math.sin(t * 0.4 + c.phase)
        a = Math.min(1, a)
        if (a < 0.035) continue

        const gIdx =
          (c.g0 + Math.floor(t * c.speed * 1.8 + c.phase * 2.2)) % GLYPHS.length
        const ch = GLYPHS[gIdx]!
        const lum = Math.floor(120 + c.base * 110 + scanBoost * 50)
        const cool = c.ring || !c.planet ? 18 : 8
        ctx.fillStyle = `rgba(${lum}, ${lum + 4}, ${Math.min(255, lum + cool)}, ${a})`
        ctx.fillText(ch, c.x + flow * 0.4, c.y + flow)
      }

      // Orbit sparks + multi-dot trails
      if (!reduced) {
        for (const s of sparks) {
          s.angle += s.speed * 0.018
          for (let tr = 0; tr < s.trail; tr++) {
            const ang = s.angle - tr * 0.08
            const px = cx + Math.cos(ang) * s.radius
            const py = cy + Math.sin(ang) * s.radius * 0.52
            const pulse = 0.4 + 0.6 * Math.sin(t * 3.2 + s.life * 10 - tr)
            const fa = (0.5 - tr / s.trail * 0.45) * (0.35 + pulse * 0.5)
            ctx.fillStyle = `rgba(210, 214, 222, ${fa})`
            ctx.fillText(tr === 0 ? s.glyph : '·', px, py)
          }
        }
      }

      // Scan glows
      if (!reduced) {
        for (const [sy, sw, alpha] of [
          [scanY1, scanW, 0.07],
          [scanY2, scanW * 0.65, 0.045],
        ] as const) {
          const g = ctx.createLinearGradient(0, sy - sw, 0, sy + sw)
          g.addColorStop(0, 'rgba(196,200,206,0)')
          g.addColorStop(0.5, `rgba(196,200,206,${alpha})`)
          g.addColorStop(1, 'rgba(196,200,206,0)')
          ctx.fillStyle = g
          ctx.fillRect(0, sy - sw, w, sw * 2)
        }
      }

      // Subtle grid pulse (mission console)
      if (!reduced) {
        ctx.strokeStyle = `rgba(80, 84, 92, ${0.04 + 0.03 * Math.sin(t * 0.5)})`
        ctx.lineWidth = 1
        const step = 64
        for (let x = 0; x < w; x += step) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
          ctx.stroke()
        }
        for (let y = 0; y < h; y += step) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(w, y)
          ctx.stroke()
        }
      }

      // Vignette: stronger left for claim legibility, open right for product card
      const grd = ctx.createRadialGradient(
        w * 0.55,
        h * 0.45,
        Math.min(w, h) * 0.08,
        w * 0.55,
        h * 0.5,
        Math.max(w, h) * 0.78,
      )
      grd.addColorStop(0, 'rgba(5,5,5,0)')
      grd.addColorStop(0.45, 'rgba(5,5,5,0.08)')
      grd.addColorStop(1, 'rgba(5,5,5,0.82)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, w, h)

      // Left wash so claim stays crisp
      const left = ctx.createLinearGradient(0, 0, w * 0.55, 0)
      left.addColorStop(0, 'rgba(5,5,5,0.55)')
      left.addColorStop(0.55, 'rgba(5,5,5,0.12)')
      left.addColorStop(1, 'rgba(5,5,5,0)')
      ctx.fillStyle = left
      ctx.fillRect(0, 0, w * 0.55, h)

      raf = requestAnimationFrame(draw)
    }

    rebuild()
    raf = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => {
      rebuild()
    })
    ro.observe(canvas)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [density, opacity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  )
}

function softRing(d: number, width: number): number {
  return Math.exp(-(d * d) / (2 * width * width))
}

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function noise2(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function fbm(x: number, y: number): number {
  let v = 0
  let a = 0.5
  let f = 1
  for (let i = 0; i < 5; i++) {
    v += a * (noise2(x * f, y * f) * 2 - 1)
    a *= 0.5
    f *= 2
  }
  return v
}
