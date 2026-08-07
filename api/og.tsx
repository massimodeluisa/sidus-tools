/**
 * Dynamic OG image — SIDUS brand language (not Axiom gold gallery).
 *
 * Matches site UI tokens:
 * - bg #050505 · fg #f2f2f2 · muted #8a8a8a · border #222 · signal #c4c8ce · grid #161616
 * - Orbit mark (Lucide-style mono), IBM Plex Mono labels, Space Grotesk headlines
 * - Tool cards: title + formula + optional live metrics
 *
 * Performance: static payload only (no physics bundle). Live metrics optional
 * via dynamic import when URL has tool params — crawlers rarely wait >5s.
 *
 * 1200×630 · @vercel/og
 */
import { ImageResponse } from '@vercel/og'
import {
  hasLiveToolParams,
  queryFromSearch,
  resolveOgPayloadStatic,
} from '../src/lib/og/payload'
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
      {/* outer ring */}
      <div
        style={{
          width: s * 0.62,
          height: s * 0.62,
          borderRadius: 999,
          border: `2px solid ${FG}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
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
      {/* satellite dots */}
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <OrbitMark size={40} />
      <div
        style={{
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
            marginLeft: 8,
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
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 16,
        color: MUTED,
      }}
    >
      <span style={{ color: SIGNAL }}>https://sidus.tools</span>
      {urlHint && urlHint !== 'sidus.tools' ? (
        <>
          <span style={{ color: SUBTLE }}>·</span>
          <span style={{ color: SUBTLE }}>{urlHint.replace(/^sidus\.tools\/?/, '/')}</span>
        </>
      ) : null}
    </div>
  )
}

function TagChips({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {tags.slice(0, 6).map((tg) => (
        <div
          key={tg}
          style={{
            border: `1px solid ${BORDER}`,
            padding: '5px 10px',
            fontSize: 13,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: MUTED,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          #{tg}
        </div>
      ))}
    </div>
  )
}

function MetricsRow({
  metrics,
}: {
  metrics: NonNullable<OgPayload['metrics']>
}) {
  return (
    <div style={{ display: 'flex', gap: 28, marginTop: 20, flexWrap: 'wrap' }}>
      {metrics.slice(0, 4).map((m) => (
        <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
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
              <div style={{ fontSize: 15, color: SIGNAL }}>{m.unit}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function SidusOgCard({ payload }: { payload: OgPayload }) {
  const isHome = payload.kind === 'home'
  const isTool = payload.kind === 'tool'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: BG,
        color: FG,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SiteGrid />

      {/* Left accent bar */}
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
            gap: 14,
            flex: 1,
            justifyContent: 'center',
            maxWidth: 980,
          }}
        >
          {isHome ? (
            <>
              <div
                style={{
                  fontSize: 54,
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.12,
                  color: FG,
                }}
              >
                Tools for space
                <br />
                engineering.
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: MUTED,
                  lineHeight: 1.4,
                  maxWidth: 640,
                }}
              >
                Pure-SI calculators for orbits, propulsion, SGP4, launch, RF, and crew
                ECLSS — open source, educational.
              </div>
              <TagChips tags={payload.tags ?? []} />
            </>
          ) : (
            <>
              {payload.kind !== 'tool' ? (
                <div
                  style={{
                    fontSize: 13,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: SUBTLE,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  {payload.kind === 'tools' ? 'Catalog' : 'Library'}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: SUBTLE,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  Tool · SIDUS
                </div>
              )}
              <div
                style={{
                  fontSize: isTool ? 48 : 52,
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.12,
                  color: FG,
                }}
              >
                {payload.title}
              </div>
              {payload.subtitle ? (
                <div style={{ fontSize: 22, color: MUTED, lineHeight: 1.35 }}>
                  {payload.subtitle}
                </div>
              ) : null}
              {payload.formula ? (
                <div
                  style={{
                    marginTop: 6,
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
              <TagChips tags={payload.tags ?? []} />
            </>
          )}
        </div>

        <Footer urlHint={payload.urlHint} />
      </div>
    </div>
  )
}

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url)
    const q = queryFromSearch(url.searchParams)

    // Fast path: static card (no physics bundle)
    let payload: OgPayload = resolveOgPayloadStatic(q)

    // Optional live metrics — only when tool URL has real params (not just tool=id)
    const toolId = q.tool || q.id
    if (toolId && hasLiveToolParams(q)) {
      try {
        const { computeToolOg } = await import('../src/lib/og/compute')
        payload = computeToolOg(toolId, q)
      } catch (e) {
        console.error('og live compute skipped', e)
      }
    }

    return new ImageResponse(<SidusOgCard payload={payload} />, {
      width: OG_W,
      height: OG_H,
      headers: {
        'Cache-Control': CACHE,
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('og error', err)
    try {
      const fallback: OgPayload = {
        kind: 'home',
        title: 'SIDUS',
        subtitle: 'Space Engineering Tools',
        brand: 'SIDUS',
        urlHint: 'sidus.tools',
      }
      return new ImageResponse(<SidusOgCard payload={fallback} />, {
        width: OG_W,
        height: OG_H,
        headers: { 'Cache-Control': CACHE, 'Access-Control-Allow-Origin': '*' },
      })
    } catch {
      return new Response('OG render failed', { status: 500 })
    }
  }
}
