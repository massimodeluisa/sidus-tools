/**
 * Smoke-test every SIDUS MCP tool over local stdio (zero host cost).
 * Usage: node scripts/mcp-smoke.mjs   |   npm run mcp:smoke
 */
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { MCP_SAMPLES, MCP_TOOL_DEFS } from '../mcp/full-catalog.ts'
import { EARTH_MU, rvToElements, vnorm } from '../src/lib/physics/index'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SAMPLES = MCP_SAMPLES

function parseResult(content) {
  const text = content?.find((c) => c.type === 'text')?.text ?? ''
  try {
    return { text, json: JSON.parse(text) }
  } catch {
    return { text, json: null }
  }
}

function assertOk(name, json) {
  if (!json) throw new Error(`${name}: non-JSON response`)
  if (json.error) throw new Error(`${name}: error ${JSON.stringify(json.error)}`)
  const payload = json.result ?? json
  if (payload == null) throw new Error(`${name}: empty payload`)
  return payload
}

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['tsx', 'mcp/server.ts'],
  cwd: root,
  stderr: 'pipe',
})

const client = new Client({ name: 'sidus-mcp-smoke', version: '1.0.0' })

const errChunks = []
transport.stderr?.on('data', (c) => errChunks.push(String(c)))

const started = Date.now()

try {
  await client.connect(transport)
  const listed = await client.listTools()
  const names = listed.tools.map((t) => t.name).sort()
  console.log('TOOL_COUNT', names.length)
  console.log('CATALOG_DEFS', MCP_TOOL_DEFS.length)

  const sampleKeys = Object.keys(SAMPLES).sort()
  const missingSamples = names.filter((n) => !(n in SAMPLES))
  const orphanSamples = sampleKeys.filter((n) => !names.includes(n))
  if (missingSamples.length) {
    throw new Error(`No smoke sample for: ${missingSamples.join(', ')}`)
  }
  if (orphanSamples.length) {
    throw new Error(`Orphan samples (not registered): ${orphanSamples.join(', ')}`)
  }

  let okCount = 0
  const failures = []
  for (const name of names) {
    const args = SAMPLES[name] ?? {}
    const res = await client.callTool({ name, arguments: args })
    if (res.isError) {
      failures.push(`${name}: isError: ${JSON.stringify(res.content)}`)
      continue
    }
    const { json } = parseResult(res.content)
    try {
      assertOk(name, json)
      okCount += 1
      if (okCount <= 5 || okCount % 25 === 0 || okCount === names.length) {
        console.log('OK', name, `(${okCount}/${names.length})`)
      }
    } catch (e) {
      failures.push(String(e))
    }
  }

  if (failures.length) {
    throw new Error(`${failures.length} tool failures:\n${failures.slice(0, 20).join('\n')}`)
  }

  // Spot-check numeric anchors
  const hyper = await client.callTool({
    name: 'hyperbolic_c3',
    arguments: SAMPLES.hyperbolic_c3,
  })
  const hyperJson = parseResult(hyper.content).json
  const c3 = hyperJson?.result?.c3_m2_s2 ?? hyperJson?.c3_m2_s2
  if (Math.abs((c3 ?? 0) - 9e6) > 1) {
    throw new Error(`hyperbolic c3 anchor fail: ${c3}`)
  }

  const hoh = await client.callTool({
    name: 'hohmann',
    arguments: SAMPLES.hohmann,
  })
  const hohJson = parseResult(hoh.content).json
  const hohRes = hohJson?.result ?? hohJson
  const totalDv = hohRes?.dvTotal ?? hohRes?.dv_total_m_s ?? hohRes?.total_dv_m_s
  const dv1 = hohRes?.dv1 ?? hohRes?.dv1_m_s
  const dv2 = hohRes?.dv2 ?? hohRes?.dv2_m_s
  if (totalDv != null) {
    if (!(totalDv > 3000 && totalDv < 5000)) {
      throw new Error(`hohmann total Δv out of band: ${totalDv}`)
    }
  } else if (dv1 != null && dv2 != null) {
    const sum = dv1 + dv2
    if (!(sum > 3000 && sum < 5000)) {
      throw new Error(`hohmann dv1+dv2 out of band: ${sum}`)
    }
  } else {
    const nums = Object.values(hohRes ?? {}).filter((v) => typeof v === 'number' && v > 0)
    if (nums.length < 2) throw new Error('hohmann: expected positive numeric fields')
  }

  // Golden anchor: lambert real solver, Vallado Example 5-5 (short way, prograde)
  const lamR1 = [15945340, 0, 0]
  const lamR2 = [12214833.99, 10249467.31, 0]
  const lamR1n = vnorm(lamR1)
  const lamR2n = vnorm(lamR2)
  const lamDot = lamR1[0] * lamR2[0] + lamR1[1] * lamR2[1] + lamR1[2] * lamR2[2]
  const lamAngle = Math.acos(lamDot / (lamR1n * lamR2n))
  const lamExpectedV1 = [2058.925, 2915.956, 0]
  const lamExpectedV2 = [-3451.569, 910.301, 0]

  const lam = await client.callTool({
    name: 'lambert',
    arguments: { r1_m: lamR1n, r2_m: lamR2n, tof_s: 4560, ang_rad: lamAngle, way: 'short' },
  })
  const lamRes = parseResult(lam.content).json?.result
  const lamV1 = [lamRes?.v1x, lamRes?.v1y, lamRes?.v1z]
  const lamV2 = [lamRes?.v2x, lamRes?.v2y, lamRes?.v2z]
  for (let i = 0; i < 3; i++) {
    if (!(Math.abs(lamV1[i] - lamExpectedV1[i]) <= 0.05)) {
      throw new Error(`lambert golden v1[${i}] fail: got ${lamV1[i]} expected ${lamExpectedV1[i]}`)
    }
    if (!(Math.abs(lamV2[i] - lamExpectedV2[i]) <= 0.05)) {
      throw new Error(`lambert golden v2[${i}] fail: got ${lamV2[i]} expected ${lamExpectedV2[i]}`)
    }
  }
  console.log('GOLDEN lambert v1/v2 within 0.05 m/s of Vallado Ex 5-5')

  // Golden anchor: rv_elements real solver, Vallado Example 2-4 state, vector mode
  const rvR = [1131340, -2282343, 6672423]
  const rvV = [-5643.05, 4303.33, 2428.79]
  const rvExpected = rvToElements(rvR, rvV, EARTH_MU)
  if (!rvExpected) throw new Error('rv_elements golden: shipped rvToElements returned null')

  const rvVec = await client.callTool({
    name: 'rv_elements',
    arguments: { rx: rvR[0], ry: rvR[1], rz: rvR[2], vx: rvV[0], vy: rvV[1], vz: rvV[2] },
  })
  const rvVecRes = parseResult(rvVec.content).json?.result
  const rvChecks = [
    ['a_m', rvExpected.a],
    ['e', rvExpected.e],
    ['i_rad', rvExpected.i],
    ['raan_rad', rvExpected.raan],
    ['argp_rad', rvExpected.argp],
    ['nu_rad', rvExpected.nu],
    ['h_m2_s', rvExpected.h],
    ['energy_j_kg', rvExpected.energy],
  ]
  for (const [key, expected] of rvChecks) {
    const got = rvVecRes?.[key]
    const relErr = Math.abs((got - expected) / (expected || 1))
    if (!(relErr <= 1e-9)) {
      throw new Error(`rv_elements golden ${key} fail: got ${got} expected ${expected} (relErr ${relErr})`)
    }
  }
  console.log('GOLDEN rv_elements vector mode matches shipped rvToElements at 1e-9 relative')

  // rv_elements magnitude mode: consistent with the vis-viva energy equation on the same state's norms
  const rvRn = vnorm(rvR)
  const rvVn = vnorm(rvV)
  const rvMagExpectedEnergy = (rvVn * rvVn) / 2 - EARTH_MU / rvRn
  const rvMagExpectedA = -EARTH_MU / (2 * rvMagExpectedEnergy)
  const rvMag = await client.callTool({
    name: 'rv_elements',
    arguments: { r_m: rvRn, v_m_s: rvVn },
  })
  const rvMagRes = parseResult(rvMag.content).json?.result
  const rvMagAErr = Math.abs((rvMagRes?.a_m - rvMagExpectedA) / rvMagExpectedA)
  const rvMagEErr = Math.abs((rvMagRes?.energy_j_kg - rvMagExpectedEnergy) / rvMagExpectedEnergy)
  if (!(rvMagAErr <= 1e-9)) {
    throw new Error(`rv_elements magnitude-mode a_m fail: got ${rvMagRes?.a_m} expected ${rvMagExpectedA}`)
  }
  if (!(rvMagEErr <= 1e-9)) {
    throw new Error(
      `rv_elements magnitude-mode energy_j_kg fail: got ${rvMagRes?.energy_j_kg} expected ${rvMagExpectedEnergy}`,
    )
  }
  console.log('GOLDEN rv_elements magnitude mode consistent with vis-viva energy equation')

  const elapsed = Date.now() - started
  console.log('INVOKED', okCount)
  console.log('ELAPSED_MS', elapsed)
  console.log('HOST_COST', 'zero (local stdio only)')
  console.log('MCP_SMOKE_OK')
  process.exitCode = 0
} catch (e) {
  console.error('MCP_SMOKE_FAIL', e)
  console.error('stderr', errChunks.join(''))
  process.exitCode = 1
} finally {
  try {
    await client.close()
  } catch {
    /* ignore */
  }
}
