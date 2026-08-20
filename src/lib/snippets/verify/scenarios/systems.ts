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

  // ─── Propulsion (category === 'propulsion') ────────────────────────────────

  'multi-stage': [
    {
      name: 'kerolox-3-stage',
      source: 'well-known kerolox sea-level/vacuum/upper-stage Isp regimes (~282/311/320 s)',
      bag: {
        isp1: 282, m01: 500_000, mf1: 50_000,
        isp2: 311, m02: 100_000, mf2: 20_000,
        isp3: 320, m03: 20_000, mf3: 5_000,
      },
    },
    {
      name: 'hydrolox-3-stage',
      source: 'well-known hydrolox sea-level/vacuum/upper-stage Isp regimes (~363/452/465 s)',
      bag: {
        isp1: 363, m01: 2_000_000, mf1: 200_000,
        isp2: 452, m02: 400_000, mf2: 40_000,
        isp3: 465, m03: 30_000, mf3: 6_000,
      },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round Isp/m0/mf per stage',
      bag: {
        isp1: 273.4, m01: 417_235.6, mf1: 41_723.5,
        isp2: 298.7, m02: 83_456.2, mf2: 9_123.7,
        isp3: 315.9, m03: 15_642.3, mf3: 3_012.8,
      },
    },
  ],

  'propellant-mass': [
    {
      name: 'kerolox-ascent-stage',
      source: 'well-known kerolox vacuum Isp (~311 s) and order-of-magnitude LEO ascent Δv budget (~9.4 km/s)',
      bag: { mf: 50_000, dv: 9_400, isp: 311, g0: 9.80665 },
    },
    {
      name: 'storable-apogee-kick',
      source: 'well-known GTO-to-GEO apogee-kick Δv order (~1.5 km/s) and storable bipropellant Isp regime (~320 s)',
      bag: { mf: 1_000, dv: 1_500, isp: 320, g0: 9.80665 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mf/dv/isp',
      bag: { mf: 8_734.2, dv: 4_523.7, isp: 287.3, g0: 9.80665 },
    },
  ],

  'ideal-thrust': [
    {
      name: 'kerolox-engine',
      source: 'well-known kerolox engine regime: vacuum ve ≈ 311 s × g0 ≈ 3050 m/s, order-of-magnitude mass flow (~250 kg/s)',
      bag: { mdot: 250, ve: 3050 },
    },
    {
      name: 'hydrolox-engine',
      source: 'well-known hydrolox engine regime: vacuum ve ≈ 452 s × g0 ≈ 4433 m/s, lower mass flow for the same thrust class (~65 kg/s)',
      bag: { mdot: 65, ve: 4433 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mdot/ve',
      bag: { mdot: 137.4, ve: 2874.6 },
    },
  ],

  'delta-v-budget': [
    {
      name: 'leo-insertion-budget',
      source: 'illustrative LEO ascent phase split (gravity/steering losses, insertion, plane trim); pure sum, any non-negative split is valid',
      bag: { d1: 1_500, d2: 7_800, d3: 100, d4: 0, d5: 0, d6: 0 },
    },
    {
      name: 'geo-transfer-budget',
      source: 'illustrative GTO-class multi-phase split (ascent, apogee kick, plane change, stationkeeping reserve)',
      bag: { d1: 9_400, d2: 1_500, d3: 200, d4: 50, d5: 50, d6: 25 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round d1..d6, including a zero phase',
      bag: { d1: 734.2, d2: 0, d3: 1_243.7, d4: 88.4, d5: 512.9, d6: 17.3 },
    },
  ],

  'equal-stage': [
    {
      name: 'leo-2-stage',
      source: 'order-of-magnitude LEO Δv budget (~9.4 km/s) split over 2 equal kerolox stages (Isp≈311 s)',
      bag: { dv: 9_400, n: 2, isp: 311 },
    },
    {
      name: 'geo-3-stage',
      source: 'order-of-magnitude GEO-direct Δv budget (~12 km/s) split over 3 equal stages, higher-Isp upper stages (Isp≈320 s)',
      bag: { dv: 12_000, n: 3, isp: 320 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round dv/n/isp',
      bag: { dv: 7_345.6, n: 4, isp: 298.2 },
    },
  ],

  rcs: [
    {
      name: 'smallsat-rcs',
      source: 'well-known small-satellite cold-gas/hydrazine RCS thrust order (~1 N) and minimum pulse width order (~20 ms)',
      bag: { F: 1, t: 5, m: 200, tmin: 0.02 },
    },
    {
      name: 'large-sc-bipropellant-rcs',
      source: 'well-known larger-spacecraft bipropellant RCS thruster order (~100 N)',
      bag: { F: 100, t: 2, m: 5_000, tmin: 0.05 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round F/t/m/tmin',
      bag: { F: 17.3, t: 3.7, m: 843.2, tmin: 0.037 },
    },
  ],

  'impulse-budget': [
    {
      name: 'adcs-desaturation',
      source: 'illustrative reaction-wheel desaturation campaign: many small RCS pulses (order-of-magnitude thrust/pulse width)',
      bag: { F: 0.5, t_min: 0.02, N: 500 },
    },
    {
      name: 'large-thruster-pulse-train',
      source: 'illustrative larger-thruster pulse train (order-of-magnitude thrust/pulse width)',
      bag: { F: 10, t_min: 0.05, N: 1_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round F/t_min/N',
      bag: { F: 3.47, t_min: 0.0137, N: 278 },
    },
  ],

  'mass-ratio-stack': [
    {
      name: 'kerolox-2-stage',
      source: 'well-known ideal per-stage mass ratio order for kerolox stages (R≈3)',
      bag: { payload: 1_000, R: 3, N: 2 },
    },
    {
      name: 'solid-3-stage',
      source: 'well-known higher ideal per-stage mass ratio order for solid stages (R≈4)',
      bag: { payload: 200, R: 4, N: 3 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round payload/R/N',
      bag: { payload: 734.2, R: 3.417, N: 2.7 },
    },
  ],

  'payload-fraction': [
    {
      name: 'medium-lift-class',
      source: 'order-of-magnitude medium-lift kerolox launch vehicle gross mass (~550 t) and LEO payload (~20 t)',
      bag: { m0: 550_000, mpl: 20_000 },
    },
    {
      name: 'smallsat-launcher-class',
      source: 'order-of-magnitude small dedicated launcher gross mass (~50 t) and payload (~1 t)',
      bag: { m0: 50_000, mpl: 1_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round m0/mpl',
      bag: { m0: 417_235.6, mpl: 9_123.4 },
    },
  ],

  'isentropic-nozzle': [
    {
      name: 'vacuum-large-area-ratio',
      source: 'well-known kerolox combustion-gas regime (γ≈1.2, R≈355 J/(kg·K), Tc≈3500 K) with vacuum-class large expansion (pe/pc≈0.01)',
      // tc (lowercase) alongside Tc: PHYSICS_ID_ALIASES aliases Tc->tc, and SAMPLE
      // separately defines both spellings at the same default (3500); without also
      // setting tc here, normalizeValueKeys keeps SAMPLE's pre-existing tc and drops
      // this override, injecting the wrong Tc into every rendered snippet language.
      bag: { gamma: 1.2, Rgas: 355, Tc: 3500, tc: 3500, pepc: 0.01 },
    },
    {
      name: 'sea-level-modest-expansion',
      source: 'same kerolox combustion-gas regime with a sea-level-class modest expansion ratio (pe/pc≈0.15)',
      bag: { gamma: 1.2, Rgas: 355, Tc: 3300, tc: 3300, pepc: 0.15 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round gamma/Rgas/Tc/pepc, pe/pc in (0,1)',
      bag: { gamma: 1.23, Rgas: 347.8, Tc: 3421.7, tc: 3421.7, pepc: 0.0347 },
    },
  ],

  'characteristic-velocity-cstar': [
    {
      name: 'kerolox-chamber',
      source: 'well-known kerolox chamber pressure order (~7 MPa) and combustion-gas regime (γ≈1.2, R≈355 J/(kg·K), Tc≈3500 K)',
      // tc (lowercase) alongside Tc: see isentropic-nozzle above for why both spellings
      // must be set (PHYSICS_ID_ALIASES Tc->tc collides with SAMPLE's redundant default).
      bag: { pc: 7e6, At: 0.05, mdot: 250, Rgas: 355, Tc: 3500, tc: 3500, gamma: 1.2 },
    },
    {
      name: 'hydrolox-chamber',
      source: 'well-known high-pressure hydrolox chamber order (~20 MPa) and lower-γ, higher-R combustion-gas regime',
      bag: { pc: 20e6, At: 0.02, mdot: 65, Rgas: 500, Tc: 3600, tc: 3600, gamma: 1.15 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round pc/At/mdot/Rgas/Tc/gamma',
      bag: { pc: 6.234e6, At: 0.0417, mdot: 213.7, Rgas: 368.2, Tc: 3387.4, tc: 3387.4, gamma: 1.21 },
    },
  ],

  'throat-area-sizing': [
    {
      name: 'kerolox-engine',
      source: 'well-known ~1 MN-class thrust, vacuum thrust-coefficient order (Cf≈1.5), kerolox chamber pressure order (~7 MPa)',
      bag: { F: 1_000_000, Cf: 1.5, pc: 7e6 },
    },
    {
      name: 'small-engine',
      source: 'order-of-magnitude smaller engine class (~50 kN) at lower chamber pressure',
      bag: { F: 50_000, Cf: 1.4, pc: 5e6 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round F/Cf/pc',
      bag: { F: 734_215.6, Cf: 1.62, pc: 6.417e6 },
    },
  ],

  'rocket-thrust-chamber': [
    {
      name: 'kerolox-engine',
      source: 'well-known vacuum thrust-coefficient order (Cf≈1.5) and kerolox chamber pressure order (~7 MPa)',
      bag: { Cf: 1.5, pc: 7e6, At: 0.1 },
    },
    {
      name: 'small-engine',
      source: 'order-of-magnitude smaller engine class at lower chamber pressure',
      bag: { Cf: 1.4, pc: 5e6, At: 0.02 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round Cf/pc/At',
      bag: { Cf: 1.618, pc: 6.417e6, At: 0.0347 },
    },
  ],

  'mixture-ratio': [
    {
      name: 'kerolox-engine',
      source: 'well-known kerolox O/F mixture-ratio order (~2.6)',
      bag: { mox: 180, mfuel: 70 },
    },
    {
      name: 'hydrolox-engine',
      source: 'well-known hydrolox O/F mixture-ratio order (~6)',
      bag: { mox: 340, mfuel: 57 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mox/mfuel',
      bag: { mox: 143.7, mfuel: 52.3 },
    },
  ],

  'tank-ullage': [
    {
      name: 'rp1-fuel-tank',
      source: 'well-known RP-1 kerosene density (~810 kg/m³) and typical fill fraction leaving ullage (~0.95)',
      bag: { V: 50, fill: 0.95, rho: 810 },
    },
    {
      name: 'lox-tank',
      source: 'well-known LOX density (~1141 kg/m³) and typical fill fraction leaving ullage (~0.93)',
      bag: { V: 40, fill: 0.93, rho: 1141 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round V/fill/rho, fill in (0,1]',
      bag: { V: 27.3, fill: 0.87, rho: 974.6 },
    },
  ],

  'blowdown-tank': [
    {
      name: 'cold-gas-pressurant',
      source: 'well-known high-pressure cold-gas/pressurant tank order (~20 MPa) and diatomic-gas γ (N2, γ≈1.4)',
      bag: { p1: 20e6, V1: 0.05, V2: 0.15, gamma: 1.4 },
    },
    {
      name: 'helium-pressurant',
      source: 'well-known high-pressure helium pressurant tank order (~30 MPa) and monatomic-gas γ (He, γ≈1.667)',
      bag: { p1: 30e6, V1: 0.03, V2: 0.09, gamma: 1.667 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round p1/V1/V2/gamma, gamma>1',
      bag: { p1: 18.4e6, V1: 0.0417, V2: 0.1263, gamma: 1.28 },
    },
  ],

  'propellant-density-impulse': [
    {
      name: 'kerolox',
      source: 'well-known RP-1 density (~810 kg/m³) and kerolox vacuum Isp (~311 s)',
      bag: { rho: 810, isp: 311 },
    },
    {
      name: 'hydrolox',
      source: 'well-known low LH2 density (~71 kg/m³) penalizing an otherwise high hydrolox Isp (~452 s)',
      bag: { rho: 71, isp: 452 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round rho/isp',
      bag: { rho: 643.7, isp: 298.4 },
    },
  ],

  'cold-gas-thrust': [
    {
      name: 'n2-cold-gas',
      source: 'well-known small N2 cold-gas ACS thruster order (mdot~0.01 kg/s) and N2 cold-gas exhaust velocity order (~800 m/s)',
      bag: { mdot: 0.01, ve: 800 },
    },
    {
      name: 'co2-cold-gas',
      source: 'well-known CO2 cold-gas thruster regime with lower exhaust velocity order (~600 m/s)',
      bag: { mdot: 0.02, ve: 600 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mdot/ve',
      bag: { mdot: 0.0137, ve: 734.6 },
    },
  ],

  'ion-thruster-efficiency': [
    {
      name: 'nstar-class-xenon',
      source: 'well-known NASA NSTAR-class xenon ion thruster regime (~92 mN, ~2.3 kW, few mg/s)',
      bag: { T: 0.092, mdot: 3.5e-6, P: 2_300 },
    },
    {
      name: 'small-ion-thruster',
      source: 'order-of-magnitude smaller ion thruster class (lower thrust, power and flow)',
      bag: { T: 0.02, mdot: 1e-6, P: 500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round T/mdot/P',
      bag: { T: 0.0537, mdot: 2.14e-6, P: 1_348.7 },
    },
  ],

  'hall-thruster-isp': [
    {
      name: 'xenon-300v',
      source: 'well-known Hall-thruster discharge voltage order (~300 V) and xenon-131 ion mass (~2.1801e-25 kg)',
      bag: { V: 300, mIon: 2.1801e-25 },
    },
    {
      name: 'krypton-400v',
      source: 'well-known krypton-propellant Hall-thruster discharge voltage order (~400 V) and krypton ion mass (~1.3915e-25 kg)',
      bag: { V: 400, mIon: 1.3915e-25 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round V, xenon ion mass held fixed (physical constant)',
      bag: { V: 417.3, mIon: 2.1801e-25 },
    },
  ],

  'geo-propellant-budget': [
    {
      name: 'geo-chemical-15yr',
      source: 'well-known GEO stationkeeping Δv budget order (~50 m/s/yr), design life order (~15 yr), comsat dry mass order and storable bipropellant Isp (~300 s)',
      bag: { dvY: 50, life: 15, mdry: 1_500, isp: 300 },
    },
    {
      name: 'geo-electric-10yr',
      source: 'same stationkeeping Δv budget with electric-propulsion Isp order (~1800 s) over a 10-yr life',
      bag: { dvY: 50, life: 10, mdry: 2_000, isp: 1_800 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round dvY/life/mdry/isp',
      bag: { dvY: 47.3, life: 12.7, mdry: 1_734.2, isp: 287.6 },
    },
  ],

  'solar-sail-accel': [
    {
      name: '1au-ideal-sail',
      source: 'well-known solar constant at 1 AU (1361 W/m²), ideal reflection, order-of-magnitude large sail area and small sailcraft mass',
      bag: { eta: 1, flux: 1361, A: 1_000, m: 300 },
    },
    {
      name: 'near-sun-realistic-sail',
      source: 'flux scaled to 0.5 AU by the inverse-square law (1/0.5²=4×) with a realistic sub-unity reflectivity',
      bag: { eta: 0.9, flux: 1361 * 4, A: 100, m: 50 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round eta/flux/A/m',
      bag: { eta: 0.87, flux: 1_834.6, A: 347.2, m: 112.4 },
    },
  ],

  'finite-burn-dv': [
    {
      name: 'kerolox-first-stage',
      source: 'well-known first-stage burn time order (~150 s), kerolox vacuum ve (~3050 m/s), multi-engine mass-flow order',
      bag: { m0: 500_000, mdot: 2_500, tb: 150, ve: 3050 },
    },
    {
      name: 'hydrolox-upper-stage',
      source: 'well-known longer upper-stage burn time order (~300 s) and hydrolox vacuum ve (~4430 m/s)',
      bag: { m0: 100_000, mdot: 250, tb: 300, ve: 4430 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round m0/mdot/tb/ve (mf stays positive and below m0)',
      bag: { m0: 83_456.2, mdot: 213.7, tb: 127.4, ve: 2874.6 },
    },
  ],

  'thruster-impulse-bit': [
    {
      name: 'rcs-min-pulse',
      source: 'well-known small RCS thrust order (~1 N) and minimum pulse width order (~20 ms)',
      bag: { F: 1, ton: 0.02 },
    },
    {
      name: 'medium-bipropellant-pulse',
      source: 'well-known medium bipropellant RCS thrust order (~22 N) with a longer pulse',
      bag: { F: 22, ton: 0.05 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round F/ton',
      bag: { F: 4.37, ton: 0.0137 },
    },
  ],

  'gravity-loss': [
    {
      name: 'vertical-ascent',
      source: 'surface gravity, well-known first-stage burn time order (~150 s), purely vertical pitch (worst-case sin=1)',
      bag: { g: 9.80665, tb: 150, gamma: Math.PI / 2 },
    },
    {
      name: 'pitched-ascent',
      source: 'same burn time with a representative 45° pitch-over angle',
      bag: { g: 9.80665, tb: 150, gamma: 45 * (Math.PI / 180) },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round burn time and pitch angle',
      bag: { g: 9.80665, tb: 137.4, gamma: 1.047 },
    },
  ],

  'edelbaum-dv': [
    {
      name: 'leo-to-geo-plane-change',
      source: 'well-known ISS-class LEO circular speed (~7668.6 m/s), well-known GEO circular speed (~3074.66 m/s), well-known ISS inclination (51.6°)',
      bag: { v1: 7668.6, v2: 3074.66, di: 51.6 * (Math.PI / 180) },
    },
    {
      name: 'small-plane-change',
      source: 'same LEO-class speed regime with a small 5° plane change',
      bag: { v1: 7668.6, v2: 7000, di: 5 * (Math.PI / 180) },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round v1/v2/di, di in [0, π]',
      bag: { v1: 6823.4, v2: 3417.6, di: 0.647 },
    },
  ],

  'boiloff-rate': [
    {
      name: 'lh2-tank',
      source: 'order-of-magnitude insulated cryogenic tank heat leak (~500 W) and well-known LH2 heat of vaporization (~446 kJ/kg)',
      bag: { Q: 500, hfg: 446_000 },
    },
    {
      name: 'lox-tank',
      source: 'order-of-magnitude heat leak (~800 W) and well-known LOX heat of vaporization (~213 kJ/kg)',
      bag: { Q: 800, hfg: 213_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round Q/hfg',
      bag: { Q: 347.6, hfg: 187_423.5 },
    },
  ],

  'thrust-to-weight': [
    {
      name: 'liftoff-class',
      source: 'order-of-magnitude medium/heavy-lift kerolox liftoff thrust (~7.6 MN) and gross mass (~549 t), T/W just above 1',
      bag: { F: 7_600_000, m: 549_000 },
    },
    {
      name: 'throttled-descent-class',
      source: 'order-of-magnitude lander-class throttled engine thrust and mass, T/W below 1 for controlled descent',
      bag: { F: 45_000, m: 15_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round F/m',
      bag: { F: 734_215.6, m: 52_347.8 },
    },
  ],
}
