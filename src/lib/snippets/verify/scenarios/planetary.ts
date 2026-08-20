/**
 * Verification scenarios for the crew/ECLSS, planetary/interplanetary, and
 * geometry-category tools (strict category partition: crew + planetary + geometry).
 * See scenarios/index.ts for how these merge into the runner's SCENARIOS map.
 *
 * `elevation-azimuth` is UNVERIFIABLE (EXPECTED returns `{}` regardless of bag; see
 * expected/planetary.ts), so these scenarios never reach a numeric comparison — they
 * exist to satisfy the pilot's >=3-scenario minimum and to document plausible ENU
 * inputs for future waves.
 */
import type { Scenario } from '../inputs'

export const PLANETARY_SCENARIOS: Record<string, Scenario[]> = {
  // ─── ECLSS / crew (category 'crew') ────────────────────────────────────

  'cabin-atmosphere': [
    {
      name: 'iss-habitable-volume',
      source:
        'NASA-cited ISS habitable volume ~388 m^3, nominal 101.3 kPa (14.7 psi) total pressure, ' +
        '22C (295.15 K), ~21% O2 dry mole fraction, ppCO2 ~3 mmHg (within ISS nominal CO2 band), ' +
        '~40% RH (ISS target range); masses derived via ideal-gas cabinMassesFromComposition.',
      bag: { V: 388, T: 295.15, m_O2: 106.1036319179339, m_N2: 349.45425818186703, m_CO2: 2.7831024669207673 },
    },
    {
      name: 'dragon-class-cabin',
      source:
        'SpaceX Crew Dragon public pressurized-volume spec ~9.3 m^3, sea-level-equivalent 101.3 kPa, ' +
        '22C, 21% O2 dry, ppCO2 ~2 mmHg, 40% RH; masses derived via ideal-gas cabinMassesFromComposition.',
      bag: { V: 9.3, T: 295.15, m_O2: 2.5466006897201425, m_N2: 8.387276088719515, m_CO2: 0.04447225591471329 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round V/T/gas masses',
      bag: { V: 13.457, T: 289.4, m_O2: 4.031871715547959, m_N2: 11.49086093055162, m_CO2: 0.15063237766027243 },
    },
  ],

  'lioh-scrubber': [
    {
      name: 'apollo-canister-1crew',
      source:
        'Apollo-era LiOH canister mass ~2.7 kg (6 lb, well-documented historical figure); shipped ' +
        'LIOH_CO2_CAPACITY=0.85; single-crew CO2 rate from shipped ISS_DAY_CO2_KG=1.04 kg/day.',
      bag: { m: 2.7, capacity: 0.85, co2RateManual: 1.04 / 86400 },
    },
    {
      name: 'iss-3crew-contingency',
      source: 'contingency canister stack 5.4 kg, shipped capacity default, 3-crew CO2 rate from ISS_DAY_CO2_KG.',
      bag: { m: 5.4, capacity: 0.85, co2RateManual: (3 * 1.04) / 86400 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mass/capacity/rate',
      bag: { m: 13.457, capacity: 0.62, co2RateManual: 7.234e-6 },
    },
  ],

  'cabin-leak': [
    {
      name: 'iss-module-small-hole',
      source: 'ISS-scale module 100 m^3, 1 cm^2 orifice, depress from 101.3 kPa to 70 kPa (10.2 psi campout threshold), standard air.',
      bag: { V: 100, A: 1e-4, P0: 101325, P1: 70000, T: 293.15, Cd: 0.65 },
    },
    {
      name: 'dragon-class-small-hole',
      source: 'Dragon-class cabin 9.3 m^3, 5 mm^2 orifice, depress from 101.3 kPa to 84 kPa, 22C air.',
      bag: { V: 9.3, A: 5e-6, P0: 101325, P1: 84000, T: 295.15, Cd: 0.65 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round V/A/P0/P1/T/Cd',
      bag: { V: 13.457, A: 2.345e-5, P0: 97500, P1: 42000, T: 301.2, Cd: 0.58 },
    },
  ],

  'thermal-loop': [
    {
      name: 'iss-4crew-sensible-heat',
      source: 'four-crew nominal sensible heat load ~480 W, 5 K allowable coolant rise, water loop.',
      bag: { Q: 480, dT: 5 },
    },
    {
      name: 'exercise-heat-load',
      source: 'single-crew exercise metabolic heat ~550 W (shipped METABOLIC_RATES.exercise.heatW), 8 K rise, water loop.',
      bag: { Q: 550, dT: 8 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round Q/dT (ammonia-scale numbers)',
      bag: { Q: 9345.2, dT: 3.71 },
    },
  ],

  'thermal-rad': [
    {
      name: 'iss-radiator-panel',
      source: 'ISS-class radiator panel ~10 m^2, 280 K, emissivity 0.8 (typical white-paint/silver-Teflon coating).',
      bag: { A: 10, T: 280, eps: 0.8 },
    },
    {
      name: 'cubesat-panel',
      source: 'small CubeSat radiator panel 0.1 m^2, 300 K, emissivity 0.9 (high-emissivity coating).',
      bag: { A: 0.1, T: 300, eps: 0.9 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round A/T/eps',
      bag: { A: 3.457, T: 412.6, eps: 0.63 },
    },
  ],

  // ─── Planetary / interplanetary (category 'planetary') ─────────────────

  'helio-hohmann': [
    {
      name: 'earth-to-mars',
      source: 'well-known Earth->Mars coplanar circular heliocentric Hohmann; r1=1 AU, r2=1.523679 AU (shipped HELIO_SMA_M.mars).',
      bag: { mu: 1.32712440018e20, r1: 149_597_870_700, r2: 227_939_134_030.3053 },
    },
    {
      name: 'earth-to-jupiter',
      source: 'well-known Earth->Jupiter coplanar circular heliocentric Hohmann; r2=5.203363 AU (shipped HELIO_SMA_M.jupiter).',
      bag: { mu: 1.32712440018e20, r1: 149_597_870_700, r2: 778_412_025_279.1642 },
    },
    {
      name: 'synthetic',
      source:
        'adversarial synthetic, outward transfer (r1<r2) only: the snippet formula omits abs(), so an ' +
        'inward transfer (r1>r2, e.g. Earth->Venus) yields signed-negative dv1/dv2 that disagree with the ' +
        'shipped hohmannTransfer()\'s abs()-wrapped dv1/dv2 (see found-bug note in the wave report).',
      bag: { mu: 1.5e20, r1: 1.1e11, r2: 3.4e11 },
    },
  ],

  'patched-conic-depart': [
    {
      name: 'earth-mars-class-departure',
      source: '200 km Earth parking orbit; v_inf=3872.98 m/s (Mars-mission-class C3~=15 km^2/s^2, a commonly cited order of magnitude).',
      bag: { R: 6_378_137, h: 200_000, mu: 3.986004418e14, v_inf: 3872.98 },
    },
    {
      name: 'earth-lower-energy-departure',
      source: '300 km Earth parking orbit; v_inf=2500 m/s (lower-energy departure order of magnitude).',
      bag: { R: 6_378_137, h: 300_000, mu: 3.986004418e14, v_inf: 2500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round R/h/mu/v_inf',
      bag: { R: 6_500_000, h: 555_555, mu: 3.7e14, v_inf: 4321 },
    },
  ],

  'surface-access': [
    {
      name: 'lunar-parking-orbit',
      source: 'shipped BODIES.moon mu/radius; 100 km parking orbit (well-documented Apollo-era lunar parking altitude).',
      bag: { mu: 4.9028e12, R: 1_737_400, r_park: 1_837_400 },
    },
    {
      name: 'mars-parking-orbit',
      source: 'shipped BODIES.mars mu/radius; 400 km parking orbit (common Mars parking-orbit altitude order of magnitude).',
      bag: { mu: 4.282837e13, R: 3_389_500, r_park: 3_789_500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/r_park',
      bag: { mu: 3.7e14, R: 6_500_000, r_park: 7_100_000 },
    },
  ],

  'tisserand-parameter': [
    {
      name: 'jupiter-family-comet-like',
      source:
        'Jupiter-family-comet-class Tisserand test wrt Jupiter (aPlanet=5.203363 AU, shipped HELIO_SMA_M.jupiter); ' +
        'a=3.2 AU, e=0.6, i=15deg (JFC objects are classically 2<T<3).',
      bag: { a: 478_713_186_240, e: 0.6, i: 0.2617993877991494, ap: 778_412_025_279.1642 },
    },
    {
      name: 'earth-crossing-neo-like',
      source: 'Earth-crossing-NEO-class Tisserand test wrt Earth (aPlanet=1 AU); a=1.5 AU, e=0.3, i=5deg.',
      bag: { a: 224_396_806_050, e: 0.3, i: 0.08726646259971647, ap: 149_597_870_700 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round a/e/i/ap',
      bag: { a: 2.345e11, e: 0.42, i: 0.7, ap: 3.1e11 },
    },
  ],

  'b-plane-impact': [
    {
      name: 'earth-flyby',
      source: 'Earth gravity-assist-class flyby: mu=EARTH_MU, v_inf=4000 m/s, turn angle 1.2 rad.',
      bag: { mu: 3.986004418e14, vinf: 4000, delta: 1.2 },
    },
    {
      name: 'jupiter-flyby',
      source: 'Jupiter gravity-assist-class flyby: shipped BODIES.jupiter mu, v_inf=8000 m/s, turn angle 0.8 rad.',
      bag: { mu: 1.26686534e17, vinf: 8000, delta: 0.8 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/vinf/delta',
      bag: { mu: 3.7e14, vinf: 5678.9, delta: 0.45 },
    },
  ],

  'hyperbolic-eccentricity': [
    {
      name: 'earth-hyperbolic-departure',
      source: '300 km Earth departure altitude; v_inf=3000 m/s.',
      bag: { mu: 3.986004418e14, rp: 6_678_137, vinf: 3000 },
    },
    {
      name: 'mars-hyperbolic-arrival',
      source: 'shipped BODIES.mars mu/radius; 300 km arrival altitude; v_inf=2500 m/s.',
      bag: { mu: 4.282837e13, rp: 3_689_500, vinf: 2500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/rp/vinf',
      bag: { mu: 3.7e14, rp: 9_123_456, vinf: 6789.123 },
    },
  ],

  'capture-circularize': [
    {
      name: 'mars-orbit-insertion',
      source: 'shipped BODIES.mars mu/radius; 400 km capture periapsis; v_inf=2900 m/s (Mars-arrival-class order of magnitude).',
      bag: { mu: 4.282837e13, rp: 3_789_500, vinf: 2900 },
    },
    {
      name: 'jupiter-orbit-insertion',
      source: 'shipped BODIES.jupiter mu/radius; periapsis 4500 km above cloud tops; v_inf=5640 m/s (Jupiter-arrival-class order of magnitude).',
      bag: { mu: 1.26686534e17, rp: 74_411_000, vinf: 5640 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/rp/vinf',
      bag: { mu: 3.7e14, rp: 9_123_456, vinf: 6789.123 },
    },
  ],

  'hill-sphere': [
    {
      name: 'earth-wrt-sun',
      source: 'Earth Hill sphere about the Sun: a=1 AU, m=EARTH_MASS=5.9722e24 kg, M=SOLAR_MASS=1.98847e30 kg (both shipped constants); result cross-checks close to the well-known ~1.5e9 m figure.',
      bag: { a: 149_597_870_700, m: 5.9722e24, M: 1.98847e30 },
    },
    {
      name: 'moon-wrt-earth',
      source: 'Moon Hill sphere about Earth: a=384,400 km (well-known Earth-Moon distance), m=shipped BODIES.moon.mass=7.342e22 kg, M=EARTH_MASS=5.9722e24 kg.',
      bag: { a: 384_400_000, m: 7.342e22, M: 5.9722e24 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round a/m/M',
      bag: { a: 2.345e11, m: 6.42e23, M: 1.98e30 },
    },
  ],

  'porkchop-earth-mars': [
    {
      name: 'mars2020-perseverance-dates',
      source:
        'real Mars 2020/Perseverance mission dates: launch 2020-07-30, landing 2021-02-18. v1 (heliocentric ' +
        'departure velocity) obtained by running the shipped porkchopTransfer(tDep, tArr) once offline; ' +
        'mu/aE/aM/LE0/LM0/t0 are the shipped SUN_MU/AU/MARS_SMA_M/EARTH_HELIO_L0/MARS_HELIO_L0/J2000_UNIX_S constants.',
      bag: {
        mu: 1.32712440018e20,
        aE: 149_597_870_700,
        aM: 227_939_134_030.3053,
        LE0: 1.7534336883759651,
        LM0: 6.20383077114501,
        t0: 946_728_000,
        tDep: 1_596_067_200,
        tArr: 1_613_606_400,
        v1x: 28_103.33202062955,
        v1y: 16_375.164072485328,
        v1z: 0,
      },
    },
    {
      name: 'insight-mission-dates',
      source:
        'real InSight mission dates: launch 2018-05-05, landing 2018-11-26. v1 obtained by running the ' +
        'shipped porkchopTransfer(tDep, tArr) once offline.',
      bag: {
        mu: 1.32712440018e20,
        aE: 149_597_870_700,
        aM: 227_939_134_030.3053,
        LE0: 1.7534336883759651,
        LM0: 6.20383077114501,
        t0: 946_728_000,
        tDep: 1_525_478_400,
        tArr: 1_543_190_400,
        v1x: 21_987.320282831522,
        v1y: -24_486.02600258944,
        v1z: 0,
      },
    },
    {
      name: 'synthetic',
      source:
        'adversarial synthetic non-round departure/arrival epoch and TOF; v1 obtained by running the shipped ' +
        'porkchopTransfer(tDep, tArr) once offline for internal consistency.',
      bag: {
        mu: 1.32712440018e20,
        aE: 149_597_870_700,
        aM: 227_939_134_030.3053,
        LE0: 1.7534336883759651,
        LM0: 6.20383077114501,
        t0: 946_728_000,
        tDep: 1_931_513_234,
        tArr: 1_947_675_712,
        v1x: -5_615.879215625582,
        v1y: -32_354.648412439816,
        v1z: 0,
      },
    },
  ],

  'b-plane-target': [
    {
      name: 'earth-flyby-ksc-class',
      source: 'Earth flyby: v_inf vector [4000,3000,1000] m/s, 300 km periapsis altitude, clock angle 0.5 rad.',
      bag: { vx: 4000, vy: 3000, vz: 1000, rp: 6_678_137, mu: 3.986004418e14, theta: 0.5 },
    },
    {
      name: 'earth-flyby-alt2',
      source: 'Earth flyby: distinct v_inf vector, 500 km periapsis altitude, clock angle 2.0 rad.',
      bag: { vx: -2500, vy: 6000, vz: -500, rp: 6_878_137, mu: 3.986004418e14, theta: 2.0 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round vx/vy/vz/rp/mu/theta',
      bag: { vx: 3123.45, vy: -876.5, vz: 219.87, rp: 9_123_456, mu: 3.7412e14, theta: -1.234 },
    },
  ],

  'pump-crank': [
    {
      name: 'mars-flyby-class',
      source: 'shipped BODIES.mars mu/radius; 300 km flyby altitude, v_inf=5500 m/s, pump=0.4 rad, crank=0.9 rad.',
      bag: { rp: 3_689_500, vinf: 5500, mu: 4.282837e13, pump: 0.4, crank: 0.9 },
    },
    {
      name: 'jupiter-flyby-class',
      source: 'shipped BODIES.jupiter mu/radius; 500 km flyby altitude, v_inf=10000 m/s, pump=-0.3 rad, crank=1.7 rad.',
      bag: { rp: 70_411_000, vinf: 10_000, mu: 1.26686534e17, pump: -0.3, crank: 1.7 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round rp/vinf/mu/pump/crank',
      bag: { rp: 12_345_678, vinf: 6789.123, mu: 3.7931187e13, pump: 1.1234, crank: -0.567 },
    },
  ],

  // ─── Geometry (category 'geometry') ─────────────────────────────────────

  'spherical-distance': [
    {
      name: 'ksc-to-vandenberg',
      source: 'well-known public launch-site geodetic coordinates: KSC (28.5721N, -80.648E) to Vandenberg SFB (34.7420N, -120.5724E); shipped EARTH_RADIUS.',
      bag: { lat1: 0.4986797581307065, lon1: -1.4074571770168015, lat2: 0.6062839087139169, lon2: -2.104090715194785, R: 6_378_137 },
    },
    {
      name: 'equator-to-london',
      source: 'equator/prime-meridian origin to London (51.5074N, -0.1278E), well-known public coordinates.',
      bag: { lat1: 0, lon1: 0, lat2: 0.8989653750452715, lon2: -0.0022305429117570487, R: 6_378_137 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round lat/lon (rad) and a non-Earth body radius',
      bag: { lat1: -0.3, lon1: 1.1, lat2: 0.6, lon2: -2.1, R: 3_390_000 },
    },
  ],

  'elevation-azimuth': [
    {
      name: 'high-elevation-ne',
      source: 'documents a plausible ENU line-of-sight (target to the NE, high elevation); no shipped counterpart (see UNVERIFIABLE note).',
      bag: { east: 3000, north: 4000, up: 8000 },
    },
    {
      name: 'low-elevation-sw',
      source: 'documents a plausible ENU line-of-sight (target to the SW, near horizon).',
      bag: { east: -1500, north: -2000, up: 200 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round ENU components',
      bag: { east: 1234.5, north: -876.5, up: 4321.9 },
    },
  ],

  'vector-angle': [
    {
      name: 'orthogonal-exact',
      source: 'exact identity: a=[1,0,0], b=[0,1,0] are orthogonal, theta=pi/2 exactly.',
      bag: { ax: 1, ay: 0, az: 0, bx: 0, by: 1, bz: 0 },
    },
    {
      name: 'antiparallel-clamp',
      source:
        'branch coverage: exact 3-4-5 Pythagorean-triple antiparallel vectors a=[3,4,0], b=[-3,-4,0] give ' +
        'cos(theta)=-1 exactly (no libm rounding noise from the integer/exact-sqrt inputs), theta=pi exactly; ' +
        'exercises the acos-domain clamp branch.',
      bag: { ax: 3, ay: 4, az: 0, bx: -3, by: -4, bz: 0 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round a/b components',
      bag: { ax: 1.234, ay: -5.678, az: 9.101, bx: -3.456, by: 7.89, bz: -2.345 },
    },
  ],
}
