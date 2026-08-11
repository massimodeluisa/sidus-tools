/**
 * Godbolt matrix: render every SIDUS CodeExport body and compile+execute on
 * Compiler Explorer (godbolt.org API).
 *
 * Usage:
 *   npx tsx scripts/godbolt-matrix.ts
 *   npx tsx scripts/godbolt-matrix.ts --langs=python,javascript,c
 *   npx tsx scripts/godbolt-matrix.ts --all
 *   npx tsx scripts/godbolt-matrix.ts --langs=python --limit=5 --concurrency=2
 *   npx tsx scripts/godbolt-matrix.ts --include-lib   # also try satellite.js tools
 *
 * Exit code 1 if any pure-SI (no deps) case fails.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOOLS } from '../src/data/tools.ts'
import {
  CODE_LANGS,
  getSnippets,
  prepareGodboltSource,
  renderLiveCode,
  type CodeLang,
  type LiveCodeValues,
} from '../src/lib/snippets/index.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CE = 'https://godbolt.org'
const DEFAULT_LANGS: CodeLang[] = ['python', 'javascript', 'c']
const ALL_GODBOLT: CodeLang[] = [
  'python',
  'javascript',
  'typescript',
  'c',
  'cpp',
  'rust',
  'zig',
  'fortran',
  'julia',
]

/**
 * Educational defaults: enough free-vars for pure-SI orbital / systems tools.
 * Tools that need special bags (SGP4 TLE, etc.) are library-backed and skipped
 * unless --include-lib.
 */
const SAMPLE: LiveCodeValues = {
  // Earth LEO-ish
  mu: 3.986004418e14,
  R: 6_378_137,
  r_eq: 6_378_137,
  M: 5.972e24,
  M_primary: 5.972e24,
  m: 1000,
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
  mpl: 100,
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
  isp: 300,
  Isp: 300,
  g0: 9.80665,
  N: 2,
  n: 2,
  n_stages: 2,
  nt: 2,
  dv: 3000,
  dvs: 3000,
  dv1: 1000,
  dv2: 1000,
  dv3: 500,
  mdot: 1.5,
  ve: 3000,
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
  tRx: 290,
  uz1: 0,
  uz2: 0,
  uz3: 0,
  uz4: 0,
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
  ns: 14,
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
const SAMPLE_OVERRIDES: Record<string, LiveCodeValues> = {
  'panel-eol-power': { d: 0.005, p0: 200, years: 15 },
  'cr3bp-jacobi': { mu: 0.01215, x: 0.8, y: 0, vx: 0, vy: 0.1 },
  'angular-diameter': { d: 384_400_000, R: 1_737_400 },
}

type Status =
  | 'ok'
  | 'fail-compile'
  | 'fail-execute'
  | 'skip-no-source'
  | 'skip-library'
  | 'error-network'
  | 'error-render'

type CaseResult = {
  toolId: string
  formulaId: string
  lang: CodeLang
  status: Status
  compiler?: string
  code?: number
  execCode?: number
  didExecute?: boolean
  ms?: number
  stderr?: string
  stdout?: string
  sourcePreview?: string
  hasDeps?: boolean
}

function parseArgs(argv: string[]) {
  let langs = [...DEFAULT_LANGS]
  let limit = Infinity
  let concurrency = 3
  let includeLib = false
  let outDir = path.join(ROOT, 'docs', 'godbolt-matrix')
  let toolsFilter: string[] | null = null

  for (const a of argv) {
    if (a === '--all') langs = [...ALL_GODBOLT]
    else if (a.startsWith('--langs=')) {
      langs = a
        .slice('--langs='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as CodeLang[]
    } else if (a.startsWith('--limit=')) limit = Number(a.slice('--limit='.length))
    else if (a.startsWith('--concurrency='))
      concurrency = Math.max(1, Number(a.slice('--concurrency='.length)) || 3)
    else if (a === '--include-lib') includeLib = true
    else if (a.startsWith('--out=')) outDir = path.resolve(a.slice('--out='.length))
    else if (a.startsWith('--tools=')) {
      toolsFilter = a
        .slice('--tools='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }
  return { langs, limit, concurrency, includeLib, outDir, toolsFilter }
}

function textLines(
  arr: { text?: string }[] | string[] | undefined,
): string {
  if (!arr?.length) return ''
  return arr
    .map((x) => (typeof x === 'string' ? x : (x.text ?? '')))
    .filter(Boolean)
    .join('\n')
    .slice(0, 1200)
}

async function compileExecute(
  lang: CodeLang,
  source: string,
): Promise<{
  ok: boolean
  status: Status
  compiler: string
  code: number
  execCode?: number
  didExecute?: boolean
  stderr: string
  stdout: string
  ms: number
}> {
  const prep = prepareGodboltSource(lang, source)
  if (!prep) {
    return {
      ok: false,
      status: 'error-render',
      compiler: '',
      code: -1,
      stderr: 'no Godbolt target',
      stdout: '',
      ms: 0,
    }
  }

  const t0 = Date.now()
  const body = {
    source: prep.source,
    lang: prep.language,
    options: {
      userArguments: prep.options,
      compilerOptions: {
        executorRequest: true,
        skipAsm: true,
      },
      filters: {
        execute: true,
        binary: false,
        binaryObject: false,
        labels: true,
        directives: true,
        commentOnly: true,
        demangle: true,
        intel: true,
        libraryCode: false,
        trim: false,
      },
      executeParameters: {
        args: [] as string[],
        stdin: '',
      },
      tools: [] as unknown[],
      libraries: [] as unknown[],
    },
    allowStoreCodeDebug: true,
  }

  const res = await fetch(`${CE}/api/compiler/${prep.compiler}/compile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  const ms = Date.now() - t0
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    return {
      ok: false,
      status: 'error-network',
      compiler: prep.compiler,
      code: res.status,
      stderr: t.slice(0, 800),
      stdout: '',
      ms,
    }
  }

  const data = (await res.json()) as {
    code?: number
    stdout?: { text?: string }[]
    stderr?: { text?: string }[]
    didExecute?: boolean
    execTime?: number
    buildResult?: {
      code?: number
      stderr?: { text?: string }[]
      stdout?: { text?: string }[]
    }
  }

  // Executor-request shape: top-level code is process exit; buildResult.code is compile
  const buildCode =
    typeof data.buildResult?.code === 'number' ? data.buildResult.code : undefined
  const topCode = typeof data.code === 'number' ? data.code : undefined
  const stderr =
    textLines(data.stderr) ||
    textLines(data.buildResult?.stderr) ||
    // Some CE paths only put messages in stdout on failure
    (data.didExecute === false ? textLines(data.stdout) : '')
  const stdout = textLines(data.stdout)

  // Compile failure (compiled languages)
  if (buildCode !== undefined && buildCode !== 0) {
    return {
      ok: false,
      status: 'fail-compile',
      compiler: prep.compiler,
      code: buildCode,
      execCode: topCode,
      didExecute: data.didExecute,
      stderr: stderr || 'Build failed (no stderr from CE)',
      stdout,
      ms,
    }
  }

  // Did not execute and no successful top-level code 0 with output
  if (data.didExecute === false) {
    return {
      ok: false,
      status: 'fail-execute',
      compiler: prep.compiler,
      code: buildCode ?? topCode ?? -1,
      execCode: topCode,
      didExecute: false,
      stderr: stderr || 'didExecute=false',
      stdout,
      ms,
    }
  }

  // Process non-zero exit (common for Python NameError → exit 1)
  if (topCode !== undefined && topCode !== 0) {
    return {
      ok: false,
      status: 'fail-execute',
      compiler: prep.compiler,
      code: buildCode ?? 0,
      execCode: topCode,
      didExecute: data.didExecute,
      stderr: stderr || stdout,
      stdout,
      ms,
    }
  }

  return {
    ok: true,
    status: 'ok',
    compiler: prep.compiler,
    code: buildCode ?? 0,
    execCode: topCode ?? 0,
    didExecute: data.didExecute ?? true,
    stderr,
    stdout,
    ms,
  }
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number, r: R) => void,
): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  let done = 0
  async function worker() {
    for (;;) {
      const i = next++
      if (i >= items.length) return
      const r = await fn(items[i]!, i)
      out[i] = r
      done++
      onProgress?.(done, items.length, r)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return out
}

function buildMarkdown(results: CaseResult[], meta: Record<string, unknown>): string {
  const byLang = new Map<string, { ok: number; fail: number; skip: number }>()
  const fails = results.filter((r) => r.status.startsWith('fail') || r.status.startsWith('error'))
  for (const r of results) {
    const b = byLang.get(r.lang) ?? { ok: 0, fail: 0, skip: 0 }
    if (r.status === 'ok') b.ok++
    else if (r.status.startsWith('skip')) b.skip++
    else b.fail++
    byLang.set(r.lang, b)
  }

  const lines: string[] = [
    '# Godbolt matrix report',
    '',
    `Generated: ${meta.generatedAt}`,
    '',
    '## Summary',
    '',
    `| Lang | OK | Fail | Skip |`,
    `|------|----|------|------|`,
  ]
  for (const lang of [...byLang.keys()].sort()) {
    const b = byLang.get(lang)!
    lines.push(`| ${lang} | ${b.ok} | ${b.fail} | ${b.skip} |`)
  }
  lines.push('')
  lines.push(
    `Totals: **${results.filter((r) => r.status === 'ok').length}** ok · **${fails.length}** fail · **${results.filter((r) => r.status.startsWith('skip')).length}** skip (of ${results.length} cases)`,
  )
  lines.push('')
  lines.push('## Failures')
  lines.push('')
  if (fails.length === 0) {
    lines.push('_None: all attempted cases passed._')
  } else {
    lines.push('| Tool | Lang | Status | Compiler | Code | Stderr (trunc) |')
    lines.push('|------|------|--------|----------|------|----------------|')
    for (const f of fails) {
      const err = (f.stderr || f.stdout || '')
        .replace(/\|/g, '\\|')
        .replace(/\n/g, ' ⏎ ')
        .slice(0, 180)
      lines.push(
        `| \`${f.toolId}\` | ${f.lang} | ${f.status} | ${f.compiler ?? ': '} | ${f.execCode ?? f.code ?? ': '} | ${err || ': '} |`,
      )
    }
  }
  lines.push('')
  lines.push('## How to re-run')
  lines.push('')
  lines.push('```bash')
  lines.push('npm run godbolt:matrix                 # python + javascript + c')
  lines.push('npm run godbolt:matrix -- --all        # all Godbolt languages')
  lines.push('npm run godbolt:matrix -- --include-lib')
  lines.push('```')
  lines.push('')
  lines.push(
    'Pure-SI snippets (no `deps`) should pass. Library-backed tools (SGP4, look-angles, …) are skipped unless `--include-lib`.',
  )
  lines.push('')
  return lines.join('\n')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const jobs: {
    toolId: string
    formulaId: string
    lang: CodeLang
    body: string
    hasDeps: boolean
  }[] = []

  for (const tool of TOOLS) {
    if (args.toolsFilter && !args.toolsFilter.includes(tool.id)) continue
    const snip = getSnippets(tool.id)
    if (!snip) continue
    const hasDeps = Boolean(snip.deps?.length)
    for (const lang of args.langs) {
      if (!CODE_LANGS.some((l) => l.id === lang)) continue
      const body = snip.code[lang]
      if (!body?.trim()) {
        jobs.push({
          toolId: tool.id,
          formulaId: snip.formulaId,
          lang,
          body: '',
          hasDeps,
        })
        continue
      }
      jobs.push({
        toolId: tool.id,
        formulaId: snip.formulaId,
        lang,
        body,
        hasDeps,
      })
    }
  }

  const limited = jobs.slice(0, args.limit)
  console.log(
    `Godbolt matrix: ${limited.length} cases · langs=${args.langs.join(',')} · concurrency=${args.concurrency}${args.includeLib ? ' · include-lib' : ''}`,
  )

  const results = await mapPool(
    limited,
    args.concurrency,
    async (job): Promise<CaseResult> => {
      if (!job.body) {
        return {
          toolId: job.toolId,
          formulaId: job.formulaId,
          lang: job.lang,
          status: 'skip-no-source',
          hasDeps: job.hasDeps,
        }
      }
      if (job.hasDeps && !args.includeLib) {
        return {
          toolId: job.toolId,
          formulaId: job.formulaId,
          lang: job.lang,
          status: 'skip-library',
          hasDeps: true,
        }
      }

      let source: string
      try {
        const bag: LiveCodeValues = {
          ...SAMPLE,
          ...(SAMPLE_OVERRIDES[job.toolId] ?? {}),
        }
        source = renderLiveCode(job.body, job.lang, bag)
      } catch (e) {
        return {
          toolId: job.toolId,
          formulaId: job.formulaId,
          lang: job.lang,
          status: 'error-render',
          stderr: e instanceof Error ? e.message : String(e),
          hasDeps: job.hasDeps,
        }
      }

      try {
        const r = await compileExecute(job.lang, source)
        return {
          toolId: job.toolId,
          formulaId: job.formulaId,
          lang: job.lang,
          status: r.status,
          compiler: r.compiler,
          code: r.code,
          execCode: r.execCode,
          didExecute: r.didExecute,
          ms: r.ms,
          stderr: r.stderr,
          stdout: r.stdout,
          sourcePreview: source.slice(0, 400),
          hasDeps: job.hasDeps,
        }
      } catch (e) {
        return {
          toolId: job.toolId,
          formulaId: job.formulaId,
          lang: job.lang,
          status: 'error-network',
          stderr: e instanceof Error ? e.message : String(e),
          sourcePreview: source.slice(0, 400),
          hasDeps: job.hasDeps,
        }
      }
    },
    (done, total, r) => {
      const mark =
        r.status === 'ok' ? '✓' : r.status.startsWith('skip') ? '·' : '✗'
      if (done % 10 === 0 || r.status !== 'ok' || done === total) {
        process.stdout.write(
          `\r[${done}/${total}] ${mark} ${r.toolId}:${r.lang} ${r.status}   `,
        )
      }
    },
  )
  process.stdout.write('\n')

  await mkdir(args.outDir, { recursive: true })
  const meta = {
    generatedAt: new Date().toISOString(),
    langs: args.langs,
    concurrency: args.concurrency,
    includeLib: args.includeLib,
    limit: args.limit === Infinity ? null : args.limit,
    cases: results.length,
  }
  const jsonPath = path.join(args.outDir, 'report.json')
  const mdPath = path.join(args.outDir, 'report.md')
  await writeFile(
    jsonPath,
    JSON.stringify({ meta, results }, null, 2),
    'utf8',
  )
  await writeFile(mdPath, buildMarkdown(results, meta), 'utf8')

  // Console summary
  const pureFails = results.filter(
    (r) =>
      !r.hasDeps &&
      (r.status.startsWith('fail') || r.status.startsWith('error')),
  )
  const byLang: Record<string, { ok: number; fail: number; skip: number }> = {}
  for (const r of results) {
    byLang[r.lang] ??= { ok: 0, fail: 0, skip: 0 }
    if (r.status === 'ok') byLang[r.lang]!.ok++
    else if (r.status.startsWith('skip')) byLang[r.lang]!.skip++
    else byLang[r.lang]!.fail++
  }
  console.log('\nBy language:')
  for (const [lang, b] of Object.entries(byLang).sort()) {
    console.log(`  ${lang.padEnd(12)} ok=${b.ok}  fail=${b.fail}  skip=${b.skip}`)
  }
  console.log(`\nWrote ${mdPath}`)
  console.log(`Wrote ${jsonPath}`)

  if (pureFails.length) {
    console.log(`\n${pureFails.length} pure-SI failures:`)
    for (const f of pureFails.slice(0, 40)) {
      console.log(`  - ${f.toolId}:${f.lang}  ${f.status}  ${(f.stderr || '').split('\n')[0]?.slice(0, 100)}`)
    }
    if (pureFails.length > 40) console.log(`  … +${pureFails.length - 40} more`)
    process.exitCode = 1
  } else {
    console.log('\nAll pure-SI cases OK (or skipped).')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
