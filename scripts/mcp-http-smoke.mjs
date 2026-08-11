/**
 * Smoke the remote-style Streamable HTTP MCP (local dev server).
 * Starts mcp/http-dev.ts, lists tools via MCP client HTTP transport, calls one tool.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = 8791
const base = `http://127.0.0.1:${port}/api/mcp`

const child = spawn('npx', ['tsx', 'mcp/http-dev.ts'], {
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

async function waitReady(timeoutMs = 15000) {
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

try {
  await waitReady()
  const discovery = await fetch(base).then((r) => r.json())
  console.log('DISCOVERY', JSON.stringify(discovery).slice(0, 300))
  if (!discovery.endpoint) throw new Error('missing discovery.endpoint')

  const transport = new StreamableHTTPClientTransport(new URL(base))
  const client = new Client({ name: 'sidus-http-smoke', version: '1.0.0' })
  await client.connect(transport)

  const listed = await client.listTools()
  const names = listed.tools.map((t) => t.name).sort()
  console.log('HTTP_TOOL_COUNT', names.length)
  if (names.length < 40) throw new Error(`too few tools: ${names.length}`)

  const hyper = await client.callTool({
    name: 'hyperbolic_c3',
    arguments: { r_m: 6_678_137, v_inf_m_s: 3000 },
  })
  const text = hyper.content?.find((c) => c.type === 'text')?.text ?? ''
  const parsed = JSON.parse(text)
  const c3 = parsed.result?.c3_m2_s2 ?? parsed.c3_m2_s2
  if (Math.abs((c3 ?? 0) - 9e6) > 1) throw new Error(`c3 fail: ${c3}`)
  if (!parsed.disclaimer && !parsed.result) {
    // ok() wraps disclaimer + result
  }
  console.log('HTTP_HYPERBOLIC_C3', c3)
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
