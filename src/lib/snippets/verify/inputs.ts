/**
 * Shared input bags for snippet verification and the Godbolt matrix.
 *
 * Single source of the educational free-var values injected into every rendered
 * snippet, so the compile matrix and the numeric verifier exercise identical inputs.
 */
import { formatCodeNumber, type LiveCodeValues } from '../liveValues'
import { SCENARIOS } from './scenarios'

/**
 * Educational defaults: enough free-vars for pure-SI orbital / systems tools.
 * Tools that need special bags (SGP4 TLE, etc.) are library-backed and skipped
 * unless --include-lib.
 */
export const SAMPLE: LiveCodeValues = {
  // Earth LEO-ish
  mu: 3.986004418e14,
  R: 6_378_137,
  r_eq: 6_378_137,
  r: 6_778_137,
  r1: 6_778_137,
  r2: 42_164_000,
  rb: 100_000_000, // bielliptic intermediate apo > max(r1,r2)
  ra: 42_164_000,
  rp: 6_778_137,
  a: 6_778_137,
  a1: 6_778_137,
  a2: 42_164_000,
  // Tropo-safe altitude for ISA snippets; orbit tools usually free-var `r` directly
  h: 10_000,
  h_m: 10_000,
  h1: 400_000,
  h2: 35_786_000,
  payload: 1000,
  isp1: 280,
  isp2: 310,
  isp3: 320,
  m01: 100_000,
  mf1: 30_000,
  m02: 25_000,
  mf2: 8_000,
  m03: 5_000,
  mf3: 2_000,
  // ENU look-angles educational free vars (not eccentricity e)
  east: 1_000,
  north: 2_000,
  up: 500,
  // Look-angles / pass-predict SEZ core (system langs): satellite ECEF [m], SEZ range components [m], elevation mask [rad]
  sat_x: 4.6e6,
  sat_y: 2.6e6,
  sat_z: 3.6e6,
  south: -29561.8,
  zenith: 151219.5,
  el_min: 0.17453292519943295,
  ha: 35_786_000,
  hp: 400_000,
  e: 0.001,
  i_deg: 51.6,
  i: 51.6 * (Math.PI / 180),
  iRad: 51.6 * (Math.PI / 180),
  i_rad: 51.6 * (Math.PI / 180),
  di_deg: 10,
  diDeg: 10,
  di: 10 * (Math.PI / 180),
  raan: 0,
  argp: 0,
  nu: 0,
  E: 0.1,
  Ea: 0.1,
  // Rocket / mass / Δv
  m0: 1000,
  m_0: 1000,
  mf: 400,
  m_f: 400,
  Isp: 300,
  g0: 9.80665,
  n_stages: 2,
  nt: 2,
  dv: 3000,
  dvs: 3000,
  dv1: 1000,
  dv2: 1000,
  dv3: 500,
  F: 4500,
  // Dynamics
  v: 7800,
  V: 7800,
  v_c: 7668,
  v_inf: 3000,
  vinf: 3000,
  vInf: 3000,
  rho: 1.225e-3,
  rho0: 1.225,
  rho_0: 1.225,
  // LOS range magnitude for elevation-azimuth (when free-var is rho)
  // kept density-scale for drag; elev snippet uses east/north/up + rho as range:
  // if both needed, elev uses hypot-like  scale: set range-like rho after density tools:
  // (overwritten below for elev: we also inject via east/north/up)
  Cd: 2.2,
  C_d: 2.2,
  A: 1,
  mass: 100,
  m: 100,
  M: 1000,
  T: 1000,
  Ft: 1000,
  dt: 1,
  // Geometry / look / surface
  lat_deg: 28.5721,
  lon_deg: -80.648,
  lat: 28.5721 * (Math.PI / 180),
  lon: -80.648 * (Math.PI / 180),
  lat_rad: 28.5721 * (Math.PI / 180),
  lon_rad: -80.648 * (Math.PI / 180),
  latRad: 28.5721 * (Math.PI / 180),
  lat1: 0,
  lon1: 0,
  lat2: 1 * (Math.PI / 180),
  lon2: 1 * (Math.PI / 180),
  elev_deg: 10,
  az_deg: 180,
  ax: 1,
  ay: 0,
  az: 0,
  bx: 0,
  by: 1,
  bz: 0,
  // RF / link
  f: 2.2e9,
  fHz: 2.2e9,
  f_hz: 2.2e9,
  freqMHz: 2200,
  f_mhz: 2200,
  ptW: 10,
  pt_w: 10,
  gtDbi: 5,
  gt_dbi: 5,
  grDbi: 20,
  gr_dbi: 20,
  range_m: 1e6,
  range: 1e6,
  rangeKm: 1000,
  range_km: 1000,
  // Thermal / solar / pressure
  S0: 1361,
  P0: 4.56e-6,
  sigma: 5.670374419e-8,
  T_K: 300,
  r_au: 1,
  rAu: 1,
  C_r: 1.2,
  cr: 1.2,
  qdot: 1e4,
  Q_dot: 1e4,
  dT: 10,
  dTheta: 0.1,
  da: 1000,
  d1: 100,
  d2: 100,
  d3: 100,
  d4: 100,
  d5: 100,
  d6: 100,
  rn: 0.5,
  Rn: 0.5,
  ang: 0.1,
  eps: 0.8,
  alpha: 0.01,
  dM: 0.01,
  P: 100,
  P1: 50,
  t: 1,
  co2_rate_kg_s: 1e-5,
  co2_cap: 1,
  delta_theta: 0.1,
  n_t: 0.0011,
  N: 3,
  mdot: 1.5,
  ve: 3000,
  x: 100,
  vx: 1,
  xmin: -10,
  xmax: 10,
  n: 200,
  // Units tool (camel + snake)
  from: 'km',
  to: 'm',
  value: 1,
  fromOffset: 0,
  toOffset: 0,
  fromToBase: 1000,
  toToBase: 1,
  from_to_base: 1000,
  to_to_base: 1,
  from_offset: 0,
  to_offset: 0,
  peerToBase: 1,
  peerOffset: 0,
  // Misc orbital
  body: 'earth',
  beta: 0,
  phi: 0.1,
  phaseRad: 0.1,
  p: 6_778_137, // semi-latus
  J2: 1.08262668e-3,
  j2: 1.08262668e-3,
  omega_e: 7.292115e-5,
  omega_earth: 7.292115e-5,
  c: 299_792_458,
  G: 6.6743e-11,
  AU: 149_597_870_700,
  M_primary: 5.972e24,
  Mparent: 5.972e24,
  r_park: 6_678_137,
  r_soi: 9.24e8,
  rT: 6_778_137,
  r_t: 6_778_137,
  // ECLSS
  crew: 3,
  co2_kg_s: 1e-5,
  o2_kg_s: 1e-5,
  co2RateKgS: 1e-5,
  m_CO2: 1,
  m_O2: 1,
  m_N2: 1,
  m_lioh: 1,
  mCO2: 1,
  mO2: 1,
  mN2: 1,
  mLioh: 1,
  // Battery / power / array
  C_Ah: 50,
  C: 50,
  eta: 0.3,
  Sp: 10,
  // Impulse / RCS / wheel
  I_bit: 1e-3,
  t_min: 0.01,
  tmin: 0.01,
  I_tot: 10,
  torque: 0.01,
  I: 10,
  rpm: 5000,
  // Link noise
  t_sys_k: 290,
  tSysK: 290,
  required_cn0_dbhz: 50,
  requiredCn0: 50,
  other_loss_db: 1,
  otherLossDb: 1,
  // Pass / duration / phasing
  duration_s: 600,
  durationS: 600,
  step_s: 30,
  stepS: 30,
  min_el_deg: 10,
  minElDeg: 10,
  // Lambert / transfer / tof
  tof: 3600,
  TOF: 3600,
  short_way: true,
  shortWay: true,
  // Observer / ground
  obs_lat_deg: 28.5721,
  obs_lon_deg: -80.648,
  obs_h_m: 0,
  height_m: 400_000,
  // Angular diameter / diffraction
  d: 100,
  D: 10,
  // Scale height / atmosphere
  H: 8500,
  // Dynamic pressure
  q: 30_000,
  // Heat flux (Sutton-Graves)
  k: 1.83e-4,
  R_n: 0.5,
  // Along-track / mean motion helpers
  n1: 0.0011,
  n2: 0.00105,
  // Payload fraction
  mpl: 100,
  // Energy / C3
  C3: 10e6,
  C_3: 10e6,
  // true anomaly helpers
  theta: 0.5,
  // Free-vars for discovery / engines / RF / ECLSS (Godbolt green path)
  capacity: 0.85,
  tS: 86400,
  t_s: 86400,
  tf: 1000,
  phase: 0.1,
  dy: 1000,
  betaRad: 0.1,
  gamma: 1.2,
  pc: 7e6,
  At: 0.05,
  Cf: 1.5,
  mox: 2,
  mfuel: 1,
  fill: 0.95,
  p1: 1e6,
  p2: 5e5,
  V1: 0.5,
  V2: 1.0,
  Q: 1000,
  cp: 4180,
  lam: 0.136,
  B: 100,
  cn0: 55,
  elev: 0.5,
  g: 9.80665,
  co2RateManual: 1e-5,
  mIon: 2.1801e-25,
  zL: 75,
  z0: 50,
  f0: 2.2e9,
  pt: 10,
  rate: 1e6,
  snrDb: 20,
  v0: 7800,
  wmax: 0.1,
  aMax: 0.01,
  dI: 10,
  w: 1000,
  sx: 1,
  sy: 0,
  sz: 0,
  pix: 5e-6,
  fov: 0.1,
  swath: 100_000,
  dvY: 50,
  ap: 1.5e11,
  psun: 200,
  dPhi: 1e7,
  ifov: 1e-5,
  flux: 1361,
  tb: 100,
  delta: 0.1,
  nGeo: 7.292115e-5,
  ton: 100,
  sma_p: 1.5e11,
  ball: 100,
  p0: 1e5,
  eUsed: 0.5,
  pe: 0.01,
  pepc: 0.01,
  pe_pc: 0.01,
  rcs: 1,
  o2_rate: 0.84 / 86400,
  co2_rate: 1.0 / 86400,
  h2o_rate: 1.5 / 86400,
  q_met: 100,
  // CW / relative state free vars (x/vx already set above; complete the set)
  y: 0,
  z: 0,
  vy: -0.2,
  vz: 0,
  TT: 5400,
  T_t: 5400,
  tc: 3500,
  Tc: 3500,
  Rgas: 320,
  tTx: 0.001,
  tRx: 290,
  ux1: 0.5,
  uy1: 0.5,
  uz1: 0.7,
  ux2: -0.3,
  uy2: 0.4,
  uz2: 0.86,
  ux3: 0.2,
  uy3: -0.6,
  uz3: 0.77,
  ux4: -0.4,
  uy4: -0.2,
  uz4: 0.89,
  etaT: 0.8,
  etaR: 0.7,
  vr: 1000,
  path: 5000,
  amax: 0.01,
  ew: 5.0,
  ns: 50.0,
  life: 15,
  years: 15,
  fecl: 0.35,
  tecu: 20,
  aGeo: 42164170,
  req: 45,
  L: 10,
  eCap: 1000,
  Rb: 50,
  press: 2000000.0,
  v1: 7700,
  v2: 3100,
  days: 1,
  s1: 0.001,
  s2: 0.001,
  s3: 0.001,
  hfg: 200000.0,
  fmax: 1000000.0,
  f_max: 1000000.0,
  thk: 0.005,
  Te: 255,
  mdry: 2000,
  isp: 300,
  dvYear: 50,
  k_rain: 0.01,
  alpha_rain: 1.0,
  rate_mm: 10,
  bias: 1e-06,
  gt: 1.0,
  gr: 1.0,
  dth: 0.1,
  Rs: 696000000.0,
  rad: 0.5,
  ZL: 75,
  Z0: 50,
  zl: 75,
  eta_t: 0.8,
  eta_r: 0.7,
  wMax: 0.1,
  deltaTheta: 0.2,
  dtTx: 0.001,
  c_light: 299792458,
}

/**
 * Per-tool SAMPLE overrides when global bag keys collide or need domain-specific
 * scales (CR3BP μ is mass ratio ≠ Earth GM; panel d is degradation ≠ distance).
 */
export const SAMPLE_OVERRIDES: Record<string, LiveCodeValues> = {
  'panel-eol-power': { d: 0.005, p0: 200, years: 15 },
  // Bag-level G is the gravitational constant; this tool's G is antenna gain, so override with a physical value.
  'antenna-gain-effective': { G: 1000, lam: 0.1 },
  'cr3bp-jacobi': { mu: 0.01215, x: 0.8, y: 0, vx: 0, vy: 0.1 },
  'angular-diameter': { d: 384_400_000, R: 1_737_400 },
  // Attitude free vars exist in no shared bag: without them the snippet cannot compile.
  'quaternion-euler': { yaw: 0.5, pitch: 0.2, roll: 0.1 },
  // LEO state vector; the shared bag's vx/vy/vz are CW-relative, not orbital.
  'kepler-propagate': {
    rx: 6_778_137,
    ry: 0,
    rz: 0,
    vx: 0,
    vy: 7668.6,
    vz: 0,
    dt_s: 3600,
  },
}

/** Live-input bag for a tool: shared SAMPLE merged with its per-tool override. */
export function inputBagFor(toolId: string): LiveCodeValues {
  return { ...SAMPLE, ...(SAMPLE_OVERRIDES[toolId] ?? {}) }
}

/**
 * A named, sourced input bag for multi-scenario verification. `bag` layers on
 * top of `inputBagFor(toolId)` (SAMPLE + SAMPLE_OVERRIDES); it only needs to
 * carry the keys that scenario deliberately varies. `source` documents where
 * the values come from (published example, well-known constant, or adversarial
 * synthetic) per the pilot's value-sourcing hierarchy.
 */
export type Scenario = {
  name: string
  source?: string
  bag: Record<string, number | string>
}

/**
 * Per-tool verification scenarios, split by domain under `./scenarios`. Tools
 * absent here fall back to a single legacy scenario in `scenariosFor`.
 */
export { SCENARIOS }

/**
 * Live-input bags for a tool, one per scenario. Tools without `SCENARIOS`
 * entries keep today's single-scenario behavior under the legacy name
 * `sample`, using exactly `inputBagFor(toolId)`.
 */
export function scenariosFor(toolId: string): { name: string; source?: string; bag: LiveCodeValues }[] {
  const scenarios = SCENARIOS[toolId]
  if (!scenarios || scenarios.length === 0) {
    return [{ name: 'sample', bag: inputBagFor(toolId) }]
  }
  return scenarios.map((s) => ({
    name: s.name,
    source: s.source,
    bag: { ...inputBagFor(toolId), ...s.bag },
  }))
}

/**
 * The bag as a snippet actually receives it: every number round-tripped through the
 * same literal formatter `liveValues` uses to emit the live-inputs preamble.
 *
 * `formatCodeNumber` keeps 7 significant digits for |x| >= 1e7 or |x| < 1e-3, so a
 * snippet given Earth's mu computes with 3.986004e14, not 3.986004418e14. Comparing a
 * listing against physics fed the unrounded value would flag that injection rounding as
 * a formula error in every mu-bearing tool.
 */
export function asInjected(values: LiveCodeValues): LiveCodeValues {
  const out: LiveCodeValues = {}
  for (const [k, v] of Object.entries(values)) {
    out[k] = typeof v === 'number' ? Number(formatCodeNumber(v)) : v
  }
  return out
}
