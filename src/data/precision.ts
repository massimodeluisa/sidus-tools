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
  | 'rf-communications'
  | 'empirical-const'
  | 'utility'
  | 'closed-form'
  | 'unclassified'
  | 'restricted-three-body'
  | 'third-body-secular'
  | 'probabilistic-2d'
  | 'reference-data'

export type ToolPrecision = {
  /** Model / numerical class */
  modelClass: PrecisionClass
  /** Error/uncertainty class; a narrative warning is not a universal numeric bound. */
  errorClass: string
  /** Short technical limit note (EN, shown to users) */
  limits: string
  /** Reference class for benchmarks */
  referenceHint: string
}

const IEEE =
  'IEEE-754 double (~15-16 decimal digits); floating-point precision alone does not bound input or model error.'

const TWO_BODY: ToolPrecision = {
  modelClass: 'two-body-exact',
  errorClass:
    'No universal numerical-error bound across tools; published μ matching depends on the selected constant set, and floating-point residuals do not quantify physical-model error.',
  limits: `Idealized two-body point-mass central gravity; no drag, J2, or third-body perturbations. The numerical method is tool-specific. ${IEEE}`,
  referenceHint: 'Vallado / Curtis point-mass relations; μ depends on the selected body constants',
}

const J2: ToolPrecision = {
  modelClass: 'j2-secular',
  errorClass:
    'First-order secular mean-element rates omit short-period variations and higher geopotential terms; no universal numerical-error bound is implied.',
  limits: `First-order J2 secular rates for mean elements. Not a full geopotential propagator. ${IEEE}`,
  referenceHint: 'Vallado J2 secular formulas',
}

const ATM: ToolPrecision = {
  modelClass: 'atmosphere-order',
  errorClass:
    'Accuracy depends on the atmospheric profile, altitude, location, season, and space-weather conditions; no universal error bound is implied.',
  limits: `Educational ISA, exponential-atmosphere, or simplified drag relations as specified by each tool; not a time- and location-resolved operational atmosphere model. ${IEEE}`,
  referenceHint: 'ISA / ISO 2533 class troposphere; exponential scale-height models',
}

const ECLSS: ToolPrecision = {
  modelClass: 'eclss-educational',
  errorClass: 'Metabolic rates ± tens of percent vs individual crew; LiOH capacity is a practical default (~0.85), not flight canister cert.',
  limits: `OCHMO/ISS-order educational rates; ideal gas cabin; not NASA-STD flight rules. ${IEEE}`,
  referenceHint: 'NASA OCHMO technical briefs; NASA-STD-3001 context',
}

const RF: ToolPrecision = {
  modelClass: 'rf-communications',
  errorClass:
    'Accuracy depends on the communication relation and link effects represented by the tool; no universal link-performance error bound is implied.',
  limits: `Simplified communication relation; antenna, propagation, polarization, receiver, and noise effects are included only where stated by the individual tool. ${IEEE}`,
  referenceHint: 'Tool-specific RF/communications relation and assumptions',
}

const EMP: ToolPrecision = {
  modelClass: 'empirical-const',
  errorClass:
    'Validity and accuracy depend on the empirical fit, source conditions, and inputs; no universal numerical-error bound is implied.',
  limits: `Uses empirical relations or fixed reference values; check the tool-specific source, assumptions, and stated domain. ${IEEE}`,
  referenceHint: 'Tool-specific empirical relation or fixed reference value',
}

const UTIL: ToolPrecision = {
  modelClass: 'utility',
  errorClass: 'Conversion accuracy limited by unit definitions (exact SI factors where defined).',
  limits: `Unit conversions use exact SI factors where applicable. ${IEEE}`,
  referenceHint: 'BIPM SI Brochure',
}

const CLOSED_FORM: ToolPrecision = {
  modelClass: 'closed-form',
  errorClass:
    'Floating-point error is condition-dependent; an analytic formula does not imply a universal model-accuracy bound.',
  limits: `Closed-form algebraic relation. Tool-specific assumptions and input domain govern physical validity; this class does not imply orbital dynamics. ${IEEE}`,
  referenceHint: 'Tool-specific equation and sources listed for the calculator',
}

const THREE_BODY: ToolPrecision = {
  modelClass: 'restricted-three-body',
  errorClass:
    'Restricted-three-body idealization; accuracy and invariants apply only under the tool-specific assumptions, not general n-body motion.',
  limits: `Restricted three-body model or approximation; not a multi-body ephemeris or general n-body propagator. ${IEEE}`,
  referenceHint: 'Circular restricted three-body problem; see the tool-specific relation',
}

const UNCLASSIFIED: ToolPrecision = {
  modelClass: 'unclassified',
  errorClass: 'No audited numerical or scientific error bound is available for this tool.',
  limits: 'Precision metadata is unavailable; do not infer model assumptions from this placeholder.',
  referenceHint: 'No validated reference assigned',
}

const SGP4: ToolPrecision = {
  modelClass: 'two-body-series',
  errorClass: 'SGP4/SDP4 vs precise OD: typically km-class after days for LEO TLEs; TEME frame caveats apply.',
  limits: `satellite.js SGP4/SDP4 educational wrapper; TLE epoch/frame limitations; not SPICE. ${IEEE}`,
  referenceHint: 'NORAD SGP4 via satellite.js (MIT); CelesTrak™ TLE docs',
}

/** Default when tool id missing */
export const DEFAULT_PRECISION: ToolPrecision = UNCLASSIFIED

/**
 * Explicit precision map. Every live tool id should resolve (test enforces).
 * Unknown ids fall back to DEFAULT_PRECISION.
 */
export const TOOL_PRECISION: Record<string, ToolPrecision> = {
  'hoop-stress': CLOSED_FORM,
  'exponential-density': ATM,
  'hill-sphere': {
    ...THREE_BODY,
    errorClass: 'Hill radius is an approximation for a small secondary-to-primary mass ratio on a circular orbit; it is not a sharp stability boundary.',
    limits: `r_H ≈ a(m/3M)^(1/3), assuming m/M ≪ 1 and a circular primary-secondary orbit. ${IEEE}`,
    referenceHint: 'Hill approximation derived from the circular restricted three-body problem',
  },
  'edelbaum-dv': {
    modelClass: 'closed-form',
    errorClass:
      'Edelbaum combined circular transfer plus plane change. Not a spiral-to-escape Δv (that is v_circ) and not a 1/r² solar-electric campaign.',
    limits: `Low-thrust circular-to-circular with a plane change. ${IEEE}`,
    referenceHint: 'Edelbaum 1961; Vallado low-thrust chapter',
  },
  'repeating-ground-track': CLOSED_FORM,
  'pointing-budget-rss': CLOSED_FORM,
  'boiloff-rate': CLOSED_FORM,
  'residual-dipole-torque': CLOSED_FORM,
  'solar-flux-distance': EMP,
  'nyquist-rate': CLOSED_FORM,
  'data-volume': CLOSED_FORM,
  'earth-ir-flux': EMP,
  'molniya-tundra': J2,
  'frozen-orbit': J2,
  'thrust-to-weight': CLOSED_FORM,
  'planck-radiance': CLOSED_FORM,
  'eirp-gt': {
    modelClass: 'rf-communications',
    errorClass:
      'EIRP and G/T are algebraic figures of merit from supplied power, gain, and system temperature; they are not received power or link margin.',
    limits: `EIRP = Pt Gt and G/T = Gr/Tsys. Tsys must use the intended receiver reference plane; propagation, pointing, and implementation losses are not included. ${IEEE}`,
    referenceHint: 'ITU / CCSDS link-budget figures of merit',
  },
  'quaternion-euler': CLOSED_FORM,
  'porkchop-earth-mars': {
    modelClass: 'two-body-exact',
    errorClass:
      'Circular coplanar heliocentric Lambert. C3 and Δv are order-of-magnitude, not a JPL porkchop. Parking Δv is a separate patched-conic step.',
    limits: `Sketch grid only. No DE440, no plane change, no launch-site constraints. ${IEEE}`,
    referenceHint: 'Vallado Lambert + circular heliocentric elements; chain patched-conic-depart',
  },
  'conjunction-pc': {
    modelClass: 'probabilistic-2d',
    errorClass:
      'Chan is first-order (best when R ≪ σ). Foster is a polar quadrature of the 2-D Gaussian over the hard-body disk. Neither is NASA CARA.',
    limits: `Educational 2-D encounter-plane Pc. Circular hard-body, miss along +x, no 3-D TCA. ${IEEE}`,
    referenceHint: 'Chan 2008 first-order; Foster & Estes 1992 (NASA JSC 25898)',
  },
  'b-plane-target': TWO_BODY,
  'quest-attitude': CLOSED_FORM,
  'herrick-gibbs': {
    modelClass: 'closed-form',
    errorClass:
      'Gibbs is exact for a two-body conic. Herrick is a short-arc Taylor method (percent-level if the arc is tens of degrees).',
    limits: `Three-position OD. Gibbs needs coplanar samples and fails near 0°/180°. Herrick needs the sample times. ${IEEE}`,
    referenceHint: 'Vallado Alg. 54 (Gibbs) and Herrick–Gibbs (Alg. 55 class)',
  },
  'lunisolar-rates': {
    modelClass: 'third-body-secular',
    errorClass:
      'Doubly-averaged Cook quadrupole. Optional P2(i3) and (1-e3^2)^{-3/2}. No 2ω Kozai cycles, no lunar node, no ephemeris.',
    limits: `Secular third-body rates only. i3=e3=0 is the circular equatorial perturber. ${IEEE}`,
    referenceHint: 'Cook 1962 / Vallado third-body; P2 and elliptic time-average of 1/r³',
  },
  'pump-crank': TWO_BODY,
  'schweighart-sedwick': J2,
  'gnss-ionosphere-klobuchar': EMP,
  'optical-gsd': CLOSED_FORM,
  'solar-sail-accel': EMP,
  'finite-burn-dv': CLOSED_FORM,
  'b-plane-impact': TWO_BODY,
  'cr3bp-jacobi': {
    ...THREE_BODY,
    errorClass: 'This calculator implements planar states; its Jacobi constant is conserved under planar circular restricted-three-body dynamics, not general n-body motion.',
    limits: `Planar CR3BP Jacobi integral in normalized barycentric rotating coordinates; not SI mechanical energy. The Jacobi integral also exists for the spatial CR3BP, but this tool has no z or vz inputs. ${IEEE}`,
    referenceHint: 'Planar circular restricted three-body Jacobi integral',
  },
  'orbit-lifetime-rough': {
    modelClass: 'atmosphere-order',
    errorClass: 'Scale-height lifetime is an order-of-magnitude estimate; density and ballistic coefficient dominate and vary along a real orbit.',
    limits: `Circular-orbit drag decay time for losing about one density scale height, using a local constant density and speed; not a full lifetime propagation. ${IEEE}`,
    referenceHint: 'Exponential atmosphere and averaged drag-decay approximation',
  },
  'geo-drift-rate': TWO_BODY,
  'stefan-boltzmann': CLOSED_FORM,
  'wien-peak': CLOSED_FORM,
  'thruster-impulse-bit': CLOSED_FORM,
  'arg-perigee-drift-j2': J2,
  'sar-azimuth-resolution': CLOSED_FORM,
  'radar-range-resolution': CLOSED_FORM,
  'link-margin': CLOSED_FORM,
  'aerobraking-pass': {
    modelClass: 'atmosphere-order',
    errorClass: 'First-order drag estimate; accuracy is dominated by density, ballistic coefficient, speed, and path variation over the pass.',
    limits: `Δv ≈ 0.5(C_D A/m)ρvL with constant density, speed, and ballistic area ratio; no pass trajectory or atmospheric profile is integrated. ${IEEE}`,
    referenceHint: 'Drag equation integrated under constant-property single-pass assumptions',
  },
  'diffraction-limit': CLOSED_FORM,
  'panel-eol-power': EMP,
  'magnetorquer-moment': CLOSED_FORM,
  'hyperbolic-eccentricity': TWO_BODY,
  'capture-circularize': TWO_BODY,
  'gravity-loss': CLOSED_FORM,
  'battery-dod': UTIL,
  'umbra-length': CLOSED_FORM,
  'mean-anomaly-from-e': TWO_BODY,
  'flight-path-angle': TWO_BODY,
  'isentropic-nozzle': CLOSED_FORM,
  'characteristic-velocity-cstar': CLOSED_FORM,
  'throat-area-sizing': CLOSED_FORM,
  'rocket-thrust-chamber': CLOSED_FORM,
  'mixture-ratio': CLOSED_FORM,
  'tank-ullage': CLOSED_FORM,
  'blowdown-tank': CLOSED_FORM,
  'propellant-density-impulse': CLOSED_FORM,
  'cold-gas-thrust': CLOSED_FORM,
  'ion-thruster-efficiency': {
    ...CLOSED_FORM,
    errorClass:
      'η = T²/(2 ṁ P) is the jet-power identity. α = P/m_dry is a mass-closure floor, not an engineered bus.',
    limits: `Ideal ion thruster figures of merit. No plume, grid, or PPU map. ${IEEE}`,
    referenceHint: 'Goebel / Katz DESCANSO EP; jet power T ve / 2',
  },
  'hall-thruster-isp': CLOSED_FORM,
  'gnss-pseudorange': CLOSED_FORM,
  'gnss-geometry-gdop': CLOSED_FORM,
  'laser-link-budget': {
    ...CLOSED_FORM,
    errorClass:
      'Idealized optical free-space link equation; realized margin depends on beam profile, pointing, optical efficiency, receiver geometry, atmosphere, and background noise.',
    limits: `Pr = Pt ηt ηr Gt Gr (λ/(4πR))²/L. No atmospheric/turbulence, pointing-jitter, receiver-clipping, or background/noise model is integrated. ${IEEE}`,
    referenceHint: 'Optical Friis-form link equation; no Gaussian-beam or receiver-capture model',
  },
  'laser-pointing-jitter': CLOSED_FORM,
  'laser-time-of-flight': CLOSED_FORM,
  'impedance-matching': CLOSED_FORM,
  'antenna-gain-effective': {
    modelClass: 'rf-communications',
    errorClass:
      'Ideal gain/effective-aperture identity; realized gain depends on efficiency, mismatch, polarization, and antenna pattern.',
    limits: `Ae = G λ²/(4π), with the inverse relation for gain. This does not infer aperture efficiency or a full antenna pattern. ${IEEE}`,
    referenceHint: 'Antenna effective aperture and gain relation',
  },
  'doppler-shift-leo': {
    modelClass: 'rf-communications',
    errorClass:
      'First-order fd = f0 vr/c. Two-way is 2 fd. Clock error is Δρ̇ = c Δf/f. No transponder turnaround, media, or station model.',
    limits: `Topocentric radial Doppler teaching model. ${IEEE}`,
    referenceHint: 'Thornton & Border DESCANSO vol. 1; Vallado Doppler',
  },
  'radar-equation': {
    modelClass: 'rf-communications',
    errorClass:
      'Ideal monostatic radar equation with supplied RCS and gain; target fluctuation, propagation, multipath, polarization, and detection processing are outside the model.',
    limits: `Pr = Pt G² λ² σ/((4π)³R⁴) for a monostatic free-space link. No atmospheric loss, target-RCS statistics, antenna pattern, or receiver/noise threshold is modeled. ${IEEE}`,
    referenceHint: 'Monostatic radar range equation; supplied target radar cross section',
  },
  'rain-attenuation-simple': {
    ...EMP,
    errorClass: 'ITU-style power-law attenuation is a climatological engineering fit; coefficients depend on frequency and polarization.',
    limits: `Specific attenuation γ_R = k R^α with user-supplied path length; no rain-cell geometry, polarization change, or site statistics. ${IEEE}`,
    referenceHint: 'ITU-R P.838 specific attenuation model; simplified path integration',
  },
  'ttc-ebno': CLOSED_FORM,
  'optical-ber-q': CLOSED_FORM,
  'gnss-troposphere-delay': EMP,
  'free-fall-time': CLOSED_FORM,
  'ballistic-range': CLOSED_FORM,
  'terminal-velocity': CLOSED_FORM,
  'parachute-descent': CLOSED_FORM,
  'coordinated-turn-bank': CLOSED_FORM,
  'slew-rate-pointing': CLOSED_FORM,
  'magnetic-torque': CLOSED_FORM,
  'gravity-gradient-torque': CLOSED_FORM,
  'rw-momentum-capacity': CLOSED_FORM,
  'sun-sensor-cone': CLOSED_FORM,
  'star-tracker-noise': CLOSED_FORM,
  'constellation-walker': CLOSED_FORM,
  'coverage-swath': CLOSED_FORM,
  'revisit-time-simple': {
    ...EMP,
    errorClass: 'Order-of-magnitude estimate; Earth circumference divided by swath width ignores inclination, latitude, overlap, and multi-orbit ground-track geometry.',
    limits: `Simple revisit proxy = period × max(1, Earth circumference / swath width). Not a coverage simulation. ${IEEE}`,
    referenceHint: 'Geometric strip-count heuristic; not an access/revisit analysis',
  },
  'geo-stationkeeping-dv': {
    ...EMP,
    errorClass: 'Rule-of-thumb annual GEO stationkeeping budget; actual Δv depends on orbit, mission duration, and control strategy.',
    limits: `User/default N/S and E/W annual budget components are summed; no perturbation propagation or maneuver design. ${IEEE}`,
    referenceHint: 'GEO stationkeeping engineering budget rules of thumb',
  },
  'geo-propellant-budget': CLOSED_FORM,
  'drag-make-up-dv': {
    modelClass: 'atmosphere-order',
    errorClass: 'Order-of-magnitude drag replacement estimate; density, speed, and ballistic coefficient vary along the orbit and with space weather.',
    limits: `Single-orbit drag estimate from user-supplied density and constant speed/ballistic coefficient; not an atmospheric trajectory propagation. ${IEEE}`,
    referenceHint: 'Integrated drag equation under circular-orbit, constant-property assumptions',
  },
  'tisserand-parameter': {
    ...THREE_BODY,
    errorClass: 'Approximate Tisserand invariant; it is conserved only under the circular restricted-three-body assumptions and is disrupted by perturbations and eccentric primaries.',
    limits: `Planetary-orbit Tisserand parameter using a circular restricted three-body approximation; not an exact invariant for real ephemerides. ${IEEE}`,
    referenceHint: 'Tisserand relation in the circular restricted three-body problem',
  },
  'eps-orbit-average': CLOSED_FORM,
  'relativity-clock-rate': CLOSED_FORM,
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
    ...CLOSED_FORM,
    errorClass: 'First-order Gauss linearization; accurate only for small Δv/v.',
    limits: `Linearized tangential burn Δa ≈ 2a Δv/v: small maneuvers only. ${IEEE}`,
  },
  'plane-change-apo': TWO_BODY,
  'custom-body': {
    ...CLOSED_FORM,
    errorClass:
      'Newtonian point-mass relationships use the user-entered mass and mean radius; accuracy depends on those inputs and the body model.',
    limits: `μ = GM; g = μ/r²; escape and circular speed use point-mass gravity. The Laplace SOI r ≈ a(m/M)^(2/5) is an approximate boundary, not a dynamical surface. ${IEEE}`,
    referenceHint: 'Newtonian point-mass relations; Laplace sphere-of-influence approximation',
  },
  'hyperbolic-c3': TWO_BODY,
  soi: {
    ...THREE_BODY,
    errorClass: 'Laplace SOI is an approximate scale for patched-conic analysis, not a sharp dynamical boundary; its value depends on the orbital and mass assumptions.',
    limits: `Patched-conic Laplace SOI r≈a(m/M)^{2/5}, not a hard dynamical boundary. ${IEEE}`,
    referenceHint: 'Laplace sphere-of-influence approximation used in patched-conic analysis',
  },
  'synodic-period': TWO_BODY,
  coelliptic: {
    ...CLOSED_FORM,
    errorClass: 'Clohessy-Wiltshire / first-order coelliptic; valid for small Δa/a.',
    limits: `Linear relative motion assumptions. ${IEEE}`,
  },
  'los-range-rate': CLOSED_FORM,
  oberth: TWO_BODY,
  deorbit: TWO_BODY,
  'mean-motion': TWO_BODY,
  'apo-raise': TWO_BODY,
  'delta-v-budget': UTIL,
  'equal-stage': {
    ...CLOSED_FORM,
    limits: `Ideal equal stages, constant Isp, no gravity/drag losses. ${IEEE}`,
    referenceHint: 'Ideal rocket equation staging',
  },
  'propellant-mass': {
    ...CLOSED_FORM,
    limits: `Ideal Tsiolkovsky invert; no gravity/drag losses. ${IEEE}`,
    referenceHint: 'Tsiolkovsky / Curtis / GRC',
  },
  'ideal-thrust': {
    ...CLOSED_FORM,
    limits: `Vacuum ideal F=ṁ ve; no nozzle pressure term unless modeled separately. ${IEEE}`,
    referenceHint: 'Ideal rocket thrust',
  },
  'rocket-equation': {
    ...CLOSED_FORM,
    limits: `Ideal rocket equation only. ${IEEE}`,
    referenceHint: 'Tsiolkovsky',
  },
  'multi-stage': {
    ...CLOSED_FORM,
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
    ...CLOSED_FORM,
    errorClass: 'Small-angle circular along-track Δy≈aΔM.',
    limits: `Circular coplanar small separation. ${IEEE}`,
    referenceHint: 'CW / relative motion primers',
  },
  'ground-track': {
    ...SGP4,
    errorClass:
      'TLE path: satellite.js SGP4/SDP4, typically km-class after days. Two-body path: spherical Kepler, no J2; longitude shift uses IERS ω_E.',
    limits: `Lat/lon polyline. TLE = SGP4/SDP4. Two-body = spherical Kepler, no J2, not a full-force model. ${IEEE}`,
    referenceHint: 'Vallado SGP4-VER CASE A for the TLE sampler; Vallado two-body + IERS ω_E for Kepler',
  },
  'ground-track-shift': {
    ...CLOSED_FORM,
    errorClass: 'Earth rotation only; ignores J2 nodal regression in this tool.',
    limits: `Geometric ground-track shift from Earth rate × period. ${IEEE}`,
    referenceHint: 'Spherical Earth rotation; Vallado two-body period',
  },
  phasing: TWO_BODY,
  'cw-rendezvous': {
    ...CLOSED_FORM,
    errorClass: 'CW valid near circular target; large separations degrade.',
    limits: `Clohessy-Wiltshire linear relative motion. ${IEEE}`,
    referenceHint: 'Vallado CW',
  },
  'launch-azimuth': CLOSED_FORM,
  // Atmosphere / aero
  'dynamic-pressure': ATM,
  'ballistic-drag': ATM,
  'drag-force': ATM,
  'scale-height': ATM,
  'heat-flux': EMP,
  'atmosphere': ATM,
  // Satellite / RF
  sgp4: SGP4,
  'look-angles': {
    ...CLOSED_FORM,
    errorClass: 'Geometric ECI-to-ECEF and topocentric conversion; accuracy depends on the input state, observer coordinates, and time/frame convention.',
    limits: `Transforms a supplied ECI position using GMST and computes geometric look angles; it does not propagate an orbit or model atmospheric refraction. ${IEEE}`,
    referenceHint: 'Vallado / satellite.js topocentric coordinate transformations',
  },
  'pass-predict': {
    ...SGP4,
    errorClass: 'Coarse educational pass search; not commercial AOS/LOS products.',
    limits: `SGP4-based coarse next-pass estimate. ${IEEE}`,
    referenceHint: 'SGP4 + simple elevation threshold',
  },
  'link-budget': {
    ...RF,
    errorClass:
      'Ideal Friis free-space link budget; accuracy depends on antenna, propagation, receiver, and any extra losses supplied by the user.',
    limits: `Received power uses Friis free-space path loss with optional user-supplied extra losses; no propagation or pointing loss is inferred automatically. C/N0 uses the supplied system temperature or 290 K default. ${IEEE}`,
    referenceHint: 'Friis free-space link budget and Boltzmann noise relation',
  },
  'antenna-beamwidth': {
    modelClass: 'rf-communications',
    errorClass:
      'Rule-of-thumb HPBW θ ≈ k λ/D; actual beam shape and width depend on aperture illumination and antenna design.',
    limits: `Approximate half-power beamwidth θ ≈ (k°·π/180)(λ/D), with λ=c/f and k supplied by the user (default 70°). This is not a full radiation-pattern model. ${IEEE}`,
    referenceHint: 'Antenna aperture HPBW rule of thumb; result depends on the selected k factor',
  },
  'horizon-range': {
    ...CLOSED_FORM,
    errorClass: 'No refraction; geometric horizon only.',
    limits: `Spherical body geometric radio horizon. ${IEEE}`,
    referenceHint: 'Spherical Earth geometry',
  },
  'light-time': {
    modelClass: 'closed-form',
    errorClass:
      'Vacuum one-way t = r/c and RTLT = 2t. DSN two-way range is the RTLT. No media, station delay, or turnaround.',
    limits: `Geometric light time. ${IEEE}`,
    referenceHint: 'BIPM SI c; Thornton & Border DESCANSO vol. 1 ranging',
  },
  'geo-light-time': UTIL,
  'solar-pressure': EMP,
  'solar-array': EMP,
  diffraction: EMP,
  'angular-diameter': CLOSED_FORM,
  // Propulsion / power / ADCS
  rcs: EMP,
  'impulse-budget': EMP,
  battery: UTIL,
  'reaction-wheel': UTIL,
  'thermal-rad': EMP,
  'mass-ratio-stack': {
    ...CLOSED_FORM,
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
    modelClass: 'reference-data',
    errorClass: 'Values are rounded/model-dependent; the tool does not expose per-record source, epoch, convention, or uncertainty.',
    limits: `The table gives reference μ, mass, radius, and a few rounded Laplace SOI estimates; SOI is not a hard dynamical boundary. No propagation or operational ephemeris is implied. ${IEEE}`,
    referenceHint: 'Tool-level source list includes JPL Horizons, DE440, IAU, and Vallado; no per-field provenance map is surfaced',
  },
  'eclipse-duration': {
    ...TWO_BODY,
    errorClass: 'Cylindrical umbra, Sun at infinity, coplanar worst case.',
    limits: `Simplified eclipse geometry. ${IEEE}`,
    referenceHint: 'Vallado-class cylindrical shadow teaching model',
  },
  'eclipse-beta': {
    ...TWO_BODY,
    errorClass:
      'Circular-orbit cylindrical-shadow estimate; beta is a principal angle in [-90°, +90°]. Finite solar radius and penumbra are omitted.',
    limits: `Circular orbit with Sun at infinity; beta must be in [-90°, +90°]. No finite solar disk, penumbra, eccentric-orbit shadow events, or third-body occultations. ${IEEE}`,
    referenceHint: 'Circular-orbit beta-angle eclipse geometry; cylindrical-shadow approximation',
  },
  // Geometry / trig
  'spherical-distance': {
    modelClass: 'closed-form',
    errorClass: 'Spherical great-circle distance can differ materially from an ellipsoidal geodesic; with the default Earth radius, the equator-to-pole quarter meridian is about 16.8 km longer than WGS 84.',
    limits: `Great-circle distance on a sphere of the selected body's radius; no ellipsoidal flattening, terrain, or geoid correction. The default Earth radius is the WGS-84 equatorial semimajor axis, not a mean radius. ${IEEE}`,
    referenceHint: 'Spherical great-circle formula; compare Earth values with the NGA WGS 84 ellipsoid',
  },
  'elevation-azimuth': {
    modelClass: 'closed-form',
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
  'surface-g-escape': {
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
  'orbital-view': {
    modelClass: 'utility',
    errorClass:
      'Visualization of SGP4 output; accuracy follows the TLE age (kilometres near epoch, degrading fast beyond it).',
    limits: `Ground track, terminator and altitude rendering from a single TLE. Not a tracking service and not flight software. ${IEEE}`,
    referenceHint: 'SGP4 / TEME to geodetic, CelesTrak™ TLE',
  },
  'radiator-net-flux': {
    ...EMP,
    errorClass: 'Lumped view factor and constant environment: tens of percent vs a panel-resolved transient analysis.',
    limits: `Gray flat plate, lumped Earth view factor F, constant environment. The Earth-IR term uses ε (Kirchhoff) by default; the Starcloud 2024 worked example applies α to Earth IR and is reproduced only with a custom α_ir (633 vs 585 W/m² for its inputs). No self-view, no transient shadowing, no fin efficiency. ${IEEE}`,
    referenceHint: 'Gilmore, Spacecraft Thermal Control Handbook; Turyshev 2026 eq. 35; NASA RP-1121 coatings',
  },
  'sso-dawn-dusk': {
    ...J2,
    errorClass: 'β within ~0.05° of a full ephemeris for 1950–2050; eclipse from a cylindrical shadow (minutes-level vs penumbra-resolved).',
    limits: `Circular orbit, J2 secular SSO inclination, Vallado low-precision Sun (0.01°, 1950–2050), LTAN referenced to the true Sun (equation of time ignored, ≤ 4° in Ω−α), cylindrical shadow, daily samples at 00:00 UTC. ${IEEE}`,
    referenceHint: 'Vallado β-angle and shadow analysis; SMAD eclipse geometry',
  },
  'two-phase-loop': {
    ...EMP,
    errorClass: 'Property rows at one reference temperature; real loops vary h_fg, ρ_L and Δp with temperature and quality.',
    limits: `Saturation properties at one reference temperature (NIST rows), Δx as a uniform quality change, same Δp for both loops, liquid-only pump. No pressure-drop model, no two-phase flow regime. ${IEEE}`,
    referenceHint: 'NIST Chemistry WebBook; Gilmore pumped loops',
  },
  'radiator-heat-pump': {
    ...EMP,
    errorClass: 'Ideal-cycle bookkeeping: measured COP or Carnot fraction supplied by the user; compressor mass and facesheet gradients are not modelled.',
    limits: `W = Q/COP, Q_rej = Q + W, radiator at one temperature with a lumped absorbed environment. COP from a measured value or a Carnot fraction; no compressor mass, no facesheet gradient (ICES-2015-35 §C). ${IEEE}`,
    referenceHint: 'ICES-2015-35 (NLR/ESA heat pump demonstrator); Gilmore',
  },
  'odc-power-thermal-sizing': {
    ...UTIL,
    errorClass: 'Linear sizing chain; accuracy follows the user-supplied η, fill, cosθ and net flux.',
    limits: `Array from S·η·fill·cosθ (fold EOL, PMAD and temperature derating into η and cosθ), radiator from a single net flux, areal masses as constants. ${IEEE}`,
    referenceHint: 'Starcloud 2024 white paper (5 GW array); Turyshev 2026 Table X',
  },
  'cold-plate-dt': {
    ...EMP,
    errorClass: 'R_jc and h are user inputs; spreading resistance and boiling are absent (tens of percent on ΔT).',
    limits: `1-D resistance chain, single-phase liquid, uniform h, mean-fluid reference. No spreading resistance, no boiling, no CHF check. R_jc comes from the vendor datasheet. ${IEEE}`,
    referenceHint: 'Lienhard, A Heat Transfer Textbook (resistance networks); NVIDIA Hopper whitepaper anchors',
  },
  'shield-mass-scaling': {
    ...UTIL,
    errorClass: 'Exact geometry; says nothing about dose.',
    limits: `Geometry only: areal density and mass per kW of a box. No dose, no spectrum, no secondary particles. Read a SHIELDOSE-2 / SPENVIS dose-depth curve at the g/cm² shown. ${IEEE}`,
    referenceHint: 'Starcloud 2024 shield scaling argument; SPENVIS SHIELDOSE-2 help',
  },
  'low-thrust-escape': {
    modelClass: 'two-body-exact',
    errorClass:
      'Continuous tangential thrust to E = 0 costs v_circ. Impulsive escape from the same circle is (√2 − 1) v_circ. No 1/r² fade, no GNC, no perihelion-pumping campaign.',
    limits: `Two-body circular parking orbit. ${IEEE}`,
    referenceHint: 'Edelbaum/Beletsky spiral-to-escape; Vallado vis-viva',
  },
  'dsn-array-gain': {
    modelClass: 'rf-communications',
    errorClass:
      'Identical antennas, perfect coherent combining: SNR × N. Real DSN arraying has correlator, delay, and weather losses.',
    limits: `N-antenna SNR sketch. Not a DSN combiner. ${IEEE}`,
    referenceHint: 'Rogstad, Mileant, Pham DESCANSO vol. 5',
  },
  'allan-range-rate': {
    modelClass: 'rf-communications',
    errorClass:
      'White-frequency-noise band only: σ_v = √2 c σ_y. Thornton & Border quote this when the count time is shorter than the RTLT. Flicker and dead-time forms differ.',
    limits: `Clock-to-range-rate teaching model. ${IEEE}`,
    referenceHint: 'Thornton & Border DESCANSO vol. 1; BIPM Allan variance',
  },
}

export function getToolPrecision(toolId: string): ToolPrecision {
  return TOOL_PRECISION[toolId] ?? DEFAULT_PRECISION
}
