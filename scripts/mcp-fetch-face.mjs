/**
 * Exercise the Web fetch face of mcp/http-handler.ts (same code the Vercel bundle wraps).
 */
import { webHandler } from '../mcp/http-handler.ts'

function parseRpc(text) {
  const trimmed = text.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed)
  const data = []
  for (const line of trimmed.split(/\r?\n/)) {
    if (line.startsWith('data:')) data.push(line.slice(5).trim())
  }
  if (!data.length) throw new Error(trimmed.slice(0, 200))
  return JSON.parse(data.join('\n'))
}

const origin = 'http://sidus.tools/api/mcp'

const handler = webHandler
const get = await handler.fetch(new Request(origin, { headers: { host: 'sidus.tools' } }))
const getBody = await get.text()
if (getBody.includes('probe') || getBody.includes('minimal-node-handler')) {
  throw new Error('probe on GET')
}
const disc = JSON.parse(getBody)
if (disc.transport !== 'streamable-http') throw new Error('bad discovery')
console.log('FETCH_GET', get.status, disc.transport)

const forbidden = await handler.fetch(
  new Request('http://evil.example/api/mcp', { headers: { host: 'evil.example' } }),
)
console.log('FETCH_FORBIDDEN_HOST', forbidden.status)
if (forbidden.status !== 403) throw new Error(`expected 403, got ${forbidden.status}`)

const init = await handler.fetch(
  new Request(origin, {
    method: 'POST',
    headers: {
      host: 'sidus.tools',
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'fetch-gate', version: '0.0.1' },
      },
    }),
  }),
)
const initJson = parseRpc(await init.text())
if (initJson.error) throw new Error(JSON.stringify(initJson.error))
console.log(
  'FETCH_INIT',
  init.status,
  init.headers.get('content-type'),
  initJson.result.protocolVersion,
  initJson.result.serverInfo.name,
)

const list = await handler.fetch(
  new Request(origin, {
    method: 'POST',
    headers: {
      host: 'sidus.tools',
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }),
  }),
)
const listJson = parseRpc(await list.text())
if (listJson.error) throw new Error(JSON.stringify(listJson.error))
console.log('FETCH_LIST', listJson.result.tools.length)

const hoh = await handler.fetch(
  new Request(origin, {
    method: 'POST',
    headers: {
      host: 'sidus.tools',
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'hohmann', arguments: { r1_m: 6_778_137, r2_m: 42_164_000 } },
    }),
  }),
)
const hohJson = parseRpc(await hoh.text())
if (hohJson.error) throw new Error(JSON.stringify(hohJson.error))
const inner = JSON.parse(hohJson.result.content[0].text)
const dv = inner.result.dvTotal
if (!(dv > 3000 && dv < 5000)) throw new Error(`dv ${dv}`)
console.log('FETCH_HOHMANN_DV', dv)
console.log('FETCH_FACE_OK')
