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

  plotter: [
    {
      name: 'zero-midpoint',
      source: 'midpoint x=0 gives sin(0)=0 exactly (exact trig identity)',
      bag: { xmin: -1, xmax: 1 },
    },
    {
      name: 'quarter-wave',
      source: 'midpoint at pi/2 gives sin(pi/2)=1 exactly (well-known trig identity)',
      bag: { xmin: 0, xmax: Math.PI },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round xmin/xmax',
      bag: { xmin: -3.7, xmax: 8.2 },
    },
  ],

  units: [
    {
      name: 'km-to-m',
      source: 'kilometre → metre; UNIT_DEFS km toBase=1000, no offset (linear category)',
      bag: { value: 5, fromToBase: 1000, fromOffset: 0, fromId: 'km' },
    },
    {
      name: 'celsius-to-kelvin',
      source: 'branch coverage: temperature affine offset; UNIT_DEFS C toBase=1, offset=273.15; well-known 20°C=293.15K',
      bag: { value: 20, fromToBase: 1, fromOffset: 273.15, fromId: 'C' },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: psi → Pa (UNIT_DEFS psi toBase=6894.757293168), non-round value',
      bag: { value: 37.284, fromToBase: 6894.757293168, fromOffset: 0, fromId: 'psi' },
    },
  ],

  'custom-body': [
    {
      name: 'earth-iss',
      source:
        'well-known Earth mass/radius, ISS-class 400 km altitude; well-known v_circ≈7.67 km/s. SOI part reuses Earth as the orbiting body around the well-known Sun mass at 1 AU for the well-known ≈9.24e8 m SOI radius.',
      bag: { M: 5.9722e24, R: 6_378_137, h: 400_000, a: 149_597_870_700, m: 5.9722e24, M_primary: 1.98847e30 },
    },
    {
      name: 'moon-lunar-orbit',
      source:
        'well-known Moon mass/radius, 100 km lunar-orbit altitude (Apollo-class). SOI part uses the Moon around Earth at the well-known mean Earth-Moon distance.',
      bag: { M: 7.342e22, R: 1_737_400, h: 100_000, a: 384_400_000, m: 7.342e22, M_primary: 5.9722e24 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round M/R/h/a/m/M_primary',
      bag: { M: 3.417e23, R: 2_634_871, h: 812_345, a: 9.213e10, m: 4.821e23, M_primary: 7.223e29 },
    },
  ],

  'light-time': [
    {
      name: 'earth-moon',
      source: 'well-known mean Earth-Moon distance (384,400 km) ⇒ light time ≈1.28 s ("about 1.3 seconds to the Moon")',
      bag: { range_m: 384_400_000 },
    },
    {
      name: 'one-au',
      source: 'well-known 1 AU ⇒ light time ≈499 s ("about 8 minutes from the Sun")',
      bag: { range_m: 149_597_870_700 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round range',
      bag: { range_m: 62_734_819.3 },
    },
  ],

  'ballistic-drag': [
    {
      name: 'iss-class',
      source:
        'ISS-class LEO: well-known 400 km altitude, ~420 t mass, ~2000 m² cross-section, Cd≈2.2, ISA sea-level ρ0 and well-known ≈8500 m Earth scale height',
      bag: { R: 6_378_137, h: 400_000, mu: 3.986004418e14, m: 420_000, Cd: 2.2, A: 2000, rho0: 1.225, H: 8500 },
    },
    {
      name: 'cubesat-leo',
      source: 'small cubesat-class LEO satellite: representative ~500 km altitude, ~4 kg mass, ~0.03 m² cross-section',
      bag: { R: 6_378_137, h: 500_000, mu: 3.986004418e14, m: 4, Cd: 2.2, A: 0.03, rho0: 1.225, H: 8500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round inputs',
      bag: { R: 6_412_300, h: 623_481, mu: 3.71e14, m: 918.4, Cd: 1.83, A: 4.27, rho0: 1.31, H: 7412 },
    },
  ],

  'solar-array': [
    {
      name: 'normal-incidence-1au',
      source: 'well-known solar constant 1361 W/m² at 1 AU; representative ~30% efficient triple-junction cell at normal incidence',
      bag: { A: 1, eta: 0.3, ang: 0, r_au: 1 },
    },
    {
      name: 'edge-on-90deg',
      source: 'branch coverage: incidence ≥90° (sun in the array plane) ⇒ zero power by the saturation clamp',
      bag: { A: 1, eta: 0.3, ang: 90, r_au: 1 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round illuminated inputs',
      bag: { A: 13.7, eta: 0.284, ang: 37.4, r_au: 2.3 },
    },
  ],

  battery: [
    {
      name: 'smallsat-bus',
      source: 'representative smallsat Li-ion pack: 50 Ah, 28 V bus, 100 W load',
      bag: { C_Ah: 50, V: 28, P: 100 },
    },
    {
      name: 'cubesat-cell',
      source: 'representative cubesat single Li-ion cell: 2.5 Ah, 3.7 V, 5 W load',
      bag: { C_Ah: 2.5, V: 3.7, P: 5 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round C_Ah/V/P',
      bag: { C_Ah: 34.7, V: 22.3, P: 63.9 },
    },
  ],

  'angular-diameter': [
    {
      name: 'sun-from-earth',
      source: 'well-known Sun radius and 1 AU ⇒ angular diameter ≈0.533° (well-known solar angular size)',
      bag: { R: 696_000_000, d: 149_597_870_700 },
    },
    {
      name: 'moon-from-earth',
      source:
        "well-known Moon radius and mean Earth-Moon distance ⇒ angular diameter ≈0.518° (well-known, close to the Sun's, hence eclipses)",
      bag: { R: 1_737_400, d: 384_400_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round R/d',
      bag: { R: 4_213_678, d: 91_234_567 },
    },
  ],

  'drag-force': [
    {
      name: 'sea-level',
      source: 'ISA sea-level density (well-known 1.225 kg/m³), 100 m/s, unit drag area (flat-plate Cd≈1)',
      bag: { rho: 1.225, v: 100, Cd: 1.0, A: 1 },
    },
    {
      name: 'leo-orbital-speed',
      source: 'well-known ISS-class orbital speed ≈7660 m/s at a representative thin-LEO density order of magnitude',
      bag: { rho: 1e-11, v: 7660, Cd: 2.2, A: 1 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round rho/v/Cd/A',
      bag: { rho: 0.734, v: 213.6, Cd: 1.47, A: 3.82 },
    },
  ],

  'scale-height': [
    {
      name: 'sea-level',
      source: 'h=0 gives ρ=ρ0 exactly (exponential-atmosphere identity)',
      bag: { rho0: 1.225, h: 0, H: 8500 },
    },
    {
      name: 'one-scale-height',
      source: 'h=H gives ρ=ρ0/e exactly (exact exponential identity), well-known ≈8500 m Earth scale height',
      bag: { rho0: 1.225, h: 8500, H: 8500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round rho0/h/H',
      bag: { rho0: 1.62e-3, h: 273_481, H: 6421 },
    },
  ],

  'orbit-3d': [
    {
      name: 'iss-to-geo',
      source:
        'well-known ISS altitude (400 km, v≈7.67 km/s) and GEO altitude (35,786 km, v≈3.07 km/s, T≈1 sidereal day)',
      bag: { R: 6_378_137, mu: 3.986004418e14, h1: 400_000, h2: 35_786_000 },
    },
    {
      name: 'shuttle-to-gps',
      source: 'well-known Shuttle-class LEO (200 km) and GPS altitude (20,200 km, T≈12 h)',
      bag: { R: 6_378_137, mu: 3.986004418e14, h1: 200_000, h2: 20_200_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/R/h1/h2',
      bag: { R: 6_421_873, mu: 3.71e14, h1: 187_342, h2: 12_734_912 },
    },
  ],

  'free-fall-time': [
    {
      name: 'earth-100m',
      source: 'standard g0 (well-known 9.80665 m/s²), 100 m drop',
      bag: { h: 100, g: 9.80665 },
    },
    {
      name: 'moon-10m',
      source: 'well-known Moon surface gravity ≈1.62 m/s², 10 m drop',
      bag: { h: 10, g: 1.62 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round h/g',
      bag: { h: 734.8, g: 4.213 },
    },
  ],

  'ballistic-range': [
    {
      name: 'max-range-45deg',
      source: '45° elevation maximizes flat-Earth vacuum range (standard textbook result), v0=100 m/s, standard g0',
      bag: { v0: 100, elev: Math.PI / 4, g: 9.80665 },
    },
    {
      name: 'low-angle-30deg',
      source: '30° elevation, v0=200 m/s, standard g0',
      bag: { v0: 200, elev: Math.PI / 6, g: 9.80665 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round v0/elev/g',
      bag: { v0: 341.7, elev: 0.9137, g: 9.5 },
    },
  ],

  'terminal-velocity': [
    {
      name: 'skydiver-belly',
      source: 'representative skydiver belly-to-earth: ~80 kg, Cd≈1.0, ~0.7 m² area, ISA sea-level density, standard g0',
      bag: { m: 80, Cd: 1.0, A: 0.7, rho: 1.225, g: 9.80665 },
    },
    {
      name: 'reentry-capsule',
      source: 'representative small reentry capsule at low-density high-altitude conditions',
      bag: { m: 5000, Cd: 1.2, A: 10, rho: 0.001, g: 9.80665 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round m/Cd/A/rho/g',
      bag: { m: 341.7, Cd: 1.83, A: 2.14, rho: 0.734, g: 9.5 },
    },
  ],

  'parachute-descent': [
    {
      name: 'crew-round-canopy',
      source:
        'representative crewed round-parachute descent: ~90 kg loaded mass, Cd≈1.5, ~40 m² canopy, ISA sea-level density; well-known ≈5 m/s descent rate',
      bag: { m: 90, Cd: 1.5, A: 40, rho: 1.225 },
    },
    {
      name: 'cargo-canopy',
      source: 'representative larger cargo-canopy descent: ~500 kg, Cd≈1.4, ~120 m²',
      bag: { m: 500, Cd: 1.4, A: 120, rho: 1.225 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round m/Cd/A/rho',
      bag: { m: 213.7, Cd: 1.28, A: 18.3, rho: 0.9 },
    },
  ],

  'coordinated-turn-bank': [
    {
      name: 'airliner-cruise',
      source: 'representative airliner cruise speed ≈250 m/s and a 5000 m turn radius',
      bag: { v: 250, R: 5000, g: 9.80665 },
    },
    {
      name: 'ga-approach',
      source: 'representative general-aviation approach speed ≈60 m/s and a 1000 m turn radius',
      bag: { v: 60, R: 1000, g: 9.80665 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round v/R/g',
      bag: { v: 137.4, R: 2734.6, g: 9.5 },
    },
  ],

  'eps-orbit-average': [
    {
      name: 'leo-typical-eclipse',
      source: 'well-known typical LEO eclipse fraction ≈35%, representative 100 W sun-power and 85% bus efficiency',
      bag: { psun: 100, fecl: 0.35, eta: 0.85 },
    },
    {
      name: 'geo-no-eclipse',
      source: 'GEO is eclipse-free most of the year (fecl≈0), representative 500 W sun-power and 90% bus efficiency',
      bag: { psun: 500, fecl: 0.0, eta: 0.9 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round psun/fecl/eta',
      bag: { psun: 234.6, fecl: 0.213, eta: 0.734 },
    },
  ],

  'relativity-clock-rate': [
    {
      name: 'zero-correction',
      source: 'zero potential difference and zero velocity ⇒ no relativistic correction (exact identity)',
      bag: { dPhi: 0, v: 0 },
    },
    {
      name: 'gps-orbit-scale',
      source:
        'GPS-orbit-scale gravitational potential difference and orbital speed (order-of-magnitude representative values, not a precision GPS citation)',
      bag: { dPhi: 5.3e7, v: 3874 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round dPhi/v',
      bag: { dPhi: -2.417e6, v: 6234.8 },
    },
  ],

  'stefan-boltzmann': [
    {
      name: 'round-100k',
      source: 'blackbody (eps=1), 1 m², T=100 K round number ⇒ exact SI value',
      bag: { eps: 1, A: 1, T: 100 },
    },
    {
      name: 'room-temp-300k',
      source: 'blackbody, 1 m², well-known room temperature 300 K',
      bag: { eps: 1, A: 1, T: 300 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round eps/A/T',
      bag: { eps: 0.734, A: 3.42, T: 421.7 },
    },
  ],

  'wien-peak': [
    {
      name: 'sun-surface',
      source: 'well-known Sun effective surface temperature 5778 K ⇒ peak ≈501.5 nm (well-known green-visible peak)',
      bag: { T: 5778 },
    },
    {
      name: 'human-body',
      source: 'well-known human body temperature 310 K (37°C) ⇒ peak ≈9.3 µm (well-known thermal-IR peak)',
      bag: { T: 310 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round T',
      bag: { T: 734.28 },
    },
  ],

  'aerobraking-pass': [
    {
      name: 'mars-pass',
      source:
        'representative Mars aerobraking pass: ballistic-inverse ≈0.01 m²/kg, thin upper-atmosphere density, Mars-orbital-scale speed; order-of-magnitude only',
      bag: { ball: 0.01, rho: 1e-9, v: 4000, L: 1e5 },
    },
    {
      name: 'venus-pass',
      source: 'representative Venus aerobraking pass: denser upper atmosphere; order-of-magnitude only',
      bag: { ball: 0.005, rho: 5e-9, v: 7000, L: 8e4 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round ball/rho/v/L',
      bag: { ball: 0.0347, rho: 2.13e-8, v: 3421.7, L: 4.62e4 },
    },
  ],

  'panel-eol-power': [
    {
      name: 'zero-degradation',
      source: 'zero degradation ⇒ power unchanged after any elapsed time (exact identity)',
      bag: { p0: 100, d: 0, years: 10 },
    },
    {
      name: 'geo-15yr-gaas',
      source: 'representative GaAs triple-junction degradation ≈2.5%/yr, well-known 15-year GEO design life',
      bag: { p0: 200, d: 0.025, years: 15 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round p0/d/years',
      bag: { p0: 341.7, d: 0.0173, years: 8.4 },
    },
  ],

  'battery-dod': [
    {
      name: 'full-discharge',
      source: 'eUsed=eCap ⇒ DoD=1.0 exactly (identity)',
      bag: { eUsed: 500, eCap: 500 },
    },
    {
      name: 'leo-design-limit',
      source: 'well-known LEO cycling-battery design limit ≈20% DoD',
      bag: { eUsed: 100, eCap: 500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round eUsed/eCap',
      bag: { eUsed: 213.7, eCap: 841.2 },
    },
  ],

  'hoop-stress': [
    {
      name: 'one-atm-thin-wall',
      source: 'well-known 1 standard atmosphere (101,325 Pa), 1 m radius, 1 cm wall',
      bag: { press: 101_325, rad: 1, thk: 0.01 },
    },
    {
      name: 'propellant-tank',
      source: 'representative pressurized propellant tank: ≈2 MPa, 0.5 m radius, 5 mm wall',
      bag: { press: 2_000_000, rad: 0.5, thk: 0.005 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round press/rad/thk',
      bag: { press: 734_218, rad: 0.734, thk: 0.0083 },
    },
  ],

  'exponential-density': [
    {
      name: 'sea-level',
      source: 'h=0 gives ρ=ρ0 exactly (exponential-atmosphere identity)',
      bag: { rho0: 1.225, h: 0, H: 8500 },
    },
    {
      name: 'one-scale-height',
      source: 'h=H gives ρ=ρ0/e exactly (exact exponential identity), well-known ≈8500 m Earth scale height',
      bag: { rho0: 1.225, h: 8500, H: 8500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round rho0/h/H',
      bag: { rho0: 2.13e-3, h: 341_872, H: 7134 },
    },
  ],

  'solar-flux-distance': [
    {
      name: 'one-au',
      source: 'r=1 AU gives S=S0 exactly by definition of the solar constant',
      bag: { S0: 1361, r: 149_597_870_700 },
    },
    {
      name: 'mars-orbit',
      source: "well-known Mars orbital distance ≈1.524 AU ⇒ flux ≈586 W/m² (well-known, ≈43% of Earth's)",
      bag: { S0: 1361, r: 1.524 * 149_597_870_700 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round S0/r',
      bag: { S0: 1342.7, r: 2.317e11 },
    },
  ],

  'earth-ir-flux': [
    {
      name: 'surface-255k',
      source:
        'well-known Earth effective blackbody temperature 255 K at the surface ⇒ ≈240 W/m² outgoing longwave radiation (well-known climate figure)',
      bag: { Te: 255, h: 0 },
    },
    {
      name: 'iss-altitude-255k',
      source: 'well-known 255 K effective temperature at ISS-class 400 km altitude',
      bag: { Te: 255, h: 400_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round Te/h',
      bag: { Te: 241.7, h: 734_218 },
    },
  ],

  'planck-radiance': [
    {
      name: 'sun-visible',
      source: 'well-known Sun effective temperature 5778 K near its visible-peak wavelength (500 nm)',
      bag: { T: 5778, lam: 500e-9 },
    },
    {
      name: 'cmb-branch',
      source:
        'branch coverage: well-known cosmic microwave background temperature 2.725 K at a near-IR wavelength ⇒ x≫700, exact hard-zero clamp regime',
      bag: { T: 2.725, lam: 1e-6 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round T/lam, moderate x (no clamp)',
      bag: { T: 421.7, lam: 3.4e-6 },
    },
  ],
}
