/**
 * Expected numeric results for snippet verification, sourced from shipped physics.
 *
 * Verification chain:
 *   snippet listing (11 langs) → compiled/executed locally → printed numbers
 *     → EXPECTED (this module) → shipped `src/lib/physics` exports
 *     → golden tests anchored to published sources.
 *
 * This module never re-derives physics: every value comes from a shipped export, so a
 * mismatch means the language listing disagrees with the physics the site actually ships.
 * Keys are the assigned variable names as they appear in the snippet bodies; several
 * tools rename results per language (rust `t` vs `T`, js `lfsDb` vs `lfs_db`), so the
 * union of those spellings is returned. Printed names with no shipped counterpart
 * (pure intermediates such as j2 `p`/`k`) are omitted by design.
 *
 * Domain modules (one per snippet category) hold the per-tool expected-value
 * functions; this barrel merges them into the flat maps the runner and tests use.
 */
import { ORBITS_EXPECTED } from './orbits'
import { RF_EXPECTED } from './rf'
import { SYSTEMS_EXPECTED } from './systems'
import { OPS_EXPECTED, UNVERIFIABLE_OPS } from './ops'

export type { ExpectedFn } from './shared'

export const EXPECTED = {
  ...ORBITS_EXPECTED,
  ...RF_EXPECTED,
  ...SYSTEMS_EXPECTED,
  ...OPS_EXPECTED,
}

export const UNVERIFIABLE: Readonly<Record<string, string>> = {
  ...UNVERIFIABLE_OPS,
}
