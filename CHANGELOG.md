# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`1.0.0` matches `package.json` and the MCP `serverInfo.version` in `mcp/create-server.ts`. The date below is TODO until the tag is created. This file does not create that tag.

## [Unreleased]

### Added

- Added the crew water loop and resupply calculator.

### Fixed

- Rejected out-of-range inputs for Kepler, GNSS delay, look angles, solar sail, battery depth of discharge, umbra, Hill radius, Edelbaum, GEO drift, and circular-orbit perigee rate.
- Made exports follow the selected mode for elements, the rocket equation, circularize, plane change, and repeating ground track.
- Used expm1 and log1p for a tiny delta-v and a near-unity mass ratio.
- Corrected Neptune GM, Mercury radius, the launch-site boost, porkchop sampling, and pass Doppler.
- Named the GNSS delay models, porkchop epoch, and flyby MCP sketch, and translated the battery and solar-array labels.
- Labeled the SGP4 position TEME and stated that UTC is used as UT1.
- Removed the MATLAB, Julia, and LaTeX Kepler proxies from the SGP4 export.
- Kept short and long way in Lambert exports and refused a transfer that did not converge.
- Replaced the GNSS DOP snippet proxy with the diagonal of (H^T H)^-1.
- Aligned MCP tool arguments with the library and named the frame on SGP4, Lambert, look angles, and GNSS DOP.
- Stripped TypeScript tuple annotations so snippet exports run on plain JavaScript.
- Rejected a frozen orbit whose periapsis intersects the body.

### Changed

- Required a formula change to update every language export for that tool.
- Described frozen orbit as J2+J3 and Molniya as Kepler at critical inclination.

## [1.0.0] - TODO

### Added

- 201 pure-SI calculators. Counted as 201 `id` entries in `src/data/tools.ts` (all `status: 'live'`), 201 `/tools/` URLs in `public/sitemap.xml`, and the `201 tools` note in `public/llms.txt`.
- UI in 10 languages: English, Italian, German, French, Spanish, Russian, Chinese, Japanese, Korean, and Portuguese (`src/i18n/index.ts`).
- Code export for the 11 ids in `src/lib/snippets/types.ts`: C, C++, Rust, Zig, Python, JavaScript, TypeScript, MATLAB, Julia, Fortran, and LaTeX. The README groups JavaScript and TypeScript as one label, JS/TS, and calls that set 10 programming languages.
- Public MCP endpoint `https://sidus.tools/api/mcp` (streamable HTTP, no auth) and a local stdio server (`npm run mcp`). Agent Skill at `skills/sidus/SKILL.md`.
- No accounts. The site and the public MCP do not ask for one.
- `server.json` for the Official MCP Registry (`io.github.massimodeluisa/sidus-tools`, version `1.0.0`). Not published from this changelog.

[1.0.0]: https://github.com/massimodeluisa/sidus-tools/releases/tag/v1.0.0
