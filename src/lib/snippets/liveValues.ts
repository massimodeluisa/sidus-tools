import type { CodeLang } from './types'

/** Scalar values injected into code export as a live-inputs preamble. */
export type LiveCodeValue = number | string | boolean | null | undefined

export type LiveCodeValues = Record<string, LiveCodeValue>

/** Format a number for readable code literals. */
export function formatCodeNumber(n: number): string {
  if (!Number.isFinite(n)) return 'NaN'
  if (Object.is(n, -0)) return '0'
  const a = Math.abs(n)
  if (a !== 0 && (a < 1e-3 || a >= 1e7)) {
    return n.toExponential(6).replace(/e\+?(-?)0*(\d+)/, 'e$1$2')
  }
  if (Number.isInteger(n)) return String(n)
  const s = n.toPrecision(12)
  if (s.includes('e') || s.includes('E')) return s
  return s.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '')
}

/** Keywords that cannot be bare identifiers in a given language. */
const RESERVED: Partial<Record<CodeLang, ReadonlySet<string>>> = {
  python: new Set([
    'False',
    'None',
    'True',
    'and',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'nonlocal',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'try',
    'while',
    'with',
    'yield',
  ]),
  javascript: new Set([
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'let',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
    'enum',
    'await',
  ]),
  typescript: new Set([
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'let',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
    'enum',
    'await',
    'type',
    'interface',
    'implements',
    'package',
    'private',
    'protected',
    'public',
    'static',
    'readonly',
  ]),
  rust: new Set([
    'as',
    'async',
    'await',
    'break',
    'const',
    'continue',
    'crate',
    'dyn',
    'else',
    'enum',
    'extern',
    'false',
    'fn',
    'for',
    'if',
    'impl',
    'in',
    'let',
    'loop',
    'match',
    'mod',
    'move',
    'mut',
    'pub',
    'ref',
    'return',
    'self',
    'Self',
    'static',
    'struct',
    'super',
    'trait',
    'true',
    'type',
    'unsafe',
    'use',
    'where',
    'while',
  ]),
  c: new Set([
    'auto',
    'break',
    'case',
    'char',
    'const',
    'continue',
    'default',
    'do',
    'double',
    'else',
    'enum',
    'extern',
    'float',
    'for',
    'goto',
    'if',
    'inline',
    'int',
    'long',
    'register',
    'restrict',
    'return',
    'short',
    'signed',
    'sizeof',
    'static',
    'struct',
    'switch',
    'typedef',
    'union',
    'unsigned',
    'void',
    'volatile',
    'while',
  ]),
  cpp: new Set([
    'alignas',
    'alignof',
    'and',
    'and_eq',
    'asm',
    'auto',
    'bitand',
    'bitor',
    'bool',
    'break',
    'case',
    'catch',
    'char',
    'class',
    'compl',
    'const',
    'constexpr',
    'continue',
    'decltype',
    'default',
    'delete',
    'do',
    'double',
    'else',
    'enum',
    'explicit',
    'export',
    'extern',
    'false',
    'float',
    'for',
    'friend',
    'goto',
    'if',
    'inline',
    'int',
    'long',
    'mutable',
    'namespace',
    'new',
    'noexcept',
    'not',
    'not_eq',
    'nullptr',
    'operator',
    'or',
    'or_eq',
    'private',
    'protected',
    'public',
    'register',
    'reinterpret_cast',
    'return',
    'short',
    'signed',
    'sizeof',
    'static',
    'static_cast',
    'struct',
    'switch',
    'template',
    'this',
    'throw',
    'true',
    'try',
    'typedef',
    'typeid',
    'typename',
    'union',
    'unsigned',
    'using',
    'virtual',
    'void',
    'volatile',
    'wchar_t',
    'while',
    'xor',
    'xor_eq',
  ]),
}

/** Make a safe identifier for the language (append `_` if reserved). */
export function safeIdent(lang: CodeLang, key: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return key
  if (RESERVED[lang]?.has(key)) return `${key}_id`
  // C/C++: avoid clashing with common macros
  if ((lang === 'c' || lang === 'cpp') && (key === 'EOF' || key === 'NULL')) return `${key}_id`
  return key
}

function lit(lang: CodeLang, v: LiveCodeValue): string | null {
  if (v == null) return null
  if (typeof v === 'boolean') {
    if (lang === 'python') return v ? 'True' : 'False'
    return v ? 'true' : 'false'
  }
  if (typeof v === 'string') {
    if (lang === 'c' || lang === 'cpp' || lang === 'rust' || lang === 'zig') {
      return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    }
    if (lang === 'matlab') return `'${v.replace(/'/g, "''")}'`
    return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  }
  if (typeof v === 'number') {
    if (lang === 'fortran') {
      const s = formatCodeNumber(v)
      if (/e/i.test(s)) return s.replace(/e/i, 'd')
      if (s.includes('.')) return `${s}d0`
      return `${s}.0d0`
    }
    // Julia/Rust/Zig: force float literals so r^3 never overflows Int64 / integer ops
    if (
      lang === 'julia' ||
      lang === 'rust' ||
      lang === 'zig' ||
      lang === 'c' ||
      lang === 'cpp'
    ) {
      const s = formatCodeNumber(v)
      if (Number.isInteger(v) && !/[.eE]/.test(s)) return `${s}.0`
      return s
    }
    return formatCodeNumber(v)
  }
  return null
}

function assignLine(lang: CodeLang, key: string, raw: LiveCodeValue, value: string): string {
  const id = safeIdent(lang, key)
  switch (lang) {
    case 'python':
    case 'julia':
    case 'matlab':
      return `${id} = ${value}`
    case 'javascript':
    case 'typescript':
      return `const ${id} = ${value}`
    case 'c':
    case 'cpp': {
      if (typeof raw === 'string') return `const char *${id} = ${value};`
      if (typeof raw === 'boolean') return `const int ${id} = ${value}; /* bool */`
      return `const double ${id} = ${value};`
    }
    case 'rust':
      if (typeof raw === 'string') return `let ${id} = ${value};`
      if (typeof raw === 'boolean') return `let ${id} = ${value};`
      return `let ${id} = ${value}_f64;`
    case 'zig':
      if (typeof raw === 'string') return `const ${id} = ${value};`
      if (typeof raw === 'boolean') return `const ${id} = ${value};`
      return `const ${id}: f64 = ${value};`
    case 'fortran':
      return `${id} = ${value}`
    case 'latex':
      return `% ${id} = ${value}`
    default:
      return `${id} = ${value}`
  }
}

function header(lang: CodeLang): string {
  switch (lang) {
    case 'python':
    case 'julia':
      return '# --- live inputs (from SIDUS UI) ---'
    case 'matlab':
    case 'latex':
    case 'fortran':
      return '% --- live inputs (from SIDUS UI) ---'
    default:
      return '// --- live inputs (from SIDUS UI) ---'
  }
}

/**
 * Standard physics constants injected when a free var is missing from the UI.
 * Educational SI defaults used across pure-SI snippets.
 */
export const PHYSICS_DEFAULTS: Readonly<Record<string, number>> = {
  g0: 9.80665,
  G: 6.6743e-11,
  c: 299_792_458,
  P0: 4.56e-6,
  S0: 1361,
  sigma: 5.670374419e-8,
  /** Sutton-Graves Earth educational coefficient [SI] */
  k: 1.83e-4,
  AU: 149_597_870_700,
  omega_e: 7.292115e-5,
  omega_earth: 7.292115e-5,
  r_au: 1,
  rAu: 1,
  /** Earth equatorial radius [m]: J2 / SSO free vars */
  r_eq: 6_378_137,
  R: 6_378_137,
  /** Earth gravitational parameter [m³/s²] */
  mu: 3.986_004_418e14,
  /** Earth mass [kg]: custom-body / SOI free vars */
  M: 5.972e24,
  M_primary: 5.972e24,
  m: 1000,
  /** Stage mass ratio educational default */
  payload: 1000,
  /** Apo/peri altitudes [m] for plane-change-apo / apo-raise */
  ha: 35_786_000,
  hp: 400_000,
  /**
   * Ambiguous free-var `d`: angular-diameter distance [m] vs panel-eol degradation.
   * Default favors panel-eol (0–1 fraction); angular tools pass distance from UI.
   */
  d: 0.005,
  // Common free-vars for discovery / ECLSS / RF / ADCS snippets (Godbolt SAMPLE)
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
  beta: 100,
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
  y: 0,
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
  /** Along-track ΔM [rad] educational */
  dM: 0.01,
  /** Altitude [m] for ISA / eclipse free vars */
  h: 400_000,
  h_m: 400_000,
  /** Mean motion helpers [rad/s] */
  n_t: 0.0011,
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
 * Derive common aliases so formula bodies work when tools pass alternate keys
 * (h_m + R → r, n → N, r → r_au for solar tools, fHz → f, …).
 */
export function enrichLiveValues(
  values: LiveCodeValues | undefined,
): LiveCodeValues | undefined {
  if (!values) return values
  const v: LiveCodeValues = { ...values }

  // Orbit radius from body radius + altitude
  if ((v.r === undefined || v.r === null) && typeof v.R === 'number') {
    if (typeof v.h_m === 'number') v.r = (v.R as number) + (v.h_m as number)
    else if (typeof v.h === 'number' && (v.h as number) < 1e7)
      v.r = (v.R as number) + (v.h as number)
    else if (typeof v.r_m === 'number') v.r = v.r_m
  }
  if ((v.a === undefined || v.a === null) && typeof v.a_m === 'number') {
    v.a = v.a_m
  }

  // Stage / count aliases
  if ((v.N === undefined || v.N === null) && typeof v.n === 'number') v.N = v.n
  if ((v.n === undefined || v.n === null) && typeof v.N === 'number') v.n = v.N
  if ((v.N === undefined || v.N === null) && typeof v.pulses === 'number')
    v.N = v.pulses

  // Solar distance (tools often pass `r` already in AU)
  if ((v.r_au === undefined || v.r_au === null) && typeof v.rAu === 'number')
    v.r_au = v.rAu
  if ((v.rAu === undefined || v.rAu === null) && typeof v.r_au === 'number')
    v.rAu = v.r_au
  if (
    (v.r_au === undefined || v.r_au === null) &&
    typeof v.r === 'number' &&
    (v.r as number) > 0 &&
    (v.r as number) < 100
  ) {
    // Heuristic: r < 100 ⇒ AU-scale (solar tools), not meters
    v.r_au = v.r
    v.rAu = v.r
  }

  // RF / beamwidth / link-budget (tools pass camelCase SI; snippets use snake_case)
  if ((v.f === undefined || v.f === null) && typeof v.fHz === 'number') v.f = v.fHz
  if ((v.f_hz === undefined || v.f_hz === null) && typeof v.fHz === 'number')
    v.f_hz = v.fHz
  if ((v.f_hz === undefined || v.f_hz === null) && typeof v.freqHz === 'number')
    v.f_hz = v.freqHz
  if (
    (v.f_hz === undefined || v.f_hz === null) &&
    typeof v.f === 'number' &&
    (v.f as number) > 1e5
  ) {
    // UI sometimes already stores SI Hz as `f`
    v.f_hz = v.f
  }
  if ((v.fHz === undefined || v.fHz === null) && typeof v.f_hz === 'number')
    v.fHz = v.f_hz
  if ((v.freqMHz === undefined || v.freqMHz === null) && typeof v.f_hz === 'number')
    v.freqMHz = (v.f_hz as number) / 1e6
  if ((v.f_mhz === undefined || v.f_mhz === null) && typeof v.freqMHz === 'number')
    v.f_mhz = v.freqMHz

  if ((v.pt_w === undefined || v.pt_w === null) && typeof v.ptW === 'number')
    v.pt_w = v.ptW
  if ((v.ptW === undefined || v.ptW === null) && typeof v.pt_w === 'number')
    v.ptW = v.pt_w

  if ((v.gt_dbi === undefined || v.gt_dbi === null) && typeof v.gtDbi === 'number')
    v.gt_dbi = v.gtDbi
  if ((v.gt_dbi === undefined || v.gt_dbi === null) && typeof v.gt === 'number')
    v.gt_dbi = v.gt
  if ((v.gtDbi === undefined || v.gtDbi === null) && typeof v.gt_dbi === 'number')
    v.gtDbi = v.gt_dbi

  if ((v.gr_dbi === undefined || v.gr_dbi === null) && typeof v.grDbi === 'number')
    v.gr_dbi = v.grDbi
  if ((v.gr_dbi === undefined || v.gr_dbi === null) && typeof v.gr === 'number')
    v.gr_dbi = v.gr
  if ((v.grDbi === undefined || v.grDbi === null) && typeof v.gr_dbi === 'number')
    v.grDbi = v.gr_dbi

  if (
    (v.other_loss_db === undefined || v.other_loss_db === null) &&
    typeof v.otherLossDb === 'number'
  )
    v.other_loss_db = v.otherLossDb
  if (
    (v.other_loss_db === undefined || v.other_loss_db === null) &&
    typeof v.loss === 'number'
  )
    v.other_loss_db = v.loss
  if (
    (v.otherLossDb === undefined || v.otherLossDb === null) &&
    typeof v.other_loss_db === 'number'
  )
    v.otherLossDb = v.other_loss_db

  if ((v.t_sys_k === undefined || v.t_sys_k === null) && typeof v.tSysK === 'number')
    v.t_sys_k = v.tSysK
  if ((v.t_sys_k === undefined || v.t_sys_k === null) && typeof v.tsys === 'number')
    v.t_sys_k = v.tsys
  if ((v.tSysK === undefined || v.tSysK === null) && typeof v.t_sys_k === 'number')
    v.tSysK = v.t_sys_k

  if (
    (v.required_cn0_dbhz === undefined || v.required_cn0_dbhz === null) &&
    typeof v.requiredCn0 === 'number'
  )
    v.required_cn0_dbhz = v.requiredCn0
  if (
    (v.required_cn0_dbhz === undefined || v.required_cn0_dbhz === null) &&
    typeof v.req === 'number'
  )
    v.required_cn0_dbhz = v.req
  if (
    (v.requiredCn0 === undefined || v.requiredCn0 === null) &&
    typeof v.required_cn0_dbhz === 'number'
  )
    v.requiredCn0 = v.required_cn0_dbhz

  if ((v.k_deg === undefined || v.k_deg === null) && typeof v.k === 'number')
    v.k_deg = v.k

  // Light-time / RF range (m and km aliases)
  if ((v.range_m === undefined || v.range_m === null) && typeof v.rangeM === 'number')
    v.range_m = v.rangeM
  if ((v.range_m === undefined || v.range_m === null) && typeof v.range === 'number') {
    // Heuristic: large values are meters (SI); small display values are often km
    if ((v.range as number) >= 1e5) v.range_m = v.range
  }
  if ((v.range_km === undefined || v.range_km === null) && typeof v.rangeKm === 'number')
    v.range_km = v.rangeKm
  if ((v.range_km === undefined || v.range_km === null) && typeof v.range_m === 'number')
    v.range_km = (v.range_m as number) / 1000
  if (
    (v.range_km === undefined || v.range_km === null) &&
    typeof v.range === 'number' &&
    (v.range as number) < 1e5
  ) {
    v.range_km = v.range // UI field often already in km
  }
  if ((v.rangeKm === undefined || v.rangeKm === null) && typeof v.range_km === 'number')
    v.rangeKm = v.range_km
  if ((v.range_m === undefined || v.range_m === null) && typeof v.range_km === 'number')
    v.range_m = (v.range_km as number) * 1000

  // Battery capacity
  if ((v.C_Ah === undefined || v.C_Ah === null) && typeof v.C === 'number')
    v.C_Ah = v.C

  // Thermal temp
  if ((v.T === undefined || v.T === null) && typeof v.T_K === 'number') v.T = v.T_K

  // Earth rotation rate aliases
  if (
    (v.omega_earth === undefined || v.omega_earth === null) &&
    typeof v.omega_e === 'number'
  )
    v.omega_earth = v.omega_e
  if (
    (v.omega_e === undefined || v.omega_e === null) &&
    typeof v.omega_earth === 'number'
  )
    v.omega_e = v.omega_earth

  // Impulse bit min pulse
  if ((v.t_min === undefined || v.t_min === null) && typeof v.tmin === 'number')
    v.t_min = v.tmin

  // Eccentric anomaly (avoid bare C-confusable names when tools pass E)
  if ((v.Ea === undefined || v.Ea === null) && typeof v.E === 'number') v.Ea = v.E
  if ((v.E === undefined || v.E === null) && typeof v.Ea === 'number') v.E = v.Ea
  if ((v.Ea === undefined || v.Ea === null) && typeof v.Er === 'number') v.Ea = v.Er

  // Hyperbolic excess aliases
  if ((v.v_inf === undefined || v.v_inf === null) && typeof v.vinf === 'number')
    v.v_inf = v.vinf
  if ((v.vinf === undefined || v.vinf === null) && typeof v.v_inf === 'number')
    v.vinf = v.v_inf
  if ((v.v_inf === undefined || v.v_inf === null) && typeof v.vInf === 'number')
    v.v_inf = v.vInf

  // Parent mass aliases (custom body)
  if (
    (v.M_primary === undefined || v.M_primary === null) &&
    typeof v.Mparent === 'number'
  )
    v.M_primary = v.Mparent

  // GEO period
  if ((v.T === undefined || v.T === null) && typeof v.periodS === 'number')
    v.T = v.periodS

  // SMA from radius + altitude when tools pass h not a
  if (
    (v.a === undefined || v.a === null) &&
    typeof v.R === 'number' &&
    typeof v.h === 'number' &&
    (v.h as number) < 1e8
  ) {
    v.a = (v.R as number) + (v.h as number)
  }

  // Apo/peri radii from altitudes
  if (
    (v.ra === undefined || v.ra === null) &&
    typeof v.R === 'number' &&
    typeof v.ha === 'number'
  ) {
    v.ra = (v.R as number) + (v.ha as number)
  }
  if (
    (v.rp === undefined || v.rp === null) &&
    typeof v.R === 'number' &&
    typeof v.hp === 'number'
  ) {
    v.rp = (v.R as number) + (v.hp as number)
  }

  // Catch-up phasing aliases
  if ((v.phi === undefined || v.phi === null) && typeof v.phaseRad === 'number')
    v.phi = v.phaseRad
  if ((v.r1 === undefined || v.r1 === null) && typeof v.r === 'number') v.r1 = v.r
  if ((v.r2 === undefined || v.r2 === null) && typeof v.r2 === 'number') {
    /* already set */
  }

  // Relative period dual radii
  if (
    (v.r1 === undefined || v.r1 === null) &&
    typeof v.R === 'number' &&
    typeof v.h === 'number'
  ) {
    v.r1 = (v.R as number) + (v.h as number)
  }

  // deorbit: circular radius
  if (
    (v.r === undefined || v.r === null) &&
    typeof v.R === 'number' &&
    typeof v.h === 'number'
  ) {
    v.r = (v.R as number) + (v.h as number)
  }

  // Oberth often needs v from circular energy; leave to tool when present
  // Angular diameter distance already as d

  return v
}

export function liveValuesPreamble(
  lang: CodeLang,
  values: LiveCodeValues | undefined,
): string {
  // Public preamble: enrich first so callers get r from R+h etc.
  const lines = liveInputLines(lang, enrichLiveValues(values))
  if (lines.length === 0) return ''
  return `${header(lang)}\n${lines.join('\n')}\n\n`
}

export function liveInputLines(
  lang: CodeLang,
  values: LiveCodeValues | undefined,
): string[] {
  // Do NOT re-enrich here: filterLiveValuesForBody already chose the free vars.
  // Re-enriching would reintroduce unused aliases (k_deg, N, rAu, …).
  if (!values) return []
  const lines: string[] = []
  for (const [key, raw] of Object.entries(values)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    const v = lit(lang, raw)
    if (v == null) continue
    lines.push(assignLine(lang, key, raw, v))
  }
  return lines
}

export function applyValuePlaceholders(
  code: string,
  lang: CodeLang,
  values: LiveCodeValues | undefined,
): string {
  const enriched = enrichLiveValues(values)
  if (!enriched) return code
  return code.replace(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g, (full, key: string) => {
    if (!(key in enriched)) return full
    const v = lit(lang, enriched[key])
    return v ?? full
  })
}

/** Julia/MATLAB keyword-block openers whose matching close is a bare `end`. */
const FUNCTION_BLOCK_OPENERS: Partial<Record<CodeLang, RegExp>> = {
  julia: /^(?:function|if|for|while|begin|let|try|struct|macro)\b/,
  matlab: /^(?:function|if|for|while|switch|try|parfor)\b/,
}

/** Julia's trailing `do` syntax (`open(file) do f` … `end`) also opens a block. */
const JULIA_DO_OPENER = /\bdo\b\s*(?:\([^)]*\))?\s*(?:[A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)?$/

/**
 * Julia and MATLAB blocks are keyword-delimited (`function`/`if`/`for`/…
 * `end`), not brace- or indentation-based, so the depth tracker in
 * `extractAssignedNames` never sees a `function` body as nested and leaks its
 * locals into the top-level scan. Blank out every line whose OUTERMOST
 * enclosing `end`-closed block is `function`; the function's own header and
 * closing `end` stay visible (already excluded elsewhere), and top-level
 * `if`/`for` blocks outside any function are left untouched.
 */
function stripFunctionInteriors(code: string, lang: CodeLang): string {
  const openerRe = FUNCTION_BLOCK_OPENERS[lang]
  if (!openerRe) return code
  const stack: string[] = []
  const out: string[] = []
  for (const line of code.split('\n')) {
    const t = line.trim()
    const insideFunction = stack.length > 0 && stack[0] === 'function'
    const isEnd = t === 'end' || /^end(?![A-Za-z0-9_])/.test(t)
    if (isEnd && stack.length > 0) {
      const closesOutermostFunction = insideFunction && stack.length === 1
      stack.pop()
      out.push(closesOutermostFunction || !insideFunction ? line : '')
      continue
    }
    const openerMatch = openerRe.test(t) ? t.match(/^[A-Za-z]+/) : null
    const opener = openerMatch ? openerMatch[0] : lang === 'julia' && JULIA_DO_OPENER.test(t) ? 'do' : null
    if (opener) {
      stack.push(opener)
      out.push(insideFunction ? '' : line)
      continue
    }
    out.push(insideFunction ? '' : line)
  }
  return out.join('\n')
}

/**
 * Top-level assignment LHS only (brace depth 0, paren depth 0).
 * Skips function default-params, Python `def`/`class` bodies, and
 * multi-assign lines like `const a = 1, b = 2`. `lang` additionally strips
 * Julia/MATLAB function interiors (see `stripFunctionInteriors`); omit it to
 * preserve prior behavior.
 */
export function extractAssignedNames(code: string, lang?: CodeLang): string[] {
  const scanCode = lang ? stripFunctionInteriors(code, lang) : code
  const out: string[] = []
  const seen = new Set<string>()
  let brace = 0
  let paren = 0
  let bracket = 0
  /** Python def/class indent base; -1 = not inside a def body */
  let pyBlockBase = -1

  const updateDepths = (line: string) => {
    let inStr: '"' | "'" | '`' | null = null
    let esc = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (inStr) {
        if (esc) {
          esc = false
          continue
        }
        if (c === '\\') {
          esc = true
          continue
        }
        if (c === inStr) inStr = null
        continue
      }
      if (c === '"' || c === "'" || c === '`') {
        inStr = c
        continue
      }
      if (c === '{') brace++
      else if (c === '}') brace = Math.max(0, brace - 1)
      else if (c === '(') paren++
      else if (c === ')') paren = Math.max(0, paren - 1)
      else if (c === '[') bracket++
      else if (c === ']') bracket = Math.max(0, bracket - 1)
    }
  }

  const addName = (name: string) => {
    if (
      !seen.has(name) &&
      name !== 'M_PI' &&
      name !== 'PI' &&
      name !== 'Math' &&
      name !== 'math'
    ) {
      seen.add(name)
      out.push(name)
    }
  }

  /** Index of first `=` that is not nested in () and not `==`/`=>`/`!=`. */
  const topLevelAssignEq = (s: string): number => {
    let p = 0
    for (let i = 0; i < s.length; i++) {
      const c = s[i]
      if (c === '(') p++
      else if (c === ')') p = Math.max(0, p - 1)
      else if (c === '=' && p === 0) {
        const prev = s[i - 1]
        const next = s[i + 1]
        if (prev === '!' || prev === '<' || prev === '>' || prev === '=') continue
        if (next === '=' || next === '>') continue
        return i
      }
    }
    return -1
  }

  for (const line of scanCode.split('\n')) {
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0
    const t = line.trim()

    // Leave Python def/class block when indentation returns to base
    if (pyBlockBase >= 0 && t && indent <= pyBlockBase && !t.startsWith('#')) {
      pyBlockBase = -1
    }
    if (/^(def|class)\s+/.test(t)) {
      pyBlockBase = indent
      updateDepths(line)
      continue
    }

    const inPyBlock = pyBlockBase >= 0 && (indent > pyBlockBase || !t)
    const atTop = brace === 0 && paren === 0 && bracket === 0 && !inPyBlock

    if (
      atTop &&
      t &&
      !t.startsWith('//') &&
      !t.startsWith('#') &&
      !t.startsWith('%') &&
      !t.startsWith('!') &&
      !t.startsWith('/*') &&
      !t.startsWith('*')
    ) {
      if (
        !/^(import\b|from\b|use\s|#include|fn\s|pub\s|int\s+main|void\s|program\s|end\s|const\s+std|using\s|export\s|module\s|package\s|def\s|class\s|struct\s|enum\s|type\s|impl\s|return\s|print|println|printf|console\.|std:|@import|function\s)/i.test(
          t,
        )
      ) {
        // Skip C/C++/Zig function signatures with default args:
        //   double to_si(..., double offset = 0.0) {
        //   (assignment `=` is inside parens → topLevelAssignEq = -1)
        const eq = topLevelAssignEq(t)
        if (eq < 0) {
          updateDepths(line)
          continue
        }
        // Multi-assign: const a = 1, b = 2  /  a = 1; b = 2
        const chunks = t.split(/,(?![^()]*\))/)
        for (const chunk of chunks) {
          const c = chunk.trim().replace(/;+\s*$/, '')
          if (topLevelAssignEq(c) < 0) continue
          const m = c.match(
            /^(?:(?:(?:const|static|volatile)\s+)*(?:double|float|int|long|auto|bool|size_t|char\s*\*)\s+|let\s+(?:mut\s+)?|var\s+|const\s+|real\s*\([^)]*\)\s*(?:::)?:?\s*)?([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*[A-Za-z_][\w.<>[\]| ]*)?\s*=\s*.+/,
          )
          if (m && m[1] !== '_' && !c.endsWith(',')) addName(m[1])
        }
      }
    }
    updateDepths(line)
  }
  return out
}

function indentBlock(lines: string[], n: number): string[] {
  const pad = ' '.repeat(n)
  return lines.map((l) => (l.trim() === '' ? '' : pad + l))
}

function findMatchingBrace(src: string, openBraceIdx: number): number {
  let depth = 0
  let inStr: '"' | "'" | '`' | null = null
  let esc = false
  for (let i = openBraceIdx; i < src.length; i++) {
    const c = src[i]
    if (inStr) {
      if (esc) {
        esc = false
        continue
      }
      if (c === '\\') {
        esc = true
        continue
      }
      if (c === inStr) inStr = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = c
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function stripOuterMainRust(body: string): {
  prelude: string
  inner: string
  hadMain: boolean
} {
  const m = body.match(/\bfn\s+main\s*\([^)]*\)\s*\{/)
  if (!m || m.index === undefined) {
    return { prelude: body, inner: '', hadMain: false }
  }
  const openBrace = m.index + m[0].length - 1
  const close = findMatchingBrace(body, openBrace)
  if (close < 0) return { prelude: body, inner: '', hadMain: false }
  const prelude = body.slice(0, m.index).trimEnd()
  const inner = body.slice(openBrace + 1, close).replace(/^\n/, '').replace(/\n$/, '')
  return { prelude, inner, hadMain: true }
}

function stripOuterMainC(body: string): {
  includes: string[]
  prelude: string
  inner: string
  hadMain: boolean
} {
  const includes: string[] = []
  const other: string[] = []
  for (const line of body.split('\n')) {
    if (line.trim().startsWith('#include')) includes.push(line.trim())
    else other.push(line)
  }
  const rest = other.join('\n')
  const m = rest.match(/\b(?:int|void)\s+main\s*\([^)]*\)\s*\{/)
  if (!m || m.index === undefined) {
    return { includes, prelude: '', inner: rest.trim(), hadMain: false }
  }
  const openBrace = m.index + m[0].length - 1
  const close = findMatchingBrace(rest, openBrace)
  if (close < 0) {
    return { includes, prelude: '', inner: rest.trim(), hadMain: false }
  }
  const prelude = rest.slice(0, m.index).trim()
  const inner = rest
    .slice(openBrace + 1, close)
    .replace(/^\n/, '')
    .replace(/\n$/, '')
  const cleaned = inner
    .split('\n')
    .filter((l) => !/^\s*return\s+0\s*;\s*$/.test(l))
    .join('\n')
  return { includes, prelude, inner: cleaned.trim(), hadMain: true }
}

function printLines(
  lang: CodeLang,
  names: string[],
  values: LiveCodeValues | undefined,
): string[] {
  // Trust caller's name list (already free-var filtered). Do NOT re-enrich:
  // enrichLiveValues can invent aliases (a from R+h, r1 from r) that collide
  // with body-assigned intermediates and wrongly drop them from prints.
  const bag = values ?? {}
  const finalNames = names.filter((n) => n && n !== '_')
  if (finalNames.length === 0) return []

  switch (lang) {
    case 'python':
      return finalNames.map((n) => `print(f"${n} = {${n}}")`)
    case 'javascript':
    case 'typescript':
      return finalNames.map((n) => `console.log("${n} =", ${n})`)
    case 'julia':
      return finalNames.map((n) => `println("${n} = ", ${n})`)
    case 'matlab':
      return finalNames.map((n) => `fprintf('${n} = %g\\n', ${n});`)
    case 'c':
      return finalNames.map((n) => {
        const raw = bag[n]
        if (typeof raw === 'string') return `printf("${n} = %s\\n", ${n});`
        return `printf("${n} = %.9g\\n", (double)(${n}));`
      })
    case 'cpp':
      return finalNames.map((n) => {
        const raw = bag[n]
        if (typeof raw === 'string') return `std::printf("${n} = %s\\n", ${n});`
        return `std::printf("${n} = %.9g\\n", static_cast<double>(${n}));`
      })
    case 'rust':
      return finalNames.map((n) => `println!("${n} = {:?}", ${n});`)
    case 'zig':
      return [
        'const stdout = std.io.getStdOut().writer();',
        ...finalNames.map((n) => `try stdout.print("${n} = {d}\\n", .{${n}});`),
      ]
    case 'fortran':
      return finalNames.map((n) => `print *, '${n} = ', ${n}`)
    default:
      return []
  }
}

/** Body already prints results (avoid bogus extra prints from default params). */
function bodyAlreadyPrints(body: string): boolean {
  return /\b(printf|println!|console\.log|print\s*\(|println\s*\(|std::cout|fprintf)\b/.test(
    body,
  )
}

function wrapPython(body: string, inputs: string[], prints: string[]): string {
  const parts: string[] = []
  if (inputs.length) {
    parts.push('# --- live inputs (from SIDUS UI) ---', ...inputs, '')
  }
  parts.push(body.trimEnd())
  if (prints.length && !bodyAlreadyPrints(body)) {
    parts.push('', '# --- results ---', ...prints)
  }
  return parts.join('\n') + '\n'
}

/** Bare abs() is invalid in JS engines; normalize educational ports. */
function sanitizeJsBody(body: string): string {
  return body.replace(/(?<![.\w])\babs\s*\(/g, 'Math.abs(')
}

function wrapJs(body: string, inputs: string[], prints: string[]): string {
  const parts: string[] = []
  if (inputs.length) {
    parts.push('// --- live inputs (from SIDUS UI) ---', ...inputs, '')
  }
  parts.push(sanitizeJsBody(body.trimEnd()))
  if (prints.length && !bodyAlreadyPrints(body)) {
    parts.push('', '// --- results ---', ...prints)
  }
  return parts.join('\n') + '\n'
}

function wrapJulia(body: string, inputs: string[], prints: string[]): string {
  // Julia uses ^ for exponentiation; educational ports often keep Python **
  // atan2 is Python/C: Julia is atan(y, x)
  const juliaBody = body
    .replace(/\*\*(?!\*)/g, '^')
    .replace(/\bmath\./g, '')
    .replace(/(?<![A-Za-z0-9_.])\batan2\s*\(/g, 'atan(')
  const parts: string[] = []
  if (inputs.length) {
    parts.push('# --- live inputs (from SIDUS UI) ---', ...inputs, '')
  }
  parts.push(juliaBody.trimEnd())
  if (prints.length && !bodyAlreadyPrints(juliaBody)) {
    parts.push('', '# --- results ---', ...prints)
  }
  return parts.join('\n') + '\n'
}

function wrapMatlab(body: string, inputs: string[], prints: string[]): string {
  const parts: string[] = []
  if (inputs.length) {
    parts.push('% --- live inputs (from SIDUS UI) ---', ...inputs, '')
  }
  parts.push(body.trimEnd())
  if (prints.length && !bodyAlreadyPrints(body)) {
    parts.push('', '% --- results ---', ...prints)
  }
  return parts.join('\n') + '\n'
}

function wrapCFamily(
  body: string,
  inputs: string[],
  prints: string[],
  cpp: boolean,
): string {
  const { includes, prelude, inner, hadMain } = stripOuterMainC(body)
  const inc = new Set(includes)
  if (cpp) {
    inc.add('#include <cmath>')
    inc.add('#include <cstdio>')
  } else {
    inc.add('#include <math.h>')
    inc.add('#include <stdio.h>')
  }
  // iostream if already used in body
  if (cpp && /std::cout|iostream/.test(body)) {
    inc.add('#include <iostream>')
  }

  const bound = inputBoundNames(inputs)
  const bodyLines = skipRedeclaredAssigns(
    inner.split('\n').filter((l) => !l.trim().startsWith('#include')),
    bound,
  )

  // Prefer prints from top-level assigns in the main body only
  const names = extractAssignedNames(bodyLines.join('\n'))
  const printL =
    prints.length > 0
      ? prints
      : printLines(cpp ? 'cpp' : 'c', names, undefined)
  const extraPrints =
    printL.length > 0 && !bodyAlreadyPrints(inner) ? printL : []

  const lines: string[] = [...inc]
  if (![...inc].some((i) => i.includes('math'))) {
    /* already added */
  }
  lines.push('#ifndef M_PI', '#define M_PI 3.14159265358979323846', '#endif', '')

  // Helper functions / globals BEFORE main (critical for units etc.)
  if (prelude.trim()) {
    lines.push(prelude.trimEnd(), '')
  } else if (!hadMain) {
    // pure fragment: bodyLines are the formula
  }

  lines.push(cpp ? 'int main() {' : 'int main(void) {')
  if (inputs.length) {
    lines.push('  // --- live inputs (from SIDUS UI) ---', ...indentBlock(inputs, 2), '')
  }
  lines.push('  // --- formula ---', ...indentBlock(bodyLines, 2))
  if (extraPrints.length) {
    lines.push('', '  // --- results ---', ...indentBlock(extraPrints, 2))
  }
  lines.push('  return 0;', '}', '')
  return lines.join('\n')
}

/**
 * Names already bound by live-input lines (`let x =` / `const x =` /
 * `const double x =`). Must capture the **identifier**, not the C type word.
 */
function inputBoundNames(inputs: string[]): Set<string> {
  const s = new Set<string>()
  for (const line of inputs) {
    const t = line.trim()
    // C/C++: const double x = … / const char *x = …
    const cType = t.match(
      /^(?:(?:const|static|volatile)\s+)*(?:double|float|int|long|auto|bool|size_t|char\s*\*)\s+([A-Za-z_][\w$]*)\s*=/,
    )
    if (cType) {
      s.add(cType[1]!)
      continue
    }
    // Rust/JS/Zig: let x / const x / let mut x / const x: f64
    const m2 = t.match(
      /^(?:let\s+(?:mut\s+)?|const\s+|var\s+)([A-Za-z_][\w$]*)\b/,
    )
    if (m2) {
      s.add(m2[1]!)
      continue
    }
    const m3 = t.match(/^([A-Za-z_][\w$]*)\s*=/)
    if (m3) s.add(m3[1]!)
  }
  return s
}

/** Drop formula lines that redeclare a live input (prevents Zig/Rust redecl). */
function skipRedeclaredAssigns(lines: string[], bound: Set<string>): string[] {
  return lines.filter((line) => {
    const t = line.trim()
    // C/C++ typed: const double x = …
    const cType = t.match(
      /^(?:(?:const|static|volatile)\s+)*(?:double|float|int|long|auto|bool|size_t|char\s*\*)\s+([A-Za-z_][\w$]*)\s*=/,
    )
    if (cType && bound.has(cType[1]!)) return false
    // let/const/var name …
    const m = t.match(
      /^(?:let\s+(?:mut\s+)?|const\s+|var\s+)([A-Za-z_][\w$]*)\b/,
    )
    if (m && bound.has(m[1]!)) return false
    // bare name =
    const bare = t.match(/^([A-Za-z_][\w$]*)\s*=/)
    if (bare && bound.has(bare[1]!)) return false
    return true
  })
}

function wrapRust(body: string, inputs: string[], prints: string[]): string {
  const { prelude, inner, hadMain } = stripOuterMainRust(body)
  const formula = hadMain ? inner : body
  const bound = inputBoundNames(inputs)
  const formulaLines = skipRedeclaredAssigns(formula.split('\n'), bound)
  const names = extractAssignedNames(formulaLines.join('\n'))
  const printL =
    prints.length > 0 ? prints : printLines('rust', names, undefined)
  const extraPrints =
    printL.length > 0 && !bodyAlreadyPrints(formula) ? printL : []

  const parts: string[] = []
  if (hadMain && prelude.trim()) {
    parts.push(prelude.trimEnd(), '')
  } else if (!hadMain) {
    parts.push('// pure SI: educational (runnable)', '')
  }

  parts.push('fn main() {')
  if (inputs.length) {
    parts.push('    // --- live inputs (from SIDUS UI) ---')
    parts.push(...indentBlock(inputs, 4))
    parts.push('')
  }
  parts.push('    // --- formula ---')
  for (const line of formulaLines) {
    const t = line.trimEnd()
    if (!t.trim()) {
      parts.push('')
      continue
    }
    parts.push('    ' + t.trim())
  }
  if (extraPrints.length) {
    parts.push('', '    // --- results ---')
    parts.push(...indentBlock(extraPrints, 4))
  }
  parts.push('}', '')
  return parts.join('\n')
}

function wrapZig(body: string, inputs: string[], prints: string[]): string {
  let inner = body
  let prelude = ''
  const m = body.match(
    /\bpub\s+fn\s+main\s*\([^)]*\)\s*[^{]*\{|\bfn\s+main\s*\([^)]*\)\s*[^{]*\{/,
  )
  if (m && m.index !== undefined) {
    const openBrace = body.indexOf('{', m.index)
    const close = findMatchingBrace(body, openBrace)
    if (close >= 0) {
      prelude = body.slice(0, m.index).trimEnd()
      inner = body.slice(openBrace + 1, close).replace(/^\n/, '').replace(/\n$/, '')
    }
  }

  if (!prelude.includes('@import("std")') && !body.includes('@import("std")')) {
    prelude = (prelude ? prelude + '\n' : '') + 'const std = @import("std");'
  }

  const bound = inputBoundNames(inputs)
  const formulaLines = skipRedeclaredAssigns(inner.split('\n'), bound)
  // Drop explicit `_ = x` discards from educational bodies (we print results)
  const cleanedFormula = formulaLines.filter((line) => {
    const t = line.trim()
    return !/^_\s*=\s*/.test(t)
  })
  const names = extractAssignedNames(cleanedFormula.join('\n'))
  const printL = prints.length ? prints : printLines('zig', names, undefined)
  const extraPrints =
    printL.length > 0 && !bodyAlreadyPrints(inner) ? printL : []
  const useTry = extraPrints.some((l) => l.includes('try '))

  const parts: string[] = []
  if (prelude.trim()) parts.push(prelude.trimEnd(), '')
  parts.push(useTry ? 'pub fn main() !void {' : 'pub fn main() void {')
  if (inputs.length) {
    parts.push('    // --- live inputs (from SIDUS UI) ---')
    parts.push(...indentBlock(inputs, 4))
    parts.push('')
  }
  parts.push('    // --- formula ---')
  for (const line of cleanedFormula) {
    const t = line.trimEnd()
    if (!t.trim()) {
      parts.push('')
      continue
    }
    if (t.trim().startsWith('const std')) continue
    parts.push('    ' + t.trim())
  }
  if (extraPrints.length) {
    parts.push('', '    // --- results ---')
    parts.push(...indentBlock(extraPrints, 4))
  }
  parts.push('}', '')
  return parts.join('\n')
}

/**
 * Fortran is case-insensitive: free inputs m/M, r/R, h/H must not share a
 * symbol. Prefer uppercase (or longer) originals; rename the rest and rewrite body.
 */
function fortranDisambiguateInputs(
  inputLines: string[],
  assigned: string[],
): { inputs: string[]; rename: Map<string, string> } {
  const used = new Set(assigned.map((n) => n.toLowerCase()))
  const parsed: { name: string; val: string; raw: string }[] = []
  for (const line of inputLines) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (!m) continue
    parsed.push({ name: m[1], val: m[2], raw: line })
  }
  // Prefer ALL-CAPS / longer names so M,R,H keep their usual physics symbols
  parsed.sort((a, b) => {
    const aUp = a.name === a.name.toUpperCase() ? 0 : 1
    const bUp = b.name === b.name.toUpperCase() ? 0 : 1
    if (aUp !== bUp) return aUp - bUp
    return b.name.length - a.name.length || a.name.localeCompare(b.name)
  })
  const rename = new Map<string, string>()
  const out: string[] = []
  for (const p of parsed) {
    let cand = p.name
    let i = 0
    while (used.has(cand.toLowerCase())) {
      i++
      cand = `${p.name}_${i}`
    }
    used.add(cand.toLowerCase())
    if (cand !== p.name) rename.set(p.name, cand)
    out.push(`${cand} = ${p.val}`)
  }
  return { inputs: out, rename }
}

function rewriteFortranIdents(src: string, rename: Map<string, string>): string {
  if (rename.size === 0) return src
  const keys = [...rename.keys()].sort((a, b) => b.length - a.length)
  let out = src
  for (const k of keys) {
    const to = rename.get(k)!
    out = out.replace(new RegExp(`\\b${k}\\b`, 'g'), to)
  }
  return out
}

function wrapFortran(body: string, inputs: string[], prints: string[]): string {
  let inner = body
  if (/\bprogram\s+/i.test(body)) {
    inner = body
      .replace(/^\s*program\s+\w+\s*$/im, '')
      .replace(/^\s*end\s+program\b.*$/im, '')
      .replace(/^\s*implicit\s+none\s*$/im, '')
  }

  const assigned = extractAssignedNames(inner)
  const { inputs: safeInputs, rename } = fortranDisambiguateInputs(
    inputs,
    assigned,
  )
  if (rename.size > 0) {
    inner = rewriteFortranIdents(inner, rename)
  }

  // Fortran requires all declarations before any executable statement.
  // Symbols are case-insensitive: track lowercase keys.
  const declNamesLower = new Set<string>()
  const decls: string[] = []
  const exec: string[] = []
  const comments: string[] = []

  const ensureDecl = (name: string) => {
    const low = name.toLowerCase()
    if (declNamesLower.has(low)) return
    declNamesLower.add(low)
    // Fortran requires `::` between attributes/type and the name list
    decls.push(`  real(kind=8) :: ${name}`)
  }

  for (const line of inner.split('\n')) {
    const t = line.trim()
    if (!t) {
      exec.push('')
      continue
    }
    if (t.startsWith('!')) {
      comments.push('  ' + t)
      exec.push('  ' + t)
      continue
    }
    if (/^real\s*\(/i.test(t) && t.includes('::')) {
      const m = t.match(/::\s*([A-Za-z_][A-Za-z0-9_]*)/)
      if (m && !declNamesLower.has(m[1].toLowerCase())) {
        declNamesLower.add(m[1].toLowerCase())
        decls.push('  ' + t)
      }
      continue
    }
    // Normalize single-colon legacy decls → ::
    if (/^real\s*\(/i.test(t) && /:\s*[A-Za-z_]/.test(t) && !t.includes('::')) {
      const fixed = t.replace(/:\s*([A-Za-z_])/, ':: $1')
      const m = fixed.match(/::\s*([A-Za-z_][A-Za-z0-9_]*)/)
      if (m && !declNamesLower.has(m[1].toLowerCase())) {
        declNamesLower.add(m[1].toLowerCase())
        decls.push('  ' + fixed)
      }
      continue
    }
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (m) {
      ensureDecl(m[1])
      exec.push(`  ${m[1]} = ${m[2]}`)
    } else {
      exec.push('  ' + t)
    }
  }

  const inputBlock: string[] = []
  for (const line of safeInputs) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (!m) continue
    const name = m[1]
    const val = m[2]
    declNamesLower.add(name.toLowerCase())
    if (val.startsWith("'") || val.startsWith('"')) {
      inputBlock.push(
        `  character(len=*), parameter :: ${name} = ${val.replace(/"/g, "'")}`,
      )
    } else {
      // Fortran double-precision scientific: 3.98e14 → 3.98d14
      const fval = val.replace(/([0-9.])[eE]([+-]?\d+)/g, '$1d$2')
      inputBlock.push(`  real(kind=8), parameter :: ${name} = ${fval}`)
    }
  }

  const names = extractAssignedNames(inner)
  const printL = prints.length ? prints : printLines('fortran', names, undefined)
  const extraPrints =
    printL.length > 0 && !bodyAlreadyPrints(inner) ? printL : []

  return [
    '! pure SI: educational (runnable)',
    'program sidus_snippet',
    '  implicit none',
    '  ! --- live inputs (from SIDUS UI) ---',
    ...inputBlock,
    '  ! --- declarations ---',
    ...decls,
    '  ! --- formula ---',
    ...exec,
    ...(extraPrints.length
      ? ['  ! --- results ---', ...extraPrints.map((l) => '  ' + l.trim())]
      : []),
    'end program sidus_snippet',
    '',
  ].join('\n')
}

/**
 * Physics notation often uses Isp/Cd/… while UI live values use isp/cd/….
 * Normalize so Godbolt C/Rust/etc. resolve identifiers.
 */
const PHYSICS_ID_ALIASES: Record<string, string> = {
  Isp: 'isp',
  ISP: 'isp',
  Cd: 'cd',
  CD: 'cd',
  Cr: 'cr',
  CR: 'cr',
  Rn: 'rn',
  RN: 'rn',
  Qdot: 'qdot',
  QDot: 'qdot',
  QDOT: 'qdot',
  Tc: 'tc',
  TC: 'tc',
  G0: 'g0',
}

/** ALL-CAPS identifiers that are C macros / types: not free physics inputs. */
const MACRO_OR_TYPE = new Set([
  'M_PI',
  'M_E',
  'NULL',
  'EOF',
  'TRUE',
  'FALSE',
  'PI',
  // bare E is eccentric anomaly: not a macro
  'INT',
  'UINT',
  'SIZE_T',
  'BOOL',
  'CHAR',
  'VOID',
  'CONST',
  'STATIC',
  'INLINE',
  'STDIN',
  'STDOUT',
  'STDERR',
])

const CODE_BUILTINS = new Set([
  'Math',
  'math',
  'std',
  'console',
  'True',
  'False',
  'None',
  'true',
  'false',
  'null',
  'undefined',
  'NaN',
  'Infinity',
  'PI',
  // bare `pi` from splitting math.pi: not a free input
  'pi',
  // bare `E` is eccentric anomaly in orbital snippets: not Math.E
  'M_PI',
  'M_E',
  'int',
  'double',
  'float',
  'void',
  'f64',
  'f32',
  'i32',
  'i64',
  'usize',
  'bool',
  'string',
  'println',
  'print',
  'printf',
  'abs_f',
  'powf',
  'powi2',
  'powi3',
  'sqrt',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'atan2',
  'exp',
  'ln',
  'log',
  'log10',
  'log2',
  'hypot',
  'max',
  'min',
  'fabs',
  'abs',
  'powi',
  'pow',
  'main',
  'mut',
  'let',
  'const',
  'fn',
  'pub',
  'use',
  'import',
  'writer',
  'stdout',
  'var',
  'from',
  'export',
  'return',
  'if',
  'else',
  'elif',
  'for',
  'while',
  'include',
  'stdio',
  'cmath',
  'fmax',
  'fmin',
  'floor',
  'ceil',
  'Number',
  'String',
  'Error',
  'Date',
  'function',
  // Python / JS keywords & helpers: never free UI inputs
  'def',
  'class',
  'lambda',
  'async',
  'await',
  'yield',
  'pass',
  'break',
  'continue',
  'raise',
  'try',
  'except',
  'finally',
  'with',
  'as',
  'in',
  'is',
  'not',
  'and',
  'or',
  'global',
  'nonlocal',
  'assert',
  'del',
  'self',
  'cls',
  'dict',
  'list',
  'set',
  'tuple',
  'range',
  'len',
  'sum',
  'zip',
  'map',
  'filter',
  'any',
  'all',
  'enum',
  'struct',
  'impl',
  'trait',
  'type',
  'where',
  'match',
  'loop',
  'mod',
  'crate',
  'super',
  'self',
  'Self',
])

/** Rewrite Isp/Cd/… → isp/cd/… in code (not in string literals: best-effort). */
export function canonicalizePhysicsIds(code: string): string {
  let out = code
  for (const [from, to] of Object.entries(PHYSICS_ID_ALIASES)) {
    if (from === to) continue
    out = out.replace(new RegExp(`\\b${from}\\b`, 'g'), to)
  }
  return out
}

function normalizeValueKeys(values: LiveCodeValues): LiveCodeValues {
  const out: LiveCodeValues = {}
  for (const [k, v] of Object.entries(values)) {
    const nk = PHYSICS_ID_ALIASES[k] ?? k
    // Prefer first write; explicit lowercase wins if both present later
    if (out[nk] === undefined || nk === k) out[nk] = v
  }
  return out
}

/** Identifiers referenced in code (comments stripped roughly). */
export function collectIdentifiers(code: string): Set<string> {
  const stripped = code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    // Full-line Fortran `!` comments only (avoid stripping C/JS `!flag` / `!=`)
    .replace(/^\s*![^\n]*/gm, ' ')
    .replace(/#[^\n]*/g, ' ')
    .replace(/%[^\n]*/g, ' ')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
  const ids = new Set<string>()
  const re = /\b([A-Za-z_][A-Za-z0-9_]*)\b/g
  let m: RegExpExecArray | null
  while ((m = re.exec(stripped))) ids.add(m[1])
  return ids
}

/**
 * Peel outer `main` shells so free-var analysis sees formula assigns inside
 * makeSnippet-generated Rust/Zig/C programs (brace-depth was hiding them).
 */
function bodyForFreeVarAnalysis(body: string, lang?: CodeLang): string {
  let s = body
  // Rust: keep only fn main inner + ignore helper fns for free-var purposes
  const rust = stripOuterMainRust(s)
  if (rust.hadMain) {
    s = rust.inner
  } else {
    // Drop helper `fn foo(...) { ... }` blocks so param names (x,y,a,b) aren't free
    s = s.replace(
      /\bfn\s+[A-Za-z_][\w]*\s*\([^)]*\)\s*(?:->\s*[^{]+)?\{[^}]*\}/g,
      '',
    )
  }
  const zig = s.match(
    /\b(?:pub\s+)?fn\s+main\s*\([^)]*\)\s*[^{]*\{/,
  )
  if (zig && zig.index !== undefined) {
    const open = s.indexOf('{', zig.index)
    const close = findMatchingBrace(s, open)
    if (close >= 0) s = s.slice(open + 1, close)
  }
  const c = stripOuterMainC(s)
  if (c.hadMain) s = c.inner

  // Python / JS: drop def/function blocks (params + bodies) so helpers aren't free
  // Multi-line Python def … indented body until next non-indented line
  s = s.replace(
    /^def\s+[A-Za-z_][\w]*\s*\([^)]*\)\s*:[\s\S]*?(?=^[^\s#]|\Z)/gm,
    '',
  )
  s = s.replace(
    /\bfunction\s+[A-Za-z_][\w]*\s*\([^)]*\)\s*\{[^}]*\}/g,
    '',
  )
  s = s.replace(
    /\b(?:const|let|var)\s+[A-Za-z_][\w]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{[^}]*\}/g,
    '',
  )

  // Strip use/import/include noise
  s = s
    .split('\n')
    .filter(
      (l) =>
        !/^\s*(use\s|#include|import\s|from\s|const\s+std\s*=)/.test(l) &&
        !/^\s*fn\s+/.test(l) &&
        !/^\s*def\s+/.test(l),
    )
    .join('\n')

  // Julia/MATLAB: no braces/indentation, so peel keyword-delimited function
  // interiors here too, same as the brace/indent stripping above for other langs.
  if (lang) s = stripFunctionInteriors(s, lang)
  return s
}

/**
 * Free variables needed from the UI: appear in body, not assigned there,
 * not builtins/keywords. Physics constants (P0, S0, g0, …) stay free so
 * they can be injected from UI or PHYSICS_DEFAULTS.
 */
export function freeVarsNeeded(body: string, lang?: CodeLang): Set<string> {
  const core = bodyForFreeVarAnalysis(body, lang)
  const assigned = new Set(extractAssignedNames(core, lang))
  // Also treat top-level assigns in the original body (no-main fragments)
  for (const n of extractAssignedNames(body, lang)) assigned.add(n)
  // Function names are defined in the snippet, not free inputs.
  // Do NOT mark parameters as assigned globally: they only shadow inside the
  // function (params are already removed via bodyForFreeVarAnalysis stripping).
  for (const m of body.matchAll(/\bdef\s+([A-Za-z_][\w]*)/g)) assigned.add(m[1])
  for (const m of body.matchAll(/\bfunction\s+([A-Za-z_][\w]*)/g)) assigned.add(m[1])
  for (const m of body.matchAll(/\bfn\s+([A-Za-z_][\w]*)/g)) assigned.add(m[1])
  const all = collectIdentifiers(core)
  const free = new Set<string>()
  for (const id of all) {
    if (assigned.has(id)) continue
    if (CODE_BUILTINS.has(id)) continue
    // Alias keys (Tc→tc): count the *canonical* free name, not the raw spelling
    if (PHYSICS_ID_ALIASES[id]) {
      free.add(PHYSICS_ID_ALIASES[id]!)
      continue
    }
    if (MACRO_OR_TYPE.has(id)) continue
    // Skip single-letter? No: n, a, e, i, m, R are common physics inputs.
    free.add(id)
  }
  return free
}

/** Keep only live values that the snippet actually reads; fill physics defaults. */
export function filterLiveValuesForBody(
  body: string,
  values: LiveCodeValues | undefined,
  lang?: CodeLang,
): LiveCodeValues | undefined {
  const normalized = normalizeValueKeys(
    enrichLiveValues(values) ?? values ?? {},
  )
  const needed = freeVarsNeeded(body, lang)
  // Empty free-set → no live inputs (do not dump the whole UI bag into scope)
  if (needed.size === 0) return {}
  const out: LiveCodeValues = {}
  for (const key of needed) {
    if (key in normalized && normalized[key] != null) {
      out[key] = normalized[key]
    } else if (key in PHYSICS_DEFAULTS) {
      out[key] = PHYSICS_DEFAULTS[key]
    }
  }
  return out
}

/**
 * Turn a formula snippet (+ live UI values) into a runnable program that
 * prints results. Shared by CodeExport display and online Run.
 */
export function wrapAsRunnable(
  body: string,
  lang: CodeLang,
  values: LiveCodeValues | undefined,
): string {
  if (lang === 'latex') return body

  const canonBody = canonicalizePhysicsIds(body)
  const filtered = filterLiveValuesForBody(canonBody, values, lang)
  const inputs = liveInputLines(lang, filtered)
  const bodyNames = extractAssignedNames(canonBody, lang)
  const inputKeys = new Set([
    ...Object.keys(filtered ?? {}),
    ...Object.keys(filtered ?? {}).map((k) => safeIdent(lang, k)),
  ])
  // Body-assigned names are results even if they share a symbol with a
  // physics default (e.g. circular-orbit `g = mu/(r*r)`). Skipping those
  // left Zig unused-locals hard errors.
  const resultNames = bodyNames.filter((n) => !inputKeys.has(n))
  const prints = printLines(lang, resultNames, filtered)

  switch (lang) {
    case 'python':
      return wrapPython(canonBody, inputs, prints)
    case 'javascript':
    case 'typescript':
      return wrapJs(canonBody, inputs, prints)
    case 'julia':
      return wrapJulia(canonBody, inputs, prints)
    case 'matlab':
      return wrapMatlab(canonBody, inputs, prints)
    case 'c':
      return wrapCFamily(canonBody, inputs, prints, false)
    case 'cpp':
      return wrapCFamily(canonBody, inputs, prints, true)
    case 'rust':
      return wrapRust(canonBody, inputs, prints)
    case 'zig':
      return wrapZig(canonBody, inputs, prints)
    case 'fortran':
      return wrapFortran(canonBody, inputs, prints)
    default:
      return `${liveValuesPreamble(lang, filtered)}${canonBody}`
  }
}

/**
 * Strip TypeScript type annotations so code can run on a plain JS engine.
 */
export function stripTsTypes(code: string): string {
  let s = code
  // type Alias = { ... } / type Alias = Other
  s = s.replace(/\btype\s+[A-Za-z_$][\w$]*\s*=\s*\{[^}]*\}\s*;?/g, '')
  s = s.replace(/\btype\s+[A-Za-z_$][\w$]*\s*=\s*[^;\n]+;?\s*/g, '')
  // interface X { ... }
  s = s.replace(/\binterface\s+[A-Za-z_$][\w$]*\s*\{[^}]*\}\s*/g, '')
  // Return types: `): Type {` / `): Type =>`
  s = s.replace(/\)\s*:\s*[A-Za-z_$][\w$<>[\]|&.]*(?=\s*[{=])/g, ')')
  // Parameter / variable types: `name: Type` before `=`, `,`, `)`
  // Type class must NOT include `,` or whitespace: those terminate the type.
  s = s.replace(
    /([,\(\s])([A-Za-z_$][\w$]*)\s*:\s*[A-Za-z_$][\w$<>[\]|&.]*(?=\s*[=,)])/g,
    '$1$2',
  )
  // `as Type`
  s = s.replace(/\s+as\s+[A-Za-z_$][\w$<>[\]|&.]+/g, '')
  // Optional `?` on params / props
  s = s.replace(/([,\(]\s*[A-Za-z_$][\w$]*)\?(?=\s*[=,)])/g, '$1')
  s = s.replace(/([A-Za-z_$][\w$]*)\?\s*:/g, '$1:')
  return s
}

/** Full render: placeholders → canonicalize ids → filter live inputs → runnable. */
export function renderLiveCode(
  body: string,
  lang: CodeLang,
  values: LiveCodeValues | undefined,
): string {
  const withPlaceholders = applyValuePlaceholders(
    body,
    lang,
    values ? normalizeValueKeys(values) : values,
  )
  return wrapAsRunnable(withPlaceholders, lang, values)
}
