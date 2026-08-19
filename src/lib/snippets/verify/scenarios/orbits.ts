/**
 * Verification scenarios for orbital-mechanics pilot tools.
 * See scenarios/index.ts for how these merge into the runner's SCENARIOS map,
 * and inputs.ts for how a scenario's `bag` layers onto SAMPLE + SAMPLE_OVERRIDES.
 */
import type { Scenario } from '../inputs'

export const ORBITS_SCENARIOS: Record<string, Scenario[]> = {
  'circular-orbit': [
    {
      name: 'iss',
      source: 'ISS-class LEO: R=EARTH_RADIUS, h=400 km; well-known v≈7.67 km/s',
      bag: { h: 400_000 },
    },
    {
      name: 'geo',
      source: 'Geostationary altitude 35,786 km; well-known r≈42,164 km circular orbit',
      bag: { h: 35_786_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h',
      bag: { mu: 3.5e14, R: 6_300_000, h: 913_000 },
    },
  ],

  hohmann: [
    {
      name: 'leo300-to-geo',
      source: 'textbook LEO(300 km)→GEO Hohmann transfer (Curtis/Vallado-scale example)',
      bag: { h1: 300_000, h2: 35_786_000 },
    },
    {
      name: 'leo-raise',
      source: 'well-known small LEO altitude raise, ISS-class to higher LEO',
      bag: { h1: 400_000, h2: 800_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h1/h2',
      bag: { mu: 3.5e14, R: 6_450_000, h1: 250_777, h2: 19_650_321 },
    },
  ],

  'vis-viva': [
    {
      name: 'iss-circular',
      source: 'well-known ISS-class circular orbit (r=a, v = circular velocity)',
      bag: { r: 6_778_137, a: 6_778_137 },
    },
    {
      name: 'gto-perigee',
      source: 'Hohmann transfer ellipse LEO(400 km)→GEO, velocity at perigee (textbook GTO geometry)',
      bag: { r: 6_778_137, a: (6_778_137 + 42_164_000) / 2 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/r/a, elliptical a>0',
      bag: { mu: 3.7e14, r: 9_123_456, a: 12_345_678 },
    },
  ],

  'plane-change': [
    {
      name: 'leo-correction',
      source: 'typical small LEO inclination-correction burn at ISS-class circular speed',
      bag: { di_deg: 5, diDeg: 5, v: 7668.6 },
    },
    {
      name: 'geo-correction',
      source: 'small plane-change at well-known GEO circular speed (~3074.66 m/s)',
      bag: { di_deg: 2, diDeg: 2, v: 3074.66 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round Δi/v, away from 0°/90°',
      bag: { di_deg: 37.283, diDeg: 37.283, v: 5432.17 },
    },
  ],

  'j2-drift': [
    {
      name: 'iss-prograde',
      source: 'well-known ISS inclination 51.6° (prograde, i<90°, cos(i)>0), ISS-class LEO',
      bag: { a: 6_778_137, e: 0.001, i: 51.6 * (Math.PI / 180), iRad: 51.6 * (Math.PI / 180), i_rad: 51.6 * (Math.PI / 180) },
    },
    {
      name: 'sso-retrograde',
      source: 'well-known sun-synchronous inclination ≈98.6° at ~700 km (retrograde, i>90°, cos(i)<0)',
      bag: {
        a: 7_078_137,
        e: 0.001,
        i: 98.6 * (Math.PI / 180),
        iRad: 98.6 * (Math.PI / 180),
        i_rad: 98.6 * (Math.PI / 180),
      },
    },
    {
      name: 'synthetic-retrograde',
      source: 'adversarial synthetic: distinct non-round a/e/i, retrograde (i>90°)',
      bag: {
        a: 8_123_456,
        e: 0.0456,
        i: 142.938 * (Math.PI / 180),
        iRad: 142.938 * (Math.PI / 180),
        i_rad: 142.938 * (Math.PI / 180),
      },
    },
  ],

  'kepler-propagate': [
    {
      name: 'vallado-ex-2-4',
      source: 'Vallado Ex 2-4 (published, elliptic branch, z>0)',
      bag: { rx: 1_131_340, ry: -2_282_343, rz: 6_672_423, vx: -5643.05, vy: 4303.33, vz: 2428.79, dt_s: 2400 },
    },
    {
      name: 'hyperbolic-branch',
      source: 'same LEO position as Vallado Ex 2-4, velocity scaled to 1.25x local escape speed to force the hyperbolic Stumpff branch (z<0)',
      bag: {
        rx: 1_131_340,
        ry: -2_282_343,
        rz: 6_672_423,
        vx: -9935.44,
        vy: 7576.66,
        vz: 4276.25,
        dt_s: 2400,
      },
    },
    {
      name: 'leo-circular',
      source: 'current LEO SAMPLE_OVERRIDES bag (near-circular LEO, elliptic branch, z>0)',
      bag: { rx: 6_778_137, ry: 0, rz: 0, vx: 0, vy: 7668.6, vz: 0, dt_s: 3600 },
    },
  ],
}
