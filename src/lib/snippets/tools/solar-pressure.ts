import type { FormulaSnippet } from '../types'

/**
 * Solar radiation pressure: F = P0 A Cr / r_au², a = F/m.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches SolarPressureTool + lib/physics/mission.ts solarRadiationForce/Accel.
 */
const A =
  'Flat-plate SRP; P0 ≈ 4.56e-6 N/m² at 1 AU; F = P0 A Cr / r_au²; a = F/m. SI.'

export const solarPressureSnippets: FormulaSnippet = {
  formulaId: 'solar-pressure',
  assumptions: A,
  code: {
    python: `# Solar radiation pressure: ${A}
P0 = 4.56e-6  # N/m² at 1 AU
F = P0 * A * Cr / r_au**2
a = F / m`,

    javascript: `// Solar radiation pressure: ${A}
const P0 = 4.56e-6 // N/m² at 1 AU
const F = (P0 * A * Cr) / (r_au ** 2)
const a = F / m`,

    typescript: `// Solar radiation pressure: ${A}
const P0: number = 4.56e-6 // N/m² at 1 AU
const F: number = (P0 * A * Cr) / (r_au ** 2)
const a: number = F / m`,

    c: `/* Solar radiation pressure: ${A} */
const double P0 = 4.56e-6; /* N/m² at 1 AU */
const double F = (P0 * A * Cr) / (r_au * r_au);
const double a = F / m;`,

    cpp: `// Solar radiation pressure: ${A}
const double P0 = 4.56e-6; // N/m² at 1 AU
const double F = (P0 * A * Cr) / (r_au * r_au);
const double a = F / m;`,

    rust: `// Solar radiation pressure: ${A}
let p0 = 4.56e-6_f64; // N/m² at 1 AU
let f = (p0 * A * Cr) / (r_au * r_au);
let a = f / m;`,

    zig: `// Solar radiation pressure: ${A}
const P0: f64 = 4.56e-6; // N/m² at 1 AU
const F = (P0 * A * Cr) / (r_au * r_au);
const a = F / m;`,

    fortran: `! Solar radiation pressure: ${A}
P0 = 4.56d-6
F = (P0 * A * Cr) / (r_au * r_au)
a = F / m`,

    matlab: `% Solar radiation pressure: ${A}
P0 = 4.56e-6; % N/m^2 at 1 AU
F = (P0 * A * Cr) / r_au^2;
a = F / m;`,

    julia: `# Solar radiation pressure: ${A}
P0 = 4.56e-6  # N/m² at 1 AU
F = (P0 * A * Cr) / r_au^2
a = F / m`,

    latex: `% Solar radiation pressure: pure SI
\\[
  P_{0} \\approx 4.56\\times 10^{-6}\\,\\mathrm{N/m^{2}},\\quad
  F = P_{0} A C_{r} / r_{\\mathrm{AU}}^{2},\\quad
  a = F/m
\\]`,
  },
}
