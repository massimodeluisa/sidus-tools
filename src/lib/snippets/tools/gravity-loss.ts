import type { FormulaSnippet } from '../types'

const A = "Δv_gl ≈ g t sin gamma; SI."

export const gravityLossSnippets: FormulaSnippet = {
  formulaId: 'gravity-loss',
  assumptions: A,
  code: {
    python: "# Δv_gl ≈ g t sin gamma; SI.\nimport math\ndv = g * tb * math.sin(gamma)",
    javascript: "// Δv_gl ≈ g t sin gamma; SI.\nconst dv = g * tb * Math.sin(gamma)",
    typescript: "// Δv_gl ≈ g t sin gamma; SI.\nconst dv = g * tb * Math.sin(gamma)",
    c: "/* Δv_gl ≈ g t sin gamma; SI. */\nconst double dv = g * tb * sin(gamma);",
    cpp: "// Δv_gl ≈ g t sin gamma; SI.\nconst double dv = g * tb * sin(gamma);",
    rust: "// Δv_gl ≈ g t sin gamma; SI.\nlet dv = g * tb * (gamma).sin();",
    zig: "// Δv_gl ≈ g t sin gamma; SI.\nconst dv = g * tb * std.math.sin(gamma);",
    fortran: "! Δv_gl ≈ g t sin gamma; SI.\n  dv = g * tb * sin(gamma)",
    matlab: "% Δv_gl ≈ g t sin gamma; SI.\ndv = g * tb * sin(gamma)",
    julia: "# Δv_gl ≈ g t sin gamma; SI.\ndv = g * tb * sin(gamma)",
    latex: "% Δv_gl ≈ g t sin gamma; SI.\n\\[\\Delta v_{gl}\\approx g t\\sin\\gamma\\]",
  },
}
