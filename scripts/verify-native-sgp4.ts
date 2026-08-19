/**
 * Native SGP4 verification matrix: compile the C reference port and check it
 * against the FULL published AIAA 2006-6753 verification output.
 *
 * Every satellite in SGP4-VER.TLE is propagated over its own start/stop/step
 * range and every row of tcppver.out is consumed and asserted. Published
 * numbers are never edited and tolerances are never relaxed: a disagreement
 * beyond tolerance is a failure.
 *
 * Usage:
 *   npx tsx scripts/verify-native-sgp4.ts
 *   npx tsx scripts/verify-native-sgp4.ts --opsmode=a
 *   npx tsx scripts/verify-native-sgp4.ts --grav=wgs84 --keep
 *
 * Exit code 1 on any mismatch, missing row, or unexpected error code.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const NATIVE_DIR = path.join(ROOT, 'src/lib/snippets/native/sgp4')
const DATA_DIR = path.join(ROOT, 'src/lib/physics/golden/data')
const DRIVER = path.join(ROOT, 'scripts/native-sgp4-driver.c')
const TMP = path.join(ROOT, '.verify-tmp', `native-sgp4-${process.pid}-${Date.now()}`)

/** Absolute tolerances in SI, per the brief. tcppver.out carries km and km/s. */
const POS_TOL_M = 1e-3
const VEL_TOL_MS = 1e-5

/**
 * Error codes the published run raises, in file order. Same list python-sgp4
 * asserts in its own tcppver integration test.
 */
const EXPECTED_ERRORS = [1, 1, 6, 6, 4, 3, 6]

const TCPPVER_LINES = 700

type Row = { tsince: number; r: [number, number, number]; v: [number, number, number] }
type Block = { satnum: number; rows: Row[]; terminator: 'none' | 'nan' | 'err'; error: number; message: string }

const args = process.argv.slice(2)
const flag = (name: string, fallback: string): string => {
  const hit = args.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}
const opsmode = flag('opsmode', 'i')
const grav = flag('grav', 'wgs72')
const keep = args.includes('--keep')

function fail(message: string): never {
  console.error(`\nFAIL: ${message}`)
  if (!keep) rmSync(TMP, { recursive: true, force: true })
  process.exit(1)
}

function compile(): string {
  mkdirSync(TMP, { recursive: true })
  const bin = path.join(TMP, 'native-sgp4')
  const cc = spawnSync(
    'cc',
    [
      '-O2',
      '-std=c99',
      '-Wall',
      '-Wextra',
      '-I',
      NATIVE_DIR,
      DRIVER,
      path.join(NATIVE_DIR, 'sgp4.c'),
      '-lm',
      '-o',
      bin,
    ],
    { encoding: 'utf8' },
  )
  if (cc.status !== 0) fail(`compilation failed:\n${cc.stderr || cc.stdout}`)
  if (cc.stderr.trim()) console.log(`compiler diagnostics:\n${cc.stderr.trim()}`)
  return bin
}

/** Parse tcppver.out: "<satnum> xx" starts a block, every other line is a data row. */
function parsePublished(text: string): { blocks: Block[]; lineCount: number } {
  const lines = text.replace(/\r/g, '').split('\n')
  while (lines.length && lines[lines.length - 1] === '') lines.pop()

  const blocks: Block[] = []
  for (const line of lines) {
    const head = /^(\d+)\s+xx\s*$/.exec(line)
    if (head) {
      blocks.push({ satnum: Number(head[1]), rows: [], terminator: 'none', error: 0, message: '' })
      continue
    }
    if (!blocks.length) fail(`tcppver.out data row before any "xx" header: ${line}`)
    const f = line.trim().split(/\s+/).map(Number)
    if (f.length < 7 || f.slice(0, 7).some((n) => !Number.isFinite(n))) {
      fail(`unparsable tcppver.out row: ${line}`)
    }
    blocks[blocks.length - 1].rows.push({
      tsince: f[0],
      r: [f[1], f[2], f[3]],
      v: [f[4], f[5], f[6]],
    })
  }
  return { blocks, lineCount: lines.length }
}

/** Parse the driver stream: SAT / ROW / NAN / ERR records. */
function parseDriver(text: string): Block[] {
  const blocks: Block[] = []
  for (const line of text.split('\n')) {
    if (!line) continue
    const kind = line.slice(0, 3)
    if (kind === 'SAT') {
      blocks.push({ satnum: Number(line.slice(4)), rows: [], terminator: 'none', error: 0, message: '' })
      continue
    }
    if (!blocks.length) fail(`driver record before any SAT header: ${line}`)
    const block = blocks[blocks.length - 1]
    if (kind === 'ROW') {
      const f = line.slice(4).split(' ').map(Number)
      if (f.length !== 7 || f.some((n) => !Number.isFinite(n))) fail(`unparsable driver row: ${line}`)
      block.rows.push({ tsince: f[0], r: [f[1], f[2], f[3]], v: [f[4], f[5], f[6]] })
      continue
    }
    if (kind === 'NAN' || kind === 'ERR') {
      const rest = line.slice(4)
      const sp = rest.indexOf(' ')
      block.terminator = kind === 'NAN' ? 'nan' : 'err'
      block.error = Number(sp < 0 ? rest : rest.slice(0, sp))
      block.message = sp < 0 ? '' : rest.slice(sp + 1)
      continue
    }
    fail(`unknown driver record: ${line}`)
  }
  return blocks
}

const bin = compile()

const tlePath = path.join(DATA_DIR, 'SGP4-VER.TLE')
const run = spawnSync(bin, [tlePath, opsmode, grav], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
if (run.status !== 0) fail(`driver exited ${run.status}:\n${run.stderr}`)
if (run.stderr.trim()) fail(`driver wrote to stderr:\n${run.stderr}`)

const published = parsePublished(readFileSync(path.join(DATA_DIR, 'tcppver.out'), 'utf8'))
const actual = parseDriver(run.stdout)

if (published.lineCount !== TCPPVER_LINES) {
  fail(`tcppver.out has ${published.lineCount} lines, expected ${TCPPVER_LINES}`)
}
if (published.blocks.length !== actual.length) {
  fail(`satellite count differs: published ${published.blocks.length}, port ${actual.length}`)
}

let rowsAsserted = 0
let repeatedRowsAsserted = 0
let maxPosDevM = 0
let maxVelDevMs = 0
let maxPosAt = ''
let maxVelAt = ''
const errorsSeen: Array<{ satnum: number; code: number; message: string }> = []
const failures: string[] = []

/** The last real data row emitted, mirroring TestSGP4.cpp's stale output buffer. */
let previous: Row | null = null

for (let i = 0; i < published.blocks.length; i++) {
  const exp = published.blocks[i]
  const got = actual[i]

  if (exp.satnum !== got.satnum) {
    fail(`block ${i}: published satnum ${exp.satnum} but port reported ${got.satnum}`)
  }

  if (got.terminator === 'nan') {
    errorsSeen.push({ satnum: got.satnum, code: got.error, message: got.message })
    if (exp.rows.length !== 1) {
      failures.push(`sat ${exp.satnum}: port produced NaN at tsince 0 but tcppver.out has ${exp.rows.length} rows`)
      continue
    }
    const row = exp.rows[0]
    if (row.tsince !== 0) {
      failures.push(`sat ${exp.satnum}: stale row has tsince ${row.tsince}, expected 0`)
      continue
    }
    if (!previous) {
      failures.push(`sat ${exp.satnum}: stale row has no preceding data row to repeat`)
      continue
    }
    const same =
      row.r.every((n, k) => n === (previous as Row).r[k]) &&
      row.v.every((n, k) => n === (previous as Row).v[k])
    if (!same) {
      failures.push(
        `sat ${exp.satnum}: stale row does not repeat the previous data line\n` +
          `  published: ${row.r.join(' ')} ${row.v.join(' ')}\n` +
          `  previous : ${previous.r.join(' ')} ${previous.v.join(' ')}`,
      )
      continue
    }
    rowsAsserted += 1
    repeatedRowsAsserted += 1
    continue
  }

  if (got.terminator === 'err') {
    errorsSeen.push({ satnum: got.satnum, code: got.error, message: got.message })
  }

  if (exp.rows.length !== got.rows.length) {
    failures.push(
      `sat ${exp.satnum}: published ${exp.rows.length} rows, port produced ${got.rows.length}`,
    )
    continue
  }

  for (let k = 0; k < exp.rows.length; k++) {
    const e = exp.rows[k]
    const a = got.rows[k]
    if (Math.abs(e.tsince - a.tsince) > 1e-6) {
      failures.push(`sat ${exp.satnum} row ${k}: tsince ${a.tsince} vs published ${e.tsince}`)
      continue
    }
    for (let c = 0; c < 3; c++) {
      const dev = Math.abs(a.r[c] - e.r[c]) * 1000
      if (dev > maxPosDevM) {
        maxPosDevM = dev
        maxPosAt = `sat ${exp.satnum} tsince ${e.tsince} r[${c}]`
      }
      if (dev > POS_TOL_M) {
        failures.push(
          `sat ${exp.satnum} tsince ${e.tsince} r[${c}]: ${a.r[c]} km vs published ${e.r[c]} km (${dev.toExponential(3)} m)`,
        )
      }
    }
    for (let c = 0; c < 3; c++) {
      const dev = Math.abs(a.v[c] - e.v[c]) * 1000
      if (dev > maxVelDevMs) {
        maxVelDevMs = dev
        maxVelAt = `sat ${exp.satnum} tsince ${e.tsince} v[${c}]`
      }
      if (dev > VEL_TOL_MS) {
        failures.push(
          `sat ${exp.satnum} tsince ${e.tsince} v[${c}]: ${a.v[c]} km/s vs published ${e.v[c]} km/s (${dev.toExponential(3)} m/s)`,
        )
      }
    }
    rowsAsserted += 1
    previous = e
  }
}

const publishedRows = published.blocks.reduce((n, b) => n + b.rows.length, 0)
if (rowsAsserted !== publishedRows) {
  failures.push(`consumed ${rowsAsserted} of ${publishedRows} published data rows`)
}
if (publishedRows + published.blocks.length !== TCPPVER_LINES) {
  failures.push(
    `${publishedRows} data rows + ${published.blocks.length} headers != ${TCPPVER_LINES} file lines`,
  )
}

const errorCodes = errorsSeen.map((e) => e.code)
const errorsMatch =
  errorCodes.length === EXPECTED_ERRORS.length && errorCodes.every((c, i) => c === EXPECTED_ERRORS[i])
if (!errorsMatch) {
  failures.push(`error codes [${errorCodes.join(', ')}] != published [${EXPECTED_ERRORS.join(', ')}]`)
}

console.log(`native SGP4 verification (opsmode '${opsmode}', ${grav})`)
console.log(`  satellites            ${actual.length}`)
console.log(`  tcppver.out lines     ${published.lineCount}`)
console.log(`  data rows asserted    ${rowsAsserted} (${repeatedRowsAsserted} stale-buffer repeats)`)
console.log(`  max position dev      ${maxPosDevM.toExponential(3)} m   (${maxPosAt})`)
console.log(`  max velocity dev      ${maxVelDevMs.toExponential(3)} m/s (${maxVelAt})`)
console.log(`  tolerances            ${POS_TOL_M} m position, ${VEL_TOL_MS} m/s velocity`)
console.log('  error codes')
for (const e of errorsSeen) console.log(`    sat ${String(e.satnum).padStart(5)}  code ${e.code}  ${e.message}`)

if (!keep) rmSync(TMP, { recursive: true, force: true })

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`)
  for (const f of failures.slice(0, 40)) console.error(`  ${f}`)
  if (failures.length > 40) console.error(`  ... and ${failures.length - 40} more`)
  process.exit(1)
}

console.log('\nPASS: full AIAA 2006-6753 verification matrix reproduced.')
