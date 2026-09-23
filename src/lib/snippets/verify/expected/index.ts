/**
 * Expected numeric results for snippet verification, generally sourced from
 * shipped physics. Dynamic pressure is a deliberate exception: its check is
 * independently implemented from the U.S. Standard Atmosphere 1976.
 *
 * Verification chain:
 *   executable language listings (plus the non-executable LaTeX formula)
 *     → rendered/compiled/executed by the available language runners → printed
 *       numbers → EXPECTED (this module) → shipped physics or an independent
 *       reference equation → golden tests anchored to published sources.
 *
 * Most entries use shipped exports; the dynamic-pressure exception avoids using
 * the production atmosphere routine as its own oracle. A mismatch means the
 * language listing disagrees with its declared reference model.
 * Keys are the assigned variable names as they appear in the snippet bodies; several
 * tools rename results per language (rust `t` vs `T`, js `lfsDb` vs `lfs_db`), so the
 * union of those spellings is returned. Printed names with no shipped counterpart
 * (pure intermediates such as j2 `p`/`k`) are omitted by design.
 *
 * Domain modules (one per snippet category) hold the per-tool expected-value
 * functions; this barrel merges them into the flat maps the runner and tests use.
 */
import { ORBITS_EXPECTED, TOLERANCE_OVERRIDES_ORBITS } from './orbits'
import { RF_EXPECTED, UNVERIFIABLE_RF } from './rf'
import { SYSTEMS_EXPECTED } from './systems'
import { OPS_EXPECTED, UNVERIFIABLE_OPS } from './ops'
import { PLANETARY_EXPECTED, UNVERIFIABLE_PLANETARY } from './planetary'
import { ODC_EXPECTED } from './odc'

export type { ExpectedFn, ToleranceOverride, ToleranceOverrides } from './shared'

export const EXPECTED = {
  ...ORBITS_EXPECTED,
  ...RF_EXPECTED,
  ...SYSTEMS_EXPECTED,
  ...OPS_EXPECTED,
  ...PLANETARY_EXPECTED,
  ...ODC_EXPECTED,
}

export const UNVERIFIABLE: Readonly<Record<string, string>> = {
  ...UNVERIFIABLE_OPS,
  ...UNVERIFIABLE_RF,
  ...UNVERIFIABLE_PLANETARY,
}

/** Justified per-(tool, scenario, key) absolute-tolerance overrides; see `ToleranceOverride`. */
export const TOLERANCE_OVERRIDES = {
  ...TOLERANCE_OVERRIDES_ORBITS,
}
