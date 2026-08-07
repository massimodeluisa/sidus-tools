# SIDUS MCP server

Public **Model Context Protocol** tools for SIDUS pure-SI physics.

## Primary: remote URL (no install)

Point any MCP client at the public endpoint: **no clone, no `npm install`**:

```text
https://sidus.tools/api/mcp
```

### Claude Desktop / Cursor / other clients

```json
{
  "mcpServers": {
    "sidus": {
      "url": "https://sidus.tools/api/mcp"
    }
  }
}
```

Some clients use `"type": "http"` or `"serverUrl"` instead of `"url"`: use whatever your client documents for remote Streamable HTTP MCP.

Browser health / discovery: open the URL (JSON metadata). Agents use MCP POST with the Streamable HTTP transport.

## Optional: local stdio (offline / air-gapped)

```bash
git clone https://github.com/massimodeluisa/sidus-tools.git
cd sidus-tools && npm install && npm run mcp
```

```json
{
  "mcpServers": {
    "sidus": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/absolute/path/to/sidus-tools"
    }
  }
}
```

## Architecture

| Path | Transport | When |
|------|-----------|------|
| `https://sidus.tools/api/mcp` | Streamable HTTP (stateless) | **Default for users** |
| `npm run mcp` | stdio | Offline, CI, local smoke |

Both share `mcp/create-server.ts` (same tools, same pure-SI math).

## Cost / privacy notes

- Remote path runs short pure-SI calculations on the site deploy (Vercel serverless). Calls are cheap educational math, not GPU inference.
- No SIDUS account or API key.
- Educational models. Not flight software.
- Optional local stdio keeps all compute on your machine if you prefer.

## Tools (full live catalog)

Orbital, hyperbolic/mission, propulsion, RF/ops, ECLSS: see `create-server.ts`.

Smoke (stdio): `npm run mcp:smoke`  
Local HTTP smoke: `npm run mcp:http` then hit `http://127.0.0.1:8787/api/mcp`.

## Disclaimer

Educational pure-SI model (SIDUS). No affiliation with NASA, ESA, SpaceX, or any agency.
