# Agents: SIDUS

Entrypoint for agentic tooling on **[sidus.tools](https://sidus.tools)**.

## Read these first (mandatory)

| Doc | Why |
|-----|-----|
| **[CONVENTIONS.md](./CONVENTIONS.md)** | Code, tests, i18n, catalog, robots/sitemap/llms, snippets |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | PR / contribution workflow |
| **[INDEX.md](./INDEX.md)** | Full documentation map |
| **[skills/sidus/SKILL.md](./skills/sidus/SKILL.md)** | Agent Skill (MCP + pure-SI calculators) |
| **[LICENSE.md](./LICENSE.md)** | MIT + educational disclaimer |
| **[src/lib/snippets/QUALITY.md](./src/lib/snippets/QUALITY.md)** | Multi-lang export quality |

Follow **CONVENTIONS.md** for every change. This file is a short checklist only.

## Language policy

- **Source code, comments, Markdown, commits: English only.**
- **User-facing strings only via `t(...)`**: locales under `src/i18n/locales/`.
- Locales: `en`, `it`, `de`, `fr`, `es`, `ru`, `zh`, `ja`, `ko`, `pt`.
- Numbers: `src/lib/localeNumber.ts` (active i18n language).

## Stack

React 19 + Vite + TypeScript + Tailwind v4 · react-router · i18next · pure SI in
`lib/physics/` · snippets in `lib/snippets/` · shared UI in `components/shared/`.

## Non-negotiables

1. Every user-facing string through `useTranslation().t(...)`.
2. New i18n key → update **all** locale files (EN first).
3. Shared UI only in `components/shared/`: tools use `ToolShell` + field/result components.
4. Pure physics in `lib/physics/`: no React.
5. Snippets: idiomatic all langs; no Rust free-function shims (`abs_f`, …).
6. Theme tokens only: no raw hex in components.
7. After catalog/URL changes: `public/sitemap.xml` + `npm run llms:gen`.
8. Keep tests green: `npm run type-check` && `npm test`.

## Footer / legal

- No affiliation with NASA, ESA, SpaceX, Roscosmos, CNSA, JAXA, ISRO, ASI, DLR, CNES, KARI, AEB, …
- 100% open source, non-profit · MIT
- Made with ❤️ by Massimo De Luisa → https://massimo.deluisa.bio

## Commands

```bash
npm install
npm run dev
npm run build
npm run type-check
npm test
npm run llms:gen
npm run godbolt:matrix
```
