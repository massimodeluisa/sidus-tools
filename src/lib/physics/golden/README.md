# Golden-case matrix

Engineer-grade regression anchors for SIDUS pure-SI physics.

## Run

```bash
npm test -- src/lib/physics/golden-cases.test.ts
# or full suite
npm test
```

CI fails if any case exceeds its tolerance.

## Layout

| File | Role |
|------|------|
| `types.ts` | Case / check schema + default relative tolerances per domain |
| `cases.ts` | All golden scenarios (expected from independent formulas; `got` from shipped exports) |
| `../golden-cases.test.ts` | Vitest runner |

## Domains

- **two-body**: circular, escape, vis-viva, energy, multi-body catalog
- **maneuvers**: Hohmann, bielliptic, plane change, GEO, circularize, Gauss
- **hyperbolic**: C3, departure, turn angle
- **planetary**: heliocentric Hohmann, synodic, patched conic, surface access
- **geometry**: great circle, ENU el/az, vectors
- **propulsion**: Tsiolkovsky, stages, thrust
- **link-rf**: FSPL, link budget
- **mission**: μ, g, SOI, light-time, eclipse
- **ops-aero**: Sutton-Graves, solar array, RCS
- **eclss**: metabolic, LiOH

## Adding a case

1. Derive `expected` **without** calling SIDUS (or use a published band with loose `relTol`).
2. Set `got: () => shippedFn(...)`.
3. Cite source class in `source` (Curtis / Vallado / JPL / ITU / OCHMO…).
4. Prefer tight `relTol` (1e-12…1e-15) for algebraic identities; wider for textbook “class” numbers.

## What this is not

Educational two-body teaching models. Not flight certification, and not a match to GMAT or STK ephemerides.
