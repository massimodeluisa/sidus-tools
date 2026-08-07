# SIDUS

**[sidus.tools](https://sidus.tools)**: open-source space engineering tools.

*Sidus* (Latin) = constellation, heavenly body.

## Principles

- Maximum reuse, zero UI duplication (`ToolShell` + shared fields/results)
- Full i18n for major space-agency languages
- Multi-language code export (C, C++, Rust, Zig, Python, JS/TS, MATLAB, Julia, Fortran, LaTeX)
- Independent educational project. No affiliation with any agency or company
- **100% open source · non-profit**
- Made with ❤️ by [Massimo De Luisa](https://massimo.deluisa.bio)

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · react-router · i18next

## Develop

```bash
npm install
npm run dev
npm run build
npm run type-check
npm test
```

## MCP (public URL: no install)

Connect Claude Desktop, Cursor, or any MCP client to:

```text
https://sidus.tools/api/mcp
```

```json
{
  "mcpServers": {
    "sidus": {
      "url": "https://sidus.tools/api/mcp"
    }
  }
}
```

No clone, no `npm install` for end users. Optional offline stdio: `npm run mcp`.  
Full docs: [`mcp/README.md`](mcp/README.md).

## Documentation (policy)

| Doc | |
|-----|--|
| **[INDEX.md](INDEX.md)** | Full documentation map |
| **[CONVENTIONS.md](CONVENTIONS.md)** | Coding + maintenance rules (tests, i18n, robots, llms, snippets) |
| **[CONTRIBUTIONS.md](CONTRIBUTIONS.md)** | How to contribute |
| **[LICENSE.md](LICENSE.md)** / [LICENSE](LICENSE) | MIT |
| **[AGENTS.md](AGENTS.md)** | Agent entrypoint |

## Agents / SEO

- [`public/llms.txt`](public/llms.txt): agent index (`npm run llms:gen`)  
- [`public/robots.txt`](public/robots.txt) · [`public/sitemap.xml`](public/sitemap.xml)  
- Engineering survey: [`docs/ENGINEERING_TOOLS_SURVEY.md`](docs/ENGINEERING_TOOLS_SURVEY.md)

## Open Graph images (1200×630)

Homepage-dark cards, SaaS-style (safe zone, large type, mono formula):

| URL | Card |
|-----|------|
| `/api/og?page=home` | Default SIDUS brand |
| `/api/og?tool=hohmann` | Tool + formula (static) |
| `/api/og?tool=hohmann&h1=200&h2=35786&hu=km&body=earth` | **Live results** (Δv, TOF, …) |

- Template: `api/og.tsx` (`@vercel/og` PNG)  
- Payload / formulas: `src/lib/og/`  
- Social bots get injected `og:image` via root `middleware.ts`  
- Design refs (SVG): `public/og/*.svg` · `npm run og:static`

## License

MIT: see [LICENSE.md](LICENSE.md) and [LICENSE](LICENSE).
