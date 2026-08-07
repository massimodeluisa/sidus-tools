import type { FormulaSnippet } from '../types'

/**
 * Atmospheric drag force: F_d = ½ ρ v² C_d A.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches DragForceTool + lib/physics/power.ts dragForce.
 * Free vars: rho, v, Cd, A (m is optional UI context, unused in force).
 */
const A =
  'Quadratic drag: F_d = ½ ρ v² C_d A. Pure SI (ρ kg/m³, v m/s, A m²).'

export const dragSnippets: FormulaSnippet = {
  formulaId: 'drag-force',
  assumptions: A,
  code: {
    python: `# Atmospheric drag force: ${A}
F = 0.5 * rho * v**2 * Cd * A`,

    javascript: `// Atmospheric drag force: ${A}
const F = 0.5 * rho * (v ** 2) * Cd * A`,

    typescript: `// Atmospheric drag force: ${A}
const F: number = 0.5 * rho * (v ** 2) * Cd * A`,

    c: `/* Atmospheric drag force: ${A} */
const double F = 0.5 * rho * v * v * Cd * A;`,

    cpp: `// Atmospheric drag force: ${A}
const double F = 0.5 * rho * v * v * Cd * A;`,

    rust: `// Atmospheric drag force: ${A}
let f = 0.5 * rho * v * v * Cd * A;`,

    zig: `// Atmospheric drag force: ${A}
const F = 0.5 * rho * v * v * Cd * A;`,

    fortran: `! Atmospheric drag force: ${A}
F = 0.5d0 * rho * v * v * Cd * A`,

    matlab: `% Atmospheric drag force: ${A}
F = 0.5 * rho * v^2 * Cd * A;`,

    julia: `# Atmospheric drag force: ${A}
F = 0.5 * rho * v^2 * Cd * A`,

    latex: `% Atmospheric drag force: pure SI
\\[
  F_d = \\tfrac{1}{2}\\rho v^{2} C_d A
\\]`,
  },
}
