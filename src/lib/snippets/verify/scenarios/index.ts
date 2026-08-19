/**
 * Merges the domain-split scenario modules into the flat map `inputs.ts` uses
 * for `scenariosFor`. Mirrors the expected/ directory split.
 */
import { ORBITS_SCENARIOS } from './orbits'
import { RF_SCENARIOS } from './rf'
import { SYSTEMS_SCENARIOS } from './systems'
import { OPS_SCENARIOS } from './ops'
import type { Scenario } from '../inputs'

export const SCENARIOS: Record<string, Scenario[]> = {
  ...ORBITS_SCENARIOS,
  ...RF_SCENARIOS,
  ...SYSTEMS_SCENARIOS,
  ...OPS_SCENARIOS,
}
