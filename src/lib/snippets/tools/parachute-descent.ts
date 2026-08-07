import type { FormulaSnippet } from '../types'

const A = "Terminal velocity under chute; SI."

export const parachuteDescentSnippets: FormulaSnippet = {
  formulaId: 'parachute-descent',
  assumptions: A,
  code: {
    python: "# Terminal velocity under chute; SI.\nimport math\nv = math.sqrt(2 * m * 9.80665 / (rho * Cd * A))",
    javascript: "// Terminal velocity under chute; SI.\nconst v = Math.sqrt(2 * m * 9.80665 / (rho * Cd * A))",
    typescript: "// Terminal velocity under chute; SI.\nconst v = Math.sqrt(2 * m * 9.80665 / (rho * Cd * A))",
    c: "/* Terminal velocity under chute; SI. */\nconst double v = sqrt(2 * m * 9.80665 / (rho * Cd * A));",
    cpp: "// Terminal velocity under chute; SI.\nconst double v = sqrt(2 * m * 9.80665 / (rho * Cd * A));",
    rust: "// Terminal velocity under chute; SI.\nlet v = (2.0_f64 * m * 9.80665_f64 / (rho * Cd * A)).sqrt();",
    zig: "// Terminal velocity under chute; SI.\nconst v = std.math.sqrt(@as(f64, 2.0) * m * @as(f64, 9.80665) / (rho * Cd * A));",
    fortran: "! Terminal velocity under chute; SI.\n  v = sqrt(2.0d0 * m * 9.80665 / (rho * Cd * A))",
    matlab: "% Terminal velocity under chute; SI.\nv = sqrt(2 * m * 9.80665 / (rho * Cd * A))",
    julia: "# Terminal velocity under chute; SI.\nv = sqrt(2 * m * 9.80665 / (rho * Cd * A))",
    latex: "% Terminal velocity under chute; SI.\n\\[v=\\sqrt{\\frac{2mg}{\\rho C_D A}}\\]",
  },
}
