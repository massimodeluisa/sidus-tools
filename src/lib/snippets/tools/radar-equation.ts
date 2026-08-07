import type { FormulaSnippet } from '../types'

const A = "Monostatic radar equation; SI."

export const radarEquationSnippets: FormulaSnippet = {
  formulaId: 'radar-equation',
  assumptions: A,
  code: {
    python: "# Monostatic radar equation; SI.\nimport math\nPr = pt * G**2 * lam**2 * rcs / ((4 * math.pi)**3 * R**4)",
    javascript: "// Monostatic radar equation; SI.\nconst Pr = pt * G**2 * lam**2 * rcs / ((4 * Math.pi)**3 * R**4)",
    typescript: "// Monostatic radar equation; SI.\nconst Pr = pt * G**2 * lam**2 * rcs / ((4 * Math.pi)**3 * R**4)",
    c: "/* Monostatic radar equation; SI. */\nconst double Pr = pt * pow(G, 2) * pow(lam, 2) * rcs / (pow((4 * M_PI), 3) * pow(R, 4));",
    cpp: "// Monostatic radar equation; SI.\nconst double Pr = pt * pow(G, 2) * pow(lam, 2) * rcs / (pow((4 * M_PI), 3) * pow(R, 4));",
    rust: "// Monostatic radar equation; SI.\nlet Pr = pt * (G).powi(2) * (lam).powi(2) * rcs / (((4.0_f64 * std::f64::consts::PI)).powi(3) * (R).powf(4.0_f64));",
    zig: "// Monostatic radar equation; SI.\nconst Pr = pt * std.math.pow(f64, G, @as(f64, 2.0)) * std.math.pow(f64, lam, @as(f64, 2.0)) * rcs / (std.math.pow(f64, (@as(f64, 4.0) * std.math.pi), @as(f64, 3.0)) * std.math.pow(f64, R, @as(f64, 4.0)));",
    fortran: "! Monostatic radar equation; SI.\n  Pr = pt * G**2.0d0 * lam**2.0d0 * rcs / ((4.0d0 * 3.141592653589793d0)**3.0d0 * R**4.0d0)",
    matlab: "% Monostatic radar equation; SI.\nPr = pt * G^2 * lam^2 * rcs / ((4 * pi)^3 * R^4)",
    julia: "# Monostatic radar equation; SI.\nPr = pt * G**2 * lam**2 * rcs / ((4 * π)**3 * R**4)",
    latex: "% Monostatic radar equation; SI.\n\\[P_r=\\frac{P_t G^2\\lambda^2\\sigma}{(4\\pi)^3 R^4}\\]",
  },
}
