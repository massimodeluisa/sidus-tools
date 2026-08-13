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
import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { createSidusMcpServer } from './create-server'

serveStdio(() => createSidusMcpServer(), {
  onerror: (err) => {
    console.error(err)
  },
})

console.error('SIDUS MCP stdio (optional local). Prefer https://sidus.tools/api/mcp')
