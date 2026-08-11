/**
 * Smoke-test every SIDUS MCP tool over local stdio (zero host cost).
 * Usage: node scripts/mcp-smoke.mjs   |   npm run mcp:smoke
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { MCP_SAMPLES, MCP_TOOL_DEFS } from '../mcp/full-catalog.ts'

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
