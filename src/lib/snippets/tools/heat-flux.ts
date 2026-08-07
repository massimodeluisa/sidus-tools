import type { FormulaSnippet } from '../types'

/**
 * Sutton-Graves stagnation convective heat flux (Earth k educational).
 * q̇ = k √(ρ / R_n) · v³  with k = 1.83e-4 (SI educational constant).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HeatFluxTool + lib/physics/ops.ts suttonGravesHeatFlux.
 */
const A =
  'Sutton-Graves stagnation convective flux; Earth k ≈ 1.83e-4 (educational). Pure SI.'

export const heatFluxSnippets: FormulaSnippet = {
  formulaId: 'heat-flux',
  assumptions: A,
  code: {
    python: `# Sutton-Graves heat flux: ${A}
import math
k = 1.83e-4  # kg^0.5 / m (Earth educational)
q = k * math.sqrt(rho / Rn) * v**3`,

    javascript: `// Sutton-Graves heat flux: ${A}
const k = 1.83e-4 // kg^0.5 / m (Earth educational)
const q = k * Math.sqrt(rho / Rn) * v ** 3`,

    typescript: `// Sutton-Graves heat flux: ${A}
const k: number = 1.83e-4 // kg^0.5 / m (Earth educational)
const q: number = k * Math.sqrt(rho / Rn) * v ** 3`,

    c: `/* Sutton-Graves heat flux: ${A} */
const double k = 1.83e-4; /* kg^0.5 / m (Earth educational) */
const double q = k * sqrt(rho / Rn) * v * v * v;`,

    cpp: `// Sutton-Graves heat flux: ${A}
const double k = 1.83e-4; // kg^0.5 / m (Earth educational)
const double q = k * std::sqrt(rho / Rn) * v * v * v;`,

    rust: `// Sutton-Graves heat flux: ${A}
let k = 1.83e-4_f64; // kg^0.5 / m (Earth educational)
let q = k * (rho / Rn).sqrt() * v.powi(3);`,

    zig: `// Sutton-Graves heat flux: ${A}
const k: f64 = 1.83e-4; // kg^0.5 / m (Earth educational)
const q = k * std.math.sqrt(rho / Rn) * v * v * v;`,

    fortran: `! Sutton-Graves heat flux: ${A}
k = 1.83d-4
q = k * sqrt(rho / Rn) * v**3`,

    matlab: `% Sutton-Graves heat flux: ${A}
k = 1.83e-4; % kg^0.5 / m (Earth educational)
q = k * sqrt(rho / Rn) * v^3;`,

    julia: `# Sutton-Graves heat flux: ${A}
k = 1.83e-4  # kg^0.5 / m (Earth educational)
q = k * sqrt(rho / Rn) * v^3`,

    latex: `% Sutton-Graves stagnation convective flux: pure SI
\\[
  \\dot{q} = k\\sqrt{\\frac{\\rho}{R_n}}\\,v^{3},\\quad
  k_{\\oplus} \\approx 1.83\\times 10^{-4}
\\]`,
  },
}
