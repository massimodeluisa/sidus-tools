# INDEX: SIDUS documentation map

Single entry map for humans, agents, and CI. Keep this file updated when you
add or rename top-level docs.

Site: **https://sidus.tools** · Repo:
**https://github.com/massimodeluisa/sidus-tools**

---

## Policy & contribution (read first)

| Doc | Purpose |
|-----|---------|
| **[CONVENTIONS.md](./CONVENTIONS.md)** | How to write code; tests; i18n; catalog; robots/sitemap/llms; snippets |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | How to contribute / PR workflow |
| **[LICENSE.md](./LICENSE.md)** | MIT license explanation (+ link to `LICENSE`) |
| **[LICENSE](./LICENSE)** | Canonical MIT text |
| **[AGENTS.md](./AGENTS.md)** | Short agent entrypoint (points here + CONVENTIONS) |
| **[README.md](./README.md)** | Project overview, install, MCP, skill |
| **[skills/sidus/SKILL.md](./skills/sidus/SKILL.md)** | Installable Agent Skill (`npx skills add massimodeluisa/sidus-tools`) |

---

## Engineering docs

| Doc | Purpose |
|-----|---------|
| [docs/ENGINEERING_TOOLS_SURVEY.md](./docs/ENGINEERING_TOOLS_SURVEY.md) | Survey of engineering tools |
| [docs/AGENCY_OPEN_SOURCE_SURVEY.md](./docs/AGENCY_OPEN_SOURCE_SURVEY.md) | Agency open-source landscape |
| [docs/IMPLEMENTATION_TODO.md](./docs/IMPLEMENTATION_TODO.md) | Implementation backlog |
| [docs/OG_IMAGES.md](./docs/OG_IMAGES.md) | Open Graph image pipeline |
| [docs/godbolt-matrix/](./docs/godbolt-matrix/) | Latest Godbolt compile matrix reports |
| [src/lib/snippets/QUALITY.md](./src/lib/snippets/QUALITY.md) | Multi-lang snippet quality standard |
| [src/lib/physics/golden/README.md](./src/lib/physics/golden/README.md) | Golden physics cases |
| [mcp/README.md](./mcp/README.md) | MCP server (public URL + stdio) |

---

## Public web indexes (production)

| URL / file | Purpose | Maintenance |
|------------|---------|-------------|
| [public/robots.txt](./public/robots.txt) | Crawler policy | Edit + deploy |
| [public/sitemap.xml](./public/sitemap.xml) | SEO URL list | Add tool URLs on catalog change |
| [public/llms.txt](./public/llms.txt) | LLM/agent catalog | `npm run llms:gen` |
| https://sidus.tools/api/mcp | MCP endpoint | `api/mcp.ts` |
| https://sidus.tools/api/og | Dynamic OG images | `api/og.tsx`, `src/lib/og/` |

---

## Source layout (quick)

```
src/
  components/shared/   Shared UI chrome
  components/tools/    One tool page each
  components/site/     Header, footer, home chrome
  lib/physics/         Pure SI
  lib/snippets/        Code export
  lib/localeNumber.ts  Locale number parse/format
  data/                tools, sources, precision
  i18n/locales/        en it de fr es ru zh ja ko pt
public/                robots, sitemap, llms, favicon, static og
scripts/               llms:gen, godbolt, mcp smoke, og
```

---

## Commands

```bash
npm install
npm run dev
npm run build
npm run type-check
npm test
npm run llms:gen
npm run godbolt:matrix
npm run godbolt:matrix:all
npm run mcp
npm run mcp:smoke
npm run og:static
```

---

## Checklist when you change “the surface of the product”

1. Code + tests (CONVENTIONS §6)  
2. i18n all locales (CONVENTIONS §1)  
3. Catalog / snippets if tools changed (CONVENTIONS §5)  
4. `sitemap.xml` + `llms:gen` if public URLs/catalog changed  
5. This **INDEX.md** if you added a new top-level doc  

---

*Last structural pass should match CONVENTIONS.md; update both when process changes.*
