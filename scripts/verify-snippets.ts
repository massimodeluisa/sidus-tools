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
import { fileURLToPath } from 'node:url'
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
import { asInjected, inputBagFor } from '../src/lib/snippets/verify/inputs.ts'
import { EXPECTED, UNVERIFIABLE } from '../src/lib/snippets/verify/expected.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TMP = path.join(ROOT, '.verify-tmp')
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

type Status =
  | 'ok'
  | 'ok-compile'
  | 'fail-compile'
  | 'fail-run'
  | 'fail-numeric'
  | 'fail-parse'
  | 'skip-no-source'
  | 'skip-no-expected'
  | 'skip-toolchain'
  | 'skip-dep-missing'

type Mismatch = { name: string; expected: number; got: number; relErr: number }

type CaseResult = {
  toolId: string
  lang: CodeLang
  status: Status
  matched?: number
  compared?: string[]
  mismatches?: Mismatch[]
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
    compile: (f, bin) => ['gfortran', f, '-o', bin],
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

function withinTolerance(expected: number, got: number, tol: number): boolean {
  if (!Number.isFinite(got)) return false
  if (Math.abs(expected) < NEAR_ZERO) return Math.abs(got - expected) <= NEAR_ZERO
  return Math.abs(got - expected) / Math.abs(expected) <= tol
}

function relErr(expected: number, got: number): number {
  if (Math.abs(expected) < NEAR_ZERO) return Math.abs(got - expected)
  return Math.abs(got - expected) / Math.abs(expected)
}

function tail(s: string, n = 400): string {
  const t = s.trim()
  return t.length <= n ? t : `…${t.slice(-n)}`
}

function runLatex(name: string, body: string): CaseResult['status'] | { status: Status; detail: string } {
  const engine = hasExecutable('pdflatex')
    ? 'pdflatex'
    : hasExecutable('tectonic')
      ? 'tectonic'
      : null
  if (!engine) return 'skip-toolchain'
  const file = path.join(TMP, `${name}.tex`)
  writeFileSync(file, latexDocument(body), 'utf8')
  const args =
    engine === 'pdflatex'
      ? ['-interaction=nonstopmode', '-halt-on-error', '-output-directory', TMP, file]
      : ['--outdir', TMP, file]
  const r = spawnSync(engine, args, { cwd: TMP, encoding: 'utf8', timeout: 120_000 })
  if (r.status === 0) return 'ok-compile'
  return { status: 'fail-compile', detail: tail(`${r.stdout ?? ''}\n${r.stderr ?? ''}`) }
}

function verifyCase(toolId: string, lang: CodeLang): CaseResult {
  const snip = getSnippets(toolId)
  const body = snip?.code[lang]
  if (!body?.trim()) return { toolId, lang, status: 'skip-no-source' }

  const name = `${toolId}.${lang}`.replace(/[^A-Za-z0-9._-]/g, '_')

  if (lang === 'latex') {
    const r = runLatex(name, body)
    return typeof r === 'string'
      ? { toolId, lang, status: r }
      : { toolId, lang, status: r.status, detail: r.detail }
  }

  const expectedFn = EXPECTED[toolId]
  if (!expectedFn) return { toolId, lang, status: 'skip-no-expected' }
  const bag = inputBagFor(toolId)
  let expected: Record<string, number>
  try {
    expected = expectedFn(asInjected(bag) as Record<string, number | string>)
  } catch (e) {
    return {
      toolId,
      lang,
      status: 'fail-numeric',
      detail: `expected-map error: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
  if (Object.keys(expected).length === 0) {
    return { toolId, lang, status: 'skip-no-expected', detail: UNVERIFIABLE[toolId] }
  }

  const runner = RUNNERS[lang]
  if (!runner) return { toolId, lang, status: 'skip-toolchain', detail: 'no local runner' }
  if (lang === 'zig') {
    const probe = zigUsable()
    if (!probe.usable) return { toolId, lang, status: 'skip-toolchain', detail: probe.note }
  }

  // TypeScript has no local type-stripping runtime: strip annotations, then render as JS
  // so free-var analysis and the result prints see plain JavaScript.
  const source = lang === 'typescript' ? stripTsTypes(body) : body
  const renderLang: CodeLang = lang === 'typescript' ? 'javascript' : lang

  // A body that assigns its own constant must win over the shared bag: drop those
  // keys so the wrapper cannot inject a same-named value and shadow the formula.
  const assigned = bodyAssignedNames(source)
  const pruned: LiveCodeValues = {}
  for (const [k, v] of Object.entries(bag)) {
    if (!assigned.has(canonicalizePhysicsIds(k))) pruned[k] = v
  }
  const program = renderLiveCode(source, renderLang, pruned)
  // Names still injected as live inputs are not results. MATLAB emits the preamble
  // without terminators, so Octave echoes each one as `name = value`; comparing
  // those would test the bag against physics instead of the snippet.
  const injected = new Set(
    Object.keys(filterLiveValuesForBody(canonicalizePhysicsIds(source), pruned) ?? {}),
  )

  const file = path.join(TMP, `${name}.${runner.ext}`)
  const bin = path.join(TMP, `${name}.bin`)
  writeFileSync(file, program, 'utf8')

  if (runner.compile) {
    const unit = name.replace(/[^A-Za-z0-9_]/g, '_')
    const [cmd, ...args] = runner.compile(file, bin, unit)
    if (!hasExecutable(cmd!)) return { toolId, lang, status: 'skip-toolchain', detail: cmd }
    const c = spawnSync(cmd!, args, { cwd: TMP, encoding: 'utf8', timeout: 120_000 })
    if (c.status !== 0) {
      return { toolId, lang, status: 'fail-compile', detail: tail(`${c.stderr ?? ''}${c.stdout ?? ''}`) }
    }
  }

  const [rcmd, ...rargs] = runner.run(file, bin)
  if (!hasExecutable(rcmd!)) return { toolId, lang, status: 'skip-toolchain', detail: rcmd }
  const run = spawnSync(rcmd!, rargs, { cwd: ROOT, encoding: 'utf8', timeout: 120_000 })
  const stderr = run.stderr ?? ''
  if (run.status !== 0) {
    if (/ModuleNotFoundError|ImportError|ERR_MODULE_NOT_FOUND|Package .* not found/i.test(stderr)) {
      return { toolId, lang, status: 'skip-dep-missing', detail: tail(stderr, 200) }
    }
    return { toolId, lang, status: 'fail-run', detail: tail(`${stderr}${run.stdout ?? ''}`) }
  }

  const printed = parsePrinted(run.stdout ?? '')
  const tol = TOLERANCE[lang] ?? DEFAULT_TOLERANCE
  const compared: string[] = []
  const mismatches: Mismatch[] = []
  for (const [key, want] of Object.entries(expected)) {
    const alias = safeIdent(lang, key)
    if (injected.has(key) || injected.has(alias)) continue
    const got = printed.get(key) ?? printed.get(alias)
    if (got === undefined) continue
    compared.push(key)
    if (!withinTolerance(want, got, tol)) {
      mismatches.push({ name: key, expected: want, got, relErr: relErr(want, got) })
    }
  }

  if (compared.length === 0) {
    return {
      toolId,
      lang,
      status: 'fail-parse',
      detail: `no expected name found in output (printed: ${[...printed.keys()].join(', ') || 'nothing'})`,
    }
  }
  if (mismatches.length) {
    return { toolId, lang, status: 'fail-numeric', matched: compared.length, compared, mismatches }
  }
  return { toolId, lang, status: 'ok', matched: compared.length, compared }
}

const SYMBOL: Record<Status, string> = {
  ok: 'ok',
  'ok-compile': 'ok(c)',
  'fail-compile': 'FAIL-c',
  'fail-run': 'FAIL-r',
  'fail-numeric': 'FAIL-n',
  'fail-parse': 'FAIL-p',
  'skip-no-source': '-',
  'skip-no-expected': 'no-exp',
  'skip-toolchain': 'no-tc',
  'skip-dep-missing': 'no-dep',
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

  const covered = toolIds.filter((id) => {
    const fn = EXPECTED[id]
    if (!fn) return false
    try {
      return Object.keys(fn(asInjected(inputBagFor(id)) as Record<string, number | string>)).length > 0
    } catch {
      return false
    }
  })
  const pct = toolIds.length ? Math.round((covered.length / toolIds.length) * 100) : 0

  const lines: string[] = [
    '# Snippet verification matrix',
    '',
    `Generated: ${meta.generatedAt}`,
    '',
    'Each cell renders the shipped snippet with `renderLiveCode`, compiles/executes it with a',
    'local toolchain, and compares the printed numbers against shipped `src/lib/physics`.',
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
      return r ? SYMBOL[r.status] : '-'
    })
    lines.push(`| \`${t}\` | ${cells.join(' | ')} |`)
  }

  lines.push('', '## Status counts', '', '| Status | Cases |', '|--------|-------|')
  for (const [s, n] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`| \`${s}\` | ${n} |`)
  }

  const fails = results.filter((r) => r.status.startsWith('fail'))
  lines.push('', '## Failures', '')
  if (!fails.length) {
    lines.push('_None._')
  } else {
    lines.push('| Tool | Lang | Status | Detail |', '|------|------|--------|--------|')
    for (const f of fails) {
      const detail = f.mismatches?.length
        ? f.mismatches
            .map((m) => `${m.name}: expected ${m.expected}, got ${m.got} (rel ${m.relErr.toExponential(2)})`)
            .join('; ')
        : (f.detail ?? '')
      lines.push(
        `| \`${f.toolId}\` | ${f.lang} | ${f.status} | ${detail.replace(/\|/g, '\\|').replace(/\n/g, ' ⏎ ').slice(0, 300)} |`,
      )
    }
  }

  lines.push(
    '',
    '## Legend',
    '',
    '`ok` numbers match shipped physics · `ok(c)` LaTeX compiled · `FAIL-c` compile ·',
    '`FAIL-r` runtime · `FAIL-n` numeric mismatch · `FAIL-p` nothing comparable printed ·',
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
      const d = f.mismatches?.length
        ? f.mismatches.map((m) => `${m.name} expected ${m.expected} got ${m.got}`).join('; ')
        : (f.detail ?? '')
      console.log(`  - ${f.toolId}:${f.lang} ${f.status} ${d.split('\n')[0]?.slice(0, 160)}`)
    }
  }
  if (failures.length || (args.requireAll && blockedSkips.length)) process.exitCode = 1
}

main()
