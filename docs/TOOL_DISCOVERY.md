# Tool discovery backlog

**Date:** 2026-08-11 (pass 2 expanded)  
**Scope:** Pure-SI educational calculators fit for SIDUS (browser, no backend math).  
**Sources:** Catalog (`src/data/tools.ts`), agency OSS portals (NASA code.nasa.gov, ESA RF/downstream OSS, Libre Space), smallsat propulsion surveys, GEO propellant-budget literature, GNSS open stacks (GNSS-SDR, GPS-SDR-SIM), optical ground-station communities.

Related: [AGENCY_OPEN_SOURCE_SURVEY.md](./AGENCY_OPEN_SOURCE_SURVEY.md), [ENGINEERING_TOOLS_SURVEY.md](./ENGINEERING_TOOLS_SURVEY.md), [CONVENTIONS.md](../CONVENTIONS.md).

---

## Catalog snapshot

About **175** live tools (2026-08-11 discovery waves A–C + pass 3–4), strong coverage in:

- Two-body orbits / transfers / J2 / SGP4 / look angles  
- Rocket equation / multi-stage / ideal thrust / propellant mass  
- RF link budget / beamwidth / diffraction  
- ECLSS basics / thermal loop / solar array  

Gaps below are **not yet** first-class tools (or only partial via plotter/units).

---

## Priority tiers

### P0: High value, pure SI, clear formulas (next build wave)

| Candidate id | Domain | Inputs → outputs (sketch) | Why / refs |
|--------------|--------|---------------------------|------------|
| `isentropic-nozzle` | Rocket engines | γ, R, Tc, pe/pc, At → ve, Isp, ṁ, Ae/At (choked isentropic) | Standard nozzle design teaching; NASA GRC / Sutton |
| `rocket-thrust-chamber` | Engines | pc, At, pe, Cf, c* → F, Isp | Complements ideal-thrust; chamber design chain |
| `mixture-ratio` | Propellants | ṁ_ox, ṁ_fuel or OF → r, total ṁ | LOX/LH2, hypergolics education |
| `tank-ullage` | Propellants | V_tank, fill fraction, ρ, p → m, residual | Propellant management |
| `gnss-pseudorange` | GPS / GNSS | t_tx, t_rx, c, clock bias → ρ | ESA/GPS teaching; pairs with light-time |
| `gnss-geometry-gdop` | GPS | LOS unit vectors to N sats → GDOP/PDOP/HDOP/VDOP | Navigation geometry pure SI |
| `laser-pointing-jitter` | Laser / pointing | σ_θ, range → spot radius, irradiance dilution | Optical comms / laser ranging |
| `laser-link-budget` | Laser / RF-adjacent | Pt, ηt, ηr, Gt, Gr, λ, R, L → Pr, margin | Optical freefree-space (like Friis with λ²) |
| `free-fall-time` | Entry / ballistic | h, g or μ,R → t_ff, v_impact (constant g or 1/r²) | Launch abort / drop tests |
| `ballistic-range` | Ballistics | v0, γ, g → range, TOF (flat Earth) | Range safety teaching |
| `terminal-velocity` | Aero | m, Cd, A, ρ, g → v_term | Recovery / reentry order-of-magnitude |
| `impedance-matching` | RF / power | Z0, ZL → Γ, VSWR, RL | Antenna/feed educational (not full EM) |
| `antenna-gain-effective` | RF | G, λ, Ae → relation Ae=Gλ²/4π | Complements beamwidth / link |
| `slew-rate-pointing` | GNC / pointing | Δθ, ω_max, α_max → t_slew | Reaction wheel / thruster pointing budgets |
| `sun-sensor-cone` | Pointing | n_body, s_sun → angle, in-FOV | Sun acquisition |
| `ecliptic-to-eci` | Orbits / frames | λ, β or simple R3/R1 chain → unit vector | Attitude / ephemeris education |
| `coordinated-turn-or-bank` | Aero (ascent) | v, r_turn, g → φ_bank | Launch trajectory teaching |

### P1: Strong mission fit, medium complexity

| Candidate id | Domain | Notes |
|--------------|--------|--------|
| `characteristic-velocity-cstar` | Engines | c* = pc At / ṁ from definition |
| `throat-area-sizing` | Engines | From F, pc, Cf or c* |
| `propellant-density-impulse` | Propellants | ρ·Isp figures of merit |
| `blowdown-tank` | Propellants | Isothermal / isentropic p(V) |
| `ion-thruster-efficiency` | Electric propulsion | η = T²/(2ṁP) educational |
| `hall-thruster-isp` | EP | Ve from Vd, η rough |
| `gnss-troposphere-delay` | GNSS | Simple Saastamoinen-class model |
| `laser-time-of-flight` | Laser ranging | RTT range from Δt (extends light-time) |
| `optical-ber-q` | Optical comms | Q-factor / SNR educational (no full coding) |
| `star-tracker-noise` | Pointing | pixel → σ_θ order of magnitude |
| `rw-momentum-capacity` | GNC | h = Iω, dump with thrusters |
| `magnetic-torque` | GNC | τ = m × B, LEO B simple dipole |
| `drag-make-up-dv` | Ops | integrate or mean ρ model for Δv/year |
| `constellation-walker` | Mission design | T/P/F Walker parameters → spacing |
| `revisit-time-simple` | EO | i, h, FOV → rough revisit |
| `coverage-swath` | EO | h, θ_look, FOV → swath width |
| `aerobraking-pass` | Entry | Δv / heat rough from v, ρ, Cd A/m |
| `parachute-descent` | Recovery | v_term + opening load sketch |

### P1: Strong mission fit, medium complexity (continued)

| Candidate id | Domain | Notes |
|--------------|--------|--------|
| `characteristic-velocity-cstar` | Engines | c* = pc At / ṁ from definition |
| `throat-area-sizing` | Engines | From F, pc, Cf or c* |
| `propellant-density-impulse` | Propellants | ρ·Isp figures of merit |
| `blowdown-tank` | Propellants | Isothermal / isentropic p(V) |
| `geo-stationkeeping-dv` | GEO ops | N/S + E/W yearly Δv rough (literature formulas) |
| `geo-propellant-budget` | GEO design | Life × Δv_year / (Isp g0) → m_prop + tank factor |
| `ion-thruster-efficiency` | Electric propulsion | η = T²/(2ṁP) educational |
| `hall-thruster-isp` | EP | Ve from Vd, η rough |
| `cold-gas-thrust` | CubeSat prop | ṁ, ve or pe/Ae for cold gas |
| `gnss-troposphere-delay` | GNSS | Saastamoinen-class simple model |
| `gnss-ionosphere-klobuchar` | GNSS | Single-frequency educational delay |
| `laser-time-of-flight` | Laser ranging | RTT range from Δt (extends light-time) |
| `optical-ber-q` | Optical comms | Q-factor / SNR educational (no full coding) |
| `star-tracker-noise` | Pointing | pixel → σ_θ order of magnitude |
| `rw-momentum-capacity` | GNC | h = Iω, dump with thrusters |
| `magnetic-torque` | GNC | τ = m × B, LEO B simple dipole |
| `gravity-gradient-torque` | GNC | 3μ/r³ (z×I z) educational |
| `drag-make-up-dv` | Ops | mean ρ model for Δv/year (LEO) |
| `constellation-walker` | Mission design | T/P/F Walker → mean spacing |
| `revisit-time-simple` | EO | i, h, FOV → rough revisit |
| `coverage-swath` | EO | h, θ_look, FOV → swath width |
| `aerobraking-pass` | Entry | Δv / heat rough from v, ρ, Cd A/m |
| `parachute-descent` | Recovery | v_term + opening load sketch |
| `eps-orbit-average` | Power | eclipse fraction × P_load → battery depth (extends battery/solar-array) |
| `ttc-ebno` | TT&C | Eb/N0 from rate + CN0 (pairs with link-budget) |
| `rain-attenuation-simple` | RF | ITU-class educational (frequency, elevation) |
| `radar-equation` | Sensing | Pr from Pt, G, σ, R, λ (remote sensing) |
| `doppler-shift-leo` | RF / ops | f_d from v_radial, f0 |
| `relativity-clock-rate` | GNSS / science | gravitational + velocity clock rate educational |

### P2: Valuable but heavier or needs careful scope

| Candidate id | Risk / note |
|--------------|-------------|
| `cea-lite-equilibrium` | Full CEA is too heavy; only freeze γ, Tc tables |
| `finite-burn-arc` | Needs integration UI; start with constant-thrust flat |
| `relative-orbit-roe` | ROE / Yamanaka-Ankersen beyond CW |
| `attitude-quaternion-slerp` | Math-heavy but pure SI |
| `dcm-euler-chain` | Sequence of 3-1-3 / 3-2-1 rotations |
| `gnss-kalman-toy` | Risk of false “navigation solution” claims |
| `laser-adaptive-optics` | Too specialist for first pass |
| `impedance-smith` | Chart UI heavy; start with Γ only |
| `cislunar-cr3bp-jacobi` | CR3BP Jacobi constant educational |
| `tisserand-parameter` | Flyby / patched-conic classification |
| `b-plane-targeting` | Hyperbolic approach geometry |
| `porkchop-sketch` | Lambert grid UI heavy; maybe later |

---

## Pass 2: deeper gap map by subsystem

What builders (agencies + primes + newspace) actually size early. SIDUS already covers **some** cells.

| Subsystem | Have now (examples) | Still missing (candidates) |
|-----------|---------------------|----------------------------|
| **Trajectory / OD** | Hohmann, Lambert, SGP4, J2, CW, phasing | Walker, revisit, ROE, CR3BP Jacobi, b-plane |
| **Propulsion chemical** | rocket-equation, multi-stage, ideal-thrust, propellant-mass | **nozzle, c*, Cf, OF, blowdown, chamber** |
| **Propulsion electric** | (weak) | ion efficiency, Hall Isp sketch, cold gas |
| **Propellant / tanks** | propellant-mass | ullage, density-Isp, GEO yearly budget |
| **ADCS / GNC** | reaction-wheel, vector-angle, plane-change | slew, mag-torque, gravity-gradient, star-tracker noise, RW capacity |
| **GNSS / PNT** | light-time, elevation-azimuth | **pseudorange, GDOP, tropo/iono educational** |
| **RF / TT&C** | link-budget, beamwidth, diffraction | impedance/VSWR, Ae–G, rain atten, Eb/N0, Doppler LEO |
| **Optical / laser** | (none dedicated) | **optical Friis, jitter, laser TOF** |
| **EPS** | solar-array, battery, eclipse | orbit-average power / DoD coupling |
| **Thermal** | thermal-loop, thermal-rad | multi-node sketch (P2) |
| **Structures / aero** | dynamic-pressure, heat-flux, drag | free-fall, ballistic range, terminal v, parachute |
| **Payload EO** | angular-diameter, ground-track | swath, revisit, radar equation |
| **ECLSS** | metabolic, cabin, LiOH, leak | (enough for now) |

---

## Agency / industry themes → tools

| Theme | Agencies / industry | SIDUS angle |
|-------|---------------------|-------------|
| Propulsion / nozzles | NASA GRC, MSFC; ESA propulsion; Aerospace Corp smallsat EP survey; Busek-class EP | Isentropic nozzle, c*, Cf, OF, cold gas, ion η |
| GNSS / PNT | ESA Nav + open stacks (GNSS-SDR, GPS-SDR-SIM); NASA; JAXA QZSS context | Pseudorange, GDOP, Klobuchar/Saastamoinen **toy** models |
| Optical / laser | NASA SCaN; ESA optical; Libre Space Optical MakerSpace / HolOGS | Optical Friis, pointing jitter, laser TOF |
| RF / impedance | ESA RF OSS resource lists; commercial satcom | VSWR/Γ, Ae–G, rain, Doppler, radar equation |
| Ballistics / free fall | Range safety, launch agencies | Free-fall, range, v_term, parachute |
| Vectors / pointing | GNC groups (all agencies) | Slew, sun cone, mag torque, GG torque |
| GEO bus design | Primes (Airbus, Thales, LM, …) papers on stationkeeping budgets | GEO N/S E/W Δv, propellant life budget |
| Satellite builders / newspace | Open Cosmos, Planet-class ops themes | Constellation Walker, revisit, swath, drag makeup |
| Orbits already strong | NASA GMAT/SPICE (ops, not SIDUS scope) | Frames, coverage, not full GMAT |

### Public OSS pointers (inspiration only, not dependencies)

| Asset | Use for SIDUS |
|-------|----------------|
| [code.nasa.gov](https://code.nasa.gov/) / NASA OSS catalog | Find domain problems; reimplement pure SI educationally |
| [ESA open RF / downstream OSS list](https://www.esa.int/Enabling_Support/Space_Engineering_Technology/Radio_Frequency_Systems/Open_Source_Software_Resources_for_Space_Downstream_Applications) | GNSS/RF ecosystem map |
| Libre Space Foundation projects (Ephemerista, Optical MakerSpace) | Optical + open mission analysis themes |
| GNSS-SDR / GPS-SDR-SIM | Signal-level is **out of scope**; geometry/delay tools are in scope |
| GEO propellant budget papers (public literature) | Stationkeeping Δv + Isp → mass formulas |

---

## Explicit non-goals (for now)

- Flight-certified ephemerides / EOP-correct TEME↔ECEF  
- Full CEA chemistry, CFD nozzles, full RF FEM  
- Full GNSS-SDR baseband processing  
- Proprietary thruster performance maps as authority  
- Medical ECLSS certification  
- Claiming STK/GMAT parity  

Educational pure-SI only (see footer disclaimer / LICENSE.md).

---

## Suggested implementation order

### Wave A: engines + propellants (product differentiator)

1. `isentropic-nozzle`  
2. `characteristic-velocity-cstar` + `throat-area-sizing`  
3. `mixture-ratio`  
4. `blowdown-tank` or `tank-ullage`  
5. `cold-gas-thrust` (CubeSat-friendly)

### Wave B: GNSS + laser + RF depth

6. `gnss-geometry-gdop`  
7. `gnss-pseudorange`  
8. `laser-link-budget`  
9. `laser-pointing-jitter`  
10. `impedance-matching` + `antenna-gain-effective`  
11. `doppler-shift-leo`

### Wave C: dynamics / pointing / mission

12. `free-fall-time` + `terminal-velocity`  
13. `slew-rate-pointing`  
14. `magnetic-torque`  
15. `geo-stationkeeping-dv` + `geo-propellant-budget`  
16. `constellation-walker` + `coverage-swath`

Each tool: physics + tests + ToolShell + ParamsGrid + i18n + snippets all langs + precision + sitemap + `llms:gen` (CONVENTIONS).

---

## Rough counts

| Tier | Candidate tools (pass 1+2) |
|------|----------------------------|
| P0 | ~17 |
| P1 | ~30+ |
| P2 | ~12 |
| **Total backlog ideas** | **~60** (not all will ship) |

Live catalog grew **93 → 175** (cap 200). Remaining room (~25) reserved for user-driven or non-duplicate ideas only.

---

## Stop condition (met)

Further pure-SI ideas that remain are mostly:

- **Duplicates / partial overlaps** of shipped tools (e.g. another Isp form, another FOV geometry).  
- **P2 / out-of-scope:** full CEA, porkchop UI grids, GNSS-Kalman “solutions”, adaptive optics, impedance Smith chart UI, full ROE / Yamanaka–Ankersen, multi-node TCS CAD.  
- **Non-educational claims** risk (flight-rule ECLSS, certified RF FEM, thruster maps as authority).

**Stop discovery of new first-class tools** unless a candidate is (a) pure SI, (b) non-duplicate, (c) within existing tags/contexts, and (d) under the 200 live-tool cap.

---

## Implementation status (waves shipped)

| Wave | Status | Count (approx.) |
|------|--------|-----------------|
| A engines / propellants | **shipped** | nozzle, c*, throat, chamber, OF, ullage, blowdown, density-Isp, cold gas, ion, Hall, … |
| B GNSS / laser / RF | **shipped** | pseudorange, GDOP, tropo/iono, optical Friis, jitter, TOF, Γ/VSWR, Ae, Doppler, radar, rain, Eb/N0, … |
| C ballistics / ADCS / GEO / mission | **shipped** | free-fall, ballistic, v_term, chute, bank, slew, mag/GG, RW, sun/star, Walker, swath, revisit, GEO SK/prop, drag makeup, Tisserand, EPS, clock, … |
| Pass 3 | **shipped** | GSD, sail, finite burn, b-plane, Jacobi, lifetime, GEO drift, Stefan, Wien, impulse bit, J2 ω̇, SAR, link margin, aerobrake, diffraction, panel EOL, capture, FPA, … |
| Pass 4 | **shipped** | hoop stress, exp density, Hill, Edelbaum, RGT, pointing RSS, boiloff, residual dipole, solar flux, Nyquist, data volume, Earth IR |


---

## Open questions for product (resolved for now)

1. Engine thermo: **ideal γ gas only** (no CEA tables).  
2. GNSS: geometry **and** Saastamoinen / Klobuchar-class delay toys.  
3. Optical: power + Q sketch + GSD + diffraction.  
4. Micro-tools preferred over hubs for catalog search.  
5. GEO: analytical yearly Δv + propellant budget only.

---

## Pass log

| Pass | Date | What |
|------|------|------|
| 1 | 2026-08-11 | Initial P0–P2 from user themes + catalog gaps |
| 2 | 2026-08-11 | Subsystem gap matrix; GEO propellant budget; EP/cold gas; GNSS delay; RF Doppler/rain/radar; GG/mag torque; Libre Space / ESA OSS / smallsat EP survey themes |
| 3 | 2026-08-11 | Shipped waves A–C (~44 tools) + pass 3 (~26) |
| 4 | 2026-08-11 | Final high-value pure-SI (~12); **stop condition** recorded at **175** live tools |

*Discovery complete for this campaign. Next: only exceptional non-duplicate pure-SI requests under cap 200.*
