import { ALL_TAGS } from '@/data/tools'

/** Resolve a raw tag token against catalog tags (case-insensitive). */
export function resolveCatalogTag(raw: string): string | null {
  const bare = raw.trim().replace(/^#/, '').toLowerCase()
  if (!bare) return null
  return ALL_TAGS.find((t) => t.toLowerCase() === bare) ?? null
}

/**
 * Parse multi-select tags from URL.
 * Canonical: `?tags=orbital,crew` (comma-separated).
 * Legacy: `?tag=` / `?cat=` rewritten to `tags=`.
 */
export function parseCatalogTagsParam(params: URLSearchParams): string[] {
  const multi = params.get('tags')
  const single = params.get('tag') ?? params.get('cat')
  const raw = multi ?? single ?? ''
  if (!raw.trim()) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const part of raw.split(/[,+|]/)) {
    const hit = resolveCatalogTag(part)
    if (hit && !seen.has(hit)) {
      seen.add(hit)
      out.push(hit)
    }
  }
  return out.sort((a, b) => a.localeCompare(b))
}

export function serializeCatalogTags(tags: string[]): string {
  return [...tags].sort((a, b) => a.localeCompare(b)).join(',')
}

/** Catalog path with the same `?tags=` filter as ToolsPage / home tag chips. */
export function catalogFilterPath(tags: string[]): string {
  const list: string[] = []
  const seen = new Set<string>()
  for (const raw of tags) {
    const hit = resolveCatalogTag(raw)
    if (hit && !seen.has(hit)) {
      seen.add(hit)
      list.push(hit)
    }
  }
  if (list.length === 0) return '/tools'
  return `/tools?tags=${serializeCatalogTags(list)}`
}
