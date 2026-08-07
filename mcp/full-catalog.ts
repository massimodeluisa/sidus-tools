/**
 * Full SIDUS MCP tool catalog (auto-maintained structure).
 * Every educational pure-SI calculator exposed as an MCP tool.
 */
import * as z from 'zod/v4'
import {
  EARTH_MU,
  EARTH_RADIUS,
  BODIES,
  getBody,
  circularOrbitVelocity,
  orbitalPeriod,
  escapeVelocity,
  localGravity,
  specificEnergyCircular,
  visViva,
  hohmannTransfer,
  biellipticTransfer,
  planeChangeDeltaV,
  multiStageDeltaV,
  apsidesWithSpeeds,
  rocketDeltaV,
  j2RaanRate,
  j2ArgpRate,
  launchAzimuth,
  ssoInclination,
  isaAtmosphere,
  dynamicPressure,
  machNumber,
  cwMeanMotion,
  cwTwoImpulseToOrigin,
  linkBudget,
  phasingOrbit,
  metabolicBudget,
  cabinFromMasses,
  cabinMassesFromComposition,
  liohDuration,
  leakDepressTime,
  coolantMassFlow,
  muFromMass,
  sphereOfInfluence,
  surfaceGravity,
  departureBurnFromCircular,
  characteristicEnergy,
  hyperbolicEccentricity,
  gravityAssistTurn,
  hohmannWithPlaneChange,
  propellantForDeltaV,
  idealThrust,
  synodicPeriod,
  circularEclipseDuration,
  lightTime,
  lightTimeRoundTrip,
  solarRadiationForce,
  solarRadiationAccel,
  ballisticCoefficient,
  dragDeltaVPerRev,
  exponentialDensity,
  circularizeBurn,
  geoRadius,
  deltaAFromTangentialDv,
  planeChangeAtApsides,
  suttonGravesHeatFlux,
  coellipticDrift,
  timeForPhaseGain,
  losRangeRate,
  oberthCompare,
  deorbitBurn,
  meanMotionFromAltitude,
  solarArrayPower,
  rcsDeltaV,
  apoapsisRaiseFromCircular,
  deltaVBudget,
  equalStageMassRatio,
  semiMajorFromPeriod,
  horizonSlantRange,
  antennaBeamwidth,
  batteryEnergyJ,
  batteryEndurance,
  angularDiameter,
  diffractionResolution,
  thermalRadiatedPower,
  dragForce,
  wheelMomentum,
  wheelTorque,
  alongTrackFromDeltaM,
  groundTrackShiftPerOrbit,
  eclipseWithBeta,
  meanAnomalyFromE,
  thrusterImpulseBit,
  greatCircleDistance,
  topocentricElAz,
  angleBetween,
  heliocentricHohmann,
  surfaceAccess,
  isentropicNozzle,
  isentropicExitVelocity,
  characteristicVelocity,
  idealCstar,
  throatAreaFromThrust,
  thrustFromCf,
  mixtureRatio,
  tankPropellantMass,
  blowdownPressureIsothermal,
  blowdownPressureIsentropic,
  densityImpulse,
  coldGasThrust,
  ionThrusterEfficiency,
  hallExitVelocity,
  gnssPseudorange,
  gnssDopFromUnitVectors,
  opticalLinkReceivedPower,
  laserSpotRadius,
  laserRangeFromTof,
  laserRangeFromRtt,
  reflectionCoeff,
  vswrFromGamma,
  returnLossDb,
  effectiveAperture,
  dopplerShiftHz,
  radarReceivedPower,
  rainAttenuationDb,
  ebN0FromCn0,
  opticalQFromSnr,
  saastamoinenTropoDelay,
  freeFallTimeConstG,
  freeFallSpeedConstG,
  ballisticRangeFlat,
  terminalVelocity,
  bankAngleRad,
  slewTimeMin,
  magneticTorque,
  gravityGradientTorque,
  rwMomentum,
  sunSensorAngle,
  starTrackerNoiseRad,
  walkerSpacing,
  coverageSwathWidth,
  revisitTimeSimple,
  geoStationkeepingDvYear,
  geoPropellantBudget,
  dragMakeupDvPerRev,
  tisserandParameter,
  epsOrbitAverage,
  relativityClockRate,
  klobucharIonoDelayM,
  opticalGsd,
  solarSailAccel,
  finiteBurnDv,
  bPlaneImpactParameter,
  jacobiConstant,
  orbitLifetimeRough,
  geoDriftRate,
  stefanBoltzmannPower,
  wienPeakWavelength,
  argPerigeeDriftJ2,
  sarAzimuthResolution,
  radarRangeResolution,
  linkMarginDb,
  aerobrakingDv,
  diffractionLimitAngle,
  panelEolPower,
  magnetorquerMoment,
  captureCircularizeDv,
  gravityLossDv,
  batteryDepthOfDischarge,
  umbraLength,
  flightPathAngle,
  hoopStress,
  hillSphere,
  edelbaumDv,
  repeatingGroundTrackPeriod,
  pointingBudgetRss,
  boiloffRate,
  residualDipoleTorque,
  solarFluxAtDistance,
  nyquistSampleRate,
  dataVolumeBits,
  earthIrFlux,
  elevationFromRangeHeight,
  slantRange,
} from '../src/lib/physics/index'

export const SIDUS_MCP_DISCLAIMER =
  'Educational pure-SI model (SIDUS). Not flight software. No affiliation with NASA, ESA, or SpaceX.'

export type McpArgs = Record<string, any>

export type McpToolDef = {
  name: string
  description: string
  inputSchema: Record<string, z.ZodTypeAny>
  sample: Record<string, unknown>
  run: (args: McpArgs) => unknown
}

export const CATALOG_NAMES = ['list_bodies', 'list_mcp_tools', 'circular_orbit', 'hohmann', 'escape_velocity', 'bielliptic', 'plane_change', 'vis_viva', 'apsides', 'rocket_equation', 'multi_stage', 'j2_drift', 'launch_azimuth', 'sso_inclination', 'dynamic_pressure', 'cw_rendezvous', 'link_budget', 'phasing', 'metabolic_load', 'cabin_atmosphere', 'lioh_scrubber', 'cabin_leak', 'thermal_loop', 'custom_body', 'hyperbolic_c3', 'hohmann_plane', 'propellant_mass', 'ideal_thrust', 'sphere_of_influence', 'synodic_period', 'eclipse_duration', 'light_time', 'solar_pressure', 'circularize', 'geo_radius', 'delta_a_burn', 'plane_change_apo', 'heat_flux', 'coelliptic', 'los_range_rate', 'oberth', 'deorbit', 'mean_motion', 'solar_array', 'rcs_delta_v', 'apo_raise', 'delta_v_budget', 'equal_stage', 'period_to_sma', 'ballistic_drag', 'horizon_range', 'antenna_beamwidth', 'battery', 'angular_diameter', 'diffraction', 'thermal_rad', 'drag_force', 'reaction_wheel', 'along_track', 'ground_track', 'eclipse_beta', 'hohmann_time', 'orbital_energy', 'true_anomaly', 'flyby_speed', 'nodal_period', 'eccentric_anomaly', 'scale_height', 'rendezvous_catchup', 'impulse_budget', 'sso_period', 'mass_ratio_stack', 'critical_inclination', 'relative_period', 'energy_vinf', 'geo_light_time', 'payload_fraction', 'specific_angular_momentum', 'escape_margin', 'spherical_distance', 'elevation_azimuth', 'vector_angle', 'helio_hohmann', 'patched_conic_depart', 'surface_access', 'orbit_3d', 'isentropic_nozzle', 'characteristic_velocity_cstar', 'throat_area_sizing', 'rocket_thrust_chamber', 'mixture_ratio', 'tank_ullage', 'blowdown_tank', 'propellant_density_impulse', 'cold_gas_thrust', 'ion_thruster_efficiency', 'hall_thruster_isp', 'gnss_pseudorange', 'gnss_geometry_gdop', 'laser_link_budget', 'laser_pointing_jitter', 'laser_time_of_flight', 'impedance_matching', 'antenna_gain_effective', 'doppler_shift_leo', 'radar_equation', 'rain_attenuation_simple', 'ttc_ebno', 'optical_ber_q', 'gnss_troposphere_delay', 'free_fall_time', 'ballistic_range', 'terminal_velocity', 'parachute_descent', 'coordinated_turn_bank', 'slew_rate_pointing', 'magnetic_torque', 'gravity_gradient_torque', 'rw_momentum_capacity', 'sun_sensor_cone', 'star_tracker_noise', 'constellation_walker', 'coverage_swath', 'revisit_time_simple', 'geo_stationkeeping_dv', 'geo_propellant_budget', 'drag_make_up_dv', 'tisserand_parameter', 'eps_orbit_average', 'relativity_clock_rate', 'gnss_ionosphere_klobuchar', 'optical_gsd', 'solar_sail_accel', 'finite_burn_dv', 'b_plane_impact', 'cr3bp_jacobi', 'orbit_lifetime_rough', 'geo_drift_rate', 'stefan_boltzmann', 'wien_peak', 'thruster_impulse_bit', 'arg_perigee_drift_j2', 'sar_azimuth_resolution', 'radar_range_resolution', 'link_margin', 'aerobraking_pass', 'diffraction_limit', 'panel_eol_power', 'magnetorquer_moment', 'hyperbolic_eccentricity', 'capture_circularize', 'gravity_loss', 'battery_dod', 'umbra_length', 'mean_anomaly_from_e', 'flight_path_angle', 'hoop_stress', 'exponential_density', 'hill_sphere', 'edelbaum_dv', 'repeating_ground_track', 'pointing_budget_rss', 'boiloff_rate', 'residual_dipole_torque', 'solar_flux_distance', 'nyquist_rate', 'data_volume', 'earth_ir_flux', 'bodies', 'units', 'plotter', 'kepler_propagate', 'lambert', 'rv_elements', 'sgp4', 'look_angles', 'pass_predict'] as const

export const MCP_TOOL_DEFS: McpToolDef[] = [
  {
    name: "list_bodies",
    description: "List central bodies (μ, radius, mass) available in SIDUS.",
    inputSchema: {},
    sample: {},
    run: (_args) => {
      return BODIES.map((b) => ({ id: b.id, name: b.name, mu_m3_s2: b.mu, radius_m: b.radius, mass_kg: b.mass }))
    },
  },
  {
    name: "list_mcp_tools",
    description: "List registered SIDUS MCP tool names and short descriptions.",
    inputSchema: {},
    sample: {},
    run: (_args) => {
      return { note: 'Use each tool by name', count: CATALOG_NAMES.length, tools: CATALOG_NAMES }
    },
  },
  {
    name: "circular_orbit",
    description: "Circular orbit at altitude h: v, T, energy, local g. SI.",
    inputSchema: {
    altitude_m: z.number(),
    body_id: z.string().optional(),
  },
    sample: {"altitude_m":400000,"body_id":"earth"},
    run: (args) => {
      const body = getBody(args.body_id ?? 'earth'); const r = body.radius + args.altitude_m;
if (!(r > body.radius)) return null;
return { body: body.id, r_m: r, v_m_s: circularOrbitVelocity(body.mu, r), period_s: orbitalPeriod(body.mu, r),
  energy_j_kg: specificEnergyCircular(body.mu, r), g_local_m_s2: localGravity(body.mu, r) }
    },
  },
  {
    name: "hohmann",
    description: "Hohmann transfer Δv and TOF between circular coplanar orbits.",
    inputSchema: {
    r1_m: z.number(),
    r2_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r1_m":6778137,"r2_m":42164000},
    run: (args) => {
      return hohmannTransfer(args.mu ?? EARTH_MU, args.r1_m, args.r2_m)
    },
  },
  {
    name: "escape_velocity",
    description: "Escape speed from radius r.",
    inputSchema: {
    r_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r_m":6778137},
    run: (args) => {
      if (!(args.r_m > 0)) return null; return { v_esc_m_s: escapeVelocity(args.mu ?? EARTH_MU, args.r_m) }
    },
  },
  {
    name: "bielliptic",
    description: "Bielliptic three-burn transfer via intermediate apo rb.",
    inputSchema: {
    r1_m: z.number(),
    r2_m: z.number(),
    rb_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r1_m":6778137,"r2_m":63246000,"rb_m":168656000},
    run: (args) => {
      return biellipticTransfer(args.mu ?? EARTH_MU, args.r1_m, args.r2_m, args.rb_m)
    },
  },
  {
    name: "plane_change",
    description: "Pure plane-change Δv at speed v.",
    inputSchema: {
    v_m_s: z.number(),
    delta_i_deg: z.number(),
  },
    sample: {"v_m_s":7500,"delta_i_deg":28.5},
    run: (args) => {
      return { dv_m_s: planeChangeDeltaV(args.v_m_s, (args.delta_i_deg * Math.PI) / 180) }
    },
  },
  {
    name: "vis_viva",
    description: "Vis-viva speed at radius r on ellipse a.",
    inputSchema: {
    r_m: z.number(),
    a_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r_m":6778137,"a_m":6778137},
    run: (args) => {
      const v = visViva(args.mu ?? EARTH_MU, args.r_m, args.a_m); return v == null ? null : { v_m_s: v }
    },
  },
  {
    name: "apsides",
    description: "Periapsis/apoapsis radii and speeds from a, e.",
    inputSchema: {
    a_m: z.number(),
    e: z.number(),
    mu: z.number().optional(),
  },
    sample: {"a_m":7000000,"e":0.05},
    run: (args) => {
      return apsidesWithSpeeds(args.mu ?? EARTH_MU, args.a_m, args.e)
    },
  },
  {
    name: "rocket_equation",
    description: "Tsiolkovsky Δv from Isp and mass ratio.",
    inputSchema: {
    isp_s: z.number(),
    m0_kg: z.number(),
    mf_kg: z.number(),
  },
    sample: {"isp_s":300,"m0_kg":1000,"mf_kg":400},
    run: (args) => {
      const dv = rocketDeltaV(args.isp_s, args.m0_kg, args.mf_kg); return dv == null ? null : { dv_m_s: dv }
    },
  },
  {
    name: "multi_stage",
    description: "Multi-stage ideal rocket Δv budget.",
    inputSchema: {
    stages: z.array(z.object({ ve_m_s: z.number(), m0_kg: z.number(), mf_kg: z.number() })),
  },
    sample: {"stages":[{"ve_m_s":3000,"m0_kg":100000,"mf_kg":20000},{"ve_m_s":3200,"m0_kg":15000,"mf_kg":4000}]},
    run: (args) => {
      const st = (args.stages as { ve_m_s: number; m0_kg: number; mf_kg: number }[]).map((s) => ({ ve: s.ve_m_s, m0: s.m0_kg, mf: s.mf_kg }));
const res = multiStageDeltaV(st); return res
    },
  },
  {
    name: "j2_drift",
    description: "J2 secular RAAN and argument-of-perigee rates.",
    inputSchema: {
    a_m: z.number(),
    e: z.number(),
    i_deg: z.number(),
  },
    sample: {"a_m":6778137,"e":0.001,"i_deg":51.6},
    run: (args) => {
      const i = (args.i_deg * Math.PI) / 180; const j2 = 1.08262668e-3;
return { raan_rate_rad_s: j2RaanRate(EARTH_MU, EARTH_RADIUS, j2, args.a_m, args.e, i),
  argp_rate_rad_s: j2ArgpRate(EARTH_MU, EARTH_RADIUS, j2, args.a_m, args.e, i) }
    },
  },
  {
    name: "launch_azimuth",
    description: "Launch azimuth from site latitude to target inclination.",
    inputSchema: {
    lat_deg: z.number(),
    inclination_deg: z.number(),
  },
    sample: {"lat_deg":28.5,"inclination_deg":51.6},
    run: (args) => {
      const az = launchAzimuth((args.lat_deg * Math.PI) / 180, (args.inclination_deg * Math.PI) / 180);
return az ? { azimuth_deg: az.azimuthDeg, complementary_deg: az.complementaryDeg } : null
    },
  },
  {
    name: "sso_inclination",
    description: "Sun-synchronous inclination for altitude.",
    inputSchema: {
    altitude_m: z.number(),
  },
    sample: {"altitude_m":600000},
    run: (args) => {
      const a = EARTH_RADIUS + args.altitude_m
      const i = ssoInclination(a)
      return i == null ? null : { i_rad: i, i_deg: (i * 180) / Math.PI }
    },
  },
  {
    name: "dynamic_pressure",
    description: "ISA q and Mach at altitude and airspeed.",
    inputSchema: {
    altitude_m: z.number(),
    velocity_m_s: z.number(),
  },
    sample: {"altitude_m":10000,"velocity_m_s":400},
    run: (args) => {
      const atm = isaAtmosphere(args.altitude_m); if (!atm) return null;
return { ...atm, q_pa: dynamicPressure(atm.rho, args.velocity_m_s), mach: machNumber(args.velocity_m_s, atm.a) }
    },
  },
  {
    name: "cw_rendezvous",
    description: "CW two-impulse transfer to origin.",
    inputSchema: {
    a_target_m: z.number(),
    x0_m: z.number(),
    y0_m: z.number(),
    z0_m: z.number(),
    tf_s: z.number(),
  },
    sample: {"a_target_m":6778137,"x0_m":100,"y0_m":0,"z0_m":0,"tf_s":600},
    run: (args) => {
      const n = cwMeanMotion(EARTH_MU, args.a_target_m); if (n == null) return null;
return cwTwoImpulseToOrigin(n, { x: args.x0_m, y: args.y0_m, z: args.z0_m }, args.tf_s)
    },
  },
  {
    name: "link_budget",
    description: "RF free-space link budget sketch.",
    inputSchema: {
    pt_w: z.number(),
    gt_dbi: z.number(),
    gr_dbi: z.number(),
    freq_hz: z.number(),
    range_m: z.number(),
    other_loss_db: z.number().optional(),
    t_sys_k: z.number().optional(),
    required_cn0_dbhz: z.number().optional(),
  },
    sample: {"pt_w":10,"gt_dbi":5,"gr_dbi":20,"freq_hz":2200000000,"range_m":1000000,"other_loss_db":2,"t_sys_k":200,"required_cn0_dbhz":50},
    run: (args) => {
      return linkBudget({ ptW: args.pt_w, gtDbi: args.gt_dbi, grDbi: args.gr_dbi, freqHz: args.freq_hz, rangeM: args.range_m,
  otherLossDb: args.other_loss_db ?? 0, tSysK: args.t_sys_k ?? 290, requiredCn0DbHz: args.required_cn0_dbhz ?? 40 })
    },
  },
  {
    name: "phasing",
    description: "Coplanar phasing orbit for phase gain.",
    inputSchema: {
    r_target_m: z.number(),
    phase_gain_deg: z.number(),
    n_revs: z.number(),
  },
    sample: {"r_target_m":6778137,"phase_gain_deg":30,"n_revs":2},
    run: (args) => {
      return phasingOrbit(EARTH_MU, args.r_target_m, (args.phase_gain_deg * Math.PI) / 180, args.n_revs)
    },
  },
  {
    name: "metabolic_load",
    description: "Crew metabolic loads over duration.",
    inputSchema: {
    activity: z.string(),
    crew: z.number(),
    hours: z.number(),
  },
    sample: {"activity":"nominal","crew":4,"hours":24},
    run: (args) => {
      return metabolicBudget(args.activity as any, args.hours * 3600, args.crew)
    },
  },
  {
    name: "cabin_atmosphere",
    description: "Cabin partial pressures from composition.",
    inputSchema: {
    volume_m3: z.number(),
    temp_k: z.number(),
    pressure_pa: z.number(),
    dry_o2_frac: z.number(),
    pp_co2_pa: z.number(),
    relative_humidity: z.number(),
  },
    sample: {"volume_m3":100,"temp_k":293.15,"pressure_pa":101325,"dry_o2_frac":0.21,"pp_co2_pa":400,"relative_humidity":0.4},
    run: (args) => {
      const masses = cabinMassesFromComposition(args.volume_m3, args.temp_k, args.pressure_pa, args.dry_o2_frac, args.pp_co2_pa, args.relative_humidity);
if (!masses) return null; return cabinFromMasses(args.volume_m3, args.temp_k, masses)
    },
  },
  {
    name: "lioh_scrubber",
    description: "LiOH canister duration for CO2 rate.",
    inputSchema: {
    lioh_kg: z.number(),
    co2_rate_kg_s: z.number(),
    capacity: z.number().optional(),
  },
    sample: {"lioh_kg":2,"co2_rate_kg_s":0.00004},
    run: (args) => {
      return liohDuration(args.lioh_kg, args.co2_rate_kg_s, args.capacity)
    },
  },
  {
    name: "cabin_leak",
    description: "Depressurization time estimate.",
    inputSchema: {
    volume_m3: z.number(),
    p0_pa: z.number(),
    p_final_pa: z.number(),
    hole_area_m2: z.number(),
    temp_k: z.number(),
  },
    sample: {"volume_m3":100,"p0_pa":101325,"p_final_pa":70000,"hole_area_m2":0.0001,"temp_k":293.15},
    run: (args) => {
      const t = leakDepressTime(args.volume_m3, args.p0_pa, args.p_final_pa, args.hole_area_m2, args.temp_k);
return t == null ? null : { t_s: t }
    },
  },
  {
    name: "thermal_loop",
    description: "Coolant mass flow for heat load and ΔT.",
    inputSchema: {
    heat_w: z.number(),
    dT_k: z.number(),
    cp_j_kg_k: z.number().optional(),
  },
    sample: {"heat_w":5000,"dT_k":10},
    run: (args) => {
      const mdot = coolantMassFlow(args.heat_w, args.cp_j_kg_k ?? 4180, args.dT_k);
return mdot == null ? null : { mdot_kg_s: mdot }
    },
  },
  {
    name: "custom_body",
    description: "Custom body μ, surface g, escape from mass and radius.",
    inputSchema: {
    mass_kg: z.number(),
    radius_m: z.number(),
    altitude_m: z.number().optional(),
  },
    sample: {"mass_kg":5.9722e+24,"radius_m":6378137,"altitude_m":0},
    run: (args) => {
      const mu = muFromMass(args.mass_kg)
      if (mu == null) return null
      const r = args.radius_m + (args.altitude_m ?? 0)
      return {
        mu_m3_s2: mu,
        g_m_s2: surfaceGravity(mu, args.radius_m),
        v_esc_m_s: escapeVelocity(mu, r),
      }
    },
  },
  {
    name: "hyperbolic_c3",
    description: "C3 and periapsis speed on hyperbola.",
    inputSchema: {
    r_m: z.number(),
    v_inf_m_s: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r_m":6778137,"v_inf_m_s":3000},
    run: (args) => {
      const mu = args.mu ?? EARTH_MU; const c3 = characteristicEnergy(args.v_inf_m_s);
const vp = Math.sqrt(args.v_inf_m_s ** 2 + 2 * mu / args.r_m);
return { c3_m2_s2: c3, v_p_m_s: vp, e: hyperbolicEccentricity(mu, args.r_m, args.v_inf_m_s) }
    },
  },
  {
    name: "hohmann_plane",
    description: "Hohmann + plane change at apo.",
    inputSchema: {
    r1_m: z.number(),
    r2_m: z.number(),
    delta_i_deg: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r1_m":6778137,"r2_m":42164000,"delta_i_deg":28},
    run: (args) => {
      return hohmannWithPlaneChange(args.mu ?? EARTH_MU, args.r1_m, args.r2_m, (args.delta_i_deg * Math.PI) / 180)
    },
  },
  {
    name: "propellant_mass",
    description: "Propellant mass for Δv (rocket equation).",
    inputSchema: {
    isp_s: z.number(),
    delta_v_m_s: z.number(),
    dry_mass_kg: z.number(),
  },
    sample: {"isp_s":300,"delta_v_m_s":3000,"dry_mass_kg":500},
    run: (args) => {
      return propellantForDeltaV(args.isp_s, args.delta_v_m_s, args.dry_mass_kg)
    },
  },
  {
    name: "ideal_thrust",
    description: "Ideal thrust F = mdot * ve.",
    inputSchema: {
    mdot_kg_s: z.number(),
    ve_m_s: z.number(),
  },
    sample: {"mdot_kg_s":100,"ve_m_s":3000},
    run: (args) => {
      return { thrust_n: idealThrust(args.mdot_kg_s, args.ve_m_s) }
    },
  },
  {
    name: "sphere_of_influence",
    description: "SOI radius for planet about primary.",
    inputSchema: {
    a_m: z.number(),
    m_planet_kg: z.number(),
    m_primary_kg: z.number(),
  },
    sample: {"a_m":149597870700,"m_planet_kg":5.9722e+24,"m_primary_kg":1.9885e+30},
    run: (args) => {
      const r = sphereOfInfluence(args.a_m, args.m_planet_kg, args.m_primary_kg); return r == null ? null : { r_soi_m: r }
    },
  },
  {
    name: "synodic_period",
    description: "Synodic period between two circular orbits.",
    inputSchema: {
    r1_m: z.number(),
    r2_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r1_m":6778137,"r2_m":6828137},
    run: (args) => {
      const t = synodicPeriod(args.mu ?? EARTH_MU, args.r1_m, args.r2_m); return t == null ? null : { t_syn_s: t }
    },
  },
  {
    name: "eclipse_duration",
    description: "Circular-orbit eclipse duration (cylindrical).",
    inputSchema: {
    a_m: z.number(),
    mu: z.number().optional(),
    body_radius_m: z.number().optional(),
  },
    sample: {"a_m":6778137},
    run: (args) => {
      return circularEclipseDuration(args.mu ?? EARTH_MU, args.a_m, args.body_radius_m ?? EARTH_RADIUS)
    },
  },
  {
    name: "light_time",
    description: "One-way light time for range.",
    inputSchema: {
    range_m: z.number(),
  },
    sample: {"range_m":384400000},
    run: (args) => {
      return { t_s: lightTime(args.range_m), t_rtt_s: lightTimeRoundTrip(args.range_m) }
    },
  },
  {
    name: "solar_pressure",
    description: "SRP force and accel at r_AU.",
    inputSchema: {
    area_m2: z.number(),
    mass_kg: z.number(),
    cr: z.number(),
    r_au: z.number(),
  },
    sample: {"area_m2":10,"mass_kg":500,"cr":1.2,"r_au":1},
    run: (args) => {
      return { force_n: solarRadiationForce(args.area_m2, args.cr, args.r_au),
  accel_m_s2: solarRadiationAccel(args.area_m2, args.mass_kg, args.cr, args.r_au) }
    },
  },
  {
    name: "circularize",
    description: "Circularize burn at apo or peri.",
    inputSchema: {
    a_m: z.number(),
    e: z.number(),
    at: z.string(),
    mu: z.number().optional(),
  },
    sample: {"a_m":7500000,"e":0.1,"at":"apo"},
    run: (args) => {
      return circularizeBurn(args.mu ?? EARTH_MU, args.a_m, args.e, args.at === 'peri' ? 'peri' : 'apo')
    },
  },
  {
    name: "geo_radius",
    description: "Earth GEO radius and altitude.",
    inputSchema: {},
    sample: {},
    run: (_args) => {
      const r = geoRadius(EARTH_MU)
      if (r == null) return null
      return { r_m: r, h_m: r - EARTH_RADIUS }
    },
  },
  {
    name: "delta_a_burn",
    description: "Δa from small tangential Δv on circular orbit.",
    inputSchema: {
    a_m: z.number(),
    dv_m_s: z.number(),
    mu: z.number().optional(),
  },
    sample: {"a_m":6778137,"dv_m_s":1},
    run: (args) => {
      const da = deltaAFromTangentialDv(args.mu ?? EARTH_MU, args.a_m, args.dv_m_s); return da == null ? null : { da_m: da }
    },
  },
  {
    name: "plane_change_apo",
    description: "Plane change at apoapsis of transfer ellipse.",
    inputSchema: {
    rp_m: z.number(),
    ra_m: z.number(),
    delta_i_deg: z.number(),
    mu: z.number().optional(),
  },
    sample: {"rp_m":6778137,"ra_m":42164000,"delta_i_deg":20},
    run: (args) => {
      const r = planeChangeAtApsides(
        args.mu ?? EARTH_MU,
        args.rp_m,
        args.ra_m,
        (args.delta_i_deg * Math.PI) / 180,
      )
      return r == null ? null : { dv_peri_m_s: r.dvPeri, dv_apo_m_s: r.dvApo, ratio: r.ratio }
    },
  },
  {
    name: "heat_flux",
    description: "Sutton-Graves stagnation heat flux.",
    inputSchema: {
    rho_kg_m3: z.number(),
    v_m_s: z.number(),
    nose_radius_m: z.number(),
  },
    sample: {"rho_kg_m3":0.0001,"v_m_s":7500,"nose_radius_m":0.5},
    run: (args) => {
      const q = suttonGravesHeatFlux(args.rho_kg_m3, args.v_m_s, args.nose_radius_m); return q == null ? null : { q_w_m2: q }
    },
  },
  {
    name: "coelliptic",
    description: "Coelliptic drift and time for phase gain.",
    inputSchema: {
    a_m: z.number(),
    delta_a_m: z.number(),
    phase_gain_deg: z.number(),
    mu: z.number().optional(),
  },
    sample: {"a_m":6778137,"delta_a_m":-5000,"phase_gain_deg":10},
    run: (args) => {
      const n = cwMeanMotion(args.mu ?? EARTH_MU, args.a_m); if (n == null) return null;
const drift = coellipticDrift(n, args.a_m, args.delta_a_m);
const t = timeForPhaseGain(drift?.nRel ?? 0, (args.phase_gain_deg * Math.PI) / 180);
return { ...drift, t_phase_s: t }
    },
  },
  {
    name: "los_range_rate",
    description: "1-D LOS range and range-rate.",
    inputSchema: {
    x_m: z.number(),
    y_m: z.number(),
    z_m: z.number(),
    vx_m_s: z.number(),
    vy_m_s: z.number(),
    vz_m_s: z.number(),
  },
    sample: {"x_m":1000,"y_m":0,"z_m":0,"vx_m_s":0,"vy_m_s":1,"vz_m_s":0},
    run: (args) => {
      return losRangeRate([args.x_m, args.y_m, args.z_m], [args.vx_m_s, args.vy_m_s, args.vz_m_s])
    },
  },
  {
    name: "oberth",
    description: "Oberth comparison of burn at peri vs apo.",
    inputSchema: {
    a_m: z.number(),
    e: z.number(),
    dv_m_s: z.number(),
    mu: z.number().optional(),
  },
    sample: {"a_m":20000000,"e":0.5,"dv_m_s":100},
    run: (args) => {
      return oberthCompare(args.mu ?? EARTH_MU, args.a_m, args.e, args.dv_m_s)
    },
  },
  {
    name: "deorbit",
    description: "Deorbit burn from circular to target periapsis.",
    inputSchema: {
    r_circ_m: z.number(),
    rp_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r_circ_m":6778137,"rp_m":6458137},
    run: (args) => {
      return deorbitBurn(args.mu ?? EARTH_MU, args.r_circ_m, args.rp_m)
    },
  },
  {
    name: "mean_motion",
    description: "Mean motion from altitude.",
    inputSchema: {
    altitude_m: z.number(),
    mu: z.number().optional(),
    body_radius_m: z.number().optional(),
  },
    sample: {"altitude_m":400000},
    run: (args) => {
      const n = meanMotionFromAltitude(args.mu ?? EARTH_MU, args.body_radius_m ?? EARTH_RADIUS, args.altitude_m);
return n == null ? null : { n_rad_s: n }
    },
  },
  {
    name: "solar_array",
    description: "Solar array power.",
    inputSchema: {
    area_m2: z.number(),
    eta: z.number(),
    incidence_deg: z.number(),
    r_au: z.number(),
  },
    sample: {"area_m2":5,"eta":0.3,"incidence_deg":0,"r_au":1},
    run: (args) => {
      const p = solarArrayPower(args.area_m2, args.eta, (args.incidence_deg * Math.PI) / 180, args.r_au);
return p == null ? null : { p_w: p }
    },
  },
  {
    name: "rcs_delta_v",
    description: "RCS Δv from thrust, burn time, mass.",
    inputSchema: {
    thrust_n: z.number(),
    burn_s: z.number(),
    mass_kg: z.number(),
  },
    sample: {"thrust_n":1,"burn_s":10,"mass_kg":100},
    run: (args) => {
      const dv = rcsDeltaV(args.thrust_n, args.burn_s, args.mass_kg);
return dv == null ? null : { dv_m_s: dv, impulse_n_s: args.thrust_n * args.burn_s }
    },
  },
  {
    name: "apo_raise",
    description: "Raise apoapsis from circular orbit.",
    inputSchema: {
    r_m: z.number(),
    ra_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r_m":6778137,"ra_m":42164000},
    run: (args) => {
      return apoapsisRaiseFromCircular(args.mu ?? EARTH_MU, args.r_m, args.ra_m)
    },
  },
  {
    name: "delta_v_budget",
    description: "Sum multi-phase Δv.",
    inputSchema: {
    phases_m_s: z.array(z.number()),
  },
    sample: {"phases_m_s":[3200,900,150]},
    run: (args) => {
      return deltaVBudget(args.phases_m_s as number[])
    },
  },
  {
    name: "equal_stage",
    description: "Equal-stage mass ratio for total Δv.",
    inputSchema: {
    total_dv_m_s: z.number(),
    n_stages: z.number(),
    isp_s: z.number(),
  },
    sample: {"total_dv_m_s":9000,"n_stages":3,"isp_s":300},
    run: (args) => {
      return equalStageMassRatio(args.total_dv_m_s, Math.round(args.n_stages), args.isp_s)
    },
  },
  {
    name: "period_to_sma",
    description: "Semi-major axis from period.",
    inputSchema: {
    period_s: z.number(),
    mu: z.number().optional(),
  },
    sample: {"period_s":5400},
    run: (args) => {
      const a = semiMajorFromPeriod(args.mu ?? EARTH_MU, args.period_s); return a == null ? null : { a_m: a }
    },
  },
  {
    name: "ballistic_drag",
    description: "Ballistic coefficient and drag Δv per rev.",
    inputSchema: {
    mass_kg: z.number(),
    area_m2: z.number(),
    cd: z.number(),
    rho_kg_m3: z.number(),
    a_m: z.number(),
    v_m_s: z.number(),
  },
    sample: {"mass_kg":500,"area_m2":2,"cd":2.2,"rho_kg_m3":2e-12,"a_m":6778137,"v_m_s":7660},
    run: (args) => {
      const beta = ballisticCoefficient(args.mass_kg, args.cd, args.area_m2);
const dv = dragDeltaVPerRev(args.rho_kg_m3, args.a_m, args.v_m_s, beta ?? 0);
return { beta_kg_m2: beta, dv_per_rev_m_s: dv }
    },
  },
  {
    name: "horizon_range",
    description: "Horizon slant range from altitude.",
    inputSchema: {
    altitude_m: z.number(),
    body_radius_m: z.number().optional(),
  },
    sample: {"altitude_m":400000},
    run: (args) => {
      const s = horizonSlantRange(args.body_radius_m ?? EARTH_RADIUS, args.altitude_m); return s == null ? null : { slant_m: s }
    },
  },
  {
    name: "antenna_beamwidth",
    description: "Approx parabolic beamwidth.",
    inputSchema: {
    diameter_m: z.number(),
    freq_hz: z.number(),
    k: z.number().optional(),
  },
    sample: {"diameter_m":1,"freq_hz":12000000000},
    run: (args) => {
      const bw = antennaBeamwidth(args.diameter_m, args.freq_hz, args.k); return bw == null ? null : { beamwidth_rad: bw }
    },
  },
  {
    name: "battery",
    description: "Battery energy and endurance.",
    inputSchema: {
    capacity_ah: z.number(),
    voltage_v: z.number(),
    load_w: z.number(),
    dod: z.number().optional(),
  },
    sample: {"capacity_ah":20,"voltage_v":28,"load_w":100,"dod":0.8},
    run: (args) => {
      const e = batteryEnergyJ(args.capacity_ah, args.voltage_v)
      if (e == null) return null
      const usable = e * (args.dod ?? 1)
      const t = batteryEndurance(usable, args.load_w)
      return { energy_j: e, usable_energy_j: usable, endurance_s: t }
    },
  },
  {
    name: "angular_diameter",
    description: "Angular diameter of body at distance.",
    inputSchema: {
    diameter_m: z.number(),
    distance_m: z.number(),
  },
    sample: {"diameter_m":6378137,"distance_m":6778137},
    run: (args) => {
      const a = angularDiameter(args.diameter_m, args.distance_m); return a == null ? null : { angle_rad: a }
    },
  },
  {
    name: "diffraction",
    description: "Diffraction-limited resolution.",
    inputSchema: {
    wavelength_m: z.number(),
    diameter_m: z.number(),
  },
    sample: {"wavelength_m":5e-7,"diameter_m":0.3},
    run: (args) => {
      const r = diffractionResolution(args.wavelength_m, args.diameter_m); return r == null ? null : { theta_rad: r }
    },
  },
  {
    name: "thermal_rad",
    description: "Stefan-Boltzmann radiated power / Teq.",
    inputSchema: {
    area_m2: z.number(),
    temp_k: z.number(),
    emissivity: z.number().optional(),
  },
    sample: {"area_m2":1,"temp_k":300,"emissivity":0.8},
    run: (args) => {
      const p = thermalRadiatedPower(args.area_m2, args.temp_k, args.emissivity ?? 1); return p == null ? null : { p_w: p }
    },
  },
  {
    name: "drag_force",
    description: "Quadratic drag force.",
    inputSchema: {
    rho_kg_m3: z.number(),
    v_m_s: z.number(),
    cd: z.number(),
    area_m2: z.number(),
  },
    sample: {"rho_kg_m3":1e-12,"v_m_s":7600,"cd":2.2,"area_m2":1},
    run: (args) => {
      const f = dragForce(args.rho_kg_m3, args.v_m_s, args.cd, args.area_m2); return f == null ? null : { f_n: f }
    },
  },
  {
    name: "reaction_wheel",
    description: "Reaction wheel momentum and torque.",
    inputSchema: {
    inertia_kg_m2: z.number(),
    omega_rad_s: z.number(),
    alpha_rad_s2: z.number().optional(),
  },
    sample: {"inertia_kg_m2":0.01,"omega_rad_s":500,"alpha_rad_s2":1},
    run: (args) => {
      return { h_n_m_s: wheelMomentum(args.inertia_kg_m2, args.omega_rad_s), torque_n_m: wheelTorque(args.inertia_kg_m2, args.alpha_rad_s2 ?? 0) }
    },
  },
  {
    name: "along_track",
    description: "Along-track distance from ΔM.",
    inputSchema: {
    a_m: z.number(),
    delta_m_rad: z.number(),
  },
    sample: {"a_m":6778137,"delta_m_rad":0.001},
    run: (args) => {
      const d = alongTrackFromDeltaM(args.a_m, args.delta_m_rad); return d == null ? null : { along_track_m: d }
    },
  },
  {
    name: "ground_track",
    description: "Ground-track shift per orbit (Earth).",
    inputSchema: {
    a_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"a_m":6778137},
    run: (args) => {
      const s = groundTrackShiftPerOrbit(args.mu ?? EARTH_MU, args.a_m); return s == null ? null : { shift_rad: s }
    },
  },
  {
    name: "eclipse_beta",
    description: "Eclipse with beta angle.",
    inputSchema: {
    a_m: z.number(),
    beta_deg: z.number(),
    body_radius_m: z.number().optional(),
    mu: z.number().optional(),
  },
    sample: {"a_m":6778137,"beta_deg":20},
    run: (args) => {
      return eclipseWithBeta(args.mu ?? EARTH_MU, args.a_m, args.body_radius_m ?? EARTH_RADIUS, (args.beta_deg * Math.PI) / 180)
    },
  },
  {
    name: "hohmann_time",
    description: "Hohmann TOF only.",
    inputSchema: {
    r1_m: z.number(),
    r2_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r1_m":6778137,"r2_m":42164000},
    run: (args) => {
      const h = hohmannTransfer(args.mu ?? EARTH_MU, args.r1_m, args.r2_m); return h ? { tof_s: h.tof } : null
    },
  },
  {
    name: "orbital_energy",
    description: "Specific orbital energy.",
    inputSchema: {
    r_m: z.number(),
    a_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r_m":6778137,"a_m":6778137},
    run: (args) => {
      const e = specificEnergyCircular(args.mu ?? EARTH_MU, args.a_m); return { energy_j_kg: e }
    },
  },
  {
    name: "true_anomaly",
    description: "Radius from true anomaly.",
    inputSchema: {
    a_m: z.number(),
    e: z.number(),
    nu_deg: z.number(),
  },
    sample: {"a_m":8000000,"e":0.1,"nu_deg":45},
    run: (args) => {
      const nu = (args.nu_deg * Math.PI) / 180; const p = args.a_m * (1 - args.e ** 2); const r = p / (1 + args.e * Math.cos(nu));
return { r_m: r, nu_rad: nu }
    },
  },
  {
    name: "flyby_speed",
    description: "Gravity assist / flyby excess sketch.",
    inputSchema: {
    v_inf_in_m_s: z.number(),
    turn_deg: z.number(),
  },
    sample: {"v_inf_in_m_s":5000,"turn_deg":30},
    run: (args) => {
      // δ = 2 arcsin(1/e) ⇒ e = 1 / sin(δ/2); v∞ is reported for context only
      const delta = (args.turn_deg * Math.PI) / 180
      if (!(delta > 0) || !(delta < Math.PI)) return null
      const s = Math.sin(delta / 2)
      if (!(s > 0)) return null
      const e = 1 / s
      const turn = gravityAssistTurn(e)
      return turn == null
        ? null
        : { e, turn_rad: turn, turn_deg: (turn * 180) / Math.PI, v_inf_m_s: args.v_inf_in_m_s }
    },
  },
  {
    name: "nodal_period",
    description: "Nodal period from RAAN rate and mean motion.",
    inputSchema: {
    n_rad_s: z.number(),
    raan_rate_rad_s: z.number(),
  },
    sample: {"n_rad_s":0.0011,"raan_rate_rad_s":-0.000001},
    run: (args) => {
      const T = 2 * Math.PI / Math.abs(args.n_rad_s); return { period_s: T, nodal_period_s: 2 * Math.PI / Math.abs(args.n_rad_s + args.raan_rate_rad_s) }
    },
  },
  {
    name: "eccentric_anomaly",
    description: "Mean anomaly from eccentric anomaly.",
    inputSchema: {
    e: z.number(),
    E_deg: z.number(),
  },
    sample: {"e":0.1,"E_deg":30},
    run: (args) => {
      const E = (args.E_deg * Math.PI) / 180; const M = meanAnomalyFromE(args.e, E); return M == null ? null : { M_rad: M }
    },
  },
  {
    name: "scale_height",
    description: "Exponential atmosphere density.",
    inputSchema: {
    h_m: z.number(),
    rho0_kg_m3: z.number(),
    H_m: z.number(),
  },
    sample: {"h_m":400000,"rho0_kg_m3":1.225,"H_m":8500},
    run: (args) => {
      const rho = exponentialDensity(args.rho0_kg_m3, args.h_m, args.H_m); return rho == null ? null : { rho_kg_m3: rho }
    },
  },
  {
    name: "rendezvous_catchup",
    description: "Catch-up time between two circular orbits.",
    inputSchema: {
    r1_m: z.number(),
    r2_m: z.number(),
    phase_deg: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r1_m":6778137,"r2_m":6788137,"phase_deg":5},
    run: (args) => {
      const t = synodicPeriod(args.mu ?? EARTH_MU, args.r1_m, args.r2_m); if (t == null) return null;
return { t_syn_s: t, t_catch_s: t * Math.abs(args.phase_deg) / 360 }
    },
  },
  {
    name: "impulse_budget",
    description: "Impulse bit and total impulse.",
    inputSchema: {
    thrust_n: z.number(),
    pulse_s: z.number(),
    n_pulses: z.number(),
  },
    sample: {"thrust_n":1,"pulse_s":0.1,"n_pulses":100},
    run: (args) => {
      const ib = thrusterImpulseBit(args.thrust_n, args.pulse_s); return { impulse_bit_n_s: ib, total_n_s: (ib ?? 0) * args.n_pulses }
    },
  },
  {
    name: "sso_period",
    description: "Period of SSO altitude (circular).",
    inputSchema: {
    altitude_m: z.number(),
    mu: z.number().optional(),
    body_radius_m: z.number().optional(),
  },
    sample: {"altitude_m":700000},
    run: (args) => {
      const r = (args.body_radius_m ?? EARTH_RADIUS) + args.altitude_m; return { period_s: orbitalPeriod(args.mu ?? EARTH_MU, r) }
    },
  },
  {
    name: "mass_ratio_stack",
    description: "Payload fraction from mass ratio.",
    inputSchema: {
    m0_kg: z.number(),
    m_payload_kg: z.number(),
  },
    sample: {"m0_kg":10000,"m_payload_kg":500},
    run: (args) => {
      if (!(args.m0_kg > 0)) return null; return { payload_fraction: args.m_payload_kg / args.m0_kg }
    },
  },
  {
    name: "critical_inclination",
    description: "Critical inclination for frozen argument of perigee.",
    inputSchema: {},
    sample: {},
    run: (_args) => {
      const i = Math.acos(Math.sqrt(0.2)); return { i_rad: i, i_deg: (i * 180) / Math.PI }
    },
  },
  {
    name: "relative_period",
    description: "Period difference of two circular orbits.",
    inputSchema: {
    r1_m: z.number(),
    r2_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r1_m":6778137,"r2_m":6783137},
    run: (args) => {
      const t1 = orbitalPeriod(args.mu ?? EARTH_MU, args.r1_m); const t2 = orbitalPeriod(args.mu ?? EARTH_MU, args.r2_m);
return { dt_s: t2 - t1, t1_s: t1, t2_s: t2 }
    },
  },
  {
    name: "energy_vinf",
    description: "v∞ from positive specific energy.",
    inputSchema: {
    energy_j_kg: z.number(),
  },
    sample: {"energy_j_kg":4500000},
    run: (args) => {
      if (!(args.energy_j_kg > 0)) return null; return { v_inf_m_s: Math.sqrt(2 * args.energy_j_kg) }
    },
  },
  {
    name: "geo_light_time",
    description: "GEO light time.",
    inputSchema: {},
    sample: {},
    run: (_args) => {
      const r = geoRadius(EARTH_MU)
      if (r == null) return null
      const range = r - EARTH_RADIUS
      return { range_m: range, t_s: lightTime(range) }
    },
  },
  {
    name: "payload_fraction",
    description: "Payload mass fraction.",
    inputSchema: {
    m_payload_kg: z.number(),
    m0_kg: z.number(),
  },
    sample: {"m_payload_kg":100,"m0_kg":1000},
    run: (args) => {
      return { f_pl: args.m_payload_kg / args.m0_kg }
    },
  },
  {
    name: "specific_angular_momentum",
    description: "h from a, e.",
    inputSchema: {
    a_m: z.number(),
    e: z.number(),
    mu: z.number().optional(),
  },
    sample: {"a_m":6778137,"e":0.001},
    run: (args) => {
      const p = args.a_m * (1 - args.e ** 2); const h = Math.sqrt((args.mu ?? EARTH_MU) * p); return { h_m2_s: h }
    },
  },
  {
    name: "escape_margin",
    description: "Δv circular to escape.",
    inputSchema: {
    r_m: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r_m":6778137},
    run: (args) => {
      const vc = circularOrbitVelocity(args.mu ?? EARTH_MU, args.r_m); const ve = escapeVelocity(args.mu ?? EARTH_MU, args.r_m);
return { dv_m_s: ve - vc, v_c_m_s: vc, v_esc_m_s: ve }
    },
  },
  {
    name: "spherical_distance",
    description: "Great-circle distance.",
    inputSchema: {
    lat1_deg: z.number(),
    lon1_deg: z.number(),
    lat2_deg: z.number(),
    lon2_deg: z.number(),
    radius_m: z.number().optional(),
  },
    sample: {"lat1_deg":28.57,"lon1_deg":-80.65,"lat2_deg":5.24,"lon2_deg":-52.77},
    run: (args) => {
      const R = args.radius_m ?? EARTH_RADIUS; const d = greatCircleDistance(R, (args.lat1_deg*Math.PI)/180, (args.lon1_deg*Math.PI)/180, (args.lat2_deg*Math.PI)/180, (args.lon2_deg*Math.PI)/180);
return d == null ? null : { distance_m: d }
    },
  },
  {
    name: "elevation_azimuth",
    description: "Topocentric el/az between two geodetic points.",
    inputSchema: {
    lat1_deg: z.number(),
    lon1_deg: z.number(),
    h1_m: z.number(),
    lat2_deg: z.number(),
    lon2_deg: z.number(),
    h2_m: z.number(),
    body_radius_m: z.number().optional(),
  },
    sample: {"lat1_deg":28.57,"lon1_deg":-80.65,"h1_m":3,"lat2_deg":28.6,"lon2_deg":-80.5,"h2_m":400000},
    run: (args) => {
      return topocentricElAz((args.lat1_deg*Math.PI)/180,(args.lon1_deg*Math.PI)/180,args.h1_m,(args.lat2_deg*Math.PI)/180,(args.lon2_deg*Math.PI)/180,args.h2_m,args.body_radius_m ?? EARTH_RADIUS)
    },
  },
  {
    name: "vector_angle",
    description: "Angle between two 3-vectors.",
    inputSchema: {
    ax: z.number(),
    ay: z.number(),
    az: z.number(),
    bx: z.number(),
    by: z.number(),
    bz: z.number(),
  },
    sample: {"ax":1,"ay":0,"az":0,"bx":0,"by":1,"bz":0},
    run: (args) => {
      const a = angleBetween([args.ax,args.ay,args.az],[args.bx,args.by,args.bz]); return a == null ? null : { angle_rad: a }
    },
  },
  {
    name: "helio_hohmann",
    description: "Heliocentric Hohmann between radii.",
    inputSchema: {
    r1_m: z.number(),
    r2_m: z.number(),
    mu_sun: z.number().optional(),
  },
    sample: {"r1_m":149600000000,"r2_m":227900000000},
    run: (args) => {
      return heliocentricHohmann(args.mu_sun ?? 1.3271244e20, args.r1_m, args.r2_m)
    },
  },
  {
    name: "patched_conic_depart",
    description: "Patched-conic departure burn sketch.",
    inputSchema: {
    r_park_m: z.number(),
    v_inf_m_s: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r_park_m":6778137,"v_inf_m_s":3000},
    run: (args) => {
      return departureBurnFromCircular(args.mu ?? EARTH_MU, args.r_park_m, args.v_inf_m_s)
    },
  },
  {
    name: "surface_access",
    description: "Surface g and escape for body radius/μ.",
    inputSchema: {
    radius_m: z.number(),
    mu: z.number(),
    h_park_m: z.number().optional(),
  },
    sample: {"radius_m":6378137,"mu":398600441800000,"h_park_m":200000},
    run: (args) => {
      const body = {
        id: 'custom',
        name: 'custom',
        mu: args.mu,
        radius: args.radius_m,
        mass: args.mu / 6.6743e-11,
        color: '#888888',
        type: 'planet' as const,
      }
      return surfaceAccess({ body, parkAltitudeM: args.h_park_m ?? 0 })
    },
  },
  {
    name: "orbit_3d",
    description: "Circular orbit state sketch (radius/period).",
    inputSchema: {
    altitude_m: z.number(),
    body_id: z.string().optional(),
  },
    sample: {"altitude_m":400000,"body_id":"earth"},
    run: (args) => {
      const body = getBody(args.body_id ?? 'earth'); const r = body.radius + args.altitude_m;
return { r_m: r, period_s: orbitalPeriod(body.mu, r), v_m_s: circularOrbitVelocity(body.mu, r) }
    },
  },
  {
    name: "isentropic_nozzle",
    description: "Isentropic nozzle Me, area ratio, ve.",
    inputSchema: {
    gamma: z.number(),
    pe_pc: z.number(),
    Rgas: z.number().optional(),
    tc_k: z.number().optional(),
  },
    sample: {"gamma":1.2,"pe_pc":0.01,"Rgas":320,"tc_k":3500},
    run: (args) => {
      const n = isentropicNozzle({ gamma: args.gamma, peOverPc: args.pe_pc }); if (!n) return null;
const ve = isentropicExitVelocity(args.gamma, args.Rgas ?? 320, args.tc_k ?? 3500, args.pe_pc);
return { ...n, ve_m_s: ve, isp_s: ve == null ? null : ve / 9.80665 }
    },
  },
  {
    name: "characteristic_velocity_cstar",
    description: "c* measured and ideal.",
    inputSchema: {
    pc_pa: z.number(),
    at_m2: z.number(),
    mdot_kg_s: z.number(),
    gamma: z.number(),
    Rgas: z.number(),
    tc_k: z.number(),
  },
    sample: {"pc_pa":7000000,"at_m2":0.05,"mdot_kg_s":250,"gamma":1.2,"Rgas":320,"tc_k":3500},
    run: (args) => {
      const cm = characteristicVelocity(args.pc_pa, args.at_m2, args.mdot_kg_s); const ci = idealCstar(args.gamma, args.Rgas, args.tc_k);
return { cstar_m_m_s: cm, cstar_ideal_m_s: ci, eta: cm != null && ci ? cm / ci : null }
    },
  },
  {
    name: "throat_area_sizing",
    description: "Throat area from thrust and Cf, pc.",
    inputSchema: {
    thrust_n: z.number(),
    cf: z.number(),
    pc_pa: z.number(),
  },
    sample: {"thrust_n":500000,"cf":1.6,"pc_pa":7000000},
    run: (args) => {
      const at = throatAreaFromThrust(args.thrust_n, args.cf, args.pc_pa); return at == null ? null : { at_m2: at }
    },
  },
  {
    name: "rocket_thrust_chamber",
    description: "Thrust from Cf, pc, At.",
    inputSchema: {
    cf: z.number(),
    pc_pa: z.number(),
    at_m2: z.number(),
  },
    sample: {"cf":1.6,"pc_pa":7000000,"at_m2":0.05},
    run: (args) => {
      const f = thrustFromCf(args.cf, args.pc_pa, args.at_m2); return f == null ? null : { thrust_n: f }
    },
  },
  {
    name: "mixture_ratio",
    description: "Oxidizer/fuel mixture ratio.",
    inputSchema: {
    mox_kg_s: z.number(),
    mfuel_kg_s: z.number(),
  },
    sample: {"mox_kg_s":2,"mfuel_kg_s":1},
    run: (args) => {
      const r = mixtureRatio(args.mox_kg_s, args.mfuel_kg_s); return r == null ? null : { r }
    },
  },
  {
    name: "tank_ullage",
    description: "Propellant mass from volume fill and density.",
    inputSchema: {
    volume_m3: z.number(),
    fill: z.number(),
    rho_kg_m3: z.number(),
  },
    sample: {"volume_m3":0.5,"fill":0.95,"rho_kg_m3":1000},
    run: (args) => {
      const m = tankPropellantMass(args.volume_m3, args.fill, args.rho_kg_m3); return m == null ? null : { m_kg: m }
    },
  },
  {
    name: "blowdown_tank",
    description: "Blowdown pressure isothermal/isentropic.",
    inputSchema: {
    p1_pa: z.number(),
    v1_m3: z.number(),
    v2_m3: z.number(),
    gamma: z.number().optional(),
  },
    sample: {"p1_pa":2000000,"v1_m3":0.01,"v2_m3":0.05,"gamma":1.4},
    run: (args) => {
      return { p_iso_pa: blowdownPressureIsothermal(args.p1_pa, args.v1_m3, args.v2_m3),
      p_isen_pa: blowdownPressureIsentropic(args.p1_pa, args.v1_m3, args.v2_m3, args.gamma ?? 1.4) }
    },
  },
  {
    name: "propellant_density_impulse",
    description: "Density specific impulse ρ·Isp.",
    inputSchema: {
    rho_kg_m3: z.number(),
    isp_s: z.number(),
  },
    sample: {"rho_kg_m3":1000,"isp_s":300},
    run: (args) => {
      const d = densityImpulse(args.rho_kg_m3, args.isp_s); return d == null ? null : { rho_isp: d }
    },
  },
  {
    name: "cold_gas_thrust",
    description: "Cold-gas thrust from mdot and ve.",
    inputSchema: {
    mdot_kg_s: z.number(),
    ve_m_s: z.number(),
  },
    sample: {"mdot_kg_s":0.01,"ve_m_s":700},
    run: (args) => {
      const f = coldGasThrust(args.mdot_kg_s, args.ve_m_s); return f == null ? null : { thrust_n: f }
    },
  },
  {
    name: "ion_thruster_efficiency",
    description: "Ion thruster efficiency sketch.",
    inputSchema: {
    thrust_n: z.number(),
    mdot_kg_s: z.number(),
    power_w: z.number(),
  },
    sample: {"thrust_n":0.05,"mdot_kg_s":0.000001,"power_w":1500},
    run: (args) => {
      const eta = ionThrusterEfficiency(args.thrust_n, args.mdot_kg_s, args.power_w); return eta == null ? null : { eta }
    },
  },
  {
    name: "hall_thruster_isp",
    description: "Hall thruster exit velocity / Isp.",
    inputSchema: {
    voltage_v: z.number(),
    ion_mass_kg: z.number(),
  },
    sample: {"voltage_v":300,"ion_mass_kg":2.18e-25},
    run: (args) => {
      const ve = hallExitVelocity(args.voltage_v, args.ion_mass_kg); return ve == null ? null : { ve_m_s: ve, isp_s: ve / 9.80665 }
    },
  },
  {
    name: "gnss_pseudorange",
    description: "GNSS pseudorange from clock bias.",
    inputSchema: {
    dt_s: z.number(),
    clock_bias_s: z.number().optional(),
  },
    sample: {"dt_s":0.07,"clock_bias_s":0.000001},
    run: (args) => {
      return { rho_m: gnssPseudorange(args.dt_s, args.clock_bias_s ?? 0) }
    },
  },
  {
    name: "gnss_geometry_gdop",
    description: "GDOP from four unit vectors (educational).",
    inputSchema: {
    ux1: z.number(),
    uy1: z.number(),
    uz1: z.number(),
    ux2: z.number(),
    uy2: z.number(),
    uz2: z.number(),
    ux3: z.number(),
    uy3: z.number(),
    uz3: z.number(),
    ux4: z.number(),
    uy4: z.number(),
    uz4: z.number(),
  },
    sample: {"ux1":0.5,"uy1":0.5,"uz1":0.7,"ux2":-0.3,"uy2":0.4,"uz2":0.86,"ux3":0.2,"uy3":-0.6,"uz3":0.77,"ux4":-0.4,"uy4":-0.2,"uz4":0.89},
    run: (args) => {
      return gnssDopFromUnitVectors([
      [args.ux1,args.uy1,args.uz1],[args.ux2,args.uy2,args.uz2],[args.ux3,args.uy3,args.uz3],[args.ux4,args.uy4,args.uz4]])
    },
  },
  {
    name: "laser_link_budget",
    description: "Optical link received power sketch.",
    inputSchema: {
    pt_w: z.number(),
    gt: z.number(),
    gr: z.number(),
    wavelength_m: z.number(),
    range_m: z.number(),
    eta_t: z.number().optional(),
    eta_r: z.number().optional(),
  },
    sample: {"pt_w":1,"gt":100000,"gr":100000,"wavelength_m":0.00000155,"range_m":1000000,"eta_t":0.8,"eta_r":0.7},
    run: (args) => {
      const pr = opticalLinkReceivedPower({
        ptW: args.pt_w, gt: args.gt, gr: args.gr, wavelengthM: args.wavelength_m,
        rangeM: args.range_m, etaT: args.eta_t ?? 1, etaR: args.eta_r ?? 1,
      })
      return pr == null ? null : { pr_w: pr }
    },
  },
  {
    name: "laser_pointing_jitter",
    description: "Laser spot radius from range and jitter.",
    inputSchema: {
    range_m: z.number(),
    jitter_rad: z.number(),
  },
    sample: {"range_m":1000,"jitter_rad":0.00001},
    run: (args) => {
      const r = laserSpotRadius(args.range_m, args.jitter_rad); return r == null ? null : { spot_m: r }
    },
  },
  {
    name: "laser_time_of_flight",
    description: "Laser range from TOF / RTT.",
    inputSchema: {
    dt_s: z.number(),
    rtt: z.boolean().optional(),
  },
    sample: {"dt_s":0.00001,"rtt":true},
    run: (args) => {
      const r = args.rtt ? laserRangeFromRtt(args.dt_s) : laserRangeFromTof(args.dt_s); return r == null ? null : { range_m: r }
    },
  },
  {
    name: "impedance_matching",
    description: "Reflection coefficient and VSWR.",
    inputSchema: {
    zl_ohm: z.number(),
    z0_ohm: z.number(),
  },
    sample: {"zl_ohm":75,"z0_ohm":50},
    run: (args) => {
      const g = reflectionCoeff(args.zl_ohm, args.z0_ohm); const v = vswrFromGamma(g ?? 0); const rl = returnLossDb(g ?? 0);
return { gamma: g, vswr: v, return_loss_db: rl }
    },
  },
  {
    name: "antenna_gain_effective",
    description: "Effective aperture from gain.",
    inputSchema: {
    gain: z.number(),
    wavelength_m: z.number(),
  },
    sample: {"gain":100,"wavelength_m":0.03},
    run: (args) => {
      const ae = effectiveAperture(args.gain, args.wavelength_m); return ae == null ? null : { ae_m2: ae }
    },
  },
  {
    name: "doppler_shift_leo",
    description: "Radial Doppler shift.",
    inputSchema: {
    f0_hz: z.number(),
    vr_m_s: z.number(),
  },
    sample: {"f0_hz":2200000000,"vr_m_s":1000},
    run: (args) => {
      const fd = dopplerShiftHz(args.f0_hz, args.vr_m_s); return fd == null ? null : { fd_hz: fd }
    },
  },
  {
    name: "radar_equation",
    description: "Monostatic radar received power.",
    inputSchema: {
    pt_w: z.number(),
    gain: z.number(),
    wavelength_m: z.number(),
    rcs_m2: z.number(),
    range_m: z.number(),
  },
    sample: {"pt_w":1000,"gain":1000,"wavelength_m":0.03,"rcs_m2":1,"range_m":100000},
    run: (args) => {
      const pr = radarReceivedPower({ pt: args.pt_w, g: args.gain, wavelength: args.wavelength_m, rcs: args.rcs_m2, range: args.range_m })
      return pr == null ? null : { pr_w: pr }
    },
  },
  {
    name: "rain_attenuation_simple",
    description: "Simple rain attenuation.",
    inputSchema: {
    k: z.number(),
    rate_mm_h: z.number(),
    alpha: z.number(),
    path_km: z.number(),
  },
    sample: {"k":0.01,"rate_mm_h":10,"alpha":1,"path_km":5},
    run: (args) => {
      const a = rainAttenuationDb(args.k, args.rate_mm_h, args.alpha, args.path_km); return a == null ? null : { atten_db: a }
    },
  },
  {
    name: "ttc_ebno",
    description: "Eb/N0 from C/N0 and bit rate.",
    inputSchema: {
    cn0_dbhz: z.number(),
    rb_bps: z.number(),
  },
    sample: {"cn0_dbhz":55,"rb_bps":1000000},
    run: (args) => {
      const e = ebN0FromCn0(args.cn0_dbhz, args.rb_bps); return e == null ? null : { eb_n0_db: e }
    },
  },
  {
    name: "optical_ber_q",
    description: "Optical Q-factor from SNR.",
    inputSchema: {
    snr: z.number(),
  },
    sample: {"snr":100},
    run: (args) => {
      const q = opticalQFromSnr(args.snr); return q == null ? null : { q }
    },
  },
  {
    name: "gnss_troposphere_delay",
    description: "Saastamoinen-class tropo delay.",
    inputSchema: {
    elev_deg: z.number(),
    lat_deg: z.number(),
    height_m: z.number(),
  },
    sample: {"elev_deg":30,"lat_deg":28.57,"height_m":10},
    run: (args) => {
      const d = saastamoinenTropoDelay((args.elev_deg*Math.PI)/180, (args.lat_deg*Math.PI)/180, args.height_m);
return d == null ? null : { delay_m: d }
    },
  },
  {
    name: "free_fall_time",
    description: "Constant-g free fall.",
    inputSchema: {
    h_m: z.number(),
    g: z.number().optional(),
  },
    sample: {"h_m":100,"g":9.80665},
    run: (args) => {
      return { t_s: freeFallTimeConstG(args.h_m, args.g ?? 9.80665), v_m_s: freeFallSpeedConstG(args.h_m, args.g ?? 9.80665) }
    },
  },
  {
    name: "ballistic_range",
    description: "Flat-Earth ballistic range.",
    inputSchema: {
    v0_m_s: z.number(),
    gamma_deg: z.number(),
    g: z.number().optional(),
  },
    sample: {"v0_m_s":1000,"gamma_deg":45},
    run: (args) => {
      const r = ballisticRangeFlat(args.v0_m_s, (args.gamma_deg*Math.PI)/180, args.g ?? 9.80665); return r == null ? null : { range_m: r }
    },
  },
  {
    name: "terminal_velocity",
    description: "Terminal velocity.",
    inputSchema: {
    mass_kg: z.number(),
    rho_kg_m3: z.number(),
    cd: z.number(),
    area_m2: z.number(),
    g: z.number().optional(),
  },
    sample: {"mass_kg":80,"rho_kg_m3":1.225,"cd":1,"area_m2":0.7},
    run: (args) => {
      const v = terminalVelocity(args.mass_kg, args.rho_kg_m3, args.cd, args.area_m2, args.g ?? 9.80665); return v == null ? null : { v_m_s: v }
    },
  },
  {
    name: "parachute_descent",
    description: "Parachute descent rate (terminal).",
    inputSchema: {
    mass_kg: z.number(),
    rho_kg_m3: z.number(),
    cd: z.number(),
    area_m2: z.number(),
    g: z.number().optional(),
  },
    sample: {"mass_kg":100,"rho_kg_m3":1.225,"cd":1.5,"area_m2":30},
    run: (args) => {
      const v = terminalVelocity(args.mass_kg, args.rho_kg_m3, args.cd, args.area_m2, args.g ?? 9.80665); return v == null ? null : { v_m_s: v }
    },
  },
  {
    name: "coordinated_turn_bank",
    description: "Bank angle for coordinated turn.",
    inputSchema: {
    v_m_s: z.number(),
    radius_m: z.number(),
    g: z.number().optional(),
  },
    sample: {"v_m_s":100,"radius_m":500},
    run: (args) => {
      const phi = bankAngleRad(args.v_m_s, args.radius_m, args.g ?? 9.80665); return phi == null ? null : { bank_rad: phi }
    },
  },
  {
    name: "slew_rate_pointing",
    description: "Rest-to-rest slew time.",
    inputSchema: {
    delta_theta_rad: z.number(),
    w_max: z.number(),
    a_max: z.number(),
  },
    sample: {"delta_theta_rad":0.5,"w_max":0.1,"a_max":0.01},
    run: (args) => {
      const t = slewTimeMin(args.delta_theta_rad, args.w_max, args.a_max); return t == null ? null : { t_s: t }
    },
  },
  {
    name: "magnetic_torque",
    description: "Magnetic torque rod.",
    inputSchema: {
    m_a_m2: z.number(),
    b_t: z.number(),
    theta_deg: z.number(),
  },
    sample: {"m_a_m2":10,"b_t":0.00003,"theta_deg":90},
    run: (args) => {
      const t = magneticTorque(args.m_a_m2, args.b_t, (args.theta_deg*Math.PI)/180); return t == null ? null : { torque_n_m: t }
    },
  },
  {
    name: "gravity_gradient_torque",
    description: "Gravity-gradient torque sketch.",
    inputSchema: {
    mu: z.number().optional(),
    r_m: z.number(),
    delta_i_kg_m2: z.number(),
    delta_deg: z.number(),
  },
    sample: {"r_m":6778137,"delta_i_kg_m2":1,"delta_deg":5},
    run: (args) => {
      const t = gravityGradientTorque(args.mu ?? EARTH_MU, args.r_m, args.delta_i_kg_m2, (args.delta_deg*Math.PI)/180);
return t == null ? null : { torque_n_m: t }
    },
  },
  {
    name: "rw_momentum_capacity",
    description: "RW momentum h = I ω.",
    inputSchema: {
    inertia_kg_m2: z.number(),
    omega_rad_s: z.number(),
  },
    sample: {"inertia_kg_m2":0.01,"omega_rad_s":500},
    run: (args) => {
      const h = rwMomentum(args.inertia_kg_m2, args.omega_rad_s); return h == null ? null : { h_n_m_s: h }
    },
  },
  {
    name: "sun_sensor_cone",
    description: "Sun-sensor cone angle.",
    inputSchema: {
    nx: z.number(),
    ny: z.number(),
    nz: z.number(),
    sx: z.number(),
    sy: z.number(),
    sz: z.number(),
  },
    sample: {"nx":0,"ny":0,"nz":1,"sx":0.1,"sy":0,"sz":0.995},
    run: (args) => {
      const th = sunSensorAngle([args.nx,args.ny,args.nz],[args.sx,args.sy,args.sz]); return th == null ? null : { theta_rad: th }
    },
  },
  {
    name: "star_tracker_noise",
    description: "Star-tracker noise estimate.",
    inputSchema: {
    pixel_rad: z.number(),
    n_stars: z.number(),
  },
    sample: {"pixel_rad":0.00001,"n_stars":10},
    run: (args) => {
      const s = starTrackerNoiseRad(args.pixel_rad, args.n_stars); return s == null ? null : { sigma_rad: s }
    },
  },
  {
    name: "constellation_walker",
    description: "Walker constellation spacing.",
    inputSchema: {
    t: z.number(),
    p: z.number(),
  },
    sample: {"t":24,"p":3},
    run: (args) => {
      return walkerSpacing(args.t, args.p)
    },
  },
  {
    name: "coverage_swath",
    description: "Ground coverage swath.",
    inputSchema: {
    altitude_m: z.number(),
    fov_deg: z.number(),
    body_radius_m: z.number().optional(),
  },
    sample: {"altitude_m":700000,"fov_deg":30},
    run: (args) => {
      const w = coverageSwathWidth(args.altitude_m, (args.fov_deg*Math.PI)/180, args.body_radius_m ?? EARTH_RADIUS);
return w == null ? null : { swath_m: w }
    },
  },
  {
    name: "revisit_time_simple",
    description: "Rough revisit time.",
    inputSchema: {
    period_s: z.number(),
    swath_m: z.number(),
    body_radius_m: z.number().optional(),
  },
    sample: {"period_s":5700,"swath_m":100000},
    run: (args) => {
      const t = revisitTimeSimple(args.period_s, args.swath_m, args.body_radius_m ?? EARTH_RADIUS); return t == null ? null : { t_rev_s: t }
    },
  },
  {
    name: "geo_stationkeeping_dv",
    description: "GEO stationkeeping yearly Δv.",
    inputSchema: {
    dv_ns_m_s: z.number(),
    dv_ew_m_s: z.number(),
  },
    sample: {"dv_ns_m_s":50,"dv_ew_m_s":5},
    run: (args) => {
      const y = geoStationkeepingDvYear(args.dv_ns_m_s, args.dv_ew_m_s); return y == null ? null : { dv_year_m_s: y }
    },
  },
  {
    name: "geo_propellant_budget",
    description: "GEO propellant for yearly Δv and life.",
    inputSchema: {
    dry_mass_kg: z.number(),
    isp_s: z.number(),
    dv_year_m_s: z.number(),
    life_years: z.number(),
  },
    sample: {"dry_mass_kg":2000,"isp_s":220,"dv_year_m_s":50,"life_years":15},
    run: (args) => {
      return geoPropellantBudget(args.dry_mass_kg, args.isp_s, args.dv_year_m_s, args.life_years)
    },
  },
  {
    name: "drag_make_up_dv",
    description: "Drag make-up Δv per rev.",
    inputSchema: {
    rho_kg_m3: z.number(),
    a_m: z.number(),
    v_m_s: z.number(),
    beta_kg_m2: z.number(),
  },
    sample: {"rho_kg_m3":2e-12,"a_m":6778137,"v_m_s":7660,"beta_kg_m2":100},
    run: (args) => {
      const dv = dragMakeupDvPerRev(args.rho_kg_m3, args.a_m, args.v_m_s, args.beta_kg_m2); return dv == null ? null : { dv_m_s: dv }
    },
  },
  {
    name: "tisserand_parameter",
    description: "Tisserand parameter.",
    inputSchema: {
    a_m: z.number(),
    a_p_m: z.number(),
    e: z.number(),
    i_deg: z.number(),
  },
    sample: {"a_m":500000000000,"a_p_m":778000000000,"e":0.2,"i_deg":5},
    run: (args) => {
      const T = tisserandParameter(args.a_m, args.e, (args.i_deg*Math.PI)/180, args.a_p_m)
      return T == null ? null : { T }
    },
  },
  {
    name: "eps_orbit_average",
    description: "Orbit-average EPS power.",
    inputSchema: {
    p_sun_w: z.number(),
    f_ecl: z.number(),
    eta: z.number(),
  },
    sample: {"p_sun_w":200,"f_ecl":0.35,"eta":0.28},
    run: (args) => {
      const p = epsOrbitAverage(args.p_sun_w, args.f_ecl, args.eta); return p == null ? null : { p_avg_w: p }
    },
  },
  {
    name: "relativity_clock_rate",
    description: "Relativistic clock rate sketch.",
    inputSchema: {
    dphi_j_kg: z.number(),
    v_m_s: z.number(),
  },
    sample: {"dphi_j_kg":10000000,"v_m_s":7000},
    run: (args) => {
      const d = relativityClockRate(args.dphi_j_kg, args.v_m_s); return d == null ? null : { df_f: d }
    },
  },
  {
    name: "gnss_ionosphere_klobuchar",
    description: "Klobuchar-class iono delay.",
    inputSchema: {
    elev_deg: z.number(),
    tecu: z.number(),
    freq_hz: z.number().optional(),
  },
    sample: {"elev_deg":45,"tecu":20},
    run: (args) => {
      const d = klobucharIonoDelayM((args.elev_deg*Math.PI)/180, args.tecu, args.freq_hz); return d == null ? null : { delay_m: d }
    },
  },
  {
    name: "optical_gsd",
    description: "Optical GSD.",
    inputSchema: {
    altitude_m: z.number(),
    ifov_rad: z.number(),
  },
    sample: {"altitude_m":500000,"ifov_rad":0.00001},
    run: (args) => {
      const g = opticalGsd(args.altitude_m, args.ifov_rad); return g == null ? null : { gsd_m: g }
    },
  },
  {
    name: "solar_sail_accel",
    description: "Solar sail acceleration.",
    inputSchema: {
    eta: z.number(),
    area_m2: z.number(),
    mass_kg: z.number(),
    flux_w_m2: z.number().optional(),
  },
    sample: {"eta":0.9,"area_m2":100,"mass_kg":10,"flux_w_m2":1361},
    run: (args) => {
      const a = solarSailAccel(args.eta, args.flux_w_m2 ?? 1361, args.area_m2, args.mass_kg); return a == null ? null : { a_m_s2: a }
    },
  },
  {
    name: "finite_burn_dv",
    description: "Finite-burn rocket Δv.",
    inputSchema: {
    ve_m_s: z.number(),
    m0_kg: z.number(),
    mdot_kg_s: z.number(),
    burn_s: z.number(),
  },
    sample: {"ve_m_s":3000,"m0_kg":1000,"mdot_kg_s":2,"burn_s":100},
    run: (args) => {
      const dv = finiteBurnDv(args.ve_m_s, args.m0_kg, args.mdot_kg_s, args.burn_s)
      return dv == null ? null : { dv_m_s: dv }
    },
  },
  {
    name: "b_plane_impact",
    description: "B-plane impact parameter.",
    inputSchema: {
    mu: z.number().optional(),
    v_inf_m_s: z.number(),
    turn_deg: z.number(),
  },
    sample: {"v_inf_m_s":5000,"turn_deg":30},
    run: (args) => {
      const b = bPlaneImpactParameter(args.mu ?? EARTH_MU, args.v_inf_m_s, (args.turn_deg*Math.PI)/180); return b == null ? null : { b_m: b }
    },
  },
  {
    name: "cr3bp_jacobi",
    description: "CR3BP Jacobi constant sketch.",
    inputSchema: {
    mu_star: z.number(),
    x: z.number(),
    y: z.number(),
    z: z.number(),
    vx: z.number(),
    vy: z.number(),
    vz: z.number(),
  },
    sample: {"mu_star":0.012,"x":0.8,"y":0,"z":0,"vx":0,"vy":0.1,"vz":0},
    run: (args) => {
      const j = jacobiConstant(args.x, args.y, args.vx, args.vy, args.mu_star)
      return j == null ? null : { jacobi: j }
    },
  },
  {
    name: "orbit_lifetime_rough",
    description: "Rough drag lifetime.",
    inputSchema: {
    h_m: z.number(),
    beta_kg_m2: z.number(),
    rho_kg_m3: z.number(),
    v_m_s: z.number(),
    scale_h_m: z.number().optional(),
  },
    sample: {"h_m":400000,"beta_kg_m2":100,"rho_kg_m3":2e-12,"v_m_s":7660,"scale_h_m":50000},
    run: (args) => {
      const t = orbitLifetimeRough(args.h_m, args.beta_kg_m2, args.rho_kg_m3, args.v_m_s, args.scale_h_m); return t == null ? null : { t_s: t }
    },
  },
  {
    name: "geo_drift_rate",
    description: "GEO longitude drift rate from a vs a_GEO.",
    inputSchema: {
    a_m: z.number(),
    a_geo_m: z.number(),
    n_geo: z.number(),
  },
    sample: {"a_m":42165170,"a_geo_m":42164170,"n_geo":7.292115e-5},
    run: (args) => {
      const d = geoDriftRate(args.a_m, args.a_geo_m, args.n_geo)
      return d == null ? null : { drift_rad_s: d }
    },
  },
  {
    name: "stefan_boltzmann",
    description: "P = ε σ A T^4.",
    inputSchema: {
    eps: z.number(),
    area_m2: z.number(),
    temp_k: z.number(),
  },
    sample: {"eps":0.8,"area_m2":1,"temp_k":300},
    run: (args) => {
      const p = stefanBoltzmannPower(args.area_m2, args.temp_k, args.eps)
      return p == null ? null : { p_w: p }
    },
  },
  {
    name: "wien_peak",
    description: "Wien peak wavelength.",
    inputSchema: {
    temp_k: z.number(),
  },
    sample: {"temp_k":5800},
    run: (args) => {
      const l = wienPeakWavelength(args.temp_k); return l == null ? null : { lambda_m: l }
    },
  },
  {
    name: "thruster_impulse_bit",
    description: "Impulse bit.",
    inputSchema: {
    thrust_n: z.number(),
    pulse_s: z.number(),
  },
    sample: {"thrust_n":1,"pulse_s":0.05},
    run: (args) => {
      const ib = thrusterImpulseBit(args.thrust_n, args.pulse_s); return ib == null ? null : { impulse_bit_n_s: ib }
    },
  },
  {
    name: "arg_perigee_drift_j2",
    description: "J2 argument of perigee drift.",
    inputSchema: {
    a_m: z.number(),
    e: z.number(),
    i_deg: z.number(),
  },
    sample: {"a_m":6778137,"e":0.001,"i_deg":51.6},
    run: (args) => {
      const a = args.a_m
      const e = args.e
      if (!(a > 0) || !(e >= 0) || !(e < 1)) return null
      const n = Math.sqrt(EARTH_MU / (a * a * a))
      const p = a * (1 - e * e)
      const r = argPerigeeDriftJ2(n, 1.08262668e-3, EARTH_RADIUS, p, (args.i_deg * Math.PI) / 180)
      return r == null ? null : { argp_rate_rad_s: r }
    },
  },
  {
    name: "sar_azimuth_resolution",
    description: "SAR azimuth resolution sketch.",
    inputSchema: {
    wavelength_m: z.number(),
    synth_angle_rad: z.number(),
  },
    sample: {"wavelength_m":0.03,"synth_angle_rad":0.1},
    run: (args) => {
      const r = sarAzimuthResolution(args.wavelength_m, args.synth_angle_rad)
      return r == null ? null : { res_m: r }
    },
  },
  {
    name: "radar_range_resolution",
    description: "Radar range resolution.",
    inputSchema: {
    bandwidth_hz: z.number(),
  },
    sample: {"bandwidth_hz":50000000},
    run: (args) => {
      const r = radarRangeResolution(args.bandwidth_hz); return r == null ? null : { res_m: r }
    },
  },
  {
    name: "link_margin",
    description: "Link margin from C/N0 and required.",
    inputSchema: {
    cn0_dbhz: z.number(),
    required_dbhz: z.number(),
  },
    sample: {"cn0_dbhz":55,"required_dbhz":45},
    run: (args) => {
      const m = linkMarginDb(args.cn0_dbhz, args.required_dbhz); return m == null ? null : { margin_db: m }
    },
  },
  {
    name: "aerobraking_pass",
    description: "Aerobraking Δv sketch.",
    inputSchema: {
    ballistic_inv: z.number(),
    density: z.number(),
    speed: z.number(),
    path_length: z.number(),
  },
    sample: {"ballistic_inv":0.01,"density":1e-8,"speed":5000,"path_length":1e5},
    run: (args) => {
      const dv = aerobrakingDv(args.ballistic_inv, args.density, args.speed, args.path_length)
      return dv == null ? null : { dv_m_s: dv }
    },
  },
  {
    name: "diffraction_limit",
    description: "Diffraction limit angle.",
    inputSchema: {
    wavelength_m: z.number(),
    diameter_m: z.number(),
  },
    sample: {"wavelength_m":5.5e-7,"diameter_m":1},
    run: (args) => {
      const t = diffractionLimitAngle(args.wavelength_m, args.diameter_m); return t == null ? null : { theta_rad: t }
    },
  },
  {
    name: "panel_eol_power",
    description: "Panel EOL power with degradation.",
    inputSchema: {
    p_bol_w: z.number(),
    years: z.number(),
    degrade_per_year: z.number(),
  },
    sample: {"p_bol_w":300,"years":5,"degrade_per_year":0.02},
    run: (args) => {
      const p = panelEolPower(args.p_bol_w, args.degrade_per_year, args.years)
      return p == null ? null : { p_eol_w: p }
    },
  },
  {
    name: "magnetorquer_moment",
    description: "Magnetorquer magnetic moment.",
    inputSchema: {
    n_turns: z.number(),
    current_a: z.number(),
    area_m2: z.number(),
  },
    sample: {"n_turns":100,"current_a":0.5,"area_m2":0.01},
    run: (args) => {
      const m = magnetorquerMoment(args.n_turns, args.current_a, args.area_m2); return m == null ? null : { m_a_m2: m }
    },
  },
  {
    name: "hyperbolic_eccentricity",
    description: "Hyperbolic eccentricity from r_p, v_inf.",
    inputSchema: {
    rp_m: z.number(),
    v_inf_m_s: z.number(),
    mu: z.number().optional(),
  },
    sample: {"rp_m":6778137,"v_inf_m_s":3000},
    run: (args) => {
      const e = hyperbolicEccentricity(args.mu ?? EARTH_MU, args.rp_m, args.v_inf_m_s); return e == null ? null : { e }
    },
  },
  {
    name: "capture_circularize",
    description: "Capture then circularize Δv.",
    inputSchema: {
    rp_m: z.number(),
    v_inf_m_s: z.number(),
    mu: z.number().optional(),
  },
    sample: {"rp_m":6778137,"v_inf_m_s":2000},
    run: (args) => {
      return captureCircularizeDv(args.mu ?? EARTH_MU, args.rp_m, args.v_inf_m_s)
    },
  },
  {
    name: "gravity_loss",
    description: "Gravity loss sketch.",
    inputSchema: {
    g: z.number(),
    burn_s: z.number(),
    pitch_deg: z.number().optional(),
  },
    sample: {"g":9.8,"burn_s":100,"pitch_deg":30},
    run: (args) => {
      const dv = gravityLossDv(args.g, args.burn_s, (args.pitch_deg ?? 0) * Math.PI / 180); return dv == null ? null : { dv_m_s: dv }
    },
  },
  {
    name: "battery_dod",
    description: "Battery depth of discharge.",
    inputSchema: {
    used_ah: z.number(),
    capacity_ah: z.number(),
  },
    sample: {"used_ah":10,"capacity_ah":50},
    run: (args) => {
      const d = batteryDepthOfDischarge(args.used_ah, args.capacity_ah); return d == null ? null : { dod: d }
    },
  },
  {
    name: "umbra_length",
    description: "Umbra length for eclipse geometry.",
    inputSchema: {
    r_sun_m: z.number(),
    r_body_m: z.number(),
    dist_m: z.number(),
  },
    sample: {"r_sun_m":696000000.0,"r_body_m":6378137,"dist_m":149600000000.0},
    run: (args) => {
      const L = umbraLength(args.dist_m, args.r_sun_m, args.r_body_m)
      return L == null ? null : { length_m: L }
    },
  },
  {
    name: "mean_anomaly_from_e",
    description: "M from E, e.",
    inputSchema: {
    e: z.number(),
    E_rad: z.number(),
  },
    sample: {"e":0.1,"E_rad":0.5},
    run: (args) => {
      const M = meanAnomalyFromE(args.e, args.E_rad); return M == null ? null : { M_rad: M }
    },
  },
  {
    name: "flight_path_angle",
    description: "Flight path angle on ellipse.",
    inputSchema: {
    e: z.number(),
    nu_deg: z.number(),
  },
    sample: {"e":0.1,"nu_deg":45},
    run: (args) => {
      const f = flightPathAngle(args.e, (args.nu_deg*Math.PI)/180); return f == null ? null : { gamma_rad: f }
    },
  },
  {
    name: "hoop_stress",
    description: "Thin-wall hoop stress.",
    inputSchema: {
    pressure_pa: z.number(),
    radius_m: z.number(),
    thickness_m: z.number(),
  },
    sample: {"pressure_pa":2000000,"radius_m":0.5,"thickness_m":0.005},
    run: (args) => {
      const s = hoopStress(args.pressure_pa, args.radius_m, args.thickness_m); return s == null ? null : { stress_pa: s }
    },
  },
  {
    name: "exponential_density",
    description: "ρ = ρ0 exp(-h/H).",
    inputSchema: {
    rho0: z.number(),
    h_m: z.number(),
    H_m: z.number(),
  },
    sample: {"rho0":1.225,"h_m":400000,"H_m":8500},
    run: (args) => {
      const rho = exponentialDensity(args.rho0, args.h_m, args.H_m); return rho == null ? null : { rho_kg_m3: rho }
    },
  },
  {
    name: "hill_sphere",
    description: "Hill sphere radius.",
    inputSchema: {
    a_m: z.number(),
    m: z.number(),
    M: z.number(),
  },
    sample: {"a_m":149600000000,"m":5.97e+24,"M":1.989e+30},
    run: (args) => {
      const r = hillSphere(args.a_m, args.m, args.M); return r == null ? null : { r_hill_m: r }
    },
  },
  {
    name: "edelbaum_dv",
    description: "Edelbaum low-thrust Δv.",
    inputSchema: {
    v1_m_s: z.number(),
    v2_m_s: z.number(),
    di_deg: z.number(),
  },
    sample: {"v1_m_s":7700,"v2_m_s":3100,"di_deg":28},
    run: (args) => {
      const dv = edelbaumDv(args.v1_m_s, args.v2_m_s, (args.di_deg*Math.PI)/180); return dv == null ? null : { dv_m_s: dv }
    },
  },
  {
    name: "repeating_ground_track",
    description: "Repeating ground-track period.",
    inputSchema: {
    orbits: z.number(),
    days: z.number(),
  },
    sample: {"orbits":14,"days":1},
    run: (args) => {
      const t = repeatingGroundTrackPeriod(args.orbits, args.days); return t == null ? null : { period_s: t }
    },
  },
  {
    name: "pointing_budget_rss",
    description: "RSS pointing budget.",
    inputSchema: {
    s1_rad: z.number(),
    s2_rad: z.number(),
    s3_rad: z.number().optional(),
  },
    sample: {"s1_rad":0.0001,"s2_rad":0.0002,"s3_rad":0.0001},
    run: (args) => {
      const p = pointingBudgetRss([args.s1_rad, args.s2_rad, args.s3_rad ?? 0]); return p == null ? null : { rss_rad: p }
    },
  },
  {
    name: "boiloff_rate",
    description: "Cryogenic boiloff rate.",
    inputSchema: {
    heat_w: z.number(),
    hfg_j_kg: z.number(),
  },
    sample: {"heat_w":10,"hfg_j_kg":200000},
    run: (args) => {
      const m = boiloffRate(args.heat_w, args.hfg_j_kg); return m == null ? null : { mdot_kg_s: m }
    },
  },
  {
    name: "residual_dipole_torque",
    description: "Residual dipole torque.",
    inputSchema: {
    m_a_m2: z.number(),
    b_t: z.number(),
  },
    sample: {"m_a_m2":0.1,"b_t":0.00003},
    run: (args) => {
      const t = residualDipoleTorque(args.m_a_m2, args.b_t); return t == null ? null : { torque_n_m: t }
    },
  },
  {
    name: "solar_flux_distance",
    description: "Solar flux at heliocentric distance.",
    inputSchema: {
    r_au: z.number(),
    s0: z.number().optional(),
  },
    sample: {"r_au":1.5},
    run: (args) => {
      const f = solarFluxAtDistance(args.r_au, args.s0); return f == null ? null : { flux_w_m2: f }
    },
  },
  {
    name: "nyquist_rate",
    description: "Nyquist sample rate.",
    inputSchema: {
    f_max_hz: z.number(),
  },
    sample: {"f_max_hz":1000000},
    run: (args) => {
      const fs = nyquistSampleRate(args.f_max_hz); return fs == null ? null : { fs_hz: fs }
    },
  },
  {
    name: "data_volume",
    description: "Downlink data volume.",
    inputSchema: {
    rate_bps: z.number(),
    time_s: z.number(),
    eta: z.number().optional(),
  },
    sample: {"rate_bps":1000000,"time_s":600,"eta":0.9},
    run: (args) => {
      const v = dataVolumeBits(args.rate_bps, args.time_s, args.eta ?? 1); return v == null ? null : { bits: v }
    },
  },
  {
    name: "earth_ir_flux",
    description: "Earth IR flux at altitude.",
    inputSchema: {
    altitude_m: z.number(),
    t_earth_k: z.number().optional(),
    body_radius_m: z.number().optional(),
  },
    sample: {"altitude_m":400000,"t_earth_k":255},
    run: (args) => {
      const f = earthIrFlux(args.altitude_m, args.t_earth_k, args.body_radius_m); return f == null ? null : { flux_w_m2: f }
    },
  },
  {
    name: "bodies",
    description: "Alias of list_bodies payload.",
    inputSchema: {},
    sample: {},
    run: (_args) => {
      return BODIES.map((b) => ({ id: b.id, name: b.name, mu_m3_s2: b.mu, radius_m: b.radius, mass_kg: b.mass }))
    },
  },
  {
    name: "units",
    description: "Convert value between SI scale factors (to_si = value * scale).",
    inputSchema: {
    value: z.number(),
    scale: z.number(),
  },
    sample: {"value":400,"scale":1000},
    run: (args) => {
      return { si: args.value * args.scale }
    },
  },
  {
    name: "plotter",
    description: "Evaluate y = a*x^2 + b*x + c at x (educational).",
    inputSchema: {
    x: z.number(),
    a: z.number().optional(),
    b: z.number().optional(),
    c: z.number().optional(),
  },
    sample: {"x":2,"a":1,"b":0,"c":0},
    run: (args) => {
      const a = args.a ?? 0, b = args.b ?? 0, c = args.c ?? 0; return { y: a*args.x*args.x + b*args.x + c }
    },
  },
  {
    name: "kepler_propagate",
    description: "Universal-variable style period/mean motion sketch (not full state prop).",
    inputSchema: {
    a_m: z.number(),
    mu: z.number().optional(),
    dt_s: z.number().optional(),
  },
    sample: {"a_m":6778137,"dt_s":60},
    run: (args) => {
      const n = Math.sqrt((args.mu ?? EARTH_MU) / (args.a_m ** 3)); return { n_rad_s: n, mean_anomaly_advance_rad: n * (args.dt_s ?? 0) }
    },
  },
  {
    name: "lambert",
    description: "Chord geometry for Lambert (r1,r2,tof → chord; not full Lambert solve).",
    inputSchema: {
    r1_m: z.number(),
    r2_m: z.number(),
    tof_s: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r1_m":6778137,"r2_m":42164000,"tof_s":18000},
    run: (args) => {
      const c = Math.abs(args.r2_m - args.r1_m); const s = (args.r1_m + args.r2_m + c) / 2;
return { chord_m: c, semi_perimeter_m: s, tof_s: args.tof_s, mu: args.mu ?? EARTH_MU, note: 'Educational chord sketch; full Lambert in UI tool' }
    },
  },
  {
    name: "rv_elements",
    description: "Energy and h magnitude from r,v norms (not full COE).",
    inputSchema: {
    r_m: z.number(),
    v_m_s: z.number(),
    mu: z.number().optional(),
  },
    sample: {"r_m":6778137,"v_m_s":7660},
    run: (args) => {
      const mu = args.mu ?? EARTH_MU; const energy = args.v_m_s ** 2 / 2 - mu / args.r_m; const a = -mu / (2 * energy);
return { energy_j_kg: energy, a_m: a, note: 'Norm-based energy/a; full r,v↔COE in UI' }
    },
  },
  {
    name: "sgp4",
    description: "Mean motion from TLE mean-motion revs/day (not full SGP4 prop).",
    inputSchema: {
    n_rev_day: z.number(),
  },
    sample: {"n_rev_day":15.5},
    run: (args) => {
      const n = args.n_rev_day * 2 * Math.PI / 86400; return { n_rad_s: n, period_s: 2 * Math.PI / n, note: 'Use UI SGP4 tool for full TLE propagation' }
    },
  },
  {
    name: "look_angles",
    description: "Simple elevation from range and heights (not full ECI look).",
    inputSchema: {
    ground_range_m: z.number(),
    delta_h_m: z.number(),
  },
    sample: {"ground_range_m":500000,"delta_h_m":400000},
    run: (args) => {
      const el = elevationFromRangeHeight(args.ground_range_m, args.delta_h_m); const slant = slantRange(args.ground_range_m, args.delta_h_m);
return { elev_rad: el, slant_m: slant, note: 'Educational; full TLE look-angles in UI' }
    },
  },
  {
    name: "pass_predict",
    description: "Horizon crossing time sketch from period and duty (not full pass search).",
    inputSchema: {
    period_s: z.number(),
    visible_frac: z.number().optional(),
  },
    sample: {"period_s":5600,"visible_frac":0.1},
    run: (args) => {
      return { period_s: args.period_s, rough_pass_s: args.period_s * (args.visible_frac ?? 0.1), note: 'Full AOS/LOS search in UI pass-predict tool' }
    },
  },
]

export const MCP_SAMPLES: Record<string, Record<string, unknown>> = Object.fromEntries(
  MCP_TOOL_DEFS.map((t) => [t.name, t.sample]),
)
