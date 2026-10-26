# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`1.0.0` matches `package.json` and the MCP `serverInfo.version` in `mcp/create-server.ts`. The date below is TODO until the tag is created. This file does not create that tag.

## [Unreleased]

### Fixed

- Labeled the SGP4 position TEME and stated that UTC is used as UT1.

## [1.0.0] - TODO

### Added

- 201 pure-SI calculators. Counted as 201 `id` entries in `src/data/tools.ts` (all `status: 'live'`), 201 `/tools/` URLs in `public/sitemap.xml`, and the `201 tools` note in `public/llms.txt`.
- UI in 10 languages: English, Italian, German, French, Spanish, Russian, Chinese, Japanese, Korean, and Portuguese (`src/i18n/index.ts`).
- Code export for the 11 ids in `src/lib/snippets/types.ts`: C, C++, Rust, Zig, Python, JavaScript, TypeScript, MATLAB, Julia, Fortran, and LaTeX. The README groups JavaScript and TypeScript as one label, JS/TS, and calls that set 10 programming languages.
- Public MCP endpoint `https://sidus.tools/api/mcp` (streamable HTTP, no auth) and a local stdio server (`npm run mcp`). Agent Skill at `skills/sidus/SKILL.md`.
- No accounts. The site and the public MCP do not ask for one.
- `server.json` for the Official MCP Registry (`io.github.massimodeluisa/sidus-tools`, version `1.0.0`). Not published from this changelog.

[1.0.0]: https://github.com/massimodeluisa/sidus-tools/releases/tag/v1.0.0
