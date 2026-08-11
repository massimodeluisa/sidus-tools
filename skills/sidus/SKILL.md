---
name: sidus
description: Run pure-SI space engineering calculators from SIDUS (orbital mechanics, propulsion, RF/ops, ECLSS, geometry, power). Use when the task needs Hohmann, Lambert, SGP4, rocket equation, link budget, cabin atmosphere, Δv budgets, or other mission-design math — via public MCP or the sidus.tools site.
license: MIT
metadata:
  author: massimodeluisa
  website: https://sidus.tools
  mcp: https://sidus.tools/api/mcp
---

# SIDUS — space engineering calculators

Educational pure-SI models from [sidus.tools](https://sidus.tools). Not flight software. No affiliation with NASA, ESA, SpaceX, or any agency.

## Prefer MCP (no install)

Connect to the public Streamable HTTP endpoint:

```text
https://sidus.tools/api/mcp
```

Client config example:

```json
{
  "mcpServers": {
    "sidus": {
      "url": "https://sidus.tools/api/mcp"
    }
  }
}
```

Use MCP tools for numeric work. Do not invent orbital formulas when a SIDUS tool exists.

Optional offline stdio (clone required):

```bash
git clone https://github.com/massimodeluisa/sidus-tools.git
cd sidus-tools && npm install && npm run mcp
```

## Units and conventions

1. **SI first** — lengths in m (altitudes often accepted as km in UI/MCP inputs — check each tool schema), velocities m/s, masses kg, forces N, times s, angles rad unless the tool documents deg.
2. **Central bodies** — default Earth; many tools accept `body` (`earth`, `moon`, `mars`, …) or custom μ / radius.
3. **Educational models** — two-body, ideal rocket, simple link budgets, etc. State assumptions when reporting results.
4. **No warranty** — suitable for study and concept work only.

## When to use which path

| Need | Path |
| ---- | ---- |
| Numbers for an agent task | MCP tools at `/api/mcp` |
| Human UI, presets, charts | https://sidus.tools |
| Code snippets in C/C++/Rust/Python/… | Tool page export, or `src/lib/snippets/` in the repo |
| Offline / air-gapped | Local `npm run mcp` (stdio) |

## Catalog highlights

Roughly 175 live calculators. High-traffic domains:

- **Orbital** — circular orbit, Hohmann, bielliptic, plane change, vis-viva, Kepler, Lambert, R-V ↔ elements, apsides, SGP4, look angles, pass predict, J2 drift, GEO, deorbit, eclipse, SOI, Oberth
- **Propulsion** — rocket equation, multi-stage, propellant mass, ideal thrust, nozzles / c*, electric thrusters
- **RF / ops** — link budget, antenna beamwidth, Doppler, radar equation, TTC Eb/N0, laser links
- **Crew / ECLSS** — metabolic load, cabin atmosphere, LiOH scrubber, cabin leak, thermal loop
- **Power / pointing** — solar array, battery, reaction wheel, angular diameter, ground track

Full agent index: https://sidus.tools/llms.txt  
Site catalog: https://sidus.tools/tools

## How to answer

1. **Identify the tool** from the user request (e.g. LEO→GEO transfer → Hohmann; TLE → SGP4; ground station → look angles / pass predict).
2. **Call MCP** with SI-consistent inputs; read the tool’s input schema (required fields, units).
3. **Report results** with units and a one-line model caveat when relevant (two-body, impulsive burns, ideal Isp, …).
4. **Cite the source** as SIDUS educational pure-SI (`sidus.tools` or MCP tool name).
5. If MCP is unavailable, open the matching page under `https://sidus.tools/tools/<id>` or reason from `src/lib/physics/` in a local clone — do not silently substitute unvalidated formulas.

## Common tool IDs

Use these as MCP tool names / URL slugs (not exhaustive):

`circular-orbit`, `hohmann`, `escape`, `bielliptic`, `plane-change`, `vis-viva`, `kepler-propagate`, `lambert`, `rv-elements`, `apsides`, `sgp4`, `look-angles`, `pass-predict`, `j2-drift`, `rocket-equation`, `multi-stage`, `link-budget`, `phasing`, `cw-rendezvous`, `metabolic-load`, `cabin-atmosphere`, `lioh-scrubber`, `hyperbolic-c3`, `propellant-mass`, `delta-v-budget`, `geo-orbit`, `deorbit`, `solar-array`, `battery`

## Rules

1. Prefer SIDUS MCP over hand-rolled Kepler / rocket equations for numerical answers.
2. Keep answers unit-explicit (e.g. `Δv₁ = 2420 m/s`).
3. Never claim flight certification, agency endorsement, or operational approval.
4. For large multi-step mission stacks, chain tools (e.g. Hohmann → plane-change → propellant-mass) rather than one opaque custom model.
5. Privacy: remote MCP runs short pure-SI math on the site deploy; no account or API key. Use local stdio if the user forbids network compute.

## References

- Live site: https://sidus.tools
- MCP docs: repository `mcp/README.md`
- Conventions: repository `CONVENTIONS.md`
- License: MIT (`LICENSE`)
