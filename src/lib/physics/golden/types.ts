/**
 * Golden-case matrix: engineer-grade regression anchors.
 * Each case cites a source class (textbook / standard) and a tolerance.
 */

export type GoldenDomain =
  | 'two-body'
  | 'maneuvers'
  | 'hyperbolic'
  | 'planetary'
  | 'geometry'
  | 'propulsion'
  | 'link-rf'
  | 'mission'
  | 'ops-aero'
  | 'eclss'
  | 'sgp4'
  | 'systems'

export type GoldenCheck = {
  /** Short metric name shown in failures */
  key: string
  /** Independent reference value (SI unless noted in key) */
  expected: number
  /** Value from shipped SIDUS physics (must call exports, not re-derive only) */
  got: () => number
  /**
   * Relative |got−expected|/|expected| upper bound.
   * Default applied by runner if omitted.
   */
  relTol?: number
  /** Absolute |got−expected| upper bound (used if set, in addition or instead) */
  absTol?: number
}

export type GoldenCase = {
  id: string
  domain: GoldenDomain
  /** Human scenario title */
  name: string
  /**
   * Citation class (not a full bibliography: enough for audit).
   * e.g. "Vallado §6.3; Curtis §6.4; WGS-84 μ,R"
   */
  source: string
  checks: GoldenCheck[]
}

export const DOMAIN_DEFAULT_REL_TOL: Record<GoldenDomain, number> = {
  // Algebraic closed-form on IEEE-754 doubles
  'two-body': 1e-12,
  maneuvers: 1e-12,
  hyperbolic: 1e-12,
  propulsion: 1e-12,
  'link-rf': 1e-10,
  mission: 1e-12,
  'ops-aero': 1e-12,
  systems: 1e-12,
  // Teaching models / published bands
  planetary: 1e-9,
  geometry: 1e-10,
  eclss: 1e-9,
  // Backstop only: SGP4 cases must set cited absTol in meters / m/s (absTol wins in the runner).
  sgp4: 1e-6,
}
