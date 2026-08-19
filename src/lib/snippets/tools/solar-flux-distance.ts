import type { FormulaSnippet } from '../types'

const A = "S = S0 (1 AU/r)^2; SI."

export const solarFluxDistanceSnippets: FormulaSnippet = {
  formulaId: 'solar-flux-distance',
  assumptions: A,
  code: {
    python: "# S = S0 (1 AU/r)^2; SI.\nAU = 149597870700.0\nS = S0 * (AU / r) ** 2",
    javascript: "// S = S0 (1 AU/r)^2; SI.\nconst AU = 149597870700.0\nconst S = S0 * (AU / r) ** 2",
    typescript: "// S = S0 (1 AU/r)^2; SI.\nconst AU = 149597870700.0\nconst S = S0 * (AU / r) ** 2",
    c: "/* S = S0 (1 AU/r)^2; SI. */\nconst double AU = 149597870700.0;\nconst double S = S0 * pow((AU / r), 2);",
    cpp: "// S = S0 (1 AU/r)^2; SI.\nconst double AU = 149597870700.0;\nconst double S = S0 * pow((AU / r), 2);",
    rust: "// S = S0 (1 AU/r)^2; SI.\nlet AU = 149597870700.0_f64;\nlet S = S0 * ((AU / r)).powi(2);",
    zig: "// S = S0 (1 AU/r)^2; SI.\nconst AU = @as(f64, 149597870700.0);\nconst S = S0 * std.math.pow(f64, (AU / r), @as(f64, 2.0));",
    fortran: "! S = S0 (1 AU/r)^2; SI.\n  AU = 149597870700.0d0\n  S = S0 * (AU / r) ** 2.0d0",
    matlab: "% S = S0 (1 AU/r)^2; SI.\nAU = 149597870700.0\nS = S0 * (AU / r) ^ 2",
    julia: "# S = S0 (1 AU/r)^2; SI.\nAU = 149597870700.0\nS = S0 * (AU / r) ^ 2",
    latex: "% S = S0 (1 AU/r)^2; SI.\n\\[S=S_0(1\\,\\mathrm{AU}/r)^2\\]",
  },
}
