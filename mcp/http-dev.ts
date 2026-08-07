/**
 * Local Streamable HTTP MCP for development (same handler as api/mcp.ts).
 *   npm run mcp:http  →  http://127.0.0.1:8787/api/mcp
 */
import { createServer } from 'node:http'
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

    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(Buffer.from(chunk))
    const body = chunks.length ? Buffer.concat(chunks) : undefined

    const headers = new Headers()
    for (const [k, v] of Object.entries(req.headers)) {
      if (v == null) continue
      if (Array.isArray(v)) v.forEach((x) => headers.append(k, x))
      else headers.set(k, v)
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body: body && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
    })

    const response = await handler(request)
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()))
    const ab = await response.arrayBuffer()
    res.end(Buffer.from(ab))
  } catch (err) {
    console.error(err)
    res.writeHead(500, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: String(err) }))
  }
})

server.listen(port, host, () => {
  console.error(`SIDUS MCP HTTP dev → http://${host}:${port}/api/mcp`)
})
