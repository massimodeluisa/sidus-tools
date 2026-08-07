/**
 * Static formula / copy catalog for OG cards (homepage visual language).
 * Keep formulas short: must read at ~400px card width.
 */

export type ToolOgMeta = {
  formula: string
  accent: string
  blurb: string
}

export const TOOL_OG: Record<string, ToolOgMeta> = {
  'circular-orbit': {
    formula: 'v = √(μ/r)   T = 2π √(a³/μ)   ε = −μ/(2a)',
    accent: '#7a9bb8',
    blurb: 'Circular orbit velocity, period & energy',
  },
  hohmann: {
    formula: 'Δv = |vₚ − v₁| + |v₂ − vₐ|   TOF = π √(a³/μ)',
    accent: '#e8d5a3',
    blurb: 'Minimum two-burn coplanar transfer',
  },
  escape: {
    formula: 'v_esc = √(2μ/r)   v_esc / v_circ = √2',
    accent: '#c47a5a',
    blurb: 'Leave the gravitational well',
  },
  bielliptic: {
    formula: '3 burns via r_b  ·  Δv_tot = Σ |Δv_i|',
    accent: '#e8d5a3',
    blurb: 'Three-burn transfer for large radius ratios',
  },
  'plane-change': {
    formula: 'Δv = 2 v sin(Δi / 2)',
    accent: '#9ec4c8',
    blurb: 'Pure inclination change cost',
  },
  'vis-viva': {
    formula: 'v = √[ μ (2/r − 1/a) ]',
    accent: '#7a9bb8',
    blurb: 'Speed anywhere on the conic',
  },
  'kepler-propagate': {
    formula: 'r(t), v(t) ← χ  ·  √μ (t−t₀) = f(χ, α, r₀, v₀)',
    accent: '#c4a882',
    blurb: 'Two-body state propagation (AGC class)',
  },
  lambert: {
    formula: 'r₁, r₂, TOF → v₁⁻, v₂⁺  ·  z universal',
    accent: '#c4a882',
    blurb: 'Transfer orbit from boundary conditions',
  },
  'rv-elements': {
    formula: 'h = r × v  ·  e = (v×h)/μ − r̂  ·  a = 1/(2/r − v²/μ)',
    accent: '#9a9a9a',
    blurb: 'Cartesian ↔ classical elements',
  },
  apsides: {
    formula: 'r_p = a(1−e)   r_a = a(1+e)   v_p, v_a via vis-viva',
    accent: '#7a9bb8',
    blurb: 'Periapsis & apoapsis geometry',
  },
  sgp4: {
    formula: 'TLE → r_TEME(t), v_TEME(t)  ·  SGP4/SDP4',
    accent: '#5a7ab0',
    blurb: 'NORAD element set propagation',
  },
  'look-angles': {
    formula: 'ρ = r_sat − r_site  ·  az, el, |ρ|',
    accent: '#5a7ab0',
    blurb: 'Ground-station pointing',
  },
  'pass-predict': {
    formula: 'AOS: el↑mask  ·  t_max @ ėl=0  ·  LOS: el↓mask',
    accent: '#5a7ab0',
    blurb: 'Visible pass timing',
  },
  'j2-drift': {
    formula: 'Ω̇ = −³⁄₂ n J₂ (R/p)² cos i',
    accent: '#9ec4c8',
    blurb: 'Secular nodal precession',
  },
  'rocket-equation': {
    formula: 'Δv = I_sp g₀ ln(m₀ / m_f)',
    accent: '#c47a5a',
    blurb: 'Tsiolkovsky ideal rocket',
  },
  'multi-stage': {
    formula: 'Δv = Σ v_e,i ln(m₀,i / m_f,i)',
    accent: '#c47a5a',
    blurb: 'Staged mass & Δv budget',
  },
  plotter: {
    formula: 'y = f(x)  ·  offline SVG plot',
    accent: '#c4c8ce',
    blurb: 'Function analysis workspace',
  },
  units: {
    formula: 'x_SI = x · s  ·  AU, ly, pc, g, km/s ↔ SI',
    accent: '#c4c8ce',
    blurb: 'Aerospace unit conversion',
  },
  bodies: {
    formula: 'μ = GM  ·  r_SOI ≈ a (m/M)^{2/5}  ·  g = μ/R²',
    accent: '#e8d5a3',
    blurb: 'Central body constants',
  },
  'launch-azimuth': {
    formula: 'cos i = cos φ · sin β   ·   v_rot = ω R cos φ',
    accent: '#c4a882',
    blurb: 'Range azimuth & Earth boost',
  },
  sso: {
    formula: 'Ω̇_J2 = −ω_sun  →  i_SSO(a)',
    accent: '#7a9bb8',
    blurb: 'Sun-synchronous inclination',
  },
  'dynamic-pressure': {
    formula: 'q = ½ ρ v²   ·   M = v / a  (ISA)',
    accent: '#c47a5a',
    blurb: 'Max-q & Mach on ascent',
  },
  'cw-rendezvous': {
    formula: 'ẍ − 3n²x − 2nẏ = 0  ·  two-impulse → origin',
    accent: '#9ec4c8',
    blurb: 'Relative docking-class transfer',
  },
  'link-budget': {
    formula: 'L_fs = 20 log d_km + 20 log f_MHz + 32.44',
    accent: '#5a7ab0',
    blurb: 'Free-space RF link margin',
  },
  phasing: {
    formula: 'T_c = T_t + δθ / (N n_t)   ·   Δv enter/exit',
    accent: '#e8d5a3',
    blurb: 'Coplanar phasing for rendezvous',
  },
  'metabolic-load': {
    formula: 'ṁ = ṅ · N_crew · t  ·  O₂, CO₂, H₂O, Q̇',
    accent: '#6b8f71',
    blurb: 'ECLSS metabolic sizing',
  },
  'cabin-atmosphere': {
    formula: 'p_i V = n_i R T   ·   ppO₂ / ppCO₂',
    accent: '#6b8f71',
    blurb: 'Ideal-gas cabin partial pressures',
  },
  'lioh-scrubber': {
    formula: 't = (m_LiOH · κ) / ṁ_CO₂',
    accent: '#6b8f71',
    blurb: 'LiOH canister duration',
  },
  'cabin-leak': {
    formula: 't ≈ τ ln(P₀/P₁)  ·  choked orifice',
    accent: '#a65d5d',
    blurb: 'Depressurization estimate',
  },
  'thermal-loop': {
    formula: 'Q̇ = ṁ c_p ΔT',
    accent: '#b8a55a',
    blurb: 'Coolant loop heat transport',
  },
  'custom-body': {
    formula: 'μ = G M   ·   v_esc = √(2μ/r)   ·   r_SOI ≈ a(m/M)^{2/5}',
    accent: '#e8d5a3',
    blurb: 'Custom body from mass and radius',
  },
  'hyperbolic-c3': {
    formula: 'C3 = v_∞²   ·   v_p = √(v_∞² + 2μ/r)',
    accent: '#c47a5a',
    blurb: 'Hyperbolic excess and departure Δv',
  },
  'hohmann-plane': {
    formula: 'Δv = Δv_H + 2 v_a sin(Δi/2)  ·  plane @ apo',
    accent: '#e8d5a3',
    blurb: 'Combined transfer and inclination',
  },
  'propellant-mass': {
    formula: 'm₀ = m_f exp(Δv/(Isp g₀))',
    accent: '#c47a5a',
    blurb: 'Propellant load from Δv',
  },
  'ideal-thrust': {
    formula: 'F = ṁ v_e   ·   Isp = v_e / g₀',
    accent: '#c47a5a',
    blurb: 'Ideal vacuum thrust',
  },
  soi: {
    formula: 'r_SOI ≈ a (m/M)^{2/5}',
    accent: '#e8d5a3',
    blurb: 'Patched-conic sphere of influence',
  },
  'synodic-period': {
    formula: 'T_syn = 2π / |n₂ − n₁|',
    accent: '#9ec4c8',
    blurb: 'Relative period of two circular orbits',
  },
  'eclipse-duration': {
    formula: 't_ecl ≈ T β/π   (cylindrical shadow)',
    accent: '#5a7ab0',
    blurb: 'Circular-orbit eclipse estimate',
  },
  'light-time': {
    formula: 't = d / c',
    accent: '#5a7ab0',
    blurb: 'One-way and round-trip light time',
  },
  'solar-pressure': {
    formula: 'F ≈ P₀ A C_r (AU/r)²',
    accent: '#b8a55a',
    blurb: 'Solar radiation pressure force',
  },
  'ballistic-drag': {
    formula: 'β = m/(C_d A)   ·   Δv/rev ∼ πρ a v / β',
    accent: '#c47a5a',
    blurb: 'Ballistic coefficient and drag order',
  },
  circularize: {
    formula: 'Δv = |v_ell − v_c| at apsis',
    accent: '#7a9bb8',
    blurb: 'Circularize an elliptical orbit',
  },
  'geo-orbit': {
    formula: 'a³ = μ T² / (4π²)',
    accent: '#7a9bb8',
    blurb: 'Synchronous / GEO radius',
  },
  'delta-a-burn': {
    formula: 'Δa ≈ 2 a Δv / v',
    accent: '#9ec4c8',
    blurb: 'Tangential burn changes semi-major axis',
  },
  'plane-change-apo': {
    formula: 'Δv = 2 v sin(Δi/2)   (cheaper at apo)',
    accent: '#9ec4c8',
    blurb: 'Plane change at peri vs apo',
  },
  'delta-v-budget': {
    formula: 'Δv_tot = Σ Δv_i',
    accent: '#c47a5a',
    blurb: 'Multi-phase mission Δv budget',
  },
  'heat-flux': {
    formula: 'q̇ = k √(ρ/R_n) v³',
    accent: '#a65d5d',
    blurb: 'Sutton-Graves entry heat flux',
  },
  coelliptic: {
    formula: 'n_rel ≈ −(3/2) n (Δa/a)',
    accent: '#9ec4c8',
    blurb: 'Coelliptic relative drift',
  },
  'los-range-rate': {
    formula: 'ρ = |r|   ·   ρ̇ = (r·v)/ρ',
    accent: '#9ec4c8',
    blurb: 'Line-of-sight range and range-rate',
  },
  oberth: {
    formula: 'Δε = v Δv + ½ Δv²',
    accent: '#e8d5a3',
    blurb: 'Oberth energy gain',
  },
  'horizon-range': {
    formula: 'd = √(2 R h + h²)',
    accent: '#5a7ab0',
    blurb: 'Geometric radio horizon',
  },
  'antenna-beamwidth': {
    formula: 'θ ≈ k λ / D',
    accent: '#5a7ab0',
    blurb: 'Parabolic antenna HPBW',
  },
  deorbit: {
    formula: 'Δv = v_c − v_a   ·   lower periapsis',
    accent: '#c47a5a',
    blurb: 'Deorbit burn from circular',
  },
  'equal-stage': {
    formula: 'm₀/m_f = exp((Δv/N)/(Isp g₀))',
    accent: '#c47a5a',
    blurb: 'Equal-stage mass ratio',
  },
  'mean-motion': {
    formula: 'n = √(μ/a³)',
    accent: '#7a9bb8',
    blurb: 'Circular mean motion and period',
  },
  'solar-array': { formula: 'P = S₀ η A cosθ / r²', accent: '#b8a55a', blurb: 'Solar array electrical power' },
  battery: { formula: 'E = C·V   ·   t = E/P', accent: '#b8a55a', blurb: 'Battery energy and endurance' },
  rcs: { formula: 'Δv = F t / m', accent: '#c47a5a', blurb: 'RCS impulse and Δv' },
  'angular-diameter': { formula: 'α = 2 arctan(R/d)', accent: '#c4c8ce', blurb: 'Apparent angular size' },
  diffraction: { formula: 'θ ≈ 1.22 λ/D', accent: '#5a7ab0', blurb: 'Diffraction resolution / GSD' },
  'thermal-rad': { formula: 'Q = ε σ A T⁴', accent: '#b8a55a', blurb: 'Thermal radiation and Teq' },
  'drag-force': { formula: 'F_d = ½ ρ v² C_d A', accent: '#c47a5a', blurb: 'Atmospheric drag force' },
  'reaction-wheel': { formula: 'H = Iω   ·   T = Iα', accent: '#9ec4c8', blurb: 'Reaction wheel momentum' },
  'apo-raise': { formula: 'Δv = v_p − v_c  (raise apo)', accent: '#e8d5a3', blurb: 'Apoapsis raise from circular' },
  'ground-track': { formula: 'ΔL ≈ −ω_E T per rev', accent: '#5a7ab0', blurb: 'Ground-track longitude shift' },
  'along-track': { formula: 'Δy ≈ a ΔM', accent: '#9ec4c8', blurb: 'Along-track separation' },
  'period-match': { formula: 'a³ = μ T²/(4π²)', accent: '#7a9bb8', blurb: 'Orbit from target period' },
  'eclipse-beta': { formula: 't_ecl = t_ecl(β)', accent: '#5a7ab0', blurb: 'Eclipse vs β-angle' },
  'hohmann-time': { formula: 'TOF = π √(a³/μ)', accent: '#e8d5a3', blurb: 'Hohmann time of flight' },
  'orbital-energy': { formula: 'ε = −μ/(2a)', accent: '#7a9bb8', blurb: 'Specific orbital energy' },
  'true-anomaly': { formula: 'r = a(1−e²)/(1+e cos ν)', accent: '#7a9bb8', blurb: 'Radius at true anomaly' },
  'flyby-speed': { formula: 'v_p = √(v_∞² + 2μ/r)', accent: '#c47a5a', blurb: 'Flyby periapsis speed' },
  'nodal-period': { formula: 'T_Ω = 2π / |Ω̇|', accent: '#5a7ab0', blurb: 'RAAN nodal period' },
  'eccentric-anomaly': { formula: 'M = E − e sin E', accent: '#7a9bb8', blurb: 'Kepler anomalies' },
  'scale-height': { formula: 'ρ = ρ₀ e^{−h/H}', accent: '#c47a5a', blurb: 'Exponential atmosphere' },
  'rendezvous-catchup': { formula: 'N ≈ (φ/2π) T₁/|ΔT|', accent: '#9ec4c8', blurb: 'Natural catch-up phasing' },
  'impulse-budget': { formula: 'I = N F t_min', accent: '#c47a5a', blurb: 'RCS impulse-bit budget' },
  'sso-period': { formula: 'i_SSO + T(a)', accent: '#7a9bb8', blurb: 'SSO inclination and period' },
  'mass-ratio-stack': { formula: 'm_gross/m_pl ≈ R^N', accent: '#c47a5a', blurb: 'Equal-stage stack mass' },
  'critical-inclination': { formula: 'cos² i = 1/5', accent: '#9ec4c8', blurb: 'Critical inclination' },
  'relative-period': { formula: 'ΔT = T₂ − T₁', accent: '#7a9bb8', blurb: 'Relative orbital period' },
  'energy-vinf': { formula: 'v_∞ = √(2ε)', accent: '#c47a5a', blurb: 'Energy to v_∞' },
  'geo-light-time': { formula: 't = h/c (GEO)', accent: '#5a7ab0', blurb: 'GEO light time' },
  'payload-fraction': { formula: 'f_pl = m_pl/m₀', accent: '#c47a5a', blurb: 'Payload mass fraction' },
  'specific-angular-momentum': { formula: 'h = √(μa(1−e²))', accent: '#7a9bb8', blurb: 'Specific angular momentum' },
  'escape-margin': { formula: 'Δv = (√2−1)v_c', accent: '#c47a5a', blurb: 'Circular to escape Δv' },
  'spherical-distance': {
    formula: 'cos c = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos Δλ',
    accent: '#9ec4c8',
    blurb: 'Great-circle distance on a sphere',
  },
  'elevation-azimuth': {
    formula: 'el, az from ENU · ρ = |r_tgt − r_site|',
    accent: '#9ec4c8',
    blurb: 'Topocentric elevation & azimuth',
  },
  'vector-angle': {
    formula: 'cos θ = (a·b) / (|a||b|)',
    accent: '#9ec4c8',
    blurb: 'Angle between two vectors',
  },
  'helio-hohmann': {
    formula: 'Δv_☉ = |v_p − v₁| + |v₂ − v_a|  ·  T_syn = 2π/|n₂−n₁|',
    accent: '#e8d5a3',
    blurb: 'Heliocentric planet-to-planet Hohmann',
  },
  'patched-conic-depart': {
    formula: 'v_∞ ≈ |v_t − v_p| · C3 = v_∞² · Δv_park',
    accent: '#c47a5a',
    blurb: 'Patched-conic departure burn',
  },
  'surface-access': {
    formula: 'g = μ/R² · v_esc · v_circ(h)',
    accent: '#b0b0b0',
    blurb: 'Surface g, escape, parking orbit',
  },
  'orbit-3d': {
    formula: 'r(ν) = a(1−e²)/(1+e cos ν)  ·  3D Kepler rings',
    accent: '#7a9bb8',
    blurb: 'Interactive 3D orbit view',
  },
  'isentropic-nozzle': {
    formula: "Me² = 2/(γ−1) [(pe/pc)^{−(γ−1)/γ} − 1]  ·  ε = Ae/At",
    accent: '#c47a5a',
    blurb: "Isentropic rocket nozzle",
  },
  'characteristic-velocity-cstar': {
    formula: "c* = pc At / ṁ · c*_ideal(γ,R,Tc)",
    accent: '#7a9bb8',
    blurb: "Characteristic velocity c*",
  },
  'throat-area-sizing': {
    formula: "At = F / (Cf pc)",
    accent: '#9ec4c8',
    blurb: "Nozzle throat area from thrust",
  },
  'rocket-thrust-chamber': {
    formula: "F = Cf pc At",
    accent: '#e8d5a3',
    blurb: "Thrust from chamber Cf",
  },
  'mixture-ratio': {
    formula: "r = ṁ_ox / ṁ_fuel · ṁ = ṁ_ox+ṁ_fuel",
    accent: '#b0b0b0',
    blurb: "Oxidizer/fuel mixture ratio",
  },
  'tank-ullage': {
    formula: "m = V · fill · ρ",
    accent: '#a8c5a0',
    blurb: "Tank propellant mass",
  },
  'blowdown-tank': {
    formula: "p₂ = p₁ (V₁/V₂)^γ",
    accent: '#c47a5a',
    blurb: "Blowdown tank pressure",
  },
  'propellant-density-impulse': {
    formula: "ρIsp = ρ · Isp  ·  figure of merit",
    accent: '#7a9bb8',
    blurb: "Density specific impulse",
  },
  'cold-gas-thrust': {
    formula: "F = ṁ ve",
    accent: '#9ec4c8',
    blurb: "Cold-gas thruster force",
  },
  'ion-thruster-efficiency': {
    formula: "η = T² / (2 ṁ P)",
    accent: '#e8d5a3',
    blurb: "Ion thruster efficiency",
  },
  'hall-thruster-isp': {
    formula: "ve = √(2 q V / m_ion) · Isp = ve/g₀",
    accent: '#b0b0b0',
    blurb: "Hall thruster Isp sketch",
  },
  'gnss-pseudorange': {
    formula: "ρ = c Δt + c δt",
    accent: '#a8c5a0',
    blurb: "GNSS pseudorange",
  },
  'gnss-geometry-gdop': {
    formula: "GDOP = √tr((HᵀH)⁻¹)",
    accent: '#c47a5a',
    blurb: "GNSS dilution of precision",
  },
  'laser-link-budget': {
    formula: "Pr ∝ Pt Gt Gr (λ/4πR)²",
    accent: '#7a9bb8',
    blurb: "Optical free-space link",
  },
  'laser-pointing-jitter': {
    formula: "r_spot = R · θ",
    accent: '#9ec4c8',
    blurb: "Laser spot from jitter",
  },
  'laser-time-of-flight': {
    formula: "R = c · Δt / 2 (RTT)",
    accent: '#e8d5a3',
    blurb: "Laser ranging TOF",
  },
  'impedance-matching': {
    formula: "Γ = (ZL−Z0)/(ZL+Z0) · VSWR",
    accent: '#b0b0b0',
    blurb: "Reflection coefficient & VSWR",
  },
  'antenna-gain-effective': {
    formula: "Ae = G λ² / (4π)",
    accent: '#a8c5a0',
    blurb: "Effective aperture from gain",
  },
  'doppler-shift-leo': {
    formula: "fd = f0 · vr / c",
    accent: '#c47a5a',
    blurb: "Radial Doppler shift",
  },
  'radar-equation': {
    formula: "Pr = Pt G² λ² σ / ((4π)³ R⁴)",
    accent: '#7a9bb8',
    blurb: "Monostatic radar equation",
  },
  'rain-attenuation-simple': {
    formula: "A = k R^α L",
    accent: '#9ec4c8',
    blurb: "Simple rain attenuation",
  },
  'ttc-ebno': {
    formula: "Eb/N0 = (C/N0) / Rb",
    accent: '#e8d5a3',
    blurb: "Eb/N0 from C/N0",
  },
  'optical-ber-q': {
    formula: "Q ≈ √SNR",
    accent: '#b0b0b0',
    blurb: "Optical Q-factor sketch",
  },
  'gnss-troposphere-delay': {
    formula: "d_trop ≈ 0.002277 sec z (P + …)  ·  Saastamoinen",
    accent: '#a8c5a0',
    blurb: "Tropospheric delay",
  },
  'free-fall-time': {
    formula: "t = √(2h/g) · v = √(2gh)",
    accent: '#c47a5a',
    blurb: "Constant-g free fall",
  },
  'ballistic-range': {
    formula: "R = v₀² sin(2γ) / g",
    accent: '#7a9bb8',
    blurb: "Flat-Earth ballistic range",
  },
  'terminal-velocity': {
    formula: "v = √(2mg / (ρ Cd A))",
    accent: '#9ec4c8',
    blurb: "Terminal velocity",
  },
  'parachute-descent': {
    formula: "v = √(2mg / (ρ Cd A))",
    accent: '#e8d5a3',
    blurb: "Parachute descent rate",
  },
  'coordinated-turn-bank': {
    formula: "tan φ = v² / (g R)",
    accent: '#b0b0b0',
    blurb: "Coordinated turn bank angle",
  },
  'slew-rate-pointing': {
    formula: "t = 2√(Δθ/α)  or  Δθ/ω + ω/α  ·  bang-coast-bang",
    accent: '#a8c5a0',
    blurb: "Rest-to-rest slew time",
  },
  'magnetic-torque': {
    formula: "τ = m B sin θ",
    accent: '#c47a5a',
    blurb: "Magnetic torque rod",
  },
  'gravity-gradient-torque': {
    formula: "τ ≈ (3μ/r³) ΔI sin 2δ / 2",
    accent: '#7a9bb8',
    blurb: "Gravity-gradient torque",
  },
  'rw-momentum-capacity': {
    formula: "h = I ω",
    accent: '#9ec4c8',
    blurb: "Reaction-wheel momentum",
  },
  'sun-sensor-cone': {
    formula: "θ = acos(n·ŝ)",
    accent: '#e8d5a3',
    blurb: "Sun-sensor cone angle",
  },
  'star-tracker-noise': {
    formula: "σ ≈ pixel / √N",
    accent: '#b0b0b0',
    blurb: "Star-tracker noise estimate",
  },
  'constellation-walker': {
    formula: "T/P planes · ΔL = 2π/P",
    accent: '#a8c5a0',
    blurb: "Walker constellation spacing",
  },
  'coverage-swath': {
    formula: "w = 2 R λ  ·  λ = asin((R+h)/R · sin(α)) − α",
    accent: '#c47a5a',
    blurb: "Ground coverage swath",
  },
  'revisit-time-simple': {
    formula: "t_rev ~ T_orb × strips",
    accent: '#7a9bb8',
    blurb: "Rough revisit time",
  },
  'geo-stationkeeping-dv': {
    formula: "Δv_year = Δv_NS + Δv_EW",
    accent: '#9ec4c8',
    blurb: "GEO stationkeeping Δv",
  },
  'geo-propellant-budget': {
    formula: "m_p = m_f (e^{Δv/(Isp g₀)} − 1)  ·  Δv = Δv̇ · life",
    accent: '#e8d5a3',
    blurb: "GEO propellant budget",
  },
  'drag-make-up-dv': {
    formula: "Δv/rev ≈ π ρ a v / β",
    accent: '#b0b0b0',
    blurb: "Drag make-up Δv per rev",
  },
  'tisserand-parameter': {
    formula: "T = a_p/a + 2 cos i √(a/a_p (1−e²))",
    accent: '#a8c5a0',
    blurb: "Tisserand parameter",
  },
  'eps-orbit-average': {
    formula: "P_avg = P_sun (1−f_ecl) η",
    accent: '#c47a5a',
    blurb: "Orbit-average EPS power",
  },
  'relativity-clock-rate': {
    formula: "Δf/f ≈ ΔΦ/c² − v²/(2c²)",
    accent: '#7a9bb8',
    blurb: "Relativistic clock rate",
  },
  'gnss-ionosphere-klobuchar': {
    formula: "d_iono ∝ TEC / f² · m(el)",
    accent: '#c47a5a',
    blurb: "Klobuchar-class iono delay",
  },
  'optical-gsd': {
    formula: "GSD ≈ h · IFOV",
    accent: '#7a9bb8',
    blurb: "Optical ground sample distance",
  },
  'solar-sail-accel': {
    formula: "a = 2 η P A / (c m)",
    accent: '#9ec4c8',
    blurb: "Solar sail acceleration",
  },
  'finite-burn-dv': {
    formula: "Δv = ve ln(m0/mf)",
    accent: '#e8d5a3',
    blurb: "Finite-burn rocket Δv",
  },
  'b-plane-impact': {
    formula: "b = (μ/v∞²) / tan(δ/2)",
    accent: '#b0b0b0',
    blurb: "B-plane impact parameter",
  },
  'cr3bp-jacobi': {
    formula: "C = x²+y²+2U − v²",
    accent: '#a8c5a0',
    blurb: "CR3BP Jacobi constant",
  },
  'orbit-lifetime-rough': {
    formula: "t ≈ H β / (ρ v)",
    accent: '#c47a5a',
    blurb: "Rough LEO drag lifetime",
  },
  'geo-drift-rate': {
    formula: "λ̇ ∝ −(a − a_GEO)/a_GEO",
    accent: '#7a9bb8',
    blurb: "GEO longitude drift rate",
  },
  'stefan-boltzmann': {
    formula: "P = ε σ A T⁴",
    accent: '#9ec4c8',
    blurb: "Stefan–Boltzmann radiation",
  },
  'wien-peak': {
    formula: "λ_max = b / T",
    accent: '#e8d5a3',
    blurb: "Wien peak wavelength",
  },
  'thruster-impulse-bit': {
    formula: "I_bit = F · t_on",
    accent: '#b0b0b0',
    blurb: "Thruster impulse bit",
  },
  'arg-perigee-drift-j2': {
    formula: "ω̇_J2 ∝ n J2 (R/p)² (5c²−1)",
    accent: '#a8c5a0',
    blurb: "J2 argument of perigee drift",
  },
  'sar-azimuth-resolution': {
    formula: "δ_az ≈ λ / (2 θ)",
    accent: '#c47a5a',
    blurb: "SAR azimuth resolution",
  },
  'radar-range-resolution': {
    formula: "δ_r = c / (2 B)",
    accent: '#7a9bb8',
    blurb: "Radar range resolution",
  },
  'link-margin': {
    formula: "M = CN0 − CN0_req",
    accent: '#9ec4c8',
    blurb: "RF link margin",
  },
  'aerobraking-pass': {
    formula: "Δv ≈ ½ β⁻¹ ρ v L",
    accent: '#e8d5a3',
    blurb: "Aerobraking pass Δv",
  },
  'diffraction-limit': {
    formula: "θ ≈ 1.22 λ / D",
    accent: '#b0b0b0',
    blurb: "Diffraction-limited angle",
  },
  'panel-eol-power': {
    formula: "P = P0 (1−d)^y",
    accent: '#a8c5a0',
    blurb: "Solar panel EOL power",
  },
  'magnetorquer-moment': {
    formula: "m = N I A",
    accent: '#c47a5a',
    blurb: "Magnetorquer dipole moment",
  },
  'hyperbolic-eccentricity': {
    formula: "e = 1 + rp v∞² / μ",
    accent: '#7a9bb8',
    blurb: "Hyperbolic eccentricity",
  },
  'capture-circularize': {
    formula: "Δv = vp_hyp − v_circ",
    accent: '#9ec4c8',
    blurb: "Capture circularize burn",
  },
  'gravity-loss': {
    formula: "Δv_gl ≈ g t sin γ",
    accent: '#e8d5a3',
    blurb: "Gravity-loss sketch",
  },
  'battery-dod': {
    formula: "DoD = E_used / E_cap",
    accent: '#b0b0b0',
    blurb: "Battery depth of discharge",
  },
  'umbra-length': {
    formula: "L = Rb d / (Rs − Rb)",
    accent: '#a8c5a0',
    blurb: "Geometric umbra length",
  },
  'mean-anomaly-from-e': {
    formula: "M = E − e sin E",
    accent: '#c47a5a',
    blurb: "Mean anomaly from E",
  },
  'flight-path-angle': {
    formula: "tan φ = e sin ν / (1+e cos ν)",
    accent: '#7a9bb8',
    blurb: "Orbital flight-path angle",
  },
  'hoop-stress': {
    formula: "σ = p r / t",
    accent: '#c47a5a',
    blurb: "Thin-wall hoop stress",
  },
  'exponential-density': {
    formula: "ρ = ρ0 e^(−h/H)",
    accent: '#7a9bb8',
    blurb: "Exponential atmosphere density",
  },
  'hill-sphere': {
    formula: "r_H ≈ a (m/(3M))^{1/3}",
    accent: '#9ec4c8',
    blurb: "Hill sphere radius",
  },
  'edelbaum-dv': {
    formula: "Δv = √(v₁² + v₂² − 2 v₁ v₂ cos(π Δi / 2))",
    accent: '#e8d5a3',
    blurb: "Low-thrust Edelbaum Δv",
  },
  'repeating-ground-track': {
    formula: "T = n_days · 86400 / k",
    accent: '#b0b0b0',
    blurb: "Repeating ground-track period",
  },
  'pointing-budget-rss': {
    formula: "σ = √Σ σ_i²",
    accent: '#a8c5a0',
    blurb: "RSS pointing budget",
  },
  'boiloff-rate': {
    formula: "ṁ = Q̇ / h_fg",
    accent: '#c47a5a',
    blurb: "Cryogen boiloff rate",
  },
  'residual-dipole-torque': {
    formula: "τ = m_res B",
    accent: '#7a9bb8',
    blurb: "Residual dipole torque",
  },
  'solar-flux-distance': {
    formula: "S = S0 (1 AU/r)²",
    accent: '#9ec4c8',
    blurb: "Solar flux vs distance",
  },
  'nyquist-rate': {
    formula: "f_s ≥ 2 f_max",
    accent: '#e8d5a3',
    blurb: "Nyquist sample rate",
  },
  'data-volume': {
    formula: "V = R · T · η",
    accent: '#b0b0b0',
    blurb: "Downlink data volume",
  },
  'earth-ir-flux': {
    formula: "F ≈ σ T_e⁴ (R/(R+h))²",
    accent: '#a8c5a0',
    blurb: "Earth IR flux at altitude",
  },
}

export function toolOgMeta(toolId: string): ToolOgMeta {
  return (
    TOOL_OG[toolId] ?? {
      formula: 'Pure SI · educational model',
      accent: '#c4c8ce',
      blurb: 'SIDUS space engineering tool',
    }
  )
}
