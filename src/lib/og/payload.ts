/**
 * Lightweight OG payload resolver for Edge.
 * NO physics / tools.ts imports — those make cold /api/og timeout (~60s+)
 * for social crawlers. Live formula metrics are optional via dynamic import.
 */
import { toolOgMeta } from './catalog'
import type { OgPayload } from './types'
import { SITE_ORIGIN } from './types'

const SKIP = new Set(['page', 'tool', 'id', 'v', 'mcp'])

function str(q: Record<string, string | undefined>, key: string, fallback = ''): string {
  const raw = q[key]
  return raw != null && raw !== '' ? raw : fallback
}

/** Human title from tool id (cw-rendezvous → CW rendezvous). */
export function humanizeToolId(id: string): string {
  return id
    .split('-')
    .map((w) => {
      const u = w.toUpperCase()
      if (['CW', 'SGP4', 'SSO', 'RF', 'ECLSS', 'J2', 'TLE', 'ISA', 'GEO', 'LEO', 'GNC'].includes(u)) {
        return u
      }
      if (u === 'DV' || u === 'DELTAV') return 'Δv'
      return w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join(' ')
}

export function queryFromSearch(
  search: string | URLSearchParams | Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  if (typeof search === 'string') {
    return queryFromSearch(new URLSearchParams(search.startsWith('?') ? search : `?${search}`))
  }
  if (search instanceof URLSearchParams) {
    const out: Record<string, string | undefined> = {}
    search.forEach((v, k) => {
      out[k] = v
    })
    return out
  }
  const out: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(search)) {
    if (Array.isArray(v)) out[k] = v[0]
    else if (v != null) out[k] = String(v)
  }
  return out
}

export function hasLiveToolParams(q: Record<string, string | undefined>): boolean {
  return Object.keys(q).some((k) => !SKIP.has(k) && q[k] != null && q[k] !== '')
}

/** Static / fast OG payload — safe for Edge cold starts. */
export function resolveOgPayloadStatic(
  q: Record<string, string | undefined>,
): OgPayload {
  const page = str(q, 'page')
  const toolId = str(q, 'tool', str(q, 'id'))

  if (page === 'tools') {
    return {
      kind: 'tools',
      title: 'Tool catalog',
      subtitle: 'Pure-SI space engineering calculators',
      formula: 'Orbital · Propulsion · Satellite · Crew · Utilities',
      brand: 'SIDUS',
      urlHint: 'sidus.tools/tools',
      tags: ['orbital', 'propulsion', 'ECLSS', 'RF', 'GNC'],
    }
  }

  if (page === 'resources') {
    return {
      kind: 'resources',
      title: 'Resources',
      subtitle: 'Textbooks, TLE catalogs, open data',
      formula: 'Vallado · Curtis · NASA GRC · CelesTrak',
      brand: 'SIDUS',
      urlHint: 'sidus.tools/resources',
    }
  }

  if (toolId) {
    const meta = toolOgMeta(toolId)
    return {
      kind: 'tool',
      toolId,
      title: humanizeToolId(toolId),
      subtitle: meta.blurb,
      formula: meta.formula,
      brand: 'SIDUS',
      urlHint: `sidus.tools/tools/${toolId}`,
      tags: [],
      dynamic: false,
    }
  }

  // home default
  return {
    kind: 'home',
    title: 'SIDUS',
    subtitle: 'Space Engineering Tools',
    formula: 'Pure SI · open source · educational',
    brand: 'SIDUS',
    urlHint: SITE_ORIGIN.replace('https://', ''),
    tags: ['orbits', 'propulsion', 'ECLSS', 'RF'],
    context: 'No affiliation with NASA, ESA, or SpaceX',
    dynamic: false,
  }
}
