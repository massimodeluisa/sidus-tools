import type { FormulaSnippet } from '../types'

const A = "Δv ≈ 1/2 (CdA/m) ρ v L; SI."

export const aerobrakingPassSnippets: FormulaSnippet = {
  formulaId: 'aerobraking-pass',
  assumptions: A,
  code: {
    python: "# Δv ≈ 1/2 (CdA/m) ρ v L; SI.\ndv = 0.5 * ball * rho * v * L",
    javascript: "// Δv ≈ 1/2 (CdA/m) ρ v L; SI.\nconst dv = 0.5 * ball * rho * v * L",
    typescript: "// Δv ≈ 1/2 (CdA/m) ρ v L; SI.\nconst dv = 0.5 * ball * rho * v * L",
    c: "/* Δv ≈ 1/2 (CdA/m) ρ v L; SI. */\nconst double dv = 0.5 * ball * rho * v * L;",
    cpp: "// Δv ≈ 1/2 (CdA/m) ρ v L; SI.\nconst double dv = 0.5 * ball * rho * v * L;",
    rust: "// Δv ≈ 1/2 (CdA/m) ρ v L; SI.\nlet dv = 0.5_f64 * ball * rho * v * L;",
    zig: "// Δv ≈ 1/2 (CdA/m) ρ v L; SI.\nconst dv = @as(f64, 0.5) * ball * rho * v * L;",
    fortran: "! Δv ≈ 1/2 (CdA/m) ρ v L; SI.\n  dv = 0.5 * ball * rho * v * L",
    matlab: "% Δv ≈ 1/2 (CdA/m) ρ v L; SI.\ndv = 0.5 * ball * rho * v * L",
    julia: "# Δv ≈ 1/2 (CdA/m) ρ v L; SI.\ndv = 0.5 * ball * rho * v * L",
    latex: "% Δv ≈ 1/2 (CdA/m) ρ v L; SI.\n\\[\\Delta v\\approx\\frac12\\beta^{-1}\\rho v L\\]",
  },
}
