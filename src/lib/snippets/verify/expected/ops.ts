/**
 * Expected numeric results for ground-ops/tracking pilot tools, sourced from shipped physics.
 * See expected/index.ts for the verification chain this module feeds.
 */
import type { ExpectedFn } from './shared'

/**
 * Tools whose snippets have no shipped counterpart with the same input contract.
 * They return `{}` on purpose: the runner reports them as uncovered instead of
 * asserting numbers that shipped physics does not actually produce.
 */
export const UNVERIFIABLE_OPS: Readonly<Record<string, string>> = {
  'look-angles':
    'snippet uses a WGS-84 ellipsoid + ECEF satellite vector in a SEZ frame; shipped topocentricElAz is spherical and takes target lat/lon/height. js/ts additionally call satellite.js with new Date() (non-deterministic).',
}

export const OPS_EXPECTED: Record<string, ExpectedFn> = {
  // See UNVERIFIABLE_OPS: no shipped export shares this snippet's contract.
  'look-angles': () => ({}),
}
