/**
 * Default physical-meaning tooltips for tool parameter/result labels.
 * Explicit `tip=` on a field wins; otherwise label is matched case-insensitively.
 */

const TIPS: Record<string, string> = {
  // ── Core orbit ──────────────────────────────────────────────────────────
  altitude: 'Height above the body mean radius (spherical model).',
  'initial altitude': 'Starting circular/reference orbit altitude above body radius.',
  'final altitude': 'Target circular orbit altitude after the transfer.',
  'orbit 1 altitude': 'First circular orbit altitude for visualization / comparison.',
  'orbit 2 altitude': 'Second circular orbit altitude for visualization / comparison.',
  'reference altitude': 'Altitude of the reference circular orbit (target).',
  'parking altitude': 'Low circular parking orbit altitude before departure burn.',
  'periapsis altitude': 'Altitude of periapsis above body radius.',
  'semi-major axis': 'Keplerian semi-major axis a (SI length). Circular: a = r.',
  'semi-major a': 'Keplerian semi-major axis a (SI length).',
  a: 'Semi-major axis of the orbit (SI metres).',
  e: 'Eccentricity (0 circle, 0-1 ellipse, 1 parabola, >1 hyperbola).',
  eccentricity: 'Orbit eccentricity e.',
  r: 'Radial distance from the central-body centre (SI metres).',
  'r₁': 'Initial circular radius from body centre.',
  'r₂': 'Final circular radius from body centre.',
  'apoapsis r_a': 'Apoapsis radius from body centre (farthest point).',
  'periapsis r_p': 'Periapsis radius from body centre (nearest point).',
  'central body': 'Attracting body (catalog μ and radius).',
  body: 'Central body providing μ and mean radius.',
  'gravitational parameter μ': 'μ = GM of the central body (m³/s²).',
  μ: 'Gravitational parameter GM (m³/s²).',
  mu: 'Gravitational parameter GM (m³/s²).',
  'g used': 'Newtonian constant G used in μ = GM for custom bodies.',
  'μ = gm': 'Gravitational parameter computed as G·M.',
  'mass m': 'Body or spacecraft mass (kg).',
  'primary mass': 'Parent body mass for sphere-of-influence estimates (kg).',
  'primary mass m': 'Parent / primary mass in SOI models (kg).',
  'planet mass m': 'Secondary body mass for SOI Laplace estimate (kg).',

  // ── Velocities / energy ─────────────────────────────────────────────────
  'v_∞': 'Hyperbolic excess speed relative to the body at infinity.',
  'v_inf': 'Hyperbolic excess speed v_∞ (m/s).',
  'v_circ': 'Circular orbital speed √(μ/r).',
  'v_esc': 'Local escape speed √(2μ/r).',
  'circular velocity': 'Speed of a circular two-body orbit at radius r.',
  'escape velocity': 'Minimum speed to reach infinity on a parabola.',
  'escape at r': 'Escape speed evaluated at the current radius r.',
  'orbital speed': 'Inertial speed on the two-body trajectory (vis-viva).',
  'specific energy': 'Specific mechanical energy ε = v²/2 − μ/r (J/kg).',
  energy: 'Specific mechanical energy of the orbit (J/kg).',
  'c3 = v_∞²': 'Characteristic energy C3 = v_∞² (launch energy metric).',
  c3: 'Characteristic energy C3 = v_∞² (m²/s² or MJ/kg).',
  'exhaust ve': 'Effective exhaust velocity v_e = I_sp·g₀ (m/s).',
  speed: 'Speed magnitude in the model frame (SI m/s).',
  airspeed: 'Atmosphere-relative speed for dynamic pressure (m/s).',
  'required Δv': 'Impulsive Δv budget to achieve (m/s).',
  'Δv': 'Impulsive velocity change magnitude (m/s).',
  'bielliptic Δv': 'Total three-burn bielliptic Δv cost.',
  'deorbit Δv': 'Δv to lower periapsis for re-entry / disposal.',
  'burn 1': 'First impulsive Δv of the sequence.',
  'burn 2': 'Second impulsive Δv of the sequence.',
  'burn 3': 'Third impulsive Δv of the sequence.',
  'Δv total': 'Sum of impulsive burns in the model.',
  'Δv stage 1': 'Ideal rocket Δv of stage 1.',
  'Δv stage 2': 'Ideal rocket Δv of stage 2.',
  'Δv stage 3': 'Ideal rocket Δv of stage 3.',

  // ── Maneuvers / phasing ─────────────────────────────────────────────────
  'phase gain |Δθ|': 'Along-track phase angle to close via relative drift.',
  'Δa (chaser − target)': 'Semi-major axis offset; negative → faster mean motion.',
  'desired Δa': 'Requested change in semi-major axis (Gauss / linear map).',
  'along-track Δy': 'CW/LVLH along-track separation (m).',
  'n_rel': 'Relative mean motion |n_chaser − n_target| (rad/s).',
  'n (target)': 'Mean motion of the reference circular orbit (rad/s).',
  '|360°| relative period': 'Time for a full 360° of relative phase drift.',
  'time for Δθ': 'Time to accumulate the requested phase angle.',
  'catch-up time': 'Time for chaser to catch the target under period offset.',
  'chaser revs n': 'Number of chaser revolutions during catch-up.',
  'beat / synodic': 'Synodic (beat) period between two mean motions.',
  'days / full raan': 'Days for J2 to complete 360° of nodal regression.',
  'burn at': 'True anomaly or location where the impulse is applied.',
  'cost ratio apo/peri': 'Δv cost of plane change at apoapsis vs periapsis.',

  // ── Propulsion / mass ───────────────────────────────────────────────────
  isp: 'Vacuum specific impulse (s). v_e = I_sp · g₀.',
  'i_sp': 'Vacuum specific impulse in seconds.',
  'isp (vacuum)': 'Vacuum specific impulse (s); v_e = I_sp·g₀.',
  'isp (each stage)': 'Specific impulse assumed equal for every stage (s).',
  mdot: 'Propellant mass-flow rate (kg/s).',
  'mass flow': 'Mass-flow rate (kg/s).',
  'mass flow ṁ': 'Coolant or propellant mass-flow rate (kg/s).',
  thrust: 'Ideal thrust F = ṁ·v_e (N).',
  'force f': 'Force magnitude (N).',
  'drag force': 'Aerodynamic drag magnitude ½ρv²CdA (N).',
  'dry mass': 'Mass without usable propellant (kg).',
  'wet mass': 'Mass including propellant (kg).',
  'final mass m_f': 'Post-burn mass m_f in the rocket equation (kg).',
  'initial mass m₀': 'Pre-burn mass m₀ (kg).',
  'gross m₀': 'Gross lift-off / stack mass (kg).',
  propellant: 'Usable propellant mass (kg).',
  payload: 'Payload mass (kg).',
  'payload mass': 'Payload mass delivered or carried (kg).',
  'payload fraction': 'Payload mass / gross mass.',
  'propellant fraction': 'Propellant mass / gross mass.',
  'structure+other': 'Remaining mass fraction (structure, residuals, …).',
  'structure mass': 'Non-payload non-propellant mass (kg).',
  'active stages': 'Number of stages included in the multi-stage sum.',
  'number of equal stages': 'Count of identical stages in equal-stage model.',
  'stage mass ratio r=m0/mf': 'Per-stage mass ratio m₀/m_f.',
  'ε structural (info)': 'Structural coefficient ε (design note; ideal model uses R^N).',
  'gross / payload (ideal)': 'Ideal gross-to-payload ratio ≈ R^N.',
  'gross mass': 'Implied gross mass from payload × mass ratio.',
  stages: 'Number of stages in the stack model.',
  'mass ratio m₀/m_f': 'Rocket equation mass ratio.',
  'overall mass ratio (ideal equal)': 'Product of equal-stage mass ratios.',
  'm₀/m_f per stage': 'Mass ratio of each equal stage.',
  'Δv per stage': 'Δv delivered by each equal stage.',
  'g₀ used': 'Standard gravity used to convert I_sp to v_e.',

  // ── Time ────────────────────────────────────────────────────────────────
  period: 'Orbital period of the closed two-body orbit (s).',
  'target period': 'Desired period used to solve for a or altitude.',
  'sync period': 'Sidereal rotation period for geosynchronous radius.',
  'period check': 'Period recomputed from resulting a (sanity check).',
  duration: 'Time span for the simulation or budget (s).',
  'trail duration': 'Duration of trajectory samples for the plot.',
  samples: 'Number of discrete samples along the trail.',
  tof: 'Time of flight along the transfer arc (s).',
  'helio tof': 'Heliocentric Hohmann time of flight (s).',
  'synodic window': 'Synodic period between two planetary mean motions.',
  'synodic period': 'Time between aligned geometries of two periods.',
  'time to breakthrough': 'LiOH endurance until CO₂ capacity is spent.',
  'hours of cover': 'Breakthrough time expressed in hours.',
  'endurance at load': 'Battery duration at the stated power draw.',
  'one-way light time': 'Range / c one-way (s).',
  'one-way (nadir)': 'Approximate GEO light time along nadir path.',
  'round-trip (rtt)': '2 × one-way light time.',
  rtt: 'Round-trip light time (s).',
  'fraction in shadow': 'Eclipse fraction of the orbital period.',
  fraction: 'Dimensionless fraction (shadow, duty cycle, …).',

  // ── Angles ──────────────────────────────────────────────────────────────
  inclination: 'Orbital inclination relative to the equatorial plane.',
  'true anomaly ν': 'True anomaly on the ellipse (angle from periapsis).',
  'eccentric anomaly e': 'Eccentric anomaly E (Kepler).',
  'mean anomaly m': 'Mean anomaly M = E − e sin E.',
  'mean anomaly': 'Mean anomaly M of the Kepler problem.',
  angle: 'Angle between two vectors or arcs.',
  'angle unit': 'Unit for latitude/longitude inputs.',
  azimuth: 'Azimuth angle (typically from North toward East).',
  'azimuth (n→e)': 'Topocentric azimuth from North toward East.',
  elevation: 'Elevation angle above the local horizon.',
  'el (raw)': 'Geometric elevation before refraction models.',
  'central angle': 'Great-circle central angle between two points.',
  'angular diameter': 'Apparent angular size of a body of diameter D at range.',
  'plane change Δi': 'Inclination change magnitude for the plane-change burn.',
  'sun incidence': 'Angle from surface normal to the Sun vector.',
  'sun incidence from normal': 'Off-normal angle for solar array / thermal models.',
  'launch latitude': 'Geodetic latitude of the launch site.',
  'target inclination': 'Desired orbital inclination after launch.',
  'launch azimuth (primary)': 'Primary launch azimuth solving for inclination.',
  'launch azimuth (alternate)': 'Supplementary azimuth solution when available.',
  'i_min': 'Minimum inclination reachable from this site latitude.',
  'sso inclination': 'Sun-synchronous inclination for the given altitude.',
  'ideal phase angle': 'Hohmann departure phase angle between planets.',
  'ideal phase': 'Ideal planetary phase for coplanar Hohmann.',
  'turn δ (flyby)': 'Gravity-assist turning angle δ = 2 arcsin(1/e).',

  // ── RF / link ───────────────────────────────────────────────────────────
  frequency: 'Carrier frequency (Hz). λ = c/f.',
  'diameter d': 'Antenna aperture diameter (m).',
  'aperture d': 'Optical/RF aperture diameter (m).',
  range: 'Path length or freestream range (m).',
  'range (for gsd)': 'Slant range used to convert diffraction angle to GSD.',
  'tx power': 'Transmit RF power before antenna gains.',
  'eirp': 'Equivalent isotropic radiated power (dBW).',
  fspl: 'Free-space path loss (dB).',
  'p_r': 'Received power (dBW).',
  'c/n₀': 'Carrier-to-noise density (dB-Hz).',
  'k (deg·factor)': 'Beamwidth factor (≈70° for many parabolic dishes).',
  'hpbw θ': 'Half-power beamwidth of the antenna pattern.',
  λ: 'Wavelength λ = c/f.',
  'θ (1.22 λ/d)': 'Diffraction-limited angular resolution (Airy).',
  'gsd ≈ θ·range': 'Ground sample distance ≈ θ × range.',

  // ── Aero / atmosphere ───────────────────────────────────────────────────
  density: 'Mass density (kg/m³).',
  'density ρ': 'Local freestream or atmospheric density (kg/m³).',
  'ρ₀': 'Reference density at the base of the exponential model.',
  'scale height h': 'Atmospheric scale height H in ρ = ρ₀ exp(−h/H).',
  'cd': 'Drag coefficient for the reference area.',
  'c_d': 'Drag coefficient (dimensionless).',
  'c_r (reflectivity)': 'Radiation-pressure coefficient (~1 absorb, ~2 mirror).',
  'area a': 'Reference area for force models (m²).',
  area: 'Surface or reference area (m²).',
  'array area': 'Solar-array collecting area (m²).',
  mass: 'Spacecraft or vehicle mass (kg).',
  'ballistic coefficient': 'β = m/(Cd A): higher β falls faster through atmosphere.',
  'β = m/(cd a)': 'Ballistic coefficient m/(Cd A).',
  'dynamic pressure': 'q = ½ ρ v² (Pa).',
  'dynamic pressure q': 'Dynamic pressure q = ½ ρ v².',
  mach: 'Mach number v/a_sound.',
  'speed of sound': 'Local speed of sound from the atmosphere model.',
  'isa layer': 'International Standard Atmosphere layer name.',
  'nose radius r_n': 'Effective nose radius for Sutton-Graves heating.',
  'q̇ (sutton-graves)': 'Stagnation-point convective heat flux estimate.',
  'k (earth)': 'Sutton-Graves constant for Earth (SI).',

  // ── Power / thermal ─────────────────────────────────────────────────────
  'electrical power': 'DC electrical power after efficiency and cosine loss.',
  's₀ (1 au)': 'Solar constant at 1 AU (~1361 W/m²).',
  'efficiency η': 'Solar-array conversion efficiency (0-1).',
  'heliocentric r': 'Distance from the Sun (AU or SI length).',
  temperature: 'Thermodynamic temperature (K).',
  'temperature t': 'Absolute temperature of the radiating surface (K).',
  'emissivity ε': 'Thermal emissivity of the surface (0-1).',
  'absorptivity α (for teq)': 'Solar absorptivity used in equilibrium temperature.',
  'radiated q': 'Net radiated thermal power σ ε A T⁴ (W).',
  't_eq (simple)': 'Simple radiative equilibrium temperature.',
  'heat to reject q': 'Heat load that the coolant loop must transport (W).',
  'equipment heat': 'Avionics/payload heat contribution (W).',
  'metabolic heat': 'Crew metabolic heat load (W).',
  'crew+equip load': 'Sum of metabolic and equipment heat (W).',
  'margin vs load': 'Loop capacity minus crew+equipment load (W).',
  'transportable q': 'Heat the flow can carry for the given ΔT (W).',
  'required ṁ': 'Coolant mass flow required for heat load Q (kg/s).',
  'q = ṁ cp Δt': 'Sensible heat transport relation.',
  'allowable Δt': 'Temperature rise allowed across the cold plate (K).',
  'cp used': 'Specific heat of the selected coolant (J/(kg·K)).',
  'ṁ (if water-like gpm)': 'Approximate gallons-per-minute if density ~ water.',
  coolant: 'Coolant fluid selecting cp in the loop model.',
  'bus voltage': 'Electrical bus voltage for energy ↔ capacity conversion.',
  capacity: 'Battery charge capacity (Ah) or LiOH capacity as labeled.',
  'discharge coeff. cd': 'Orifice discharge coefficient (0-1).',

  // ── ECLSS ───────────────────────────────────────────────────────────────
  'free volume v': 'Pressurized free gas volume (m³).',
  'total pressure': 'Cabin total pressure (Pa).',
  'initial ppco₂': 'Initial carbon-dioxide partial pressure.',
  'dry o₂ mole fraction': 'Dry-air O₂ mole fraction before humidity.',
  'relative humidity': 'Relative humidity fraction 0-1.',
  'then simulate metabolism': 'Advance cabin composition with crew metabolism.',
  crew: 'Number of crew in the metabolic model.',
  activity: 'Metabolic activity level (nominal, exercise, …).',
  'dry %o₂': 'Dry oxygen percentage after simulation.',
  'ppo₂': 'Oxygen partial pressure.',
  'ppco₂': 'Carbon-dioxide partial pressure.',
  'm_o₂': 'Mass of oxygen gas in the free volume.',
  'm_co₂': 'Mass of carbon dioxide in the free volume.',
  'm_n₂': 'Mass of nitrogen in the free volume.',
  'm_h₂o': 'Mass of water vapor in the free volume.',
  'lioh mass': 'Mass of lithium-hydroxide bed material (kg).',
  'practical capacity': 'kg CO₂ absorbed per kg LiOH (practical, not stoich).',
  'co₂ load source': 'Crew metabolism vs manual CO₂ rate.',
  'co₂ production': 'Manual CO₂ generation rate.',
  'co₂ capacity': 'Total CO₂ the LiOH bed can take up (kg).',
  'co₂ load': 'CO₂ production rate driving bed consumption.',
  'lioh use rate': 'LiOH mass consumed per day at the load.',
  'stoich. capacity (ref)': 'Theoretical stoichiometric CO₂ capacity reference.',
  'hole diameter': 'Effective leak orifice diameter.',
  'final p': 'Final cabin pressure after leak time.',
  'time p₀ → p₁': 'Depressurization time between pressures.',
  'n₂ mass to restore Δp': 'Nitrogen mass to make up the pressure drop.',
  'orifice area': 'Leak orifice geometric area.',

  // ── RCS / ADCS ──────────────────────────────────────────────────────────
  'inertia i': 'Moment of inertia about the spin/torque axis (kg·m²).',
  'spin rate': 'Wheel or body spin rate (rpm).',
  'angular accel α': 'Angular acceleration α (rad/s²).',
  'momentum h = iω': 'Angular momentum H = Iω.',
  'torque t = iα': 'Torque T = Iα.',
  ω: 'Angular rate ω (rad/s).',
  'impulse bit': 'Minimum impulse bit of the thruster (N·s).',
  'thrust f': 'Thruster force level (N).',
  'burn time': 'Continuous thruster on-time (s).',
  'total impulse': 'Integrated thruster impulse (N·s).',
  'number of bits': 'Count of impulse bits in the budget.',

  // ── Geometry / vectors ──────────────────────────────────────────────────
  ax: 'X component of vector A.',
  ay: 'Y component of vector A.',
  az: 'Z component of vector A (or azimuth if labeled).',
  bx: 'X component of vector B.',
  by: 'Y component of vector B.',
  bz: 'Z component of vector B.',
  'east / north / up': 'Local ENU components of the relative vector.',
  distance: 'Great-circle or Euclidean distance as labeled.',
  'great-circle distance': 'Surface distance along the sphere (R·c).',
  'arrival |Δr| check': 'Norm of Lambert terminal position residual.',
  'above horizon': 'Elevation is positive at the sample time.',
  'aos (utc)': 'Acquisition of signal: elevation crosses mask upward.',
  'los (utc)': 'Loss of signal: elevation crosses mask downward.',
  'propagate at (utc iso)': 'UTC epoch for SGP4 state (ISO-8601). Empty = now. Picker is UTC.',
  'time (utc iso)': 'Sample epoch in UTC (ISO-8601). Empty = now. Picker is UTC, not local TZ.',
  'start (utc iso)': 'Search start epoch in UTC (ISO-8601). Empty = now. Picker is UTC.',
  'trail samples': 'Number of samples along the ground-track / trail.',

  // ── Multi-stage fields ──────────────────────────────────────────────────
  'm₀': 'Stage initial mass including propellant (kg).',
  'm_f': 'Stage final mass after burn (kg).',
  isp1: 'Stage 1 vacuum specific impulse (s).',
  isp2: 'Stage 2 vacuum specific impulse (s).',
  isp3: 'Stage 3 vacuum specific impulse (s).',

  // ── Units tool ──────────────────────────────────────────────────────────
  category: 'Physical dimension group (length, mass flow, density, …).',
  'from unit': 'Unit of the input value before conversion.',
  value: 'Numeric magnitude expressed in the selected unit.',

  // ── Misc results ────────────────────────────────────────────────────────
  'earth rotation boost': 'Eastward surface inertial speed from Earth rotation.',
  'for rotation boost': 'Site latitude is used for rotation boost.',
  'local g': 'Gravitational acceleration μ/r² at radius r.',
  'g_surface': 'Surface gravitational acceleration μ/R².',
  'g_local(r)': 'Local g at r = R + h.',
  'v_esc(r)': 'Escape speed at radius r.',
  'v_circ(r)': 'Circular speed at radius r.',
  'r_soi': 'Approximate Laplace sphere-of-influence radius.',
  'r_soi / a': 'SOI radius normalized by orbital SMA about the primary.',
  'm / m_sun': 'Body mass relative to solar mass.',
  'a (hyperbola)': 'Semi-major axis of the departure hyperbola (negative for e>1 convention varies).',
  'v_p': 'Periapsis speed on the hyperbola.',
  'v_circ park': 'Circular speed on the parking orbit.',
  'Δv parking → hyperbola': 'Impulsive Δv from circular park onto the hyperbola.',
  'Δv (circ → hyper)': 'Δv from circular to hyperbolic excess trajectory.',
  'helio hohmann': 'Heliocentric coplanar Hohmann transfer about the Sun.',
  'departure planet': 'Origin planet for the patched-conic departure.',
  'target planet': 'Destination planet SMA catalog id.',
  solve: 'Which variable the tool solves for.',
  mode: 'Operating mode of the calculator.',
  'solve for': 'Unknown the tool is solving for.',
  'co₂': 'Carbon dioxide related quantity as labeled.',
  name: 'Object name from TLE or catalog.',
  '|r|': 'Position vector magnitude.',
  '|v|': 'Velocity vector magnitude.',
  'r eci': 'ECI position components (m).',
  'ground track pts': 'Number of ground-track samples computed.',
  latitude: 'Geodetic latitude.',
  longitude: 'Geodetic longitude.',
  'height': 'Geodetic height above the ellipsoid/sphere model.',
  'altitude (geo)': 'Height above the body from geodetic conversion.',
}

function norm(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function genericTip(label: string): string {
  const k = norm(label)
  if (/δv|Δv|delta\s*v|\bdv\b|Δv|deorbit|hohmann|bielliptic|impulsive/.test(k)) {
    return 'Impulsive velocity change or Δv-related quantity in the two-body educational model (SI m/s unless labeled otherwise).'
  }
  if (/altitude|height|apoapsis|periapsis|radius|range|distance|sma|semi-major/.test(k)) {
    return 'Length scale in the tool model (altitude above body radius, radius from centre, or path length).'
  }
  if (/inclination|anomaly|azimuth|elevation|phase|bearing|angle|latitude|longitude|degrees|radians/.test(k)) {
    return 'Angular quantity; convert with the unit control when offered (rad SI internally).'
  }
  if (/mass|payload|propellant|m₀|m_f|m0|mf|lioh|o₂|co₂|n₂|h₂o/.test(k)) {
    return 'Mass-related quantity (kg SI unless the unit badge says otherwise).'
  }
  if (/isp|impulse|thrust|force|mdot|flow|newton/.test(k)) {
    return 'Propulsion / force quantity (I_sp in seconds by aerospace convention; force in N; flow in kg/s).'
  }
  if (/power|heat|watt|flux|solar|array|battery|voltage|load|endurance/.test(k)) {
    return 'Power, energy, or thermal quantity in the simplified subsystem model.'
  }
  if (/pressure|density|mach|drag|cd|ballistic|temperature|emiss|absorb/.test(k)) {
    return 'Atmosphere / aero / thermal environment quantity for the educational model.'
  }
  if (/period|time|tof|duration|hours|revs|day|light|rtt|aos|los|epoch|utc/.test(k)) {
    return 'Time-related quantity (seconds SI unless shown as pretty duration or civil time).'
  }
  if (/frequency|gain|eirp|fspl|dbi|dbw|link|beam|aperture|wavelength/.test(k)) {
    return 'RF / optical link quantity (frequency in Hz SI; many gains stay in dB).'
  }
  if (/vector|position|velocity|r eci|ax|ay|az|bx|by|bz|east|north|up/.test(k)) {
    return 'Vector component or state element in the selected reference frame (SI).'
  }
  return `Educational field “${label}”. See the tool assumptions panel for model class and limits.`
}

/** Resolve a tooltip for a UI label (always defined for non-empty labels). */
export function tipForLabel(label: string | undefined | null): string | undefined {
  if (!label?.trim()) return undefined
  const key = norm(label)
  if (TIPS[key]) return TIPS[key]
  // Multi-char soft match only
  let best: { k: string; v: string } | undefined
  for (const [k, v] of Object.entries(TIPS)) {
    if (k.length < 3) continue
    if (key === k) return v
    if (key.includes(k) && (!best || k.length > best.k.length)) best = { k, v }
  }
  if (best) return best.v
  return genericTip(label)
}

/** All catalog keys (tests / coverage). */
export function tipCatalogSize(): number {
  return Object.keys(TIPS).length
}
