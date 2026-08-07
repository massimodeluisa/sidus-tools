/**
 * Canonical tags for tools. Prefer these over ad-hoc strings.
 * Keep in sync with tags actually used on TOOLS after normalizeTags.
 */

export const CANONICAL_TAGS = [
  'orbital',
  'propulsion',
  'maneuver',
  'trajectory',
  'rendezvous',
  'docking',
  'GNC',
  'mission-design',
  'launch',
  'range',
  'operations',
  'satellite',
  'LEO',
  'earth-observation',
  'geo',
  'RF',
  'comms',
  'constellation',
  'aero',
  'structures',
  'analysis',
  'math',
  'units',
  'reference',
  'apollo',
  'vis-viva',
  'delta-v',
  'relative-motion',
  'ECLSS',
  'crew',
  'atmosphere',
  'CO2',
  'LiOH',
  'thermal',
  'emergency',
  'pressure',
  'contingency',
  'astronaut',
  'ISS',
  'Dragon',
  'Soyuz',
  // Domain tags used on tools (not only aliases)
  'entry',
  'geometry',
  'hyperbolic',
  'planetary',
  'pointing',
  'power',
  'trigonometry',
  'visualization',
  'GNSS',
  'optical',
  'laser',
  'engines',
  'impedance',
  'ballistics',
] as const

export type CanonicalTag = (typeof CANONICAL_TAGS)[number]

/** Map legacy / verbose tags → canonical */
export const TAG_ALIASES: Record<string, string> = {
  // Partial pressures / cabin gas → single atmosphere tag
  ppO2: 'atmosphere',
  ppCO2: 'atmosphere',
  ppo2: 'atmosphere',
  ppco2: 'atmosphere',
  'pp-o2': 'atmosphere',
  'pp-co2': 'atmosphere',
  'partial-pressure': 'atmosphere',
  cabin: 'atmosphere',
  // Thermal control synonyms (do not keep as separate filter tags)
  cooling: 'thermal',
  TCS: 'thermal',
  'thermal-control': 'thermal',
  // Life support
  'life-support': 'ECLSS',
  eclss: 'ECLSS',
  // Constellation / EO
  'Starlink-class': 'constellation',
  starlink: 'constellation',
  EO: 'earth-observation',
  // Ops synonyms
  ops: 'operations',
  'mission ops': 'operations',
  // GNC synonyms
  gnc: 'GNC',
  guidance: 'GNC',
  navigation: 'GNC',
  // Relative motion
  'relative motion': 'relative-motion',
  hill: 'relative-motion',
  CW: 'relative-motion',
}

/** Dedupe and normalize a tag list. */
export function normalizeTags(tags: string[]): string[] {
  const out = new Set<string>()
  for (const raw of tags) {
    const t = TAG_ALIASES[raw] ?? raw
    out.add(t)
  }
  return [...out].sort((a, b) => a.localeCompare(b))
}
