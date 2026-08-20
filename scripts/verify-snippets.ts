/**
 * Snippet verification matrix: render every shipped snippet runnable, compile/execute it
 * with LOCAL toolchains, and compare the numbers it prints against shipped physics.
 *
 * Usage:
 *   npx tsx scripts/verify-snippets.ts
 *   npx tsx scripts/verify-snippets.ts --tools=circular-orbit,hohmann --langs=c,rust
 *   npx tsx scripts/verify-snippets.ts --changed
 *   npx tsx scripts/verify-snippets.ts --require-all --out=docs/verify-matrix
 *
 * Exit code 1 if any `fail-*` case is in scope. `--require-all` also fails on skipped
 * toolchains / missing language deps. `skip-no-expected` never fails: expected-value
 * coverage is reported, not claimed.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { TOOLS } from '../src/data/tools.ts'
import {
  CODE_LANGS,
  canonicalizePhysicsIds,
  extractAssignedNames,
  filterLiveValuesForBody,
  getSnippets,
  renderLiveCode,
  safeIdent,
  stripTsTypes,
  type CodeLang,
  type LiveCodeValues,
} from '../src/lib/snippets/index.ts'
import { asInjected, scenariosFor } from '../src/lib/snippets/verify/inputs.ts'
import { EXPECTED, TOLERANCE_OVERRIDES, UNVERIFIABLE } from '../src/lib/snippets/verify/expected/index.ts'
import { getAliasGroups } from '../src/lib/snippets/verify/expected/shared.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// PID+timestamp-scoped so a concurrent run of this script (e.g. another
// agent/CI job in the same checkout) never races this one's
// rmSync/mkdirSync/writeFileSync; still covered by the `.verify-tmp/` gitignore
// rule since it's a subdirectory. Cleaned up at the end as before.
const TMP = path.join(ROOT, '.verify-tmp', `${process.pid}-${Date.now()}`)
const ALL_LANGS = CODE_LANGS.map((l) => l.id)

/** Relative tolerance per language: printf precision, not physics disagreement. */
const TOLERANCE: Partial<Record<CodeLang, number>> = {
  matlab: 2e-5,
  c: 2e-8,
  cpp: 2e-8,
}
const DEFAULT_TOLERANCE = 1e-9
/** Below this magnitude a relative comparison is meaningless: use absolute. */
const NEAR_ZERO = 1e-12

/**
 * Tectonic bundle-resolution failure text: a live fetch of the bundle's own
 * index was attempted (mode-independent: this fetch is never gated by
 * `--only-cached`) and failed. Never appears from a genuine LaTeX error.
 */
const INFRA_NETWORK_SIGNATURE = /bundle isn't cached|couldn't get it from the internet|429|Too Many Requests/i

/**
 * Tectonic cache-miss failure text, meaningful only in `--only-cached` mode:
 * every snippet fragment shares the exact same fixed preamble (see
 * `latexDocument`) and no snippet body ever declares its own file/preamble
 * directive (enforced below), so the only files a fragment can ever request
 * are preamble/format/glyph-triggered bundle content: a missing input file
 * (TeX/LaTeX engine) or a missing PFB font (xdvipdfmx, when a glyph the
 * warm-up probe never rendered needs its own font at a size the probe never
 * used) is therefore a cache gap, never a genuine snippet defect: the warm-up
 * step in CI didn't pre-populate that file.
 */
const INFRA_CACHE_MISS_SIGNATURE =
  /failed to open input file|LaTeX Error: File `[^']*' not found|kpathsea library can find this font|Could not locate a virtual\/physical font/i

/**
 * A latex fragment must never carry its own file/preamble directive: every
 * fragment shares `latexDocument`'s fixed preamble, so this can only be a
 * rule-breaking snippet trying to pull in a file of its own choosing. Checked
 * before compiling so such a directive is always reported as a genuine
 * failure and can never be laundered into `fail-infra` by the cache-miss
 * signature above.
 */
const FORBIDDEN_LATEX_DIRECTIVE = /\\(documentclass|usepackage|input|include|openin)\b/

type Status =
  | 'ok'
  | 'ok-compile'
  | 'fail-compile'
  | 'fail-run'
  | 'fail-numeric'
  | 'fail-parse'
  | 'fail-infra'
  | 'skip-no-source'
  | 'skip-no-expected'
  | 'skip-toolchain'
  | 'skip-dep-missing'

type Mismatch = { name: string; expected: number; got: number; relErr: number }

/** Outcome of one scenario's compile/run/compare for a given (tool, lang). */
type ScenarioOutcome = {
  scenario: string
  status: Status
  matched?: number
  compared?: string[]
  mismatches?: Mismatch[]
  detail?: string
}

/**
 * A (tool, lang) cell. `status` is the worst scenario status (ok only if every
 * scenario in `scenarios` is ok); `scenarioCount` backs the `ok(n)` matrix badge.
 * `scenarios` is absent for cells that never reach the per-scenario loop (no
 * source, no expected fn, latex, or a language-level toolchain skip found before
 * the first scenario ran).
 */
type CaseResult = {
  toolId: string
  lang: CodeLang
  status: Status
  scenarioCount?: number
  scenarios?: ScenarioOutcome[]
  detail?: string
}

type Runner = {
  ext: string
  /** Compile step; absent for interpreted languages. `unit` is a bare identifier. */
  compile?: (file: string, bin: string, unit: string) => string[]
  run: (file: string, bin: string) => string[]
}

const RUNNERS: Partial<Record<CodeLang, Runner>> = {
  javascript: { ext: 'mjs', run: (f) => ['node', f] },
  typescript: { ext: 'mjs', run: (f) => ['node', f] },
  python: { ext: 'py', run: (f) => ['python3', f] },
  c: {
    ext: 'c',
    compile: (f, bin) => ['cc', f, '-lm', '-O1', '-o', bin],
    run: (_f, bin) => [bin],
  },
  cpp: {
    ext: 'cpp',
    compile: (f, bin) => ['c++', '-std=c++17', f, '-O1', '-o', bin],
    run: (_f, bin) => [bin],
  },
  rust: {
    ext: 'rs',
    // rustc derives the crate name from the file name; ours contains dots.
    compile: (f, bin, unit) => ['rustc', '-O', '--crate-name', unit, f, '-o', bin],
    run: (_f, bin) => [bin],
  },
  zig: {
    ext: 'zig',
    compile: (f, bin) => ['zig', 'build-exe', f, `-femit-bin=${bin}`],
    run: (_f, bin) => [bin],
  },
  fortran: {
    ext: 'f90',
    // -ffree-line-length-none: rendered snippets carry machine-injected values
    // on single long lines; Ubuntu gfortran errors past 132 free-form columns.
    compile: (f, bin) => ['gfortran', '-ffree-line-length-none', f, '-o', bin],
    run: (_f, bin) => [bin],
  },
  julia: { ext: 'jl', run: (f) => ['julia', f] },
  matlab: { ext: 'm', run: (f) => ['octave', '--no-gui', '--quiet', f] },
}

const toolchainCache = new Map<string, boolean>()

function hasExecutable(bin: string): boolean {
  const cached = toolchainCache.get(bin)
  if (cached !== undefined) return cached
  const r = spawnSync(bin, ['--version'], { stdio: 'ignore' })
  const ok = !(r.error && (r.error as NodeJS.ErrnoException).code === 'ENOENT')
  toolchainCache.set(bin, ok)
  return ok
}

/**
 * zig 0.14.1 on macOS 15 cannot link against libSystem (undefined _sigaction,
 * _isatty, _getenv, __availability_version_check), so a compiler on PATH does not
 * mean a usable toolchain. Probe once with a hello world; Linux CI is unaffected.
 */
let zigProbe: { usable: boolean; note?: string } | null = null

function zigUsable(): { usable: boolean; note?: string } {
  if (zigProbe) return zigProbe
  if (!hasExecutable('zig')) {
    zigProbe = { usable: false, note: 'zig' }
    return zigProbe
  }
  const src = path.join(TMP, '__zig_probe.zig')
  const bin = path.join(TMP, '__zig_probe.bin')
  writeFileSync(
    src,
    'const std = @import("std");\npub fn main() void {\n    std.debug.print("ok\\n", .{});\n}\n',
    'utf8',
  )
  const c = spawnSync('zig', ['build-exe', src, `-femit-bin=${bin}`], {
    cwd: TMP,
    encoding: 'utf8',
    timeout: 120_000,
  })
  const linked = c.status === 0 && spawnSync(bin, [], { encoding: 'utf8' }).status === 0
  zigProbe = linked
    ? { usable: true }
    : { usable: false, note: 'zig present but cannot link on this host; verified in CI' }
  return zigProbe
}

/**
 * Names the body assigns itself, so the shared bag never shadows a body constant.
 * `extractAssignedNames` splits multi-assign lines on commas only; MATLAB and C
 * bodies also pack several assignments onto one `;`-separated line, so extend a
 * line that was already recognised as top level with its remaining targets.
 *
 * It also only matches `NAME = value`, not the colon-typed `const/let/var NAME:
 * TYPE = value` zig/TypeScript/typed-Rust use, so a body's own typed constant
 * (e.g. zig `const L: f64 = 0.0065;`) was left unpruned and lost to a same-named
 * SAMPLE value injected ahead of it (SAMPLE's `L`, a different free var, shadowing
 * the body's own `L` via the wrapper's redeclaration-skip). Catch those here too.
 */
function bodyAssignedNames(body: string): Set<string> {
  const canon = canonicalizePhysicsIds(body)
  const names = new Set(extractAssignedNames(canon))
  for (const line of canon.split('\n')) {
    const parts = line.split(';')
    if (parts.length < 2) continue
    const targets = parts
      .map((p) => p.trim().match(/^(?:(?:const|static|volatile)\s+)*(?:double|float|int|long|auto|bool)?\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)/)?.[1])
      .filter((t): t is string => Boolean(t))
    if (targets.length && names.has(targets[0]!)) for (const t of targets) names.add(t)
  }
  for (const line of canon.split('\n')) {
    const typed = line
      .trim()
      .match(/^(?:const|let|var)\s+(?:mut\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*:\s*[^=]+=(?!=)/)
    if (typed) names.add(typed[1]!)
  }
  return names
}

function parseArgs(argv: string[]) {
  let tools: string[] | null = null
  let langs = [...ALL_LANGS]
  let changed = false
  let requireAll = false
  let outDir = path.join(ROOT, 'docs', 'verify-matrix')

  for (const a of argv) {
    if (a.startsWith('--tools=')) {
      tools = a.slice('--tools='.length).split(',').map((s) => s.trim()).filter(Boolean)
    } else if (a.startsWith('--langs=')) {
      langs = a
        .slice('--langs='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as CodeLang[]
    } else if (a === '--changed') changed = true
    else if (a === '--require-all') requireAll = true
    else if (a.startsWith('--out=')) outDir = path.resolve(ROOT, a.slice('--out='.length))
  }
  return { tools, langs, changed, requireAll, outDir }
}

/** Formula ids declared by a snippet module, read from the working tree. */
function formulaIdsIn(file: string): Set<string> {
  const ids = new Set<string>()
  let text: string
  try {
    text = readFileSync(path.join(ROOT, file), 'utf8')
  } catch {
    return ids // deleted on this branch
  }
  for (const m of text.matchAll(/formulaId:\s*'([^']+)'/g)) ids.add(m[1]!)
  return ids
}

/** Tool ids touched on this branch; full set (with a warning) on any git problem. */
function changedToolIds(allIds: string[]): string[] {
  const r = spawnSync('git', ['diff', '--name-only', 'origin/main...HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  if (r.error || r.status !== 0) {
    console.warn(`--changed: git failed (${r.error?.message ?? r.stderr?.trim()}); using all tools`)
    return allIds
  }
  const files = r.stdout.split('\n').map((s) => s.trim()).filter(Boolean)
  if (files.length === 0) return []

  const snippetFiles = files.filter((f) => f.startsWith('src/lib/snippets/'))
  // A change outside the snippet modules (physics, liveValues, …) can move any number.
  if (snippetFiles.length !== files.length) {
    console.warn('--changed: non-snippet files touched; using all tools')
    return allIds
  }
  return allIds.filter((id) => snippetFiles.some((f) => formulaIdsIn(f).has(id)))
}

/**
 * `standalone` typesets the body in restricted horizontal mode, where `\[` never
 * opens display math and the first math-only command fails with "Missing $
 * inserted". `article` is a normal vertical-mode document, so the snippet body
 * goes in verbatim: latex is never numeric and gets no value substitution.
 */
function latexDocument(body: string): string {
  return [
    '\\documentclass{article}',
    '\\usepackage{amsmath}',
    '\\usepackage{amssymb}',
    '\\begin{document}',
    body,
    '\\end{document}',
    '',
  ].join('\n')
}

/**
 * `name = value` lines; Fortran list-directed D exponents are normalized to E.
 * NaN / Infinity are kept: a snippet printing NaN is a numeric failure to report,
 * not a line to discard.
 */
function parsePrinted(stdout: string): Map<string, number> {
  const out = new Map<string, number>()
  for (const line of stdout.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (!m) continue
    const raw = m[2]!.trim().replace(/[dD]([+-]?\d)/, 'e$1')
    const v = /^[+-]?(nan|inf)/i.test(raw) ? Number.NaN : Number.parseFloat(raw)
    if (Number.isFinite(v) || Number.isNaN(v)) out.set(m[1]!, v)
  }
  return out
}

/**
 * `absOverride`, when set, is an additional justified pass path (see ToleranceOverride):
 * checked only if the language's own normal tolerance already failed. It can never make
 * an otherwise-passing language fail — e.g. MATLAB's default `%g` print truncates to ~6
 * significant digits, comfortably inside its own looser relative tolerance but well
 * outside a sub-1e-9-rad absolute budget meant for a full-precision language; the
 * override must never punish that unrelated print-precision gap.
 */
function withinTolerance(expected: number, got: number, tol: number, absOverride?: number): boolean {
  if (!Number.isFinite(got)) return false
  const passesRelative =
    Math.abs(expected) < NEAR_ZERO
      ? Math.abs(got - expected) <= NEAR_ZERO
      : Math.abs(got - expected) / Math.abs(expected) <= tol
  if (passesRelative) return true
  return absOverride !== undefined && Math.abs(got - expected) <= absOverride
}

/**
 * Every spelling an EXPECTED key can appear under in printed output. The render
 * path (`wrapAsRunnable` → `canonicalizePhysicsIds`) rewrites physics-notation
 * ids (Isp/ISP/Cd/CD/Cr/CR/Rn/RN/Qdot/QDot/QDOT/Tc/TC/G0) to their lowercase
 * canonical spelling before printing, for every language, not just Fortran.
 * Comparison must resolve the same spellings the render path produced, in
 * both raw and language-safe-identifier form, or a canonicalized result is
 * silently never looked up.
 */
export function printedKeyVariants(key: string, lang: CodeLang): string[] {
  const canonKey = canonicalizePhysicsIds(key)
  return [key, safeIdent(lang, key), canonKey, safeIdent(lang, canonKey)]
}

/** Look up an EXPECTED key's printed value across every variant spelling above. */
export function resolvePrintedValue(
  key: string,
  lang: CodeLang,
  printed: Map<string, number>,
): number | undefined {
  for (const variant of printedKeyVariants(key, lang)) {
    const v = printed.get(variant)
    if (v !== undefined) return v
  }
  return undefined
}

function relErr(expected: number, got: number): number {
  if (Math.abs(expected) < NEAR_ZERO) return Math.abs(got - expected)
  return Math.abs(got - expected) / Math.abs(expected)
}

/** Comparison outcome, pre-`fail-parse`: either a hard failure or the raw tallies. */
type ComparisonResult =
  | { status: 'fail-numeric'; detail: string }
  | { compared: string[]; mismatches: Mismatch[] }

/**
 * Group `expected`'s keys by their `put()` declaration: keys from the same
 * `put(out, names, value)` call are ONE logical value under multiple
 * acceptable spellings — different language ports print only one of them, so
 * the group (not each individual key) is the unit of strictness. A key
 * `put()` never grouped (or an EXPECTED fn that built `out` without `put()`)
 * is its own singleton group, which reduces to the original per-key rule.
 */
function groupExpectedKeys(expected: Record<string, number>): string[][] {
  const grouped = new Set<string>()
  const groups: string[][] = []
  for (const declared of getAliasGroups(expected)) {
    const present = declared.filter((k) => k in expected)
    if (present.length === 0) continue
    for (const k of present) grouped.add(k)
    groups.push(present)
  }
  for (const key of Object.keys(expected)) {
    if (!grouped.has(key)) groups.push([key])
  }
  return groups
}

/**
 * Compare an EXPECTED result map against what the snippet actually printed.
 * Extracted from `runScenario` so the render/compare symmetry (an EXPECTED key
 * spelled the physics-notation way resolves through the same canonicalization
 * the render path applied before printing) can be unit-tested without
 * spawning a compiler.
 *
 * Strictness is per alias GROUP (see `groupExpectedKeys`), not per key: every
 * declared spelling in a group is resolved (through the same canonicalization/
 * safeIdent chain, and after excluding spellings that are actually echoed live
 * inputs); zero resolved is a hard failure (a value no declared spelling
 * matched is never silently skipped), one or more resolved are each compared
 * numerically and any mismatch fails the cell.
 */
export function compareResults(
  toolId: string,
  scenarioName: string,
  lang: CodeLang,
  expected: Record<string, number>,
  printed: Map<string, number>,
  injected: Set<string>,
  tol: number,
): ComparisonResult {
  const compared: string[] = []
  const mismatches: Mismatch[] = []
  for (const group of groupExpectedKeys(expected)) {
    const candidates = group.filter((key) => !printedKeyVariants(key, lang).some((v) => injected.has(v)))
    if (candidates.length === 0) continue // every declared spelling is an echoed live input, not a result

    const resolved = candidates
      .map((key) => ({ key, got: resolvePrintedValue(key, lang, printed) }))
      .filter((r): r is { key: string; got: number } => r.got !== undefined)

    if (resolved.length === 0) {
      return {
        status: 'fail-numeric',
        detail:
          group.length > 1
            ? `value ${group[0]} never printed under any declared spelling (tried: ${group.join(', ')})`
            : `expected key ${group[0]} was never printed by the snippet`,
      }
    }

    for (const { key, got } of resolved) {
      compared.push(key)
      const want = expected[key]!
      // A justified absolute-tolerance override (see ToleranceOverride) replaces the
      // relative gate for this one (tool, scenario, key); an override missing its
      // mandatory `why` never applies silently — it fails the cell loudly instead.
      const override = TOLERANCE_OVERRIDES[toolId]?.[scenarioName]?.[key]
      if (override && !override.why?.trim()) {
        return {
          status: 'fail-numeric',
          detail: `tolerance override for ${toolId}/${scenarioName}/${key} has no justification ("why"); refusing to apply it`,
        }
      }
      if (!withinTolerance(want, got, tol, override?.absTol)) {
        mismatches.push({ name: key, expected: want, got, relErr: relErr(want, got) })
      }
    }
  }
  return { compared, mismatches }
}

function tail(s: string, n = 400): string {
  const t = s.trim()
  return t.length <= n ? t : `…${t.slice(-n)}`
}

function runLatex(name: string, body: string): CaseResult['status'] | { status: Status; detail: string } {
  if (FORBIDDEN_LATEX_DIRECTIVE.test(body)) {
    return { status: 'fail-compile', detail: 'forbidden file/preamble directive in fragment' }
  }
  const engine = hasExecutable('pdflatex')
    ? 'pdflatex'
    : hasExecutable('tectonic')
      ? 'tectonic'
      : null
  if (!engine) return 'skip-toolchain'
  const file = path.join(TMP, `${name}.tex`)
  writeFileSync(file, latexDocument(body), 'utf8')
  // --only-cached: verify never fetches the TeX bundle over the network. CI warms
  // the bundle cache in a dedicated step before this script ever runs; a cell that
  // still can't find what it needs offline is an infra problem, not a physics one.
  const args =
    engine === 'pdflatex'
      ? ['-interaction=nonstopmode', '-halt-on-error', '-output-directory', TMP, file]
      : ['--only-cached', '--outdir', TMP, file]
  const r = spawnSync(engine, args, { cwd: TMP, encoding: 'utf8', timeout: 120_000 })
  if (r.status === 0) return 'ok-compile'
  const output = `${r.stdout ?? ''}\n${r.stderr ?? ''}`
  if (engine === 'tectonic' && INFRA_NETWORK_SIGNATURE.test(output)) {
    return { status: 'fail-infra', detail: tail(output) }
  }
  // Cache-miss text is only meaningful under --only-cached (the mode tectonic
  // always runs in here): outside it, tectonic would have fetched the file
  // instead of reporting it missing, so the same text could not appear.
  if (engine === 'tectonic' && INFRA_CACHE_MISS_SIGNATURE.test(output)) {
    return {
      status: 'fail-infra',
      detail: `cache-miss under --only-cached; extend the warm probe\n${tail(output)}`,
    }
  }
  return { status: 'fail-compile', detail: tail(output) }
}

/** A tool's resolved verification scenario: SAMPLE + overrides + scenario-specific bag. */
type ResolvedScenario = ReturnType<typeof scenariosFor>[number]

/** Compile/run/compare one scenario's bag for a given (tool, lang, body). */
function runScenario(
  toolId: string,
  cellName: string,
  lang: CodeLang,
  body: string,
  expectedFn: (bag: Record<string, number | string>) => Record<string, number>,
  runner: Runner,
  scenario: ResolvedScenario,
): ScenarioOutcome {
  let expected: Record<string, number>
  try {
    expected = expectedFn(asInjected(scenario.bag) as Record<string, number | string>)
  } catch (e) {
    return {
      scenario: scenario.name,
      status: 'fail-numeric',
      detail: `expected-map error: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
  if (Object.keys(expected).length === 0) {
    return {
      scenario: scenario.name,
      status: 'fail-numeric',
      detail: 'expected map returned no keys for this scenario',
    }
  }

  // TypeScript has no local type-stripping runtime: strip annotations, then render as JS
  // so free-var analysis and the result prints see plain JavaScript.
  const source = lang === 'typescript' ? stripTsTypes(body) : body
  const renderLang: CodeLang = lang === 'typescript' ? 'javascript' : lang

  // A body that assigns its own constant must win over the shared bag: drop those
  // keys so the wrapper cannot inject a same-named value and shadow the formula.
  const assigned = bodyAssignedNames(source)
  const pruned: LiveCodeValues = {}
  for (const [k, v] of Object.entries(scenario.bag)) {
    if (!assigned.has(canonicalizePhysicsIds(k))) pruned[k] = v
  }
  const program = renderLiveCode(source, renderLang, pruned)
  // Names still injected as live inputs are not results. MATLAB emits the preamble
  // without terminators, so Octave echoes each one as `name = value`; comparing
  // those would test the bag against physics instead of the snippet.
  const injected = new Set(
    Object.keys(filterLiveValuesForBody(canonicalizePhysicsIds(source), pruned) ?? {}),
  )

  const name = `${cellName}.${scenario.name}`.replace(/[^A-Za-z0-9._-]/g, '_')
  const file = path.join(TMP, `${name}.${runner.ext}`)
  const bin = path.join(TMP, `${name}.bin`)
  writeFileSync(file, program, 'utf8')

  if (runner.compile) {
    const unit = name.replace(/[^A-Za-z0-9_]/g, '_')
    const [cmd, ...args] = runner.compile(file, bin, unit)
    if (!hasExecutable(cmd!)) return { scenario: scenario.name, status: 'skip-toolchain', detail: cmd }
    const c = spawnSync(cmd!, args, { cwd: TMP, encoding: 'utf8', timeout: 120_000 })
    if (c.status !== 0) {
      return {
        scenario: scenario.name,
        status: 'fail-compile',
        detail: tail(`${c.stderr ?? ''}${c.stdout ?? ''}`),
      }
    }
  }

  const [rcmd, ...rargs] = runner.run(file, bin)
  if (!hasExecutable(rcmd!)) return { scenario: scenario.name, status: 'skip-toolchain', detail: rcmd }
  const run = spawnSync(rcmd!, rargs, { cwd: ROOT, encoding: 'utf8', timeout: 120_000 })
  const stderr = run.stderr ?? ''
  if (run.status !== 0) {
    if (/ModuleNotFoundError|ImportError|ERR_MODULE_NOT_FOUND|Package .* not found/i.test(stderr)) {
      return { scenario: scenario.name, status: 'skip-dep-missing', detail: tail(stderr, 200) }
    }
    return { scenario: scenario.name, status: 'fail-run', detail: tail(`${stderr}${run.stdout ?? ''}`) }
  }

  const printed = parsePrinted(run.stdout ?? '')
  const tol = TOLERANCE[lang] ?? DEFAULT_TOLERANCE
  const cmp = compareResults(toolId, scenario.name, lang, expected, printed, injected, tol)
  if ('status' in cmp) {
    return { scenario: scenario.name, status: cmp.status, detail: cmp.detail }
  }
  const { compared, mismatches } = cmp

  if (compared.length === 0) {
    return {
      scenario: scenario.name,
      status: 'fail-parse',
      detail: `no expected name found in output (printed: ${[...printed.keys()].join(', ') || 'nothing'})`,
    }
  }
  if (mismatches.length) {
    return { scenario: scenario.name, status: 'fail-numeric', matched: compared.length, compared, mismatches }
  }
  return { scenario: scenario.name, status: 'ok', matched: compared.length, compared }
}

function verifyCase(toolId: string, lang: CodeLang): CaseResult {
  const snip = getSnippets(toolId)
  const body = snip?.code[lang]
  if (!body?.trim()) return { toolId, lang, status: 'skip-no-source' }

  const cellName = `${toolId}.${lang}`.replace(/[^A-Za-z0-9._-]/g, '_')

  if (lang === 'latex') {
    const r = runLatex(cellName, body)
    return typeof r === 'string'
      ? { toolId, lang, status: r }
      : { toolId, lang, status: r.status, detail: r.detail }
  }

  const expectedFn = EXPECTED[toolId]
  if (!expectedFn) return { toolId, lang, status: 'skip-no-expected' }

  const scenarios = scenariosFor(toolId)
  // EXPECTED returns the same key set for a tool regardless of scenario bag
  // (only values vary); probe once with the first scenario to keep the
  // no-expected-values skip scenario-independent, matching prior behavior.
  let probe: Record<string, number>
  try {
    probe = expectedFn(asInjected(scenarios[0]!.bag) as Record<string, number | string>)
  } catch (e) {
    return {
      toolId,
      lang,
      status: 'fail-numeric',
      detail: `expected-map error [${scenarios[0]!.name}]: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
  if (Object.keys(probe).length === 0) {
    return { toolId, lang, status: 'skip-no-expected', detail: UNVERIFIABLE[toolId] }
  }

  const runner = RUNNERS[lang]
  if (!runner) return { toolId, lang, status: 'skip-toolchain', detail: 'no local runner' }
  if (lang === 'zig') {
    const zigProbe = zigUsable()
    if (!zigProbe.usable) return { toolId, lang, status: 'skip-toolchain', detail: zigProbe.note }
  }

  const outcomes: ScenarioOutcome[] = []
  for (const scenario of scenarios) {
    const outcome = runScenario(toolId, cellName, lang, body, expectedFn, runner, scenario)
    outcomes.push(outcome)
    // Toolchain-level skips are a language property, not a scenario one: they
    // apply to the whole cell, so stop instead of re-discovering them N times.
    if (outcome.status === 'skip-toolchain' || outcome.status === 'skip-dep-missing') {
      return { toolId, lang, status: outcome.status, detail: outcome.detail, scenarios: outcomes }
    }
  }

  const worst = outcomes.find((o) => o.status !== 'ok')
  if (!worst) {
    return { toolId, lang, status: 'ok', scenarioCount: outcomes.length, scenarios: outcomes }
  }
  return {
    toolId,
    lang,
    status: worst.status,
    detail: `[${worst.scenario}] ${worst.detail ?? ''}`,
    scenarios: outcomes,
  }
}

const SYMBOL: Record<Status, string> = {
  ok: 'ok',
  'ok-compile': 'ok(c)',
  'fail-compile': 'FAIL-c',
  'fail-run': 'FAIL-r',
  'fail-numeric': 'FAIL-n',
  'fail-parse': 'FAIL-p',
  'fail-infra': 'FAIL-i',
  'skip-no-source': '-',
  'skip-no-expected': 'no-exp',
  'skip-toolchain': 'no-tc',
  'skip-dep-missing': 'no-dep',
}

/**
 * Whether `id` has expected values the per-cell loop would actually compare,
 * probed with the exact same bag `verifyCase` uses: the first resolved
 * scenario (`scenariosFor(id)[0].bag`), not the bare `inputBagFor(id)`. A
 * scenario can supply a key (e.g. `Tsys` for eirp-gt) that only exists as a
 * scenario override and is absent from the generic SAMPLE bag; probing with
 * `inputBagFor` alone throws on that missing input and got this tool (and
 * conjunction-pc, solar-pressure) wrongly reported as "no EXPECTED entry" in
 * the Coverage/Uncovered table while the Matrix section, built from the same
 * `results` this function also receives, showed it fully compared.
 */
function hasExpectedValues(id: string): boolean {
  const fn = EXPECTED[id]
  if (!fn) return false
  try {
    return Object.keys(fn(asInjected(scenariosFor(id)[0]!.bag) as Record<string, number | string>)).length > 0
  } catch {
    return false
  }
}

function buildMarkdown(
  results: CaseResult[],
  toolIds: string[],
  langs: CodeLang[],
  meta: Record<string, unknown>,
): string {
  const at = (t: string, l: CodeLang) => results.find((r) => r.toolId === t && r.lang === l)
  const counts = new Map<Status, number>()
  for (const r of results) counts.set(r.status, (counts.get(r.status) ?? 0) + 1)

  const covered = toolIds.filter(hasExpectedValues)
  const pct = toolIds.length ? Math.round((covered.length / toolIds.length) * 100) : 0

  const nonLatexLangs = langs.filter((l) => l !== 'latex')
  const verifiedTools = toolIds.filter(
    (id) => nonLatexLangs.length > 0 && nonLatexLangs.every((l) => at(id, l)?.status === 'ok'),
  )

  const lines: string[] = [
    '# Snippet verification matrix',
    '',
    `Generated: ${meta.generatedAt}`,
    '',
    'Each cell renders the shipped snippet with `renderLiveCode`, compiles/executes it with a',
    'local toolchain, and compares the printed numbers against shipped `src/lib/physics`.',
    '',
    '## Require-all semantics',
    '',
    '`--require-all` passes only when every tool with expected values compiles and matches shipped',
    'physics in every available language, and every LaTeX cell compiles from the cached Tectonic',
    'bundle. Skips (missing toolchain, missing language dependency, or no expected values) are',
    'reported explicitly below and are never counted as passing.',
    '',
    '## Verified tools',
    '',
    `${verifiedTools.length} of ${toolIds.length} tools have every non-LaTeX language cell at \`ok\` in this run:`,
    '',
    verifiedTools.length ? verifiedTools.map((id) => `\`${id}\``).join(', ') : '_None._',
    '',
    '## Coverage',
    '',
    `${covered.length} of ${toolIds.length} tools in scope have expected values from shipped physics (${pct}%).`,
    'Tools without expected values are reported as `no-exp` and never counted as passing.',
    '',
  ]

  const uncovered = toolIds.filter((id) => !covered.includes(id))
  if (uncovered.length) {
    lines.push('| Uncovered tool | Reason |', '|----------------|--------|')
    for (const id of uncovered) {
      lines.push(`| \`${id}\` | ${UNVERIFIABLE[id] ?? 'no EXPECTED entry'} |`)
    }
    lines.push('')
  }

  lines.push('## Matrix', '', `| Tool | ${langs.join(' | ')} |`, `|------|${langs.map(() => '---').join('|')}|`)
  for (const t of toolIds) {
    const cells = langs.map((l) => {
      const r = at(t, l)
      if (!r) return '-'
      if (r.status === 'ok') return `ok(${r.scenarioCount ?? 1})`
      return SYMBOL[r.status]
    })
    lines.push(`| \`${t}\` | ${cells.join(' | ')} |`)
  }

  lines.push('', '## Status counts', '', '| Status | Cases |', '|--------|-------|')
  for (const [s, n] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`| \`${s}\` | ${n} |`)
  }

  const fails = results.filter((r) => r.status.startsWith('fail') && r.status !== 'fail-infra')
  lines.push('', '## Failures', '')
  if (!fails.length) {
    lines.push('_None._')
  } else {
    lines.push(
      '| Tool | Lang | Scenario | Status | Detail |',
      '|------|------|----------|--------|--------|',
    )
    for (const f of fails) {
      const rows: ScenarioOutcome[] = f.scenarios?.filter((o) => o.status.startsWith('fail')) ?? [
        { scenario: '-', status: f.status, detail: f.detail },
      ]
      for (const o of rows) {
        const detail = o.mismatches?.length
          ? o.mismatches
              .map((m) => `${m.name}: expected ${m.expected}, got ${m.got} (rel ${m.relErr.toExponential(2)})`)
              .join('; ')
          : (o.detail ?? '')
        lines.push(
          `| \`${f.toolId}\` | ${f.lang} | ${o.scenario} | ${o.status} | ${detail.replace(/\|/g, '\\|').replace(/\n/g, ' ⏎ ').slice(0, 300)} |`,
        )
      }
    }
  }

  const infraFails = results.filter((r) => r.status === 'fail-infra')
  lines.push('', '## Infrastructure failures', '')
  if (!infraFails.length) {
    lines.push('_None._')
  } else {
    lines.push(
      'These are Tectonic bundle/network problems, not physics or snippet defects. They still fail',
      '`--require-all`.',
      '',
      '| Tool | Lang | Detail |',
      '|------|------|--------|',
    )
    for (const f of infraFails) {
      lines.push(
        `| \`${f.toolId}\` | ${f.lang} | ${(f.detail ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ⏎ ').slice(0, 300)} |`,
      )
    }
  }

  lines.push(
    '',
    '## Legend',
    '',
    '`ok(n)` all n scenarios match shipped physics · `ok(c)` LaTeX compiled · `FAIL-c` compile ·',
    '`FAIL-r` runtime · `FAIL-n` numeric mismatch (any scenario) · `FAIL-p` nothing comparable printed ·',
    '`FAIL-i` Tectonic bundle/network infra failure (not a physics or snippet defect) ·',
    '`no-exp` no expected values · `no-tc` toolchain absent · `no-dep` language dep absent ·',
    '`-` snippet has no source for that language.',
    '',
  )
  return lines.join('\n')
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const allIds = TOOLS.filter((t) => getSnippets(t.id)).map((t) => t.id)
  let toolIds = args.tools ?? allIds
  if (args.changed) {
    const changed = changedToolIds(allIds)
    toolIds = args.tools ? toolIds.filter((id) => changed.includes(id)) : changed
  }
  const unknown = toolIds.filter((id) => !allIds.includes(id))
  if (unknown.length) {
    console.error(`Unknown tool ids: ${unknown.join(', ')}`)
    process.exit(2)
  }
  const langs = args.langs.filter((l) => (ALL_LANGS as string[]).includes(l))

  rmSync(TMP, { recursive: true, force: true })
  mkdirSync(TMP, { recursive: true })

  console.log(
    `Verifying ${toolIds.length} tools × ${langs.length} langs = ${toolIds.length * langs.length} cases`,
  )
  const results: CaseResult[] = []
  try {
    for (const toolId of toolIds) {
      for (const lang of langs) {
        const r = verifyCase(toolId, lang)
        results.push(r)
        const mark = r.status === 'ok' || r.status === 'ok-compile' ? '✓' : r.status.startsWith('skip') ? '·' : '✗'
        console.log(`  ${mark} ${toolId}:${lang} ${r.status}`)
      }
    }
  } finally {
    rmSync(TMP, { recursive: true, force: true })
  }

  const meta = {
    generatedAt: new Date().toISOString(),
    tools: toolIds,
    langs,
    requireAll: args.requireAll,
  }
  mkdirSync(args.outDir, { recursive: true })
  writeFileSync(path.join(args.outDir, 'report.json'), JSON.stringify({ meta, results }, null, 2), 'utf8')
  writeFileSync(path.join(args.outDir, 'report.md'), buildMarkdown(results, toolIds, langs, meta), 'utf8')

  const counts = new Map<Status, number>()
  for (const r of results) counts.set(r.status, (counts.get(r.status) ?? 0) + 1)
  console.log('\nStatus counts:')
  for (const [s, n] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${s.padEnd(18)} ${n}`)
  }
  console.log(`\nWrote ${path.join(args.outDir, 'report.md')}`)

  const failures = results.filter((r) => r.status.startsWith('fail'))
  const blockedSkips = results.filter(
    (r) => r.status === 'skip-toolchain' || r.status === 'skip-dep-missing',
  )
  if (failures.length) {
    console.log(`\n${failures.length} failing cases:`)
    for (const f of failures) {
      const rows: ScenarioOutcome[] = f.scenarios?.filter((o) => o.status.startsWith('fail')) ?? [
        { scenario: '-', status: f.status, detail: f.detail },
      ]
      for (const o of rows) {
        const d = o.mismatches?.length
          ? o.mismatches.map((m) => `${m.name} expected ${m.expected} got ${m.got}`).join('; ')
          : (o.detail ?? '')
        console.log(`  - ${f.toolId}:${f.lang} ${o.status} [${o.scenario}] ${d.split('\n')[0]?.slice(0, 160)}`)
      }
    }
  }
  if (failures.length || (args.requireAll && blockedSkips.length)) process.exitCode = 1
}

// Only run the CLI when this file is the process entrypoint, not when a test
// imports its exported helpers (`resolvePrintedValue`, `printedKeyVariants`).
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main()
}
