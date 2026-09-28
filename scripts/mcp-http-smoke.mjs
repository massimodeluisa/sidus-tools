/**
 * Smoke the remote-style Streamable HTTP MCP (local dev server).
 * Starts mcp/http-dev.ts, fails if the probe stub is still mounted,
 * then initialize / tools/list / Hohmann SI / CORS.
 */
import { Client } from '@modelcontextprotocol/client'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = 8791
const base = `http://127.0.0.1:${port}/api/mcp`
const tsxCli = path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs')

const child = spawn(process.execPath, [tsxCli, 'mcp/http-dev.ts'], {
  cwd: root,
  env: { ...process.env, MCP_HTTP_PORT: String(port), MCP_HTTP_HOST: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe'],
})

const errChunks = []
child.stderr?.on('data', (c) => errChunks.push(String(c)))
child.stdout?.on('data', (c) => errChunks.push(String(c)))

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitReady(timeoutMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(base)
      if (r.ok) return
    } catch {
      /* retry */
    }
    await sleep(200)
  }
  throw new Error(`HTTP MCP not ready: ${errChunks.join('')}`)
}

function assertNotProbe(body, label) {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  if (text.includes('minimal-node-handler') || /"probe"\s*:/.test(text)) {
    throw new Error(`${label}: probe stub still mounted: ${text.slice(0, 400)}`)
  }
}

/** Parse a JSON-RPC body, or the first `data:` payload of an SSE stream. */
function parseRpc(text) {
  const trimmed = text.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed)
  const dataLines = []
  for (const line of trimmed.split(/\r?\n/)) {
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
  }
  if (!dataLines.length) throw new Error(`not JSON-RPC or SSE: ${trimmed.slice(0, 200)}`)
  return JSON.parse(dataLines.join('\n'))
}

try {
  await waitReady()

  const discoveryRes = await fetch(base)
  const discoveryText = await discoveryRes.text()
  assertNotProbe(discoveryText, 'GET discovery')
  if (!discoveryRes.ok) throw new Error(`GET discovery HTTP ${discoveryRes.status}: ${discoveryText}`)
  const discovery = JSON.parse(discoveryText)
  if (discovery.transport !== 'streamable-http') {
    throw new Error(`GET must advertise streamable-http, got ${JSON.stringify(discovery)}`)
  }
  if (discovery.endpoint !== '/api/mcp') throw new Error('missing discovery.endpoint')
  console.log('DISCOVERY', JSON.stringify(discovery).slice(0, 300))

  const opt = await fetch(base, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://example.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type, accept, mcp-protocol-version',
    },
  })
  if (opt.status !== 204 && opt.status !== 200) {
    throw new Error(`OPTIONS CORS HTTP ${opt.status}`)
  }
  const allowOrigin = opt.headers.get('access-control-allow-origin')
  if (allowOrigin !== '*') {
    throw new Error(`CORS Allow-Origin: ${allowOrigin}`)
  }
  console.log('CORS_OPTIONS', opt.status, allowOrigin)

  const initRes = await fetch(base, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Origin: 'https://example.com',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'sidus-http-smoke', version: '0.0.1' },
      },
    }),
  })
  const initText = await initRes.text()
  assertNotProbe(initText, 'POST initialize')
  if (!initRes.ok) throw new Error(`initialize HTTP ${initRes.status}: ${initText.slice(0, 500)}`)
  if (!initRes.headers.get('access-control-allow-origin')) {
    throw new Error('initialize missing CORS header')
  }
  const initJson = parseRpc(initText)
  const serverName = initJson?.result?.serverInfo?.name ?? initJson?.result?.serverInfo?.title
  if (initJson?.error) throw new Error(`initialize error: ${JSON.stringify(initJson.error)}`)
  if (!initJson?.result?.protocolVersion && !initJson?.result?.serverInfo) {
    throw new Error(`initialize missing result: ${initText.slice(0, 400)}`)
  }
  console.log('INITIALIZE', initJson.result.protocolVersion, serverName ?? 'sidus-tools')

  const transport = new StreamableHTTPClientTransport(new URL(base))
  const client = new Client({ name: 'sidus-http-smoke', version: '1.0.0' })
  await client.connect(transport)

  const listed = await client.listTools()
  const names = listed.tools.map((t) => t.name).sort()
  console.log('HTTP_TOOL_COUNT', names.length)
  if (names.length < 170) throw new Error(`too few tools: ${names.length}`)
  if (!names.includes('hohmann')) throw new Error('hohmann missing from tools/list')
  if (!names.includes('flyby_periapsis_speed')) throw new Error('flyby_periapsis_speed missing from tools/list')

  const hyper = await client.callTool({
    name: 'hyperbolic_c3',
    arguments: { r_m: 6_678_137, v_inf_m_s: 3000 },
  })
  const hyperText = hyper.content?.find((c) => c.type === 'text')?.text ?? ''
  assertNotProbe(hyperText, 'hyperbolic_c3')
  const hyperParsed = JSON.parse(hyperText)
  const c3 = hyperParsed.result?.c3_m2_s2 ?? hyperParsed.c3_m2_s2
  if (Math.abs((c3 ?? 0) - 9e6) > 1) throw new Error(`c3 fail: ${c3}`)
  console.log('HTTP_HYPERBOLIC_C3', c3)

  const flyby = await client.callTool({
    name: 'flyby_periapsis_speed',
    arguments: { mu_m3_s2: 3.986004418e14, periapsis_radius_m: 6_778_137, v_inf_m_s: 5000 },
  })
  const flybyText = flyby.content?.find((c) => c.type === 'text')?.text ?? ''
  assertNotProbe(flybyText, 'flyby_periapsis_speed')
  const flybyParsed = JSON.parse(flybyText)
  const vp = flybyParsed.result?.v_p_m_s ?? flybyParsed.v_p_m_s
  if (Math.abs((vp ?? 0) - 11942.092319991702) > 1e-8) {
    throw new Error(`flyby periapsis speed fail: ${vp}`)
  }
  console.log('HTTP_FLYBY_PERIAPSIS_SPEED_M_S', vp)

  const hoh = await client.callTool({
    name: 'hohmann',
    arguments: { r1_m: 6_778_137, r2_m: 42_164_000 },
  })
  const hohText = hoh.content?.find((c) => c.type === 'text')?.text ?? ''
  assertNotProbe(hohText, 'hohmann')
  const hohParsed = JSON.parse(hohText)
  const hohRes = hohParsed.result ?? hohParsed
  const totalDv = hohRes.dvTotal ?? hohRes.dv_total_m_s
  if (!(typeof totalDv === 'number' && totalDv > 3000 && totalDv < 5000)) {
    throw new Error(`hohmann SI Δv out of band: ${JSON.stringify(hohRes)}`)
  }
  if (!(typeof hohRes.tof === 'number' && hohRes.tof > 1000)) {
    throw new Error(`hohmann SI TOF missing: ${JSON.stringify(hohRes)}`)
  }
  console.log('HTTP_HOHMANN_DV_M_S', totalDv, 'TOF_S', hohRes.tof)

  console.log('NO_LOCAL_INSTALL_REQUIRED', true)
  console.log('MCP_HTTP_SMOKE_OK')
  await client.close()
  process.exitCode = 0
} catch (e) {
  console.error('MCP_HTTP_SMOKE_FAIL', e)
  console.error('server_log', errChunks.join(''))
  process.exitCode = 1
} finally {
  child.kill('SIGTERM')
  await sleep(300)
  try {
    child.kill('SIGKILL')
  } catch {
    /* ignore */
  }
}
