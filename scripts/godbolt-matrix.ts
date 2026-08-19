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
import { inputBagFor } from '../src/lib/snippets/verify/inputs.ts'

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
        const bag: LiveCodeValues = inputBagFor(job.toolId)
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
