# Snippet quality standard (mandatory)

Project-wide rules: [CONVENTIONS.md](../../../CONVENTIONS.md) ·
[CONTRIBUTING.md](../../../CONTRIBUTING.md) · [INDEX.md](../../../INDEX.md).

Every tool ships **hand-written, idiomatic** snippets, authored in pure SI,
for **all** `CodeLang` keys: `c`, `cpp`, `rust`, `zig`, `python`,
`javascript`, `typescript`, `matlab`, `julia`, `fortran`, `latex`.

Authorship and numeric verification are separate claims. The authorship
claim above (hand-written, idiomatic, pure SI) holds for every tool and
every `CodeLang` key. The numeric verification claim, that a snippet's
printed output matches shipped `src/lib/physics`, holds only for the
tools listed in
[docs/verify-matrix/report.md](../../../docs/verify-matrix/report.md).
A tool without expected values there is never described as passing.

LaTeX snippets are display-math fragments, not standalone documents. CI
verifies they compile when wrapped in the standard preamble against a
cached Tectonic bundle, not that they are correct or complete documents
on their own.

`--require-all` means every tool with expected values passes in every
available language and LaTeX compiles; skips are reported explicitly and
never counted as passing.

## Forbidden

- `makeSnippet` / Python→systems auto-transpilation
- Rust free-function shims (`fn abs_f`, `fn sqrt(x: f64)`, …)
- Broken method chains, leftover `math.` in systems langs
- Silent deps (list them in `deps` when a library is required)
- Hard-coded UI strings outside i18n (not applicable to snippet math bodies)

## Language rules

| Lang | Style |
|------|--------|
| **Python** | `import math`; `math.sqrt`, `**`, clear names |
| **JavaScript** | `const`, `Math.*`, `**` or `Math.pow` |
| **TypeScript** | same as JS with `: number` on locals where natural |
| **C** | `#include <math.h>`, `const double`, `fabs`, `M_PI`, `pow` |
| **C++** | `#include <cmath>`, `const double`, `std:` optional, same math as C |
| **Rust** | `let x = …;`, **methods**: `(expr).sqrt()`, `.abs()`, `.sin()`, `.powi(2)`, `.powf(e)`, `.hypot(y)`, `.atan2(x)`, `std::f64:consts:PI`: **no** wrapper fns, **no** bare free `sqrt(` |
| **Zig** | `const std = @import("std");`, `std.math.sqrt/sin/…`, `@abs`, `@as(f64, …)` on float lits when needed for `std.math` |
| **Fortran** | `program` / `implicit none`, `real(kind=8)`, `**`, intrinsic `sqrt/sin/abs` |
| **MATLAB** | native `sqrt`, `pi`, `^`, no `math.` |
| **Julia** | native `sqrt`, `π` or `pi`, `atan(y,x)` not `atan2` |
| **LaTeX** | display math of the governing equations only |

## Physics / free vars

- Match the tool’s pure physics (`src/lib/physics/**`) and UI free vars injected by `liveValues`.
- Pure SI only (m, s, kg, rad unless the symbol is clearly degrees with a convert step).
- Prefer the same symbol names as the educational Python/docs when they are free vars.

## File layout

One module per `formulaId`:

```
src/lib/snippets/tools/<formulaId>.ts
```

Export `export const <camel>Snippets: FormulaSnippet = { … }`.

## Fragments, not full programs

Bodies are **formula fragments**. `wrapAsRunnable` / Godbolt inject live free vars
and wrap `main` / `#include` / `program`. Do **not** ship a full `fn main`,
`#include` stack, or `program … end program` unless the tool truly needs helpers
outside main (rare; e.g. multi-function units).

- **Rust**: only `let …;` formula lines (methods on `f64`).
- **Zig**: only `const …;` formula lines; `@import("std")` is injected if missing.
  Prefer `@sqrt` / `std.math.*` as appropriate for Zig 0.14 CE.
- **C/C++**: `const double …;` formula lines; includes injected.
- **Fortran**: executable assigns only (`mu = …`); decls injected.
- **Python/JS/TS/Julia/MATLAB**: normal educational script body (imports OK).

## Verification (per tool)

1. `npx tsc --noEmit` (or project `npm run type-check`)
2. Vitest parity / liveValues tests if they cover the id
3. Optional: `npx tsx scripts/godbolt-matrix.ts --langs=python,javascript,c,rust --filter=<id>` when filter supported; else run matrix and inspect that tool
