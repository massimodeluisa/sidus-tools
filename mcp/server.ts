#!/usr/bin/env node
/**
 * SIDUS MCP server: local stdio transport (optional offline / air-gapped).
 *
 * Primary public path is remote HTTP: https://sidus.tools/api/mcp
 * (no clone/install required for end users).
 *
 * Local:
 *   npm run mcp
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createSidusMcpServer } from './create-server'

async function main() {
  const server = createSidusMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('SIDUS MCP stdio (optional local). Prefer https://sidus.tools/api/mcp')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
