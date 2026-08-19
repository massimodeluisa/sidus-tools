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
- **systems**: reaction wheel momentum, EPS orbit-average power, panel EOL power, magnetorquer moment, battery DoD, cryogen boiloff, residual dipole torque
- **sgp4**: SGP4/SDP4 TLE propagation vs published AIAA 2006-6753 verification vectors (tcppver.out; satellite.js)

## Adding a case

1. Derive `expected` **without** calling SIDUS (or use a published band with loose `relTol`).
2. Set `got: () => shippedFn(...)`.
3. Cite source class in `source` (Curtis / Vallado / JPL / ITU / OCHMO…).
4. Prefer tight `relTol` (1e-12…1e-15) for algebraic identities; wider for textbook “class” numbers.

## Coverage inventory (2026-08-19)

Method: a tool page counts as anchored only if a physics function its component calls is exercised by a golden case or a physics unit test. This is function-level coverage. It does not certify the exact numeric scenario shown on each page, and it is not a marketing claim.

Do not claim test coverage for these tool pages (no golden case or physics unit test exercises their physics functions):

| Tool id | Physics function | Note |
|---------|------------------|------|
| `plotter` | none | expression compiler unit test (not a physics golden) |

Regenerate this list when tools or tests change: map each tool component's `lib/physics` imports against the functions referenced in `golden/cases.ts` and `src/lib/physics/*.test.ts`.

## What this is not

Educational two-body teaching models. Not flight certification, and not a match to GMAT or STK ephemerides. SGP4 golden cases verify the shipped satellite.js propagator against the published AIAA 2006-6753 verification vectors; they do not certify operational conjunction or reentry products.
