# CONTRIBUTIONS: SIDUS

Thank you for contributing to **[sidus.tools](https://sidus.tools)**: open-source, non-profit educational space-engineering tools.

> Full coding rules live in **[CONVENTIONS.md](./CONVENTIONS.md)**.  
> Doc map: **[INDEX.md](./INDEX.md)**. License: **[LICENSE.md](./LICENSE.md)**.

---

## Code of conduct (practical)

- Be respectful and technical.
- No harassment, spam, or off-topic legal threats.
- Educational physics only: do not present SIDUS as flight-certified.

---

## Before you start

1. Read [CONVENTIONS.md](./CONVENTIONS.md) and [AGENTS.md](./AGENTS.md).
2. Fork / branch from an up-to-date `main`.
3. Install and verify:

```bash
npm install
npm run type-check
npm test
npm run dev
```

---

## What to contribute

| Welcome | Needs discussion first |
|---------|------------------------|
| Bug fixes with tests | New external paid APIs |
| New pure-SI tools matching existing patterns | Breaking SI / units redesign |
| i18n completions for supported locales | New locales beyond agency set |
| Docs, sources, precision notes | Rebrand / commercial claims |
| Snippet quality (idiomatic multi-lang) | Closed-source dependencies |
| Accessibility / a11y | Scraping private agency data |

---

## Workflow

1. **Issue** (optional but preferred) for non-trivial features.
2. **Branch:** `fix/…`, `feat/…`, `docs/…`.
3. **Implement** following CONVENTIONS (i18n, pure SI, shared UI, snippets).
4. **Update maintenance surfaces** when the catalog or public site changes:
   - tests
   - locale files (all languages)
   - `public/sitemap.xml`
   - `npm run llms:gen` → `public/llms.txt`
   - `public/robots.txt` only if crawler policy changes
5. **Verify:**

```bash
npm run type-check
npm test
# optional for snippet / systems-lang work:
npm run godbolt:matrix
```

6. **PR** to `main`:
   - English description: *what* and *why*
   - Checklist from CONVENTIONS §10 filled
   - Screenshots for UI changes
   - Link related issue

---

## Adding a new tool (summary)

1. Physics in `src/lib/physics/` (+ tests).  
2. UI in `src/components/tools/YourTool.tsx` using `ToolShell` / shared fields.  
3. Register in `src/data/tools.ts` + `ToolRenderer.tsx`.  
4. Snippets for all languages ([QUALITY.md](./src/lib/snippets/QUALITY.md)).  
5. Precision + sources if applicable.  
6. i18n keys for every user-visible string.  
7. Sitemap + `llms:gen`.  

Details: CONVENTIONS §5-7.

---

## Translations

- EN (`src/i18n/locales/en.ts`) is the schema (`TMessages`).
- Every PR that adds a key **must** update **all** locale files:
  `en`, `it`, `de`, `fr`, `es`, `ru`, `zh`, `ja`, `ko`, `pt`.
- Do not leave new keys English-only in non-EN files.
- Number formatting follows the active locale (see `localeNumber.ts`).

---

## Snippets & Godbolt

- Hand-written idiomatic multi-lang only (no Python→Rust wrapper shims).
- Prefer running Godbolt matrix on touched tools before merge when changing
  export bodies.

---

## License of contributions

By submitting a contribution you agree it is licensed under the same **MIT**
terms as the project ([LICENSE.md](./LICENSE.md)), and that you have the right
to submit it.

---

## Security

Do not open public issues for unfixed critical vulnerabilities if they could
harm users; contact the maintainer via
[massimo.deluisa.bio](https://massimo.deluisa.bio).

---

## Maintainer

- **Massimo De Luisa**: [massimo.deluisa.bio](https://massimo.deluisa.bio)  
- Repo: [github.com/massimodeluisa/sidus-tools](https://github.com/massimodeluisa/sidus-tools)
