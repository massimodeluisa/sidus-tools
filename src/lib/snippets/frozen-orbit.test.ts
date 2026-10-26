/**
 * GitHub #193: a frozen eccentricity whose periapsis intersects the body
 * is undefined in the helper, the MCP tool, and every export.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EARTH_J2, EARTH_J3, EARTH_RADIUS, frozenEccentricityJ2J3 } from '@/lib/physics'
import { MCP_TOOL_DEFS } from '../../../mcp/full-catalog'
import { renderLiveCode, stripTsTypes } from './live-values'
import { frozenOrbitSnippets } from './tools/frozen-orbit'
import { CODE_LANGS, type CodeLang } from './types'

const INC = (98 * Math.PI) / 180
const BAD = { a: 5_000_000, inc: INC, j2: EARTH_J2, j3: EARTH_J3, Rb: EARTH_RADIUS }
const OK = { a: EARTH_RADIUS + 800_000, inc: INC, j2: EARTH_J2, j3: EARTH_J3, Rb: EARTH_RADIUS }

function program(lang: CodeLang, bag: typeof BAD): string {
  const body = frozenOrbitSnippets.code[lang]
  if (!body) throw new Error(`missing ${lang}`)
  if (lang === 'typescript') return renderLiveCode(stripTsTypes(body), 'javascript', bag)
  return renderLiveCode(body, lang, bag)
}

function capture(cmd: string, args: string[], cwd: string): string {
  const run = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 120_000 })
  const out = `${run.stdout ?? ''}\n${run.stderr ?? ''}`
  if (run.status !== 0) {
    const why = run.error ? ` ${run.error.message}` : ''
    const sig = run.signal ? ` signal ${run.signal}` : ''
    throw new Error(`${cmd} exited ${run.status}${sig}${why}\n${out}`)
  }
  return out
}

/** Runner for each language. test.yml has no zig, octave, julia, or gfortran; snippets.yml is that compile gate. */
const COMPILER: Partial<Record<CodeLang, string>> = {
  c: 'cc',
  cpp: 'c++',
  rust: 'rustc',
  zig: 'zig',
  python: 'python3',
  javascript: 'node',
  typescript: 'node',
  matlab: 'octave',
  julia: 'julia',
  fortran: 'gfortran',
}

function compilerMissing(cmd: string): boolean {
  const run = spawnSync(cmd, ['--version'], { stdio: 'ignore' })
  return (run.error as NodeJS.ErrnoException | undefined)?.code === 'ENOENT'
}

function readE(output: string): number {
  const lines = output.split(/\r?\n/).filter((line) => /(?:^|\s)e\s*=/.test(line))
  const line = lines.at(-1)
  if (!line) throw new Error(`no printed e\n${output}`)
  return Number(line.slice(line.lastIndexOf('=') + 1).trim())
}

function runExport(lang: CodeLang, bag: typeof BAD): number {
  const dir = mkdtempSync(join(tmpdir(), 'sidus-frozen-'))
  const src = program(lang, bag)
  try {
    if (lang === 'javascript' || lang === 'typescript') {
      const file = join(dir, 'frozen.mjs')
      writeFileSync(file, src)
      return readE(capture('node', [file], dir))
    }
    if (lang === 'python') {
      const file = join(dir, 'frozen.py')
      writeFileSync(file, src)
      return readE(capture('python3', [file], dir))
    }
    if (lang === 'julia') {
      const file = join(dir, 'frozen.jl')
      writeFileSync(file, src)
      return readE(capture('julia', [file], dir))
    }
    if (lang === 'matlab') {
      const file = join(dir, 'frozen.m')
      writeFileSync(file, src)
      return readE(capture('octave', ['--no-gui', '--quiet', file], dir))
    }
    const bin = join(dir, 'frozen.bin')
    if (lang === 'c') {
      const file = join(dir, 'frozen.c')
      writeFileSync(file, src)
      capture('cc', [file, '-lm', '-O1', '-o', bin], dir)
    } else if (lang === 'cpp') {
      const file = join(dir, 'frozen.cpp')
      writeFileSync(file, src)
      capture('c++', ['-std=c++17', file, '-O1', '-o', bin], dir)
    } else if (lang === 'rust') {
      const file = join(dir, 'frozen.rs')
      writeFileSync(file, src)
      capture('rustc', ['-O', '--crate-name', 'frozen_orbit', file, '-o', bin], dir)
    } else if (lang === 'zig') {
      const file = join(dir, 'frozen.zig')
      writeFileSync(file, src)
      capture('zig', ['build-exe', file, `-femit-bin=${bin}`], dir)
    } else if (lang === 'fortran') {
      const file = join(dir, 'frozen.f90')
      writeFileSync(file, src)
      capture('gfortran', ['-ffree-line-length-none', file, '-o', bin], dir)
    } else {
      throw new Error(`no runner for ${lang}`)
    }
    return readE(capture(bin, [], dir))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('frozen orbit periapsis', () => {
  it('MCP frozen_orbit refuses the intersecting case and keeps a clearing one', () => {
    const tool = MCP_TOOL_DEFS.find((entry) => entry.name === 'frozen_orbit')!
    expect(tool.run({ a_m: BAD.a, i_rad: BAD.inc })).toBeNull()
    const got = tool.run({ a_m: OK.a, i_rad: OK.inc }) as { e: number }
    expect(got.e).toBe(frozenEccentricityJ2J3(OK.a, OK.inc))
  })

  it('every export states the periapsis limit', () => {
    for (const { id: lang } of CODE_LANGS) {
      const body = frozenOrbitSnippets.code[lang]
      expect(body, lang).toBeTruthy()
      if (lang === 'latex') {
        expect(body).toContain('a(1-e) > R')
      } else {
        expect(body, lang).toContain('> Rb')
      }
      expect(body, lang).toContain('±90°')
      expect(body, lang).toContain('critical inclination')
    }
  })

  it('every executable export matches the helper, including the refusal', () => {
    const want = frozenEccentricityJ2J3(OK.a, OK.inc)!
    const ran: CodeLang[] = []
    for (const { id: lang } of CODE_LANGS) {
      if (lang === 'latex') continue
      const cmd = COMPILER[lang]
      if (!cmd || compilerMissing(cmd)) continue
      ran.push(lang)
      expect(runExport(lang, OK), lang).toBeCloseTo(want, 8)
      expect(Number.isFinite(runExport(lang, BAD)), lang).toBe(false)
    }
    // The GitHub test image has these. A skip of every language must not look like a pass.
    for (const lang of ['c', 'cpp', 'rust', 'python', 'javascript', 'typescript'] as const) {
      expect(ran, lang).toContain(lang)
    }
  }, 180_000)
})
