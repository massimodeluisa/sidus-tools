import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { multiStageSnippets } from './multi-stage'

const python = process.platform === 'win32' ? 'python' : 'python3'
const pythonVersion = spawnSync(python, ['--version'], { encoding: 'utf8' })
const pythonAvailable = !pythonVersion.error && pythonVersion.status === 0
const helperCases: [string, Record<string, number>, number][] = [
  ['explicit exhaust velocity', { ve: 3000, m0: 10, mf: 5 }, 3000 * Math.log(2)],
  [
    'documented SI-specific-impulse keys',
    { isp_s: 300, m0_kg: 10, mf_kg: 5 },
    300 * 9.80665 * Math.log(2),
  ],
  ['legacy short keys', { isp: 300, m0: 10, mf: 5 }, 300 * 9.80665 * Math.log(2)],
  [
    'near-unit mass ratio',
    { isp_s: 320, m0_kg: 5000 + 1e-12, mf_kg: 5000 },
    5.708221578970551e-13,
  ],
]

function expectRelative(actual: number, expected: number) {
  expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThan(1e-12)
}

function runPythonStage(stage: Record<string, number>): [number[], number] {
  const body = multiStageSnippets.code.python
  const helperEnd = body.indexOf('\ndv1 =')
  if (helperEnd < 0) throw new Error('could not isolate the multi-stage Python helper')
  const helper = body.slice(0, helperEnd)
  const script = `${helper}\nimport json\nprint(json.dumps(multi_stage_dv([${JSON.stringify(stage)}])))\n`
  const result = spawnSync(python, ['-c', script], { encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr || `Python exited ${result.status}`)
  return JSON.parse(result.stdout.trim()) as [number[], number]
}

function runJavaScriptStage(stage: Record<string, number>): { dv: number[]; dvTotal: number } {
  const body = multiStageSnippets.code.javascript
  const helperEnd = body.indexOf('\nconst dv1 =')
  if (helperEnd < 0) throw new Error('could not isolate the multi-stage JavaScript helper')
  const helper = body.slice(0, helperEnd)
  const script = `${helper}\nconsole.log(JSON.stringify(multiStageDv([${JSON.stringify(stage)}])))\n`
  const result = spawnSync(process.execPath, ['-e', script], { encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr || `Node exited ${result.status}`)
  return JSON.parse(result.stdout.trim()) as { dv: number[]; dvTotal: number }
}

describe('multi-stage snippet exports', () => {
  it('documents the supported SI and legacy helper input keys', () => {
    expect(multiStageSnippets.code.python).toContain(
      'Accept {isp_s,m0_kg,mf_kg}, {ve,m0,mf}, or legacy {isp,m0,mf}; SI units',
    )
    expect(multiStageSnippets.code.javascript).toContain(
      '[{ isp_s, m0_kg, mf_kg }], [{ isp, m0, mf }], or [{ ve, m0, mf }]',
    )
  })

  it.skipIf(!pythonAvailable)
    .each(helperCases)('evaluates Python helper input: %s', (_label, stage, expected) => {
      const [perStage, total] = runPythonStage(stage)
      expect(perStage).toHaveLength(1)
      expectRelative(perStage[0]!, expected)
      expectRelative(total, expected)
    })

  it.each(helperCases)('evaluates JavaScript helper input: %s', (_label, stage, expected) => {
    const result = runJavaScriptStage(stage)
    expect(result.dv).toHaveLength(1)
    expectRelative(result.dv[0]!, expected)
    expectRelative(result.dvTotal, expected)
  })
})
