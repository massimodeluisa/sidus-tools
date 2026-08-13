/**
 * SIDUS MCP tool registration: shared by stdio and remote HTTP transports.
 * Registers the full pure-SI educational catalog (all live tools).
 */
import { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import {
  MCP_TOOL_DEFS,
  SIDUS_MCP_DISCLAIMER,
} from './full-catalog'

export { SIDUS_MCP_DISCLAIMER }

function ok(data: unknown) {
  const payload = { disclaimer: SIDUS_MCP_DISCLAIMER, result: data }
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
  }
}

function fail(message: string) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ error: message, disclaimer: SIDUS_MCP_DISCLAIMER }),
      },
    ],
    isError: true as const,
  }
}

/**
 * Shared MCP server factory (stdio local + HTTP remote).
 * Pure-SI educational tools. Not flight software.
 */
export function createSidusMcpServer(): McpServer {
  const server = new McpServer({
    name: 'sidus-tools',
    version: '1.0.0',
  })

  for (const def of MCP_TOOL_DEFS) {
    server.registerTool(
      def.name,
      {
        description: def.description,
        inputSchema: z.object(def.inputSchema),
      },
      async (args) => {
        try {
          const result = def.run((args ?? {}) as Record<string, unknown>)
          if (result == null) return fail('Invalid inputs or out of model domain')
          return ok(result)
        } catch (e) {
          return fail(e instanceof Error ? e.message : String(e))
        }
      },
    )
  }

  return server
}
