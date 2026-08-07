import type { FormulaSnippet } from '../types'

const A = "Optical free-space Friis; SI."

export const laserLinkBudgetSnippets: FormulaSnippet = {
  formulaId: 'laser-link-budget',
  assumptions: A,
  code: {
    python: "# Optical free-space Friis; SI.\nimport math\nfspl = (lam / (4 * math.pi * R)) ** 2\nPr = pt * etaT * etaR * gt * gr * fspl / L",
    javascript: "// Optical free-space Friis; SI.\nconst fspl = (lam / (4 * Math.pi * R)) ** 2\nconst Pr = pt * etaT * etaR * gt * gr * fspl / L",
    typescript: "// Optical free-space Friis; SI.\nconst fspl = (lam / (4 * Math.pi * R)) ** 2\nconst Pr = pt * etaT * etaR * gt * gr * fspl / L",
    c: "/* Optical free-space Friis; SI. */\nconst double fspl = pow((lam / (4 * M_PI * R)), 2);\nconst double Pr = pt * etaT * etaR * gt * gr * fspl / L;",
    cpp: "// Optical free-space Friis; SI.\nconst double fspl = pow((lam / (4 * M_PI * R)), 2);\nconst double Pr = pt * etaT * etaR * gt * gr * fspl / L;",
    rust: "// Optical free-space Friis; SI.\nlet fspl = ((lam / (4.0_f64 * std::f64::consts::PI * R))).powi(2);\nlet Pr = pt * etaT * etaR * gt * gr * fspl / L;",
    zig: "// Optical free-space Friis; SI.\nconst fspl = std.math.pow(f64, (lam / (@as(f64, 4.0) * std.math.pi * R)), @as(f64, 2.0));\nconst Pr = pt * etaT * etaR * gt * gr * fspl / L;",
    fortran: "! Optical free-space Friis; SI.\n  fspl = (lam / (4.0d0 * 3.141592653589793d0 * R)) ** 2.0d0\n  Pr = pt * etaT * etaR * gt * gr * fspl / L",
    matlab: "% Optical free-space Friis; SI.\nfspl = (lam / (4 * pi * R)) ^ 2\nPr = pt * etaT * etaR * gt * gr * fspl / L",
    julia: "# Optical free-space Friis; SI.\nfspl = (lam / (4 * π * R)) ** 2\nPr = pt * etaT * etaR * gt * gr * fspl / L",
    latex: "% Optical free-space Friis; SI.\n\\[P_r=P_t\\etaT\\etaR G_t G_r\\left(\\frac{\\lambda}{4\\pi R}\\right)^2/L\\]",
  },
}
