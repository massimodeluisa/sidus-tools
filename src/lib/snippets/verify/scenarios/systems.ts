/**
 * Verification scenarios for spacecraft/vehicle-systems pilot tools (propulsion,
 * thermal, ECLSS, aero, attitude).
 * See scenarios/index.ts for how these merge into the runner's SCENARIOS map.
 */
import type { Scenario } from '../inputs'

export const SYSTEMS_SCENARIOS: Record<string, Scenario[]> = {
  'rocket-equation': [
    {
      name: 'kerolox-stage',
      source: 'well-known kerolox first-stage Isp (~311 s) with a 10:1 mass ratio',
      bag: { isp: 311, m0: 500_000, mf: 50_000 },
    },
    {
      name: 'ion-stage',
      source: 'well-known electric-propulsion Isp regime (~3000 s)',
      bag: { isp: 3000, m0: 1200, mf: 1000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round Isp/m0/mf',
      bag: { isp: 417.3, m0: 83_456.2, mf: 9123.7 },
    },
  ],

  'heat-flux': [
    {
      name: 'lunar-return-reentry',
      source: 'Apollo-class lunar-return reentry peak-heating regime (~11 km/s, ISA-ish density near 70 km)',
      bag: { v: 11_000, rho: 4e-4, rn: 0.9, Rn: 0.9, R_n: 0.9 },
    },
    {
      name: 'leo-deorbit',
      source: 'typical LEO deorbit reentry speed (~7.8 km/s) at lower density',
      bag: { v: 7800, rho: 1e-4, rn: 0.3, Rn: 0.3, R_n: 0.3 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round v/rho/Rn',
      bag: { v: 6423.7, rho: 2.17e-5, rn: 0.647, Rn: 0.647, R_n: 0.647 },
    },
  ],

  'metabolic-load': [
    {
      name: 'iss-crew-day',
      source: 'well-known ISS crew size (7) over one day',
      bag: { tS: 86_400, crew: 7 },
    },
    {
      name: 'apollo-crew-week',
      source: 'Apollo-class crew size (3) over one week',
      bag: { tS: 604_800, crew: 3 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round duration, non-degenerate crew',
      bag: { tS: 53_417.8, crew: 5 },
    },
  ],

  'dynamic-pressure': [
    {
      name: 'commercial-cruise',
      source: 'commercial-jet-class cruise (~9 km, ~Mach 0.85 ≈ 250 m/s), within troposphere validity',
      bag: { h: 9000, v: 250 },
    },
    {
      name: 'max-q-ascent',
      source: 'well-known launch-vehicle "Max Q" regime (~10.5 km, transonic/supersonic ≈450 m/s)',
      bag: { h: 10_500, v: 450 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round h/v, within 0-11 km troposphere validity',
      bag: { h: 6234.7, v: 312.9 },
    },
  ],

  'quaternion-euler': [
    {
      name: 'small-attitude-correction',
      source: 'realistic small spacecraft attitude offset (few degrees)',
      bag: {
        yaw: 2 * (Math.PI / 180),
        pitch: 1 * (Math.PI / 180),
        roll: 0.5 * (Math.PI / 180),
      },
    },
    {
      name: 'large-slew',
      source: 'representative large slew maneuver, away from pitch=±90° gimbal lock',
      bag: {
        yaw: 120 * (Math.PI / 180),
        pitch: 45 * (Math.PI / 180),
        roll: 60 * (Math.PI / 180),
      },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round yaw/pitch/roll, away from 0°/±90°',
      bag: { yaw: 2.137, pitch: 0.734, roll: -1.042 },
    },
  ],
}
