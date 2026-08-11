<p align="center">
  <a href="https://sidus.tools">
    <img src="https://sidus.tools/assets/logo-512.png" width="112" height="112" alt="SIDUS" />
  </a>
</p>

<h1 align="center">SIDUS</h1>

<p align="center">
  <strong>Open-source space engineering tools</strong><br />
  Pure SI · multilingual · agent-ready · non-profit
</p>

<p align="center">
  <a href="https://sidus.tools"><img src="https://img.shields.io/badge/Live-sidus.tools-0B1B2B?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiLz48L3N2Zz4=" alt="Live site" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License: MIT" /></a>
  <a href="https://isready.ai"><img src="https://isready.ai/badge/sidus.tools" alt="AI readiness" /></a>
  <a href="https://agentskills.io"><img src="https://img.shields.io/badge/Agent_Skills-standard-orange?style=flat-square" alt="Agent Skills format" /></a>
  <a href="skills/sidus/SKILL.md"><img src="https://img.shields.io/badge/skill-sidus-0a0a0a?style=flat-square" alt="SIDUS skill" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-public_URL-111827?style=flat-square" alt="MCP" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
</p>

<p align="center">
  <a href="https://sidus.tools"><strong>sidus.tools</strong></a>
  ·
  <a href="#agent-skill">Agent skill</a>
  ·
  <a href="#mcp-no-install">MCP</a>
  ·
  <a href="#develop">Develop</a>
  ·
  <a href="#documentation">Docs</a>
</p>

---

**SIDUS** (*sidus*, Latin: constellation, heavenly body) is a free educational lab for orbital mechanics, propulsion, RF/ops, geometry, and ECLSS — in the browser and for AI agents.

No accounts. No GPU. No affiliation with any space agency or company. **100% open source · non-profit.**

## Why SIDUS

- **~175 pure-SI calculators** — Hohmann, Lambert, SGP4, link budget, cabin atmosphere, rocket equation, and many more.
- **Shared UI, zero duplication** — every tool is `ToolShell` + shared field/result components.
- **10 languages** — English, Italian, German, French, Spanish, Russian, Chinese, Japanese, Korean, Portuguese (space-agency coverage).
- **Multi-language code export** — C, C++, Rust, Zig, Python, JS/TS, MATLAB, Julia, Fortran, LaTeX.
- **Agent-native** — public [MCP](#mcp-no-install) endpoint + [Agent Skill](#agent-skill) (`skills/sidus/SKILL.md`).
- **SEO & bots** — `llms.txt`, sitemap, robots, dynamic Open Graph cards.

## Features

| Area | What you get |
| ---- | ------------ |
| **Orbital** | Circular / Hohmann / bielliptic, Lambert, Kepler, SGP4, J2 drift, look angles, pass predict, eclipse, GEO, deorbit |
| **Propulsion** | Rocket equation, multi-stage, Isp / thrust, propellant mass, Oberth, nozzles, electric thrusters |
| **RF / ops** | Link budget, antenna beamwidth, Doppler, radar equation, TTC Eb/N0, laser links |
| **Crew / ECLSS** | Metabolic load, cabin atmosphere, LiOH scrubber, cabin leak, thermal loop |
| **Geometry / power** | Angular diameter, solar array, battery, reaction wheel, ground track, coverage |
| **Agents** | Streamable HTTP MCP + installable skill for Claude Code, Codex, Cursor, and compatible clients |
| **Export** | Live values + idiomatic snippets in 10 programming languages |

Educational models only — not flight software.

## Quick start

### Use the site

Open **[https://sidus.tools](https://sidus.tools)** — no install.

### Agent skill

SIDUS ships as an [Agent Skill](https://agentskills.io) so coding agents can run the same pure-SI calculators:

```bash
npx skills add massimodeluisa/sidus-tools
```

The skill lives at [`skills/sidus/SKILL.md`](skills/sidus/SKILL.md). Compatible with [Claude Code](https://claude.ai/code), [Codex](https://openai.com/codex/), [Cursor](https://cursor.com), [OpenCode](https://opencode.ai), and other [Agent Skills](https://agentskills.io/clients) clients.

### MCP (no install)

Point any MCP client at the public endpoint — **no clone, no `npm install`**:

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

Optional offline stdio:

```bash
git clone https://github.com/massimodeluisa/sidus-tools.git
cd sidus-tools && npm install && npm run mcp
```

Full MCP docs: [`mcp/README.md`](mcp/README.md).

## Stack

| Layer | Choice |
| ----- | ------ |
| UI | React 19 · Vite · Tailwind CSS v4 · react-router |
| i18n | i18next (`en` `it` `de` `fr` `es` `ru` `zh` `ja` `ko` `pt`) |
| Physics | Pure TypeScript SI in `src/lib/physics/` (no React) |
| Snippets | Idiomatic multi-lang export in `src/lib/snippets/` |
| Agents | MCP SDK · Vercel serverless (`/api/mcp`) · Agent Skill |
| Social | `@vercel/og` dynamic cards · static OG pipeline |

## Architecture

```
Browser / agent
  │
  ├─► sidus.tools UI          → ToolShell + catalog search/filters
  │         │
  │         └─► lib/physics   → pure SI (no React, unit-tested)
  │
  ├─► /api/mcp                → Streamable HTTP MCP (same math)
  │
  ├─► /api/og                 → 1200×630 brand cards (static + live)
  │
  └─► skills/sidus            → Agent Skill instructions
```

### Source layout

```
src/
  components/shared/    ToolShell, fields, results
  components/tools/     One page per calculator
  components/site/      Header, footer, home, catalog
  lib/physics/          Pure SI models + golden cases
  lib/snippets/         Multi-lang code export
  lib/og/               OG payload / catalog
  data/                 Tool catalog, sources, precision
  i18n/locales/         All UI strings
api/                    Vercel handlers (MCP, OG)
mcp/                    Shared MCP server (HTTP + stdio)
skills/sidus/           Agent Skill (SKILL.md)
public/                 robots, sitemap, llms, logos, favicon
```

## Develop

```bash
npm install
npm run dev          # Vite dev server
npm run build        # type-check + production build
npm run type-check
npm test
npm run llms:gen     # regenerate public/llms.txt
npm run godbolt:matrix
```

| Script | Purpose |
| ------ | ------- |
| `npm run mcp` | Local MCP over stdio |
| `npm run mcp:http` | Local MCP HTTP smoke |
| `npm run mcp:smoke` | Stdio smoke tests |
| `npm run og:static` | Static OG SVG/PNG pipeline |
| `npm run docs:check` | Doc consistency checks |

## Principles

1. **Maximum reuse** — shared chrome only; tools never re-invent inputs/results.
2. **i18n everywhere** — every user-facing string goes through `t(...)`.
3. **Pure physics** — `lib/physics/` has no React, no DOM, no side effects.
4. **Idiomatic snippets** — no free-function shims; each language feels native.
5. **Theme tokens only** — no raw hex in components.
6. **Catalog hygiene** — catalog/URL changes update `sitemap.xml` + `llms:gen`.
7. **Educational honesty** — models are for learning; not flight certification.

## Documentation

| Doc | Purpose |
| --- | ------- |
| **[INDEX.md](INDEX.md)** | Full documentation map |
| **[CONVENTIONS.md](CONVENTIONS.md)** | Coding, tests, i18n, catalog, SEO |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | How to contribute / PR workflow |
| **[AGENTS.md](AGENTS.md)** | Short agent entrypoint |
| **[skills/sidus/SKILL.md](skills/sidus/SKILL.md)** | Installable Agent Skill |
| **[mcp/README.md](mcp/README.md)** | MCP remote + stdio |
| **[LICENSE.md](LICENSE.md)** / [LICENSE](LICENSE) | MIT |

Public indexes: [`public/llms.txt`](public/llms.txt) · [`public/robots.txt`](public/robots.txt) · [`public/sitemap.xml`](public/sitemap.xml)

## Open Graph

Homepage-dark cards (safe zone, large type, mono formula):

| URL | Card |
| --- | ---- |
| `/api/og?page=home` | Default SIDUS brand |
| `/api/og?tool=hohmann` | Tool + formula (static) |
| `/api/og?tool=hohmann&h1=200&h2=35786&hu=km&body=earth` | **Live results** (Δv, TOF, …) |

Details: [`docs/OG_IMAGES.md`](docs/OG_IMAGES.md).

## License

[MIT](LICENSE) — free to use, modify, and share.

**Disclaimer:** Educational pure-SI models. **No affiliation** with NASA, ESA, SpaceX, Roscosmos, CNSA, JAXA, ISRO, ASI, DLR, CNES, KARI, AEB, or any other agency or company. Not flight software. Provided as-is without warranty.

---

<p align="center">
  <a href="https://sidus.tools">sidus.tools</a>
  ·
  <a href="https://github.com/massimodeluisa">GitHub</a>
  ·
  <a href="https://x.com/massimodeluisa">X</a>
  ·
  <a href="https://massimo.deluisa.bio">massimo.deluisa.bio</a>
</p>
