import type { FormulaSnippet } from '../types'

const A = "v = sqrt(2mg/(rho Cd A)); SI."

export const terminalVelocitySnippets: FormulaSnippet = {
  formulaId: 'terminal-velocity',
  assumptions: A,
  code: {
    python: "# v = sqrt(2mg/(rho Cd A)); SI.\nimport math\nv = math.sqrt(2 * m * g / (rho * Cd * A))",
    javascript: "// v = sqrt(2mg/(rho Cd A)); SI.\nconst v = Math.sqrt(2 * m * g / (rho * Cd * A))",
    typescript: "// v = sqrt(2mg/(rho Cd A)); SI.\nconst v = Math.sqrt(2 * m * g / (rho * Cd * A))",
    c: "/* v = sqrt(2mg/(rho Cd A)); SI. */\nconst double v = sqrt(2 * m * g / (rho * Cd * A));",
    cpp: "// v = sqrt(2mg/(rho Cd A)); SI.\nconst double v = sqrt(2 * m * g / (rho * Cd * A));",
    rust: "// v = sqrt(2mg/(rho Cd A)); SI.\nlet v = (2.0_f64 * m * g / (rho * Cd * A)).sqrt();",
    zig: "// v = sqrt(2mg/(rho Cd A)); SI.\nconst v = std.math.sqrt(@as(f64, 2.0) * m * g / (rho * Cd * A));",
    fortran: "! v = sqrt(2mg/(rho Cd A)); SI.\n  v = sqrt(2.0d0 * m * g / (rho * Cd * A))",
    matlab: "% v = sqrt(2mg/(rho Cd A)); SI.\nv = sqrt(2 * m * g / (rho * Cd * A))",
    julia: "# v = sqrt(2mg/(rho Cd A)); SI.\nv = sqrt(2 * m * g / (rho * Cd * A))",
    latex: "% v = sqrt(2mg/(rho Cd A)); SI.\n\\[v=\\sqrt{\\frac{2mg}{\\rho C_D A}}\\]",
  },
}
