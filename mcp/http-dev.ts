/**
 * Local Streamable HTTP MCP for development (same handler as api/mcp.ts).
 *   npm run mcp:http  →  http://127.0.0.1:8787/api/mcp
 */
import { createServer, type IncomingMessage } from 'node:http'
import handler from '../api/mcp.ts'

const port = Number(process.env.MCP_HTTP_PORT ?? 8787)
const host = process.env.MCP_HTTP_HOST ?? '127.0.0.1'

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${host}:${port}`)
    if (url.pathname !== '/api/mcp' && url.pathname !== '/mcp') {
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'Use /api/mcp' }))
      return
    }

    // Match Vercel path so the serverless handler sees /api/mcp
    const proxied = Object.assign(req, {
      url: `/api/mcp${url.search}`,
    }) as IncomingMessage & { body?: unknown }

    // Buffer body for non-GET so handler.readRawBody works
    if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(Buffer.from(chunk))
      proxied.body = chunks.length ? Buffer.concat(chunks) : undefined
    }

    await handler(proxied, res)
  } catch (err) {
    console.error(err)
    res.writeHead(500, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: String(err) }))
  }
})

server.listen(port, host, () => {
  console.error(`SIDUS MCP HTTP dev → http://${host}:${port}/api/mcp`)
})
