import type { FormulaSnippet } from '../types'

const A = "Δv/rev ≈ π ρ a v / β; SI."

export const dragMakeUpDvSnippets: FormulaSnippet = {
  formulaId: 'drag-make-up-dv',
  assumptions: A,
  code: {
    python: "# Δv/rev ≈ π ρ a v / β; SI.\nimport math\ndv = math.pi * rho * a * v / B",
    javascript: "// Δv/rev ≈ π ρ a v / β; SI.\nconst dv = Math.pi * rho * a * v / B",
    typescript: "// Δv/rev ≈ π ρ a v / β; SI.\nconst dv = Math.pi * rho * a * v / B",
    c: "/* Δv/rev ≈ π ρ a v / β; SI. */\nconst double dv = M_PI * rho * a * v / B;",
    cpp: "// Δv/rev ≈ π ρ a v / β; SI.\nconst double dv = M_PI * rho * a * v / B;",
    rust: "// Δv/rev ≈ π ρ a v / β; SI.\nlet dv = std::f64::consts::PI * rho * a * v / B;",
    zig: "// Δv/rev ≈ π ρ a v / β; SI.\nconst dv = std.math.pi * rho * a * v / B;",
    fortran: "! Δv/rev ≈ π ρ a v / β; SI.\n  dv = 3.141592653589793d0 * rho * a * v / B",
    matlab: "% Δv/rev ≈ π ρ a v / β; SI.\ndv = pi * rho * a * v / B",
    julia: "# Δv/rev ≈ π ρ a v / β; SI.\ndv = π * rho * a * v / B",
    latex: "% Δv/rev ≈ π ρ a v / β; SI.\n\\[\\Delta v/\\mathrm{rev}\\approx\\pi\\rho a v/B\\]",
  },
}
