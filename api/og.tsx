/**
 * Dynamic OG image — SIDUS brand language.
 *
 * Matches site UI tokens:
 * - bg #050505 · fg #f2f2f2 · muted #8a8a8a · border #222 · signal #c4c8ce · grid #161616
 * - Orbit mark, system mono labels, system sans headlines
 *
 * Edge / Satori constraints (empty PNG body if violated):
 * - no <br />, no flexWrap, no React Fragments with mixed conditionals
 * - no TagChips / nested chip rows (empty body on Edge for home+tools)
 * - no heavy physics bundle on cold path (OOM → content-length 0)
 *
 * 1200×630 · @vercel/og
 */
import { ImageResponse } from '@vercel/og'
import { queryFromSearch, resolveOgPayloadStatic } from '../src/lib/og/payload'
import type { OgPayload } from '../src/lib/og/types'
import { OG_H, OG_W } from '../src/lib/og/types'

export const config = {
  runtime: 'edge',
}

// Site theme (index.css @theme)
const BG = '#050505'
const FG = '#f2f2f2'
const MUTED = '#8a8a8a'
const SUBTLE = '#5c5c5c'
const BORDER = '#222222'
const SIGNAL = '#c4c8ce'
const GRID = '#161616'
const SURFACE = '#141414'

const CACHE =
  'public, max-age=60, s-maxage=300, stale-while-revalidate=3600'

const OG_HEADERS = {
  'Cache-Control': CACHE,
  'Access-Control-Allow-Origin': '*',
} as const

/** Subtle engineering grid — few lines only (Satori cost). */
function SiteGrid() {
  const v: number[] = []
  const h: number[] = []
  for (let x = 80; x < OG_W; x += 80) v.push(x)
  for (let y = 80; y < OG_H; y += 80) h.push(y)
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
      }}
    >
      {v.map((x) => (
        <div
          key={`v${x}`}
          style={{
            position: 'absolute',
            left: x,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: GRID,
          }}
        />
      ))}
      {h.map((y) => (
        <div
          key={`h${y}`}
          style={{
            position: 'absolute',
            top: y,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: GRID,
          }}
        />
      ))}
    </div>
  )
}

/** SIDUS orbit mark: tile + nucleus + two arcs (matches logo-mark). */
function OrbitMark({ size = 44 }: { size?: number }) {
  const s = size
  return (
    <div
      style={{
        width: s,
        height: s,
        backgroundColor: SURFACE,
        border: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: s * 0.62,
          height: s * 0.62,
          borderRadius: 999,
          border: `2px solid ${FG}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: s * 0.18,
            height: s * 0.18,
            borderRadius: 999,
            backgroundColor: FG,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          width: s * 0.12,
          height: s * 0.12,
          borderRadius: 999,
          backgroundColor: FG,
          top: s * 0.14,
          right: s * 0.16,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: s * 0.12,
          height: s * 0.12,
          borderRadius: 999,
          backgroundColor: FG,
          bottom: s * 0.14,
          left: s * 0.16,
        }}
      />
    </div>
  )
}

function BrandRow({ live }: { live?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <OrbitMark size={40} />
      <div
        style={{
          marginLeft: 14,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '0.16em',
          color: FG,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        SIDUS
      </div>
      <div
        style={{
          marginLeft: 14,
          fontSize: 12,
          letterSpacing: '0.14em',
          color: SUBTLE,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          textTransform: 'uppercase',
        }}
      >
        Space Engineering Tools
      </div>
      {live ? (
        <div
          style={{
            marginLeft: 12,
            fontSize: 11,
            letterSpacing: '0.16em',
            color: SIGNAL,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            border: `1px solid ${BORDER}`,
            padding: '4px 8px',
            textTransform: 'uppercase',
          }}
        >
          LIVE
        </div>
      ) : null}
    </div>
  )
}

function Footer({ urlHint }: { urlHint?: string }) {
  const hint =
    urlHint && urlHint !== 'sidus.tools'
      ? urlHint.replace(/^sidus\.tools\/?/, '/')
      : ''
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 16,
        color: MUTED,
      }}
    >
      <span style={{ color: SIGNAL }}>https://sidus.tools</span>
      {hint ? (
        <span style={{ color: SUBTLE, marginLeft: 10 }}>· {hint}</span>
      ) : null}
    </div>
  )
}

function MetricsRow({
  metrics,
}: {
  metrics: NonNullable<OgPayload['metrics']>
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
      {metrics.slice(0, 4).map((m, i) => (
        <div
          key={m.label}
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginRight: i < 3 ? 28 : 0,
          }}
        >
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: SUBTLE,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            {m.label}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              marginTop: 4,
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 500,
                color: FG,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: '-0.02em',
              }}
            >
              {m.value}
            </div>
            {m.unit ? (
              <div style={{ fontSize: 15, color: SIGNAL, marginLeft: 6 }}>{m.unit}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function kickerFor(kind: OgPayload['kind']): string {
  if (kind === 'home') return 'Open source · Pure SI'
  if (kind === 'tools') return 'Catalog'
  if (kind === 'resources') return 'Library'
  return 'Tool · SIDUS'
}

/**
 * Single Satori-safe layout for all pages.
 * Home/tools previously used TagChips + Fragments → content-length 0 on Edge.
 */
function SidusOgCard({ payload }: { payload: OgPayload }) {
  const isTool = payload.kind === 'tool'
  const title =
    payload.kind === 'home' ? 'Tools for space engineering.' : payload.title
  const subtitle =
    payload.kind === 'home'
      ? 'Pure-SI calculators for orbits, propulsion, SGP4, launch, RF, and crew ECLSS.'
      : payload.subtitle

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BG,
        color: FG,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SiteGrid />

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: SIGNAL,
          opacity: 0.55,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          padding: '48px 56px 44px 56px',
          position: 'relative',
        }}
      >
        <BrandRow live={payload.dynamic} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 13,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: SUBTLE,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              marginBottom: 14,
            }}
          >
            {kickerFor(payload.kind)}
          </div>

          <div
            style={{
              fontSize: isTool ? 48 : 52,
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              color: FG,
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              style={{
                fontSize: 22,
                color: MUTED,
                lineHeight: 1.35,
                marginTop: 14,
              }}
            >
              {subtitle}
            </div>
          ) : null}

          {payload.formula ? (
            <div
              style={{
                marginTop: 14,
                fontSize: 20,
                color: SIGNAL,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: '0.02em',
                lineHeight: 1.4,
              }}
            >
              {payload.formula}
            </div>
          ) : null}

          {payload.context ? (
            <div
              style={{
                marginTop: 10,
                fontSize: 16,
                color: SUBTLE,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {payload.context}
            </div>
          ) : null}

          {payload.metrics && payload.metrics.length > 0 ? (
            <MetricsRow metrics={payload.metrics} />
          ) : null}
        </div>

        <Footer urlHint={payload.urlHint} />
      </div>
    </div>
  )
}

/** Minimal card used when the primary render yields an empty PNG body. */
function MinimalOgCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: BG,
        color: FG,
        padding: 64,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '0.16em',
          marginBottom: 24,
        }}
      >
        SIDUS
      </div>
      <div style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.15 }}>
        Space Engineering Tools
      </div>
      <div style={{ fontSize: 22, color: MUTED, marginTop: 16 }}>
        Pure SI · open source · educational
      </div>
      <div
        style={{
          fontSize: 16,
          color: SIGNAL,
          marginTop: 40,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        https://sidus.tools
      </div>
    </div>
  )
}

async function pngResponse(element: JSX.Element): Promise<Response> {
  const res = new ImageResponse(element, {
    width: OG_W,
    height: OG_H,
    headers: { ...OG_HEADERS },
  })
  // @vercel/og can return image/png with content-length 0 when Satori fails
  // silently — detect and let the caller fall back.
  const buf = await res.arrayBuffer()
  if (buf.byteLength < 256) {
    throw new Error(`og empty png body (${buf.byteLength} bytes)`)
  }
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      ...OG_HEADERS,
    },
  })
}

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const q = queryFromSearch(url.searchParams)
  const payload: OgPayload = resolveOgPayloadStatic(q)

  try {
    return await pngResponse(<SidusOgCard payload={payload} />)
  } catch (err) {
    console.error('og primary render failed', err)
    try {
      return await pngResponse(<MinimalOgCard />)
    } catch (err2) {
      console.error('og fallback render failed', err2)
      return new Response('OG render failed', { status: 500 })
    }
  }
}
