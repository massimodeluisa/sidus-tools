# CONVENTIONS: SIDUS

**Mandatory coding and maintenance rules** for humans and agents working on
[sidus.tools](https://sidus.tools).

Related: [CONTRIBUTING.md](./CONTRIBUTING.md) · [INDEX.md](./INDEX.md) ·
[LICENSE.md](./LICENSE.md) · [AGENTS.md](./AGENTS.md) ·
[src/lib/snippets/QUALITY.md](./src/lib/snippets/QUALITY.md)

---

## 1. Language & i18n

| Rule | Detail |
|------|--------|
| Source tree language | **English only**: code, comments, Markdown, commits, PR titles |
| User-facing copy | **Only** via `useTranslation().t('…')` / i18n keys |
| Locale files | `src/i18n/locales/*.ts`: **EN is source of truth** (`TMessages`) |
| Supported locales | `en`, `it`, `de`, `fr`, `es`, `ru`, `zh`, `ja`, `ko`, `pt` |
| New string | Add key to `en.ts` first, then **every** locale file |
| Numbers in UI | Locale-aware via `src/lib/locale-number.ts` + active i18n language |
| URL numbers | Search params stay **invariant** (dot decimal) |

**Forbidden:** hard-coded English (or any language) labels, hints, buttons,
empty states, or ResultCard labels in components.

---

## 2. Architecture layers

```
src/components/tools/*     → React UI only (ToolShell, ParamsGrid, …)
src/components/shared/*    → Shared field / result chrome only
src/lib/physics/*          → Pure SI math: NO React, NO i18n imports
src/lib/snippets/*         → Multi-lang educational code export
src/data/*                 → Catalog metadata (tools, sources, precision)
src/i18n/*                 → Messages only
```

| Do | Don’t |
|----|--------|
| `ToolShell` + `UiUnitField` / `UiField` / `ResultCard` | Duplicate field/result markup per tool |
| Physics functions return SI | Mix UI units into physics cores |
| Snippets in `lib/snippets/tools/<id>.ts` or hand-written modules | Silent `makeSnippet` / Rust `abs_f` wrappers |
| Theme tokens (`bg-bg`, `text-muted`, `border-border`) | Raw hex colors in components |

---

## 3. Pure SI & units

- Physics library: **SI base** (m, s, kg, rad, Pa, K, …).
- UI: display units via `UiUnitField` / `ResultCard` + `toSi` / `fromSi` / `convertById`.
- Conversion at the **edge** only; export live values as SI when injected into snippets.

---

## 4. Code export snippets

Full rules: [src/lib/snippets/QUALITY.md](./src/lib/snippets/QUALITY.md).

Summary:

- All 11 languages: `c`, `cpp`, `rust`, `zig`, `python`, `javascript`,
  `typescript`, `matlab`, `julia`, `fortran`, `latex`
- **Fragments** (no full `main` / includes unless rare helpers): `wrapAsRunnable` wraps
- **Rust:** method style `(x).sqrt()`, `.abs()`: **never** free-function shims
- Register in `src/lib/snippets/index.ts` (via wave re-exports or direct import)
- Library tools declare `deps` with URLs

### Every language moves with the formula

A change to a tool's formula, units, argument order, frame, time scale,
validity condition, or result names updates **every** language body for that
`formulaId` in the same change. The set is `CodeLang` in
`src/lib/snippets/types.ts`.

Do not edit one language and leave the others on the old formula. Do not
ship a different formula in another language under the same assumptions.

A language that cannot honestly implement the formula is omitted on purpose.
The module says why, and a test locks the omission. SGP4 is the current
case: JavaScript, TypeScript, and Python call satellite.js / python-sgp4.
C, C++, Rust, Zig, Fortran, MATLAB, Julia, and LaTeX are omitted because a
Kepler mean-motion proxy is not SGP4 and must not inherit a TEME claim.

Before the change is done:

1. Every shipped language for that `formulaId` has a body, or the omission
   is named by a test.
2. Run the snippet verifier on each touched tool that has expected values:

```bash
npx tsx scripts/verify-snippets.ts --require-all \
  --tools=<formulaId> \
  --langs=c,cpp,rust,zig,python,javascript,typescript,matlab,julia,fortran,latex
```

   A `skip-*` is not a pass. `--require-all` fails the run when a shipped
   language was not executed.
3. A library-backed snippet the numeric matrix cannot execute (SGP4) has a
   test that runs the rendered source and compares it to `src/lib/physics`.
4. LaTeX display math is part of the set. Update it when the governing
   equation changes. The verifier compiles it when a TeX engine is available.

---

## 5. Catalog & data consistency

When adding or renaming a tool:

| Artifact | Update |
|----------|--------|
| `src/data/tools.ts` | `id`, `category`, `title`, `description`, `tags`, `formulaId`, `status`, `sourceIds` |
| `src/data/tool-dates.ts` | `created`, `updated` ISO 8601 dates (YYYY-MM-DD), merged onto `ToolMeta` |
| `src/components/tools/*Tool.tsx` | Implementation |
| `src/components/tools/ToolRenderer.tsx` | Lazy map entry |
| `src/lib/snippets/` | Snippets for `formulaId` |
| `src/data/precision.ts` | Precision class if formula tool |
| `src/data/sources.ts` | Sources if new references |
| `src/lib/tags.ts` | Canonical tags if new |
| i18n | Titles/descriptions if exposed via keys; at least fields used by the tool |
| `public/llms.txt` | `npm run llms:gen` |
| `public/sitemap.xml` | Add tool URL (keep absolute production hosts) |
| OG | `src/lib/og/catalog.ts` if custom card formula |

---

## 6. Tests (keep green)

| Command | Purpose |
|---------|---------|
| `npm run type-check` | TypeScript |
| `npm test` | Vitest (physics, snippets, layout, locale numbers, …) |
| `npx tsx scripts/verify-snippets.ts --require-all --tools=<id>` | Execute every language export you changed and compare it to physics |
| `npm run godbolt:matrix` | Optional pure-SI compile smoke (py/js/c) |
| `npm run godbolt:matrix:all` | Full Godbolt matrix |
| `npm run mcp:smoke` / `mcp:smoke:http` | MCP smoke |

**Rules:**

- New physics: add golden / unit tests under `src/lib/physics/*.test.ts` or `golden/`
- New locale number / liveValues behavior: unit tests
- Snippet ports: parity / liveValues tests when free-var or wrap changes
- A formula or export change updates every language body for that tool, then
  the verifier above (or the SGP4 execution test) is run on those bodies
- Do not land with failing `type-check` or `npm test`

---

## 7. Indexes, robots, agents SEO

| File | Role | How to update |
|------|------|----------------|
| `public/robots.txt` | Allow SEO + AI crawlers; absolute Sitemap | Edit carefully; keep `Sitemap: https://sidus.tools/sitemap.xml` |
| `public/sitemap.xml` | Tool + page URLs | Add every public route / tool id |
| `public/llms.txt` | LLM/agent catalog | Prefer `npm run llms:gen` after catalog changes |
| `AGENTS.md` | Agent entrypoint | Keep short; point here for detail |
| `INDEX.md` | Human doc map | Add new top-level docs |

After deploy, verify:

- `https://sidus.tools/robots.txt`
- `https://sidus.tools/sitemap.xml`
- `https://sidus.tools/llms.txt`

---

## 8. Git & PRs

- Commits: **English**, imperative, focused (`fix:`, `feat:`, `docs:`, …)
- No force-push to `main` without explicit owner approval
- No secrets in repo
- Do not commit `node_modules/`, local junk, or large binary dumps
- Untracked junk (e.g. accidental binaries) stays out of commits

---

## 9. Legal & voice

- **MIT**: see [LICENSE.md](./LICENSE.md)
- Footer disclaimer: no affiliation with NASA, ESA, SpaceX, Roscosmos, CNSA,
  JAXA, ISRO, ASI, DLR, CNES, KARI, AEB, CelesTrak™, or any agency/company
- Voice: open-source educational tools, pure SI, non-profit. Avoid “industrial product” branding.

### Prose (no AI filler)

- **No em dash (Unicode U+2014)** in product copy or docs. Prefer periods, commas, or colons.
- **No strawman antithesis.** Do not write “X is not because of Y. X is because of Z” when nobody claimed Y. Write “X is because of Z.”
- Avoid filler: “not only… but also”, “whether you’re…”, “it’s important to note”, “leverage”, “seamless”, “robust” as empty intensifiers.
- Legal limits stay factual and short: “No affiliation with …”, “Educational models. Not flight software.”

---

## 10. Pre-merge checklist (apply every time)

- [ ] `npm run type-check` passes  
- [ ] `npm test` passes  
- [ ] New/changed UI strings → all locale files  
- [ ] New tool → catalog + ToolRenderer + snippets + sitemap + `llms:gen`  
- [ ] Physics pure SI; no React in `lib/physics`  
- [ ] Snippets: all langs, no Rust wrapper shims  
- [ ] Formula or export change: every language body for that tool updated, or an omission locked by a test  
- [ ] Verifier `--require-all` run on every changed tool that has expected values, all 11 langs  
- [ ] Library-backed exports (SGP4) executed against `src/lib/physics`  
- [ ] Docs touched if conventions / public indexes change  
- [ ] No hard-coded UI copy left in the change set  

---

## 11. File naming

| Area | Convention |
|------|------------|
| React components | `PascalCase.tsx`, named after the file's primary exported component; tools match their kebab-case catalog `id` |
| All other source files | `kebab-case.ts` / `kebab-case.tsx` (hooks, layers, workers, physics, data, tests) |
| Snippet tools | `src/lib/snippets/tools/<formulaId>.ts` |
| Locales | ISO 639-1 short codes: `en.ts`, `ko.ts`, … |
| Docs | `SCREAMING` or `Title` for top-level policy docs |

---

*If a rule here conflicts with a one-off comment in code, this file wins: update the code or amend this document in the same PR.*
