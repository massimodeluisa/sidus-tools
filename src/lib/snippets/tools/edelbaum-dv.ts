import type { FormulaSnippet } from '../types'

const A = "Edelbaum low-thrust combined transfer; SI."

export const edelbaumDvSnippets: FormulaSnippet = {
  formulaId: 'edelbaum-dv',
  assumptions: A,
  code: {
    python: "# Edelbaum low-thrust combined transfer; SI.\nimport math\ndv = math.sqrt(v1**2 + v2**2 - 2 * v1 * v2 * math.cos(math.pi * di / 2))",
    javascript: "// Edelbaum low-thrust combined transfer; SI.\nconst dv = Math.sqrt(v1**2 + v2**2 - 2 * v1 * v2 * Math.cos(Math.pi * di / 2))",
    typescript: "// Edelbaum low-thrust combined transfer; SI.\nconst dv = Math.sqrt(v1**2 + v2**2 - 2 * v1 * v2 * Math.cos(Math.pi * di / 2))",
    c: "/* Edelbaum low-thrust combined transfer; SI. */\nconst double dv = sqrt(pow(v1, 2) + pow(v2, 2) - 2 * v1 * v2 * cos(M_PI * di / 2));",
    cpp: "// Edelbaum low-thrust combined transfer; SI.\nconst double dv = sqrt(pow(v1, 2) + pow(v2, 2) - 2 * v1 * v2 * cos(M_PI * di / 2));",
    rust: "// Edelbaum low-thrust combined transfer; SI.\nlet dv = ((v1).powi(2) + (v2).powi(2) - 2.0_f64 * v1 * v2 * (std::f64::consts::PI * di / 2.0_f64).cos()).sqrt();",
    zig: "// Edelbaum low-thrust combined transfer; SI.\nconst dv = std.math.sqrt(std.math.pow(f64, v1, @as(f64, 2.0)) + std.math.pow(f64, v2, @as(f64, 2.0)) - @as(f64, 2.0) * v1 * v2 * std.math.cos(std.math.pi * di / @as(f64, 2.0)));",
    fortran: "! Edelbaum low-thrust combined transfer; SI.\n  dv = sqrt(v1**2.0d0 + v2**2.0d0 - 2.0d0 * v1 * v2 * cos(3.141592653589793d0 * di / 2.0d0))",
    matlab: "% Edelbaum low-thrust combined transfer; SI.\ndv = sqrt(v1^2 + v2^2 - 2 * v1 * v2 * cos(pi * di / 2))",
    julia: "# Edelbaum low-thrust combined transfer; SI.\ndv = sqrt(v1**2 + v2**2 - 2 * v1 * v2 * cos(π * di / 2))",
    latex: "% Edelbaum low-thrust combined transfer; SI.\n\\[\\Delta v=\\sqrt{v_1^2+v_2^2-2v_1v_2\\cos(\\pi\\Delta i/2)}\\]",
  },
}
