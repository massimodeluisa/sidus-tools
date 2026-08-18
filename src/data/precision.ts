/**
 * Per-tool technological / model precision limits (user-visible).
 * English source of truth; UI via i18n uses these keys or embeds modelClass.
 */

export type PrecisionClass =
  | 'two-body-exact'
  | 'two-body-series'
  | 'j2-secular'
  | 'atmosphere-order'
  | 'eclss-educational'
  | 'rf-friis'
  | 'empirical-const'
  | 'utility'

export type ToolPrecision = {
  /** Model / numerical class */
  modelClass: PrecisionClass
  /** Relative or absolute error class (honest upper bound for IEEE-754 + model) */
  errorClass: string
  /** Short technical limit note (EN, shown to users) */
  limits: string
  /** Reference class for benchmarks */
  referenceHint: string
}

const IEEE =
  'IEEE-754 double (~15-16 decimal digits). Results are educational, not flight-certified ephemerides.'

const TWO_BODY: ToolPrecision = {
  modelClass: 'two-body-exact',
  errorClass: 'Relative residual ≲ 1e-12 on algebraic identities (e.g. v_esc/v_c = √2); absolute match to published μ within constant table choice.',
  limits: `Closed-form two-body, spherical central mass, no drag/J2/n-body. ${IEEE}`,
  referenceHint: 'Vallado / Curtis closed-form; μ from WGS-84/EGM-class tables',
}

const J2: ToolPrecision = {
  modelClass: 'j2-secular',
  errorClass: 'Secular mean rates only; ignores short-period oscillations (percent-level vs full EGM for low LEO if used as osculating).',
  limits: `First-order J2 secular rates for mean elements. Not a full geopotential propagator. ${IEEE}`,
  referenceHint: 'Vallado J2 secular formulas',
}

const ATM: ToolPrecision = {
  modelClass: 'atmosphere-order',
  errorClass: 'Order-of-magnitude; density models can be wrong by factors of 2-10 vs real atmosphere.',
  limits: `Educational ISA / exponential atmosphere band only (not NRLMSISE). ${IEEE}`,
  referenceHint: 'ISA / ISO 2533 class troposphere; exponential scale-height models',
}

const ECLSS: ToolPrecision = {
  modelClass: 'eclss-educational',
  errorClass: 'Metabolic rates ± tens of percent vs individual crew; LiOH capacity is a practical default (~0.85), not flight canister cert.',
  limits: `OCHMO/ISS-order educational rates; ideal gas cabin; not NASA-STD flight rules. ${IEEE}`,
  referenceHint: 'NASA OCHMO technical briefs; NASA-STD-3001 context',
}

const RF: ToolPrecision = {
  modelClass: 'rf-friis',
  errorClass: 'Free-space path loss only; real links need atmosphere, pointing, implementation losses (often several dB).',
  limits: `Friis/ITU FSPL educational link; no rain/ionosphere/antenna pattern. ${IEEE}`,
  referenceHint: 'Friis / ITU-style FSPL; SMAD-class framing',
}

const EMP: ToolPrecision = {
  modelClass: 'empirical-const',
  errorClass: 'Depends on published k-constants (e.g. Sutton-Graves k, P0 solar pressure); typically few-tens of percent educational.',
  limits: `Uses fixed literature constants for order-of-magnitude engineering intuition. ${IEEE}`,
  referenceHint: 'Published engineering approximations (Sutton-Graves, solar constant, etc.)',
}

const UTIL: ToolPrecision = {
  modelClass: 'utility',
  errorClass: 'Conversion accuracy limited by unit definitions (exact SI factors where defined).',
  limits: `Unit conversions use exact SI factors where applicable. ${IEEE}`,
  referenceHint: 'BIPM SI Brochure',
}

const SGP4: ToolPrecision = {
  modelClass: 'two-body-series',
  errorClass: 'SGP4/SDP4 vs precise OD: typically km-class after days for LEO TLEs; TEME frame caveats apply.',
  limits: `satellite.js SGP4/SDP4 educational wrapper; TLE epoch/frame limitations; not SPICE. ${IEEE}`,
  referenceHint: 'NORAD SGP4 via satellite.js (MIT); CelesTrak TLE docs',
}

/** Default when tool id missing */
export const DEFAULT_PRECISION: ToolPrecision = TWO_BODY

/**
 * Explicit precision map. Every live tool id should resolve (test enforces).
 * Unknown ids fall back to DEFAULT_PRECISION.
 */
export const TOOL_PRECISION: Record<string, ToolPrecision> = {
  'hoop-stress': TWO_BODY,
  'exponential-density': TWO_BODY,
  'hill-sphere': TWO_BODY,
  'edelbaum-dv': TWO_BODY,
  'repeating-ground-track': TWO_BODY,
  'pointing-budget-rss': TWO_BODY,
  'boiloff-rate': TWO_BODY,
  'residual-dipole-torque': TWO_BODY,
  'solar-flux-distance': TWO_BODY,
  'nyquist-rate': TWO_BODY,
  'data-volume': TWO_BODY,
  'earth-ir-flux': TWO_BODY,
  'molniya-tundra': J2,
  'frozen-orbit': J2,
  'thrust-to-weight': TWO_BODY,
  'planck-radiance': TWO_BODY,
  'eirp-gt': TWO_BODY,
  'quaternion-euler': TWO_BODY,
  'porkchop-earth-mars': {
    modelClass: 'two-body-exact',
    errorClass:
      'Circular coplanar heliocentric Lambert. C3 and Δv are order-of-magnitude, not a JPL porkchop. Parking Δv is a separate patched-conic step.',
    limits: `Sketch grid only. No DE440, no plane change, no launch-site constraints. ${IEEE}`,
    referenceHint: 'Vallado Lambert + circular heliocentric elements; chain patched-conic-depart',
  },
  'conjunction-pc': {
    modelClass: 'two-body-series',
    errorClass:
      'Chan is first-order (best when R ≪ σ). Foster is a polar quadrature of the 2-D Gaussian over the hard-body disk. Neither is NASA CARA.',
    limits: `Educational 2-D encounter-plane Pc. Circular hard-body, miss along +x, no 3-D TCA. ${IEEE}`,
    referenceHint: 'Chan 2008 first-order; Foster & Estes 1992 (NASA JSC 25898)',
  },
  'b-plane-target': TWO_BODY,
  'quest-attitude': TWO_BODY,
  'herrick-gibbs': {
    modelClass: 'two-body-exact',
    errorClass:
      'Gibbs is exact for a two-body conic. Herrick is a short-arc Taylor method (percent-level if the arc is tens of degrees).',
    limits: `Three-position OD. Gibbs needs coplanar samples and fails near 0°/180°. Herrick needs the sample times. ${IEEE}`,
    referenceHint: 'Vallado Alg. 54 (Gibbs) and Herrick–Gibbs (Alg. 55 class)',
  },
  'lunisolar-rates': {
    modelClass: 'j2-secular',
    errorClass:
      'Doubly-averaged Cook quadrupole. Optional P2(i3) and (1-e3^2)^{-3/2}. No 2ω Kozai cycles, no lunar node, no ephemeris.',
    limits: `Secular third-body rates only. i3=e3=0 is the circular equatorial perturber. ${IEEE}`,
    referenceHint: 'Cook 1962 / Vallado third-body; P2 and elliptic time-average of 1/r³',
  },
  'pump-crank': TWO_BODY,
  'schweighart-sedwick': J2,
  'gnss-ionosphere-klobuchar': TWO_BODY,
  'optical-gsd': TWO_BODY,
  'solar-sail-accel': TWO_BODY,
  'finite-burn-dv': TWO_BODY,
  'b-plane-impact': TWO_BODY,
  'cr3bp-jacobi': TWO_BODY,
  'orbit-lifetime-rough': TWO_BODY,
  'geo-drift-rate': TWO_BODY,
  'stefan-boltzmann': TWO_BODY,
  'wien-peak': TWO_BODY,
  'thruster-impulse-bit': TWO_BODY,
  'arg-perigee-drift-j2': TWO_BODY,
  'sar-azimuth-resolution': TWO_BODY,
  'radar-range-resolution': TWO_BODY,
  'link-margin': TWO_BODY,
  'aerobraking-pass': TWO_BODY,
  'diffraction-limit': TWO_BODY,
  'panel-eol-power': TWO_BODY,
  'magnetorquer-moment': TWO_BODY,
  'hyperbolic-eccentricity': TWO_BODY,
  'capture-circularize': TWO_BODY,
  'gravity-loss': TWO_BODY,
  'battery-dod': TWO_BODY,
  'umbra-length': TWO_BODY,
  'mean-anomaly-from-e': TWO_BODY,
  'flight-path-angle': TWO_BODY,
  'isentropic-nozzle': TWO_BODY,
  'characteristic-velocity-cstar': TWO_BODY,
  'throat-area-sizing': TWO_BODY,
  'rocket-thrust-chamber': TWO_BODY,
  'mixture-ratio': TWO_BODY,
  'tank-ullage': TWO_BODY,
  'blowdown-tank': TWO_BODY,
  'propellant-density-impulse': TWO_BODY,
  'cold-gas-thrust': TWO_BODY,
  'ion-thruster-efficiency': TWO_BODY,
  'hall-thruster-isp': TWO_BODY,
  'gnss-pseudorange': TWO_BODY,
  'gnss-geometry-gdop': TWO_BODY,
  'laser-link-budget': TWO_BODY,
  'laser-pointing-jitter': TWO_BODY,
  'laser-time-of-flight': TWO_BODY,
  'impedance-matching': TWO_BODY,
  'antenna-gain-effective': TWO_BODY,
  'doppler-shift-leo': TWO_BODY,
  'radar-equation': TWO_BODY,
  'rain-attenuation-simple': TWO_BODY,
  'ttc-ebno': TWO_BODY,
  'optical-ber-q': TWO_BODY,
  'gnss-troposphere-delay': TWO_BODY,
  'free-fall-time': TWO_BODY,
  'ballistic-range': TWO_BODY,
  'terminal-velocity': TWO_BODY,
  'parachute-descent': TWO_BODY,
  'coordinated-turn-bank': TWO_BODY,
  'slew-rate-pointing': TWO_BODY,
  'magnetic-torque': TWO_BODY,
  'gravity-gradient-torque': TWO_BODY,
  'rw-momentum-capacity': TWO_BODY,
  'sun-sensor-cone': TWO_BODY,
  'star-tracker-noise': TWO_BODY,
  'constellation-walker': TWO_BODY,
  'coverage-swath': TWO_BODY,
  'revisit-time-simple': TWO_BODY,
  'geo-stationkeeping-dv': TWO_BODY,
  'geo-propellant-budget': TWO_BODY,
  'drag-make-up-dv': TWO_BODY,
  'tisserand-parameter': TWO_BODY,
  'eps-orbit-average': TWO_BODY,
  'relativity-clock-rate': TWO_BODY,
  // Core orbital closed-form
  'circular-orbit': TWO_BODY,
  hohmann: TWO_BODY,
  escape: TWO_BODY,
  bielliptic: TWO_BODY,
  'plane-change': TWO_BODY,
  'vis-viva': TWO_BODY,
  apsides: TWO_BODY,
  'kepler-propagate': {
    ...TWO_BODY,
    errorClass:
      'Universal-variable iteration residual typically ≲ 1e-10 relative on energy for well-conditioned LEO/GEO cases.',
    limits: `Two-body Kepler propagation (universal variables). Not n-body. ${IEEE}`,
  },
  lambert: {
    ...TWO_BODY,
    errorClass:
      'Solver residual on boundary conditions; multi-rev / 180° transfers may need care (educational limits documented in UI).',
    limits: `Two-body Lambert (educational). Multi-rev and near-180° geometries are harder. ${IEEE}`,
  },
  'rv-elements': TWO_BODY,
  'hohmann-plane': TWO_BODY,
  circularize: TWO_BODY,
  'geo-orbit': TWO_BODY,
  'delta-a-burn': {
    ...TWO_BODY,
    errorClass: 'First-order Gauss linearization; accurate only for small Δv/v.',
    limits: `Linearized tangential burn Δa ≈ 2a Δv/v: small maneuvers only. ${IEEE}`,
  },
  'plane-change-apo': TWO_BODY,
  'custom-body': TWO_BODY,
  'hyperbolic-c3': TWO_BODY,
  soi: {
    ...TWO_BODY,
    errorClass: 'Laplace SOI is a teaching approximation (tens of percent vs modern definitions).',
    limits: `Patched-conic Laplace SOI r≈a(m/M)^{2/5}, not a hard dynamical boundary. ${IEEE}`,
  },
  'synodic-period': TWO_BODY,
  coelliptic: {
    ...TWO_BODY,
    errorClass: 'Clohessy-Wiltshire / first-order coelliptic; valid for small Δa/a.',
    limits: `Linear relative motion assumptions. ${IEEE}`,
  },
  'los-range-rate': TWO_BODY,
  oberth: TWO_BODY,
  deorbit: TWO_BODY,
  'mean-motion': TWO_BODY,
  'apo-raise': TWO_BODY,
  'delta-v-budget': UTIL,
  'equal-stage': {
    ...TWO_BODY,
    limits: `Ideal equal stages, constant Isp, no gravity/drag losses. ${IEEE}`,
    referenceHint: 'Ideal rocket equation staging',
  },
  'propellant-mass': {
    ...TWO_BODY,
    limits: `Ideal Tsiolkovsky invert; no gravity/drag losses. ${IEEE}`,
    referenceHint: 'Tsiolkovsky / Curtis / GRC',
  },
  'ideal-thrust': {
    ...TWO_BODY,
    limits: `Vacuum ideal F=ṁ ve; no nozzle pressure term unless modeled separately. ${IEEE}`,
    referenceHint: 'Ideal rocket thrust',
  },
  'rocket-equation': {
    ...TWO_BODY,
    limits: `Ideal rocket equation only. ${IEEE}`,
    referenceHint: 'Tsiolkovsky',
  },
  'multi-stage': {
    ...TWO_BODY,
    limits: `Independent stage Δv sum (no automatic mass stacking). ${IEEE}`,
    referenceHint: 'Ideal multi-stage',
  },
  'escape-margin': TWO_BODY,
  'specific-angular-momentum': TWO_BODY,
  'hohmann-time': TWO_BODY,
  'orbital-energy': TWO_BODY,
  'true-anomaly': TWO_BODY,
  'flyby-speed': TWO_BODY,
  'eccentric-anomaly': TWO_BODY,
  'energy-vinf': TWO_BODY,
  'critical-inclination': J2,
  'nodal-period': J2,
  'j2-drift': J2,
  sso: J2,
  'sso-period': J2,
  'relative-period': TWO_BODY,
  'rendezvous-catchup': TWO_BODY,
  'period-match': TWO_BODY,
  'along-track': {
    ...TWO_BODY,
    errorClass: 'Small-angle circular along-track Δy≈aΔM.',
    limits: `Circular coplanar small separation. ${IEEE}`,
    referenceHint: 'CW / relative motion primers',
  },
  'ground-track': {
    ...TWO_BODY,
    errorClass: 'Earth rotation only; ignores J2 nodal regression in this tool.',
    limits: `Geometric ground-track shift from Earth rate × period. ${IEEE}`,
    referenceHint: 'Spherical Earth rotation',
  },
  phasing: TWO_BODY,
  'cw-rendezvous': {
    ...TWO_BODY,
    errorClass: 'CW valid near circular target; large separations degrade.',
    limits: `Clohessy-Wiltshire linear relative motion. ${IEEE}`,
    referenceHint: 'Vallado CW',
  },
  'launch-azimuth': TWO_BODY,
  // Atmosphere / aero
  'dynamic-pressure': ATM,
  'ballistic-drag': ATM,
  'drag-force': ATM,
  'scale-height': ATM,
  'heat-flux': EMP,
  'atmosphere': ATM,
  // Satellite / RF
  sgp4: SGP4,
  'look-angles': SGP4,
  'pass-predict': {
    ...SGP4,
    errorClass: 'Coarse educational pass search; not commercial AOS/LOS products.',
    limits: `SGP4-based coarse next-pass estimate. ${IEEE}`,
    referenceHint: 'SGP4 + simple elevation threshold',
  },
  'link-budget': RF,
  'antenna-beamwidth': {
    ...RF,
    errorClass: 'Rule-of-thumb HPBW k·λ/D; real antennas differ by design.',
    limits: `Approximate parabolic beamwidth formula. ${IEEE}`,
    referenceHint: 'Antenna engineering rules of thumb',
  },
  'horizon-range': {
    ...TWO_BODY,
    errorClass: 'No refraction; geometric horizon only.',
    limits: `Spherical body geometric radio horizon. ${IEEE}`,
    referenceHint: 'Spherical Earth geometry',
  },
  'light-time': UTIL,
  'geo-light-time': UTIL,
  'solar-pressure': EMP,
  'solar-array': EMP,
  diffraction: EMP,
  'angular-diameter': TWO_BODY,
  // Propulsion / power / ADCS
  rcs: EMP,
  'impulse-budget': EMP,
  battery: UTIL,
  'reaction-wheel': UTIL,
  'thermal-rad': EMP,
  'mass-ratio-stack': {
    ...TWO_BODY,
    limits: `Ideal gross/payload ≈ R^N teaching model. ${IEEE}`,
    referenceHint: 'Ideal staging mass ratio',
  },
  'payload-fraction': UTIL,
  // ECLSS
  'metabolic-load': ECLSS,
  'cabin-atmosphere': ECLSS,
  'lioh-scrubber': ECLSS,
  'cabin-leak': {
    ...ECLSS,
    errorClass: 'Order-of-magnitude choked orifice; real leaks are complex 3D flow.',
    limits: `Isothermal choked orifice educational model. ${IEEE}`,
    referenceHint: 'Compressible orifice order-of-magnitude',
  },
  'thermal-loop': {
    ...ECLSS,
    limits: `Q=ṁ cp ΔT only; no two-phase or radiator design. ${IEEE}`,
    referenceHint: 'Lumped coolant loop',
  },
  // Utilities
  plotter: UTIL,
  units: UTIL,
  bodies: {
    ...TWO_BODY,
    limits: `Catalog μ,R,M for education; prefer JPL Horizons for operational constants. ${IEEE}`,
    referenceHint: 'JPL / IAU-class body constants (catalog)',
  },
  'eclipse-duration': {
    ...TWO_BODY,
    errorClass: 'Cylindrical umbra, Sun at infinity, coplanar worst case.',
    limits: `Simplified eclipse geometry. ${IEEE}`,
    referenceHint: 'Vallado-class cylindrical shadow teaching model',
  },
  'eclipse-beta': {
    ...TWO_BODY,
    errorClass: 'β-angle correction is educational; real eclipses need full ephemeris.',
    limits: `Circular orbit β-angle eclipse estimate. ${IEEE}`,
    referenceHint: 'Orbit β-angle eclipse approximations',
  },
  // Geometry / trig
  'spherical-distance': {
    modelClass: 'two-body-exact',
    errorClass: 'Spherical body; ignores flattening / WGS84 (meters-class vs geodetic for Earth long arcs).',
    limits: `Spherical law of cosines on a sphere of catalog R. ${IEEE}`,
    referenceHint: 'Spherical trigonometry / Vallado topocentric primers',
  },
  'elevation-azimuth': {
    modelClass: 'two-body-exact',
    errorClass: 'Spherical ECEF; no refraction, no Earth rotation during light-time.',
    limits: `Topocentric ENU from spherical geodetic. ${IEEE}`,
    referenceHint: 'Vallado topocentric / ENU framing',
  },
  'vector-angle': UTIL,
  // Planetary
  'helio-hohmann': {
    ...TWO_BODY,
    errorClass: 'Coplanar circular planets; real transfers need ephemerides and plane change (tens of % Δv class).',
    limits: `Sun-centered coplanar Hohmann teaching model. ${IEEE}`,
    referenceHint: 'Curtis / Vallado interplanetary Hohmann',
  },
  'patched-conic-depart': {
    ...TWO_BODY,
    errorClass: 'Collinear v_∞ patched conic; not a porkchop or high-fidelity departure design.',
    limits: `Parking → hyperbola from ideal heliocentric Δv. ${IEEE}`,
    referenceHint: 'Patched-conic departure (educational)',
  },
  'surface-access': {
    ...TWO_BODY,
    limits: `Two-body surface g, escape, parking circular. SOI Laplace if parent set. ${IEEE}`,
    referenceHint: 'Vallado / catalog μ,R',
  },
  'orbit-3d': {
    modelClass: 'utility',
    errorClass: 'Visualization only; projective canvas scene, not SPICE/ephemeris.',
    limits: `Interactive 3D teaching view of circular rings / transfer ellipse. ${IEEE}`,
    referenceHint: 'Keplerian geometry visualization',
  },
}

export function getToolPrecision(toolId: string): ToolPrecision {
  return TOOL_PRECISION[toolId] ?? DEFAULT_PRECISION
}
