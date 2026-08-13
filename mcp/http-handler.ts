/**
 * Public remote MCP endpoint (Streamable HTTP, stateless).
 *
 * Official SDK v2 createMcpHandler: 2026-07-28 plus 2025-era fallback.
 * Source of truth for local HTTP and the Vercel bundle (api/mcp.js).
 *
 * Connect Claude Desktop / Cursor / any MCP client with:
 *   { "mcpServers": { "sidus": { "url": "https://sidus.tools/api/mcp" } } }
 *
 * Educational models. Not flight software.
 */
import { createMcpHandler } from '@modelcontextprotocol/server'
import { toNodeHandler } from '@modelcontextprotocol/node'
import { createSidusMcpServer, SIDUS_MCP_DISCLAIMER } from './create-server'

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, mcp-session-id, Last-Event-ID, mcp-protocol-version',
  'Access-Control-Expose-Headers': 'mcp-session-id, mcp-protocol-version',
  'Access-Control-Max-Age': '86400',
}

function withCors(res: Response): Response {
  const headers = new Headers(res.headers)
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v)
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  })
}

function hostnameOf(hostHeader: string | null): string {
  if (!hostHeader) return ''
  const trimmed = hostHeader.trim().toLowerCase()
  if (trimmed.startsWith('[')) {
    const end = trimmed.indexOf(']')
    return end === -1 ? trimmed : trimmed.slice(0, end + 1)
  }
  return trimmed.split(':')[0] ?? ''
}

function isAllowedHost(request: Request): boolean {
  const host = hostnameOf(request.headers.get('host'))
  if (!host) return true
  return (
    host === 'sidus.tools' ||
    host === 'www.sidus.tools' ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host.endsWith('.vercel.app')
  )
}

function discovery(): Response {
  return withCors(
    Response.json({
      name: 'sidus-tools',
      version: '1.0.0',
      transport: 'streamable-http',
      endpoint: '/api/mcp',
      note: 'Public educational pure-SI MCP. Point your MCP client url at this path. No local install required.',
      disclaimer: SIDUS_MCP_DISCLAIMER,
      docs: 'https://github.com/massimodeluisa/sidus-tools/tree/main/mcp',
    }),
  )
}

const mcp = createMcpHandler(() => createSidusMcpServer(), {
  // JSON bodies: no mid-call streams. Fits Vercel serverless and 2025 clients.
  responseMode: 'json',
  onerror: (err) => {
    console.error('SIDUS MCP HTTP error', err)
  },
})

export async function handleMcp(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }))
  }

  if (!isAllowedHost(request)) {
    return withCors(
      Response.json(
        { error: 'Forbidden host', disclaimer: SIDUS_MCP_DISCLAIMER },
        { status: 403 },
      ),
    )
  }

  // Browser / health GET: honest discovery. MCP session GET (SSE) goes to the handler (405 when stateless).
  const accept = request.headers.get('accept') ?? ''
  const wantsSse = accept.includes('text/event-stream')
  if (request.method === 'GET' && !wantsSse) {
    return discovery()
  }

  try {
    return withCors(await mcp.fetch(request))
  } catch (err) {
    console.error('SIDUS MCP HTTP error', err)
    return withCors(
      Response.json(
        {
          error: err instanceof Error ? err.message : 'MCP handler failed',
          disclaimer: SIDUS_MCP_DISCLAIMER,
        },
        { status: 500 },
      ),
    )
  }
}

export const webHandler = {
  fetch(request: Request): Promise<Response> {
    return handleMcp(request)
  },
}

/** Classic Node (req, res): the shape Vercel /api JavaScript functions run. */
export default toNodeHandler(webHandler)
