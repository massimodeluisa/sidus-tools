/**
 * Minimal MCP/health endpoint probe (Node classic handler).
 * Full MCP catalog is re-attached once this path is proven live on Vercel.
 */
export default function handler(
  req: { method?: string; headers: Record<string, string | string[] | undefined> },
  res: {
    statusCode: number
    setHeader: (k: string, v: string) => void
    end: (b?: string) => void
  },
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, mcp-session-id, Last-Event-ID, mcp-protocol-version',
  )

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(
    JSON.stringify({
      name: 'sidus-tools',
      version: '1.0.0',
      probe: 'minimal-node-handler',
      endpoint: '/api/mcp',
      method: req.method ?? 'GET',
      note: 'Minimal probe — full MCP catalog restores after Vercel runtime is confirmed.',
      disclaimer:
        'Educational pure-SI model (SIDUS). Not flight software. No affiliation with NASA, ESA, or SpaceX.',
    }),
  )
}
