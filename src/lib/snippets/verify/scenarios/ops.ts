/**
 * Verification scenarios for ground-ops/tracking pilot tools.
 * See scenarios/index.ts for how these merge into the runner's SCENARIOS map.
 *
 * `look-angles` is UNVERIFIABLE (EXPECTED returns `{}` regardless of bag; see
 * expected/ops.ts), so these scenarios never reach a numeric comparison — they
 * exist to satisfy the pilot's >=3-scenario minimum and to document plausible
 * topocentric SEZ inputs (satellite ECEF, observer geodetic) for future waves.
 */
import type { Scenario } from '../inputs'

export const OPS_SCENARIOS: Record<string, Scenario[]> = {
  'look-angles': [
    {
      name: 'iss-overhead-pass',
      source: 'ISS-class satellite ECEF near a well-known observer geodetic position (KSC)',
      bag: { sat_x: 4.6e6, sat_y: 2.6e6, sat_z: 3.6e6, lat: 28.5721 * (Math.PI / 180), lon: -80.648 * (Math.PI / 180), h_m: 0 },
    },
    {
      name: 'geo-low-elevation',
      source: 'GEO-range satellite ECEF observed from a mid-latitude ground station',
      bag: { sat_x: 4.2e7, sat_y: 1.2e7, sat_z: 3.0e6, lat: 51.6 * (Math.PI / 180), lon: 10 * (Math.PI / 180), h_m: 200 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round ECEF/geodetic inputs',
      bag: { sat_x: 5.734e6, sat_y: -1.842e6, sat_z: 4.117e6, lat: -22.347 * (Math.PI / 180), lon: 63.129 * (Math.PI / 180), h_m: 1345 },
    },
  ],
}
