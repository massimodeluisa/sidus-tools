/** Shared OG image payload: pure data, no React. */

export type OgMetric = {
  label: string
  value: string
  /** Optional unit/suffix shown muted after value */
  unit?: string
}

export type OgPayload = {
  kind: 'home' | 'tools' | 'resources' | 'tool'
  /** Tool id when kind=tool */
  toolId?: string
  title: string
  subtitle?: string
  /** LaTeX-ish / unicode formula line */
  formula?: string
  category?: string
  tags?: string[]
  /** When URL params present and compute succeeds */
  metrics?: OgMetric[]
  /** Compact input summary e.g. "h₁ 200 km → h₂ 35 786 km · Earth" */
  context?: string
  /** True when metrics come from live URL params */
  dynamic?: boolean
  brand?: string
  urlHint?: string
}

export const OG_W = 1200
export const OG_H = 630
export const SITE_ORIGIN = 'https://sidus.tools'
