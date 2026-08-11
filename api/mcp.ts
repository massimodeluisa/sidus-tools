/**
 * Public remote MCP endpoint (Streamable HTTP, stateless).
 *
 * Connect Claude Desktop / Cursor / any MCP client with:
 *   { "mcpServers": { "sidus": { "url": "https://sidus.tools/api/mcp" } } }
 *
 * No clone, no npm install on the client: pure-SI math runs on the edge of this deploy.
 * Educational models. Not flight software.
 */
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { createSidusMcpServer } from '../mcp/create-server'

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

function discovery(): Response {
  return withCors(
    Response.json({
      name: 'sidus-tools',
      version: '1.0.0',
      transport: 'streamable-http',
      endpoint: '/api/mcp',
      note: 'Public educational pure-SI MCP. Point your MCP client url at this path. No local install required.',
      disclaimer:
        'Educational pure-SI model (SIDUS). Not flight software. No affiliation with NASA, ESA, or SpaceX.',
      docs: 'https://github.com/massimodeluisa/sidus-tools/tree/main/mcp',
    }),
  )
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }))
  }

  // Friendly browser / health GET without MCP Accept headers
  const accept = req.headers.get('accept') ?? ''
  const isMcp =
    accept.includes('text/event-stream') ||
    accept.includes('application/json') ||
    req.method === 'POST' ||
    req.method === 'DELETE'

  if (req.method === 'GET' && !isMcp) {
    return discovery()
  }

  try {
    const transport = new WebStandardStreamableHTTPServerTransport({
      // Stateless: works on serverless (no sticky sessions)
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })
    const server = createSidusMcpServer()
    await server.connect(transport)
    const res = await transport.handleRequest(req)
    return withCors(res)
  } catch (err) {
    console.error('SIDUS MCP HTTP error', err)
    return withCors(
      Response.json(
        {
          error: err instanceof Error ? err.message : 'MCP handler failed',
          disclaimer:
            'Educational pure-SI model (SIDUS). Not flight software. No affiliation with NASA, ESA, or SpaceX.',
        },
        { status: 500 },
      ),
    )
  }
}
