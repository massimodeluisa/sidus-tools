/** Name token `parseTle` writes when a two-line TLE has no name line. */
export const UNNAMED_SATELLITE_TOKEN = 'SAT'

/**
 * Trimmed TLE name, or null when it is blank or exactly the unnamed token.
 * Callers show `fields.satellite_unnamed` for null.
 */
export function namedSatellite(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed === '' || trimmed === UNNAMED_SATELLITE_TOKEN) return null
  return trimmed
}
