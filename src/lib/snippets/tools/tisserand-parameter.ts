import type { FormulaSnippet } from '../types'

const A = "Tisserand vs planet; SI."

export const tisserandParameterSnippets: FormulaSnippet = {
  formulaId: 'tisserand-parameter',
  assumptions: A,
  code: {
    python: "# Tisserand vs planet; SI.\nimport math\nTpar = ap / a + 2 * math.cos(i) * math.sqrt(a / ap * (1 - e * e))",
    javascript: "// Tisserand vs planet; SI.\nconst Tpar = ap / a + 2 * Math.cos(i) * Math.sqrt(a / ap * (1 - e * e))",
    typescript: "// Tisserand vs planet; SI.\nconst Tpar = ap / a + 2 * Math.cos(i) * Math.sqrt(a / ap * (1 - e * e))",
    c: "/* Tisserand vs planet; SI. */\nconst double Tpar = ap / a + 2 * cos(i) * sqrt(a / ap * (1 - e * e));",
    cpp: "// Tisserand vs planet; SI.\nconst double Tpar = ap / a + 2 * cos(i) * sqrt(a / ap * (1 - e * e));",
    rust: "// Tisserand vs planet; SI.\nlet Tpar = ap / a + 2.0_f64 * (i).cos() * (a / ap * (1.0_f64 - e * e)).sqrt();",
    zig: "// Tisserand vs planet; SI.\nconst Tpar = ap / a + @as(f64, 2.0) * std.math.cos(i) * std.math.sqrt(a / ap * (@as(f64, 1.0) - e * e));",
    fortran: "! Tisserand vs planet; SI.\n  Tpar = ap / a + 2.0d0 * cos(i) * sqrt(a / ap * (1.0d0 - e * e))",
    matlab: "% Tisserand vs planet; SI.\nTpar = ap / a + 2 * cos(i) * sqrt(a / ap * (1 - e * e))",
    julia: "# Tisserand vs planet; SI.\nTpar = ap / a + 2 * cos(i) * sqrt(a / ap * (1 - e * e))",
    latex: "% Tisserand vs planet; SI.\n\\[T=\\frac{a_p}{a}+2\\cos i\\sqrt{\\frac{a}{a_p}(1-e^2)}\\]",
  },
}
