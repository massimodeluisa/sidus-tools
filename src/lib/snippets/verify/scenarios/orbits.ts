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

  escape: [
    {
      name: 'iss',
      source: 'ISS-class LEO altitude 400 km; well-known escape speed ~10.85 km/s vs local circular ~7.67 km/s',
      bag: { h: 400_000 },
    },
    {
      name: 'geo',
      source: 'GEO altitude 35,786 km; well-known escape speed = sqrt(2) x GEO circular speed (~3.07 km/s)',
      bag: { h: 35_786_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h',
      bag: { mu: 4.1e14, R: 6_050_000, h: 812_345 },
    },
  ],

  bielliptic: [
    {
      name: 'leo-to-super-geo',
      source: 'textbook-style large-ratio bielliptic transfer LEO(300 km) -> high orbit(90,000 km) via intermediate apoapsis 200,000 km (favorable vs Hohmann per tool assumption)',
      bag: { h1: 300_000, h2: 90_000_000, hb: 200_000_000 },
    },
    {
      name: 'leo-to-geo-alt',
      source: 'LEO(400 km) -> GEO-altitude(35,786 km) via a higher intermediate apoapsis 150,000 km',
      bag: { h1: 400_000, h2: 35_786_000, hb: 150_000_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h1/h2/hb',
      bag: { mu: 3.7e14, R: 6_450_000, h1: 250_777, h2: 19_650_321, hb: 88_123_456 },
    },
  ],

  lambert: [
    {
      name: 'leo-short-arc',
      source: 'textbook-style short-way LEO-to-LEO transfer arc, transfer angle 60 deg',
      bag: { r1_m: 6_778_137, r2_m: 6_778_137, ang_rad: Math.PI / 3, tof_s: 1500 },
    },
    {
      name: 'leo-to-higher-leo',
      source: 'textbook-style transfer between two circular LEO radii, transfer angle 170 deg (near-Hohmann-scale geometry, avoiding the exact-pi degenerate case)',
      bag: { r1_m: 6_778_137, r2_m: 8_378_137, ang_rad: (170 * Math.PI) / 180, tof_s: 5200 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/r1/r2/angle/tof, transfer angle 100.7 deg',
      bag: { mu: 3.7e14, r1_m: 9_123_456, r2_m: 12_345_678, ang_rad: (100.7 * Math.PI) / 180, tof_s: 6100 },
    },
  ],

  'rv-elements': [
    {
      name: 'vallado-ex-2-4',
      source: 'Vallado Ex 2-4 (published, general inclined elliptical state, matches kepler-propagate pilot)',
      bag: { rx: 1_131_340, ry: -2_282_343, rz: 6_672_423, vx: -5643.05, vy: 4303.33, vz: 2428.79 },
    },
    {
      name: 'near-circular',
      source: 'well-known ISS-class near-circular state (exercises the e~0 argument-of-periapsis singular branch noted in the tool assumptions)',
      bag: { rx: 6_778_137, ry: 0, rz: 0, vx: 0, vy: 7668.6, vz: 0 },
    },
    {
      name: 'equatorial-synthetic',
      source: 'adversarial synthetic equatorial state (z=0, vz=0; exercises the i~0 node-vector singular branch noted in the tool assumptions)',
      bag: { rx: 8_123_456, ry: 1_234_567, rz: 0, vx: -1200, vy: 6900, vz: 0 },
    },
  ],

  apsides: [
    {
      name: 'iss-near-circular',
      source: 'ISS-class near-circular orbit; well-known small eccentricity',
      bag: { a: 6_778_137, e: 0.001 },
    },
    {
      name: 'gto-ellipse',
      source: 'well-known GTO ellipse (LEO 400 km perigee to GEO apogee), same geometry as the hohmann/vis-viva pilots',
      bag: { a: (6_778_137 + 42_164_000) / 2, e: (42_164_000 - 6_778_137) / (42_164_000 + 6_778_137) },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: high-eccentricity non-round a/e',
      bag: { a: 15_234_567, e: 0.85 },
    },
  ],

  bodies: [
    {
      name: 'earth',
      source: 'well-known Earth mu/R (EARTH_MU, EARTH_RADIUS)',
      bag: { mu: 3.986004418e14, R: 6_378_137 },
    },
    {
      name: 'moon',
      source: 'well-known Moon mu/R (MOON_MU, Moon mean radius 1,737,400 m)',
      bag: { mu: 4.9028e12, R: 1_737_400 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R',
      bag: { mu: 8.1e13, R: 3_050_000 },
    },
  ],

  'launch-azimuth': [
    {
      name: 'ksc-iss',
      source: 'well-known Kennedy Space Center latitude (28.5 deg) launching to the ISS inclination (51.6 deg)',
      bag: { lat: 28.5 * (Math.PI / 180), i: 51.6 * (Math.PI / 180), h: 200_000 },
    },
    {
      name: 'baikonur-retrograde',
      source: 'well-known Baikonur-class latitude (~45.9 deg) launching to a near-polar/retrograde inclination (98 deg), exercising the cos(i)<0 sign region',
      bag: { lat: 45.9 * (Math.PI / 180), i: 98 * (Math.PI / 180), h: 200_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: latitude close to (but below) the target inclination, non-round values',
      bag: { lat: 44.3 * (Math.PI / 180), i: 45.7 * (Math.PI / 180), h: 350_123 },
    },
  ],

  sso: [
    {
      name: 'sso-700km',
      source: 'well-known sun-synchronous altitude ~700 km (e.g. Landsat-class), matches the j2-drift pilot sso-retrograde scenario scale',
      bag: { h: 700_000 },
    },
    {
      name: 'sso-786km',
      source: 'well-known sun-synchronous altitude ~786 km (Sentinel-2-class)',
      bag: { h: 786_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round altitude',
      bag: { h: 553_421 },
    },
  ],

  'cw-rendezvous': [
    {
      name: 'iss-quarter-orbit',
      source: 'ISS-class target, small radial offset coasted a quarter orbit',
      bag: { h: 400_000, tf: 1500, x: 1000, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
    },
    {
      name: 'iss-full-orbit',
      source: 'ISS-class target, along-track + cross-track offset coasted close to a full orbit',
      bag: { h: 400_000, tf: 5400, x: 200, y: 500, z: 100, vx: 0.1, vy: -0.2, vz: 0.05 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: GEO-class target, non-round relative state and coast time',
      bag: { R: 6_378_137, h: 35_786_000, mu: 3.986004418e14, tf: 3723, x: -350, y: 812, z: -60, vx: 0.3, vy: 0.15, vz: -0.02 },
    },
  ],

  phasing: [
    {
      name: 'iss-phasing',
      source: 'ISS-class phasing correction: gain 0.1 rad of phase over 2 revs',
      bag: { h: 400_000, n: 2, phase: 0.1 },
    },
    {
      name: 'geo-phasing',
      source: 'GEO-class phasing correction: gain 0.05 rad of phase over 3 revs',
      bag: { h: 35_786_000, n: 3, phase: 0.05 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: negative phase (catch-down) with non-round revs',
      bag: { mu: 3.9e14, R: 6_400_000, h: 812_345, n: 2.5, phase: -0.2 },
    },
  ],

  'hyperbolic-c3': [
    {
      name: 'leo-departure',
      source: 'well-known LEO departure v_inf order of magnitude (~3 km/s, interplanetary-transfer scale) from a 400 km parking orbit',
      bag: { h: 400_000, v_inf: 3000 },
    },
    {
      name: 'geo-adjacent-departure',
      source: 'well-known higher departure v_inf (~5 km/s) from an 800 km parking orbit',
      bag: { h: 800_000, v_inf: 5000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: high v_inf, non-round mu/R/h',
      bag: { mu: 3.8e14, R: 6_450_000, h: 611_234, v_inf: 8123.4 },
    },
  ],

  'hohmann-plane': [
    {
      name: 'leo300-to-geo-plane5',
      source: 'same LEO(300 km)->GEO Hohmann geometry as the hohmann pilot, combined with a small 5 deg plane change',
      bag: { h1: 300_000, h2: 35_786_000, di: 5 * (Math.PI / 180) },
    },
    {
      name: 'leo400-to-leo800-plane28',
      source: 'well-known small LEO altitude raise (matches hohmann pilot leo-raise scenario) combined with a 28.5 deg plane change (KSC minimum-inclination reference)',
      bag: { h1: 400_000, h2: 800_000, di: 28.5 * (Math.PI / 180) },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: large plane change (edge-adjacent to 90 deg), non-round radii',
      bag: { mu: 3.6e14, R: 6_390_000, h1: 350_123, h2: 21_456_789, di: 85 * (Math.PI / 180) },
    },
  ],

  soi: [
    {
      name: 'earth-soi',
      source: 'well-known Earth sphere of influence (~924,000 km) at 1 AU from the Sun (matches SAMPLE r_soi default)',
      bag: { a: 149_597_870_700, m: 5.972e24, M: 1.98847e30 },
    },
    {
      name: 'moon-soi',
      source: 'well-known Moon sphere of influence (~66,000 km) at Earth-Moon distance, using well-known Moon/Earth masses',
      bag: { a: 384_400_000, m: 7.342e22, M: 5.972e24 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round a/m/M',
      bag: { a: 210_345_678, m: 3.2e23, M: 4.5e26 },
    },
  ],

  'synodic-period': [
    {
      name: 'iss-geo',
      source: 'well-known ISS-class LEO vs GEO synodic period',
      bag: { h1: 400_000, h2: 35_786_000 },
    },
    {
      name: 'leo-raise',
      source: 'well-known small LEO altitude raise (matches hohmann pilot leo-raise scenario)',
      bag: { h1: 400_000, h2: 800_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h1/h2',
      bag: { mu: 3.5e14, R: 6_450_000, h1: 250_777, h2: 19_650_321 },
    },
  ],

  circularize: [
    {
      name: 'gto-to-geo',
      source: 'well-known GTO ellipse circularized at apogee to GEO (same geometry as the hohmann/vis-viva pilots)',
      bag: { a: (6_778_137 + 42_164_000) / 2, e: (42_164_000 - 6_778_137) / (42_164_000 + 6_778_137) },
    },
    {
      name: 'molniya-class',
      source: 'well-known Molniya-class high-eccentricity ellipse (e ~ 0.72) circularized at apogee',
      bag: { a: 26_562_000, e: 0.72 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: moderate eccentricity, non-round a',
      bag: { mu: 3.7e14, a: 9_876_543, e: 0.35 },
    },
  ],

  'geo-orbit': [
    {
      name: 'sidereal-day',
      source: 'well-known Earth sidereal day (86,164.0905 s) defining the classic GEO radius (~42,164 km)',
      bag: { T: 86_164.0905 },
    },
    {
      name: 'solar-day',
      source: 'well-known 24 h solar day, a distinct commonly-cited reference period',
      bag: { T: 86_400 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/T',
      bag: { mu: 4.2e14, T: 51_234.5 },
    },
  ],

  'delta-a-burn': [
    {
      name: 'iss-stationkeeping',
      source: 'ISS-class small tangential stationkeeping burn (~1 m/s order of magnitude)',
      bag: { h: 400_000, dv: 1 },
    },
    {
      name: 'geo-stationkeeping',
      source: 'GEO-class small tangential stationkeeping burn (~0.5 m/s order of magnitude)',
      bag: { h: 35_786_000, dv: 0.5 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: larger dv, non-round mu/R/h',
      bag: { mu: 3.8e14, R: 6_420_000, h: 611_234, dv: 25.7 },
    },
  ],

  'plane-change-apo': [
    {
      name: 'gto-apogee-28p5',
      source: 'well-known GTO transfer ellipse (LEO 400 km perigee, GEO apogee) plane change at apogee by 28.5 deg (classic GEO-insertion doctrine)',
      bag: { hp: 400_000, ha: 35_786_000, di: 28.5 * (Math.PI / 180) },
    },
    {
      name: 'leo-transfer-small-di',
      source: 'well-known small LEO transfer ellipse (300 km to 800 km) plane change at apogee by 5 deg',
      bag: { hp: 300_000, ha: 800_000, di: 5 * (Math.PI / 180) },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: large plane change (edge-adjacent to 90 deg), non-round radii',
      bag: { mu: 3.7e14, R: 6_400_000, hp: 250_123, ha: 21_456_789, di: 82 * (Math.PI / 180) },
    },
  ],

  coelliptic: [
    {
      name: 'iss-coelliptic',
      source: 'ISS-class coelliptic rendezvous phasing with a small semi-major axis offset',
      bag: { h: 400_000, da: 5000 },
    },
    {
      name: 'geo-coelliptic',
      source: 'GEO-class coelliptic station-relocation with a small semi-major axis offset',
      bag: { h: 35_786_000, da: 2000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: large negative offset, non-round mu/R/h',
      bag: { mu: 3.8e14, R: 6_420_000, h: 611_234, da: -18_432 },
    },
  ],

  'los-range-rate': [
    {
      name: 'closing',
      source: 'simple closing-range 1-D LOS scenario (positive range, positive closing rate)',
      bag: { x: 1000, vx: 5 },
    },
    {
      name: 'receding',
      source: 'simple receding-range 1-D LOS scenario (positive range, negative rate)',
      bag: { x: 5000, vx: -3 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: large non-round range and rate',
      bag: { x: 82_345.6, vx: -117.3 },
    },
  ],

  oberth: [
    {
      name: 'leo-burn',
      source: 'ISS-class circular speed with a typical 100 m/s impulsive burn',
      bag: { a: 6_778_137, dv: 100 },
    },
    {
      name: 'gto-perigee-burn',
      source: 'well-known GTO perigee speed (same geometry as the hohmann/vis-viva pilots) with a larger 1500 m/s burn (Oberth demonstration)',
      bag: { a: (6_778_137 + 42_164_000) / 2, dv: 1500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round a/dv',
      bag: { mu: 3.7e14, a: 9_876_543, dv: 623.4 },
    },
  ],

  deorbit: [
    {
      name: 'iss-deorbit',
      source: 'ISS-class deorbit from 400 km to a 50 km entry-interface perigee',
      bag: { h: 400_000, hp: 50_000 },
    },
    {
      name: 'higher-leo-deorbit',
      source: 'higher-LEO deorbit from 800 km to a 100 km perigee',
      bag: { h: 800_000, hp: 100_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round mu/R/h/hp',
      bag: { mu: 3.8e14, R: 6_420_000, h: 611_234, hp: 87_654 },
    },
  ],

  'mean-motion': [
    {
      name: 'iss',
      source: 'ISS-class LEO altitude 400 km',
      bag: { h: 400_000 },
    },
    {
      name: 'geo',
      source: 'GEO altitude 35,786 km',
      bag: { h: 35_786_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h',
      bag: { mu: 3.5e14, R: 6_300_000, h: 913_000 },
    },
  ],

  'apo-raise': [
    {
      name: 'iss-raise',
      source: 'ISS-class circular orbit raising apogee to a higher LEO altitude',
      bag: { h: 400_000, ha: 800_000 },
    },
    {
      name: 'gto-class-raise',
      source: 'well-known LEO circular orbit raising apogee to GEO altitude (GTO-class transfer geometry)',
      bag: { h: 400_000, ha: 35_786_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h/ha',
      bag: { mu: 3.7e14, R: 6_420_000, h: 611_234, ha: 9_812_345 },
    },
  ],

  'along-track': [
    {
      name: 'iss-small-offset',
      source: 'ISS-class small along-track coelliptic offset (mean anomaly 0.001 rad)',
      bag: { h: 400_000, dM: 0.001, dy: 6779 },
    },
    {
      name: 'geo-relocation',
      source: 'GEO-class along-track offset for a station relocation (mean anomaly 0.01 rad)',
      bag: { h: 35_786_000, dM: 0.01, dy: 421_640 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: large negative offset, non-round R/h',
      bag: { R: 6_420_000, h: 611_234, dM: -0.25, dy: -1_823_456 },
    },
  ],

  'period-match': [
    {
      name: 'sidereal-day',
      source: 'well-known Earth sidereal day (86,164.0905 s), same GEO reference as the geo-orbit tool',
      bag: { T: 86_164.0905 },
    },
    {
      name: 'iss-period',
      source: 'well-known ISS orbital period (~92.68 min = 5561 s)',
      bag: { T: 5561 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/T',
      bag: { mu: 4.1e14, T: 34_567.8 },
    },
  ],

  'hohmann-time': [
    {
      name: 'leo300-to-geo',
      source: 'same textbook LEO(300 km)->GEO Hohmann transfer as the hohmann pilot',
      bag: { h1: 300_000, h2: 35_786_000 },
    },
    {
      name: 'leo-raise',
      source: 'well-known small LEO altitude raise (matches hohmann pilot leo-raise scenario)',
      bag: { h1: 400_000, h2: 800_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h1/h2',
      bag: { mu: 3.5e14, R: 6_450_000, h1: 250_777, h2: 19_650_321 },
    },
  ],

  'orbital-energy': [
    {
      name: 'iss',
      source: 'ISS-class circular orbit specific energy',
      bag: { a: 6_778_137 },
    },
    {
      name: 'geo',
      source: 'GEO circular orbit specific energy',
      bag: { a: 42_164_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round mu/a',
      bag: { mu: 3.7e14, a: 15_234_567 },
    },
  ],

  'true-anomaly': [
    {
      name: 'gto-periapsis',
      source: 'well-known GTO ellipse (same geometry as the hohmann/vis-viva pilots) evaluated at periapsis (nu=0)',
      bag: { a: (6_778_137 + 42_164_000) / 2, e: (42_164_000 - 6_778_137) / (42_164_000 + 6_778_137), nu: 0 },
    },
    {
      name: 'gto-apoapsis',
      source: 'same GTO ellipse evaluated at apoapsis (nu=pi), exercising the opposite sign of the (1+e cos nu) denominator',
      bag: { a: (6_778_137 + 42_164_000) / 2, e: (42_164_000 - 6_778_137) / (42_164_000 + 6_778_137), nu: Math.PI },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: high eccentricity, non-round true anomaly',
      bag: { mu: 3.8e14, a: 12_345_678, e: 0.6, nu: 2.1 },
    },
  ],

  'flyby-speed': [
    {
      name: 'leo-flyby',
      source: 'well-known interplanetary-transfer-scale flyby v_inf (~5 km/s) at a 400 km periapsis altitude',
      bag: { h: 400_000, vinf: 5000 },
    },
    {
      name: 'higher-flyby',
      source: 'well-known higher v_inf (~8 km/s) at an 800 km periapsis altitude',
      bag: { h: 800_000, vinf: 8000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h/vinf',
      bag: { mu: 3.8e14, R: 6_420_000, h: 611_234, vinf: 11_234.5 },
    },
  ],

  'eccentric-anomaly': [
    {
      name: 'low-e',
      source: 'low-eccentricity near-circular case (e=0.01)',
      bag: { Ea: 0.5, e: 0.01 },
    },
    {
      name: 'high-e',
      source: 'high-eccentricity near-parabolic-scale case (e=0.9)',
      bag: { Ea: 2.0, e: 0.9 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: eccentric anomaly beyond pi, moderate eccentricity',
      bag: { Ea: 4.5, e: 0.5 },
    },
  ],

  'rendezvous-catchup': [
    {
      name: 'iss-proximity',
      source: 'ISS-class proximity-ops catch-up between two close LEO altitudes',
      bag: { h1: 400_000, h2: 410_000, phi: 0.05 },
    },
    {
      name: 'geo-catchup',
      source: 'GEO-class catch-up scenario over a small altitude offset',
      bag: { h1: 35_786_000, h2: 35_886_000, phi: 0.02 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: negative phase (catch-down), large altitude difference, non-round mu/R',
      bag: { mu: 3.8e14, R: 6_420_000, h1: 611_234, h2: 2_345_678, phi: -0.3 },
    },
  ],

  'sso-period': [
    {
      name: 'sso-700km',
      source: 'well-known sun-synchronous altitude ~700 km',
      bag: { h: 700_000 },
    },
    {
      name: 'sso-800km',
      source: 'well-known sun-synchronous altitude ~800 km',
      bag: { h: 800_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round altitude',
      bag: { h: 553_421 },
    },
  ],

  'critical-inclination': [
    {
      name: 'molniya-reference',
      source: 'well-known Molniya/frozen-orbit critical inclination (63.4 deg); formula has no free vars',
      bag: {},
    },
    {
      name: 'tundra-reference',
      source: 'same well-known critical inclination as used by the Tundra-class HEO family; formula has no free vars',
      bag: {},
    },
    {
      name: 'synthetic',
      source: 'adversarial: irrelevant bag noise does not perturb the constant',
      bag: { mu: 1.23e14, R: 5_555_555 },
    },
  ],

  'relative-period': [
    {
      name: 'iss-geo',
      source: 'well-known ISS-class LEO vs GEO period difference',
      bag: { h1: 400_000, h2: 35_786_000 },
    },
    {
      name: 'leo-pair',
      source: 'two well-known LEO altitudes (400 km and 800 km)',
      bag: { h1: 400_000, h2: 800_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h1/h2',
      bag: { mu: 3.5e14, R: 6_450_000, h1: 250_777, h2: 19_650_321 },
    },
  ],

  'energy-vinf': [
    {
      name: 'leo-above-escape',
      source: 'speed 10% above the local escape speed at LEO radius (well-known escape-speed multiple, positive-energy branch)',
      bag: { r: 6_778_137, v: 1.1 * Math.sqrt((2 * 3.986004418e14) / 6_778_137) },
    },
    {
      name: 'geo-above-escape',
      source: 'speed 50% above the local escape speed at GEO radius',
      bag: { r: 42_164_000, v: 1.5 * Math.sqrt((2 * 3.986004418e14) / 42_164_000) },
    },
    {
      name: 'synthetic-below-escape',
      source: 'adversarial synthetic: speed below local escape speed (negative-energy branch, exercises the abs() in v_inf)',
      bag: { mu: 3.9e14, r: 8_123_456, v: 5000 },
    },
  ],

  'specific-angular-momentum': [
    {
      name: 'iss-near-circular',
      source: 'ISS-class near-circular orbit',
      bag: { a: 6_778_137, e: 0.001 },
    },
    {
      name: 'gto-ellipse',
      source: 'well-known GTO ellipse (same geometry as the hohmann/vis-viva pilots)',
      bag: { a: (6_778_137 + 42_164_000) / 2, e: (42_164_000 - 6_778_137) / (42_164_000 + 6_778_137) },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: high-eccentricity non-round a/e',
      bag: { mu: 3.8e14, a: 15_234_567, e: 0.85 },
    },
  ],

  'escape-margin': [
    {
      name: 'iss',
      source: 'ISS-class LEO altitude 400 km',
      bag: { h: 400_000 },
    },
    {
      name: 'geo',
      source: 'GEO altitude 35,786 km',
      bag: { h: 35_786_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h',
      bag: { mu: 4.1e14, R: 6_050_000, h: 812_345 },
    },
  ],

  'constellation-walker': [
    {
      name: 'iridium-class',
      source: 'well-known Iridium NEXT constellation (66 satellites, 6 orbital planes, 11 per plane)',
      bag: { T: 66, P: 6 },
    },
    {
      name: 'gps-class',
      source: 'well-known GPS constellation (24 satellites, 6 orbital planes, 4 per plane)',
      bag: { T: 24, P: 6 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: larger constellation with a non-round-looking plane count',
      bag: { T: 100, P: 5 },
    },
  ],

  'coverage-swath': [
    {
      name: 'landsat-class',
      source: 'well-known Landsat-class altitude (705 km) with a typical narrow pushbroom full FOV (15 deg)',
      bag: { h: 705_000, fov: 15 * (Math.PI / 180) },
    },
    {
      name: 'wide-fov',
      source: 'a lower SSO altitude (600 km) with a wider full FOV (30 deg)',
      bag: { h: 600_000, fov: 30 * (Math.PI / 180) },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: higher altitude with a wide FOV, edge-adjacent to the geometric domain but not degenerate',
      bag: { h: 2_000_000, fov: 60 * (Math.PI / 180) },
    },
  ],

  'revisit-time-simple': [
    {
      name: 'landsat-class',
      source: 'well-known Landsat-class swath width (185 km) with the ISS-class orbital period (many strips per orbit)',
      bag: { T: 5561, swath: 185_000 },
    },
    {
      name: 'narrow-swath',
      source: 'a narrower swath (100 km) with a sun-synchronous-class period, forcing a larger strip count',
      bag: { T: 5940, swath: 100_000 },
    },
    {
      name: 'global-swath-synthetic',
      source: 'adversarial synthetic: swath wider than Earth\'s circumference, exercising the max(1, strips) clamp branch',
      bag: { T: 86_164.0905, swath: 45_000_000 },
    },
  ],

  'geo-stationkeeping-dv': [
    {
      name: 'geo-typical',
      source: 'well-known GEO N/S-dominant stationkeeping budget order of magnitude (~45 m/s/yr N/S, ~5 m/s/yr E/W), matching the shipped function defaults',
      bag: { ns: 45, ew: 5 },
    },
    {
      name: 'ew-only',
      source: 'a satellite with a relaxed N/S box doing mostly E/W control (~20 m/s/yr N/S, ~5 m/s/yr E/W)',
      bag: { ns: 20, ew: 5 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round ns/ew',
      bag: { ns: 33.7, ew: 8.2 },
    },
  ],

  'drag-make-up-dv': [
    {
      name: 'iss-drag',
      source: 'ISS-class LEO atmospheric density and drag makeup order of magnitude',
      bag: { rho: 1.5e-11, a: 6_778_137, v: 7668.6, B: 100 },
    },
    {
      name: 'higher-leo-drag',
      source: 'higher LEO altitude with lower atmospheric density',
      bag: { rho: 5e-13, a: 7_178_137, v: 7451, B: 120 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round density/ballistic coefficient',
      bag: { rho: 3.2e-12, a: 6_950_000, v: 7550, B: 65.4 },
    },
  ],

  'optical-gsd': [
    {
      name: 'typical-eo',
      source: 'typical EO altitude (500 km) with a representative sensor IFOV',
      bag: { h: 500_000, ifov: 1e-5 },
    },
    {
      name: 'higher-alt',
      source: 'higher EO altitude (700 km) with the same sensor IFOV',
      bag: { h: 700_000, ifov: 1e-5 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: sharper (smaller) IFOV, non-round altitude',
      bag: { h: 611_234, ifov: 3.2e-6 },
    },
  ],

  'cr3bp-jacobi': [
    {
      name: 'earth-moon-l1-vicinity',
      source: 'well-known Earth-Moon mass ratio (mu ~ 0.01215) near the L1 vicinity',
      bag: { mu: 0.01215, x: 0.8, y: 0, vx: 0, vy: 0.1 },
    },
    {
      name: 'earth-moon-off-axis',
      source: 'same well-known Earth-Moon mass ratio, a different off-axis planar state',
      bag: { mu: 0.01215, x: 0.5, y: 0.3, vx: 0.05, vy: -0.05 },
    },
    {
      name: 'sun-earth-synthetic',
      source: 'well-known Sun-Earth mass ratio (mu ~ 3.003e-6), adversarial off-axis state',
      bag: { mu: 3.003e-6, x: 0.99, y: 0.02, vx: -0.01, vy: 0.02 },
    },
  ],

  'orbit-lifetime-rough': [
    {
      name: 'iss-decay',
      source: 'ISS-class LEO with the well-known ~8500 m atmospheric scale height near 400 km',
      bag: { H: 8500, a: 6_778_137, beta: 100, rho: 1.5e-11, v: 7668.6 },
    },
    {
      name: 'lower-leo-decay',
      source: 'a lower, faster-decaying LEO altitude with higher density',
      bag: { H: 8500, a: 6_628_137, beta: 80, rho: 6e-11, v: 7750 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round scale height/ballistic coefficient',
      bag: { H: 7200, a: 6_900_000, beta: 55.3, rho: 2.1e-11, v: 7600 },
    },
  ],

  'geo-drift-rate': [
    {
      name: 'above-geo',
      source: 'well-known GEO radius (42,164,170 m, matches SAMPLE aGeo) with a satellite slightly above it (positive offset)',
      bag: { a: 42_264_170, aGeo: 42_164_170, nGeo: 7.292115e-5 },
    },
    {
      name: 'below-geo',
      source: 'same well-known GEO radius with a satellite slightly below it (opposite sign of drift)',
      bag: { a: 42_064_170, aGeo: 42_164_170, nGeo: 7.292115e-5 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: larger non-round offset',
      bag: { a: 41_500_000, aGeo: 42_164_170, nGeo: 7.2921e-5 },
    },
  ],

  'arg-perigee-drift-j2': [
    {
      name: 'iss-inclination',
      source: 'well-known Earth J2 (EARTH_J2) with the ISS inclination (51.6 deg), where 5cos^2(i)-1 > 0',
      bag: { n: 0.0011, j2: 1.08262668e-3, R: 6_378_137, sma_p: 6_700_000, i: 51.6 * (Math.PI / 180) },
    },
    {
      name: 'polar',
      source: 'well-known Earth J2 with a near-polar inclination (90 deg), where 5cos^2(i)-1 < 0 (opposite sign)',
      bag: { n: 0.0011, j2: 1.08262668e-3, R: 6_378_137, sma_p: 6_700_000, i: 90 * (Math.PI / 180) },
    },
    {
      name: 'synthetic-near-critical',
      source: 'adversarial synthetic: inclination edge-adjacent to the critical inclination (63.4 deg) without landing on it, non-round n/sma_p',
      bag: { n: 0.00098, j2: 1.08262668e-3, R: 6_378_137, sma_p: 7_234_567, i: 63 * (Math.PI / 180) },
    },
  ],

  'umbra-length': [
    {
      name: 'earth-umbra',
      source: 'well-known Earth umbra: 1 AU Sun distance, well-known solar radius (696,000 km, matches SAMPLE Rs) and Earth radius',
      bag: { d: 149_597_870_700, Rs: 696_000_000, Rb: 6_378_137 },
    },
    {
      name: 'moon-umbra',
      source: 'well-known Moon umbra: same Sun distance and radius with the Moon radius (used in lunar-eclipse duration estimates)',
      bag: { d: 149_597_870_700, Rs: 696_000_000, Rb: 1_737_400 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round distance/radii',
      bag: { d: 152_100_000_000, Rs: 690_340_000, Rb: 5_950_000 },
    },
  ],

  'mean-anomaly-from-e': [
    {
      name: 'low-e',
      source: 'low-eccentricity near-circular case (e=0.01)',
      bag: { E: 0.5, e: 0.01 },
    },
    {
      name: 'high-e',
      source: 'high-eccentricity near-parabolic-scale case (e=0.9)',
      bag: { E: 2.0, e: 0.9 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: eccentric anomaly beyond pi, moderate eccentricity',
      bag: { E: 4.5, e: 0.5 },
    },
  ],

  'flight-path-angle': [
    {
      name: 'gto-quarter',
      source: 'well-known GTO eccentricity (~0.72) evaluated at true anomaly 90 deg',
      bag: { e: 0.72, nu: Math.PI / 2 },
    },
    {
      name: 'near-circular',
      source: 'near-circular ISS-class eccentricity evaluated at true anomaly 45 deg',
      bag: { e: 0.001, nu: Math.PI / 4 },
    },
    {
      name: 'synthetic-near-apoapsis',
      source: 'adversarial synthetic: high eccentricity near (but not at) apoapsis, edge-adjacent denominator without being degenerate',
      bag: { e: 0.9, nu: (170 * Math.PI) / 180 },
    },
  ],

  'repeating-ground-track': [
    {
      name: 'landsat-16day',
      source: 'well-known Landsat-class repeat cycle: 233 orbits in 16 days',
      bag: { days: 16, k: 233 },
    },
    {
      name: 'leo-1day',
      source: 'well-known approximate LEO repeat: ~15 orbits per day',
      bag: { days: 1, k: 15 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: non-round multi-day repeat cycle',
      bag: { days: 5.5, k: 82 },
    },
  ],

  'molniya-tundra': [
    {
      name: 'molniya-600km-perigee',
      source: 'well-known Molniya-class perigee altitude (~600 km), T=0.5 sidereal day branch (kind<=0.5)',
      bag: { h: 600_000, kind: 0 },
    },
    {
      name: 'tundra-25000km-perigee',
      source: 'well-known Tundra-class perigee altitude (~25,000 km), T=1 sidereal day branch (kind>0.5)',
      bag: { h: 25_000_000, kind: 1 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: molniya branch again with a non-Earth mu/R combination',
      bag: { mu: 3.5e14, R: 6_100_000, h: 480_321, kind: 0 },
    },
  ],

  'frozen-orbit': [
    {
      name: 'sso-frozen',
      source: 'well-known Earth J2/J3 zonal harmonics (EARTH_J2, EARTH_J3) at a sun-synchronous-class inclination (98 deg)',
      bag: { a: 7_078_137, inc: 98 * (Math.PI / 180), j2: 1.08262668e-3, j3: -2.5326564853324e-6, Rb: 6_378_137 },
    },
    {
      name: 'critical-inclination-frozen',
      source: 'same well-known Earth J2/J3 harmonics at the well-known critical inclination (63.4 deg), a common frozen-orbit design pattern',
      bag: { a: 7_178_137, inc: 63.4 * (Math.PI / 180), j2: 1.08262668e-3, j3: -2.5326564853324e-6, Rb: 6_378_137 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: higher LEO altitude, distinct inclination, non-round a',
      bag: { a: 9_012_345, inc: 45 * (Math.PI / 180), j2: 1.08262668e-3, j3: -2.5326564853324e-6, Rb: 6_378_137 },
    },
  ],

  'herrick-gibbs': [
    {
      name: 'iss-circular-short-arc',
      source: 'three positions constructed from exact circular-orbit kinematics (ISS-class radius, 60 s spacing): r_k = r(cos(n t_k), sin(n t_k), 0) with n = sqrt(mu/r^3), a short arc appropriate for Herrick-Gibbs per the tool assumptions',
      bag: {
        r1x: 6_778_137, r1y: 0, r1z: 0,
        r2x: 6_762_526.284050148, r2y: 459_760.2073906481, r2z: 0,
        r3x: 6_715_766.042228007, r3y: 917_402.6688571225, r3z: 0,
        t1: 0, t2: 60, t3: 120,
      },
    },
    {
      name: 'higher-leo-circular',
      source: 'three positions from the same exact circular-orbit kinematics at a higher LEO radius, 120 s spacing',
      bag: {
        r1x: 7_178_137, r1y: 0, r1z: 0,
        r2x: 7_122_510.074049329, r2y: 891_908.6476959508, r2z: 0,
        r3x: 6_956_491.457198345, r3y: 1_769_993.6148742002, r3z: 0,
        t1: 0, t2: 120, t3: 240,
      },
    },
    {
      name: 'eccentric-synthetic',
      source: 'adversarial synthetic: three positions generated by the shipped keplerPropagate function itself from an eccentric LEO departure state, at uneven time spacing (0, 500, 1300 s)',
      bag: {
        r1x: 6_778_137, r1y: 0, r1z: 0,
        r2x: 5_750_681.961167487, r2y: 4_275_469.836417051, r2z: 0,
        r3x: 1_309_397.6052707292, r3y: 8_744_505.208069474, r3z: 0,
        t1: 0, t2: 500, t3: 1300,
      },
    },
  ],

  'lunisolar-rates': [
    {
      name: 'moon-perturbation',
      source: 'well-known Moon perturber constants (MOON_MU, MOON_SMA_M, MOON_I3_RAD, MOON_E3) acting on an ISS-class LEO orbit',
      bag: {
        a: 6_778_137, e: 0.01, inc: 51.6 * (Math.PI / 180),
        mu3: 4.9028e12, d3: 384_400_000, i3_rad: 5.145 * (Math.PI / 180), e3: 0.0549,
      },
    },
    {
      name: 'sun-perturbation',
      source: 'well-known Sun perturber constants (SUN_MU, 1 AU, Earth obliquity SUN_I3_RAD, Earth orbital eccentricity SUN_E3) acting on an equatorial GEO orbit',
      bag: {
        a: 42_164_000, e: 0.001, inc: 0,
        mu3: 1.32712440018e20, d3: 149_597_870_700, i3_rad: 23.439281 * (Math.PI / 180), e3: 0.0167086,
      },
    },
    {
      name: 'synthetic-retrograde',
      source: 'adversarial synthetic: retrograde satellite inclination (>90 deg), non-round semi-major axis/perturber distance',
      bag: {
        a: 12_345_678, e: 0.15, inc: 120 * (Math.PI / 180),
        mu3: 8.1e12, d3: 401_234_567, i3_rad: 10 * (Math.PI / 180), e3: 0.08,
      },
    },
  ],

  'schweighart-sedwick': [
    {
      name: 'iss-inclination',
      source: 'well-known Earth J2/radius with the ISS inclination (51.6 deg)',
      bag: { a: 6_778_137, inc: 51.6 * (Math.PI / 180), j2: 1.08262668e-3, Rb: 6_378_137 },
    },
    {
      name: 'sso-inclination',
      source: 'well-known Earth J2/radius with a sun-synchronous-class inclination (98 deg)',
      bag: { a: 7_078_137, inc: 98 * (Math.PI / 180), j2: 1.08262668e-3, Rb: 6_378_137 },
    },
    {
      name: 'polar-synthetic',
      source: 'adversarial synthetic: polar inclination (90 deg), flipping the sign of the (1+3cos(2i)) term vs the low-inclination scenarios, non-round semi-major axis',
      bag: { a: 6_912_345, inc: 90 * (Math.PI / 180), j2: 1.08262668e-3, Rb: 6_378_137 },
    },
  ],
}
