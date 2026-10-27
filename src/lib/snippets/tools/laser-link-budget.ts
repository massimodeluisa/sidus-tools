import type { FormulaSnippet } from '../types'

const A = 'Far-field optical Friis; SI. Valid only for R >= k*Rt*Rr (k = 2*pi/lam, aperture radii Rt/Rr); 0 < etaT, etaR <= 1; L >= 1. Gt/Gr are linear gains, separate from the optics efficiencies; L is a passive loss factor.'

export const laserLinkBudgetSnippets: FormulaSnippet = {
  formulaId: 'laser-link-budget',
  assumptions: A,
  code: {
    python: `# ${A}\nimport math\nk = 2 * math.pi / lam\nPr = float("nan")\nif R >= k * rt * rr:\n    fspl = (lam / (4 * math.pi * R)) ** 2\n    Pr = pt * etaT * etaR * gt * gr * fspl / L`,
    javascript: `// ${A}\nconst k = 2 * Math.PI / lam\nlet Pr = Number.NaN\nif (R >= k * rt * rr) {\n  const fspl = (lam / (4 * Math.PI * R)) ** 2\n  Pr = pt * etaT * etaR * gt * gr * fspl / L\n}`,
    typescript: `// ${A}\nconst k = 2 * Math.PI / lam\nlet Pr = Number.NaN\nif (R >= k * rt * rr) {\n  const fspl = (lam / (4 * Math.PI * R)) ** 2\n  Pr = pt * etaT * etaR * gt * gr * fspl / L\n}`,
    c: `/* ${A} */\nconst double k = 2 * M_PI / lam;\ndouble Pr = nan("");\nif (R >= k * rt * rr) {\n  const double fspl = pow((lam / (4 * M_PI * R)), 2);\n  Pr = pt * etaT * etaR * gt * gr * fspl / L;\n}`,
    cpp: `// ${A}\nconst double k = 2 * M_PI / lam;\ndouble Pr = std::nan("");\nif (R >= k * rt * rr) {\n  const double fspl = pow((lam / (4 * M_PI * R)), 2);\n  Pr = pt * etaT * etaR * gt * gr * fspl / L;\n}`,
    rust: `// ${A}\nlet k = 2.0_f64 * std::f64::consts::PI / lam;\nlet mut Pr = f64::NAN;\nif R >= k * rt * rr {\n    let fspl = ((lam / (4.0_f64 * std::f64::consts::PI * R))).powi(2);\n    Pr = pt * etaT * etaR * gt * gr * fspl / L;\n}`,
    zig: `// ${A}\nconst k = (@as(f64, 2.0) * std.math.pi) / lam;\nvar Pr: f64 = std.math.nan(f64);\nif (R >= k * rt * rr) {\n    const fspl = std.math.pow(f64, (lam / (@as(f64, 4.0) * std.math.pi * R)), @as(f64, 2.0));\n    Pr = pt * etaT * etaR * gt * gr * fspl / L;\n}`,
    fortran: `! ${A}\n  k = 2.0d0 * 3.141592653589793d0 / lam\n  Pr = 0.0d0\n  Pr = Pr / Pr\n  if (R >= k * rt * rr) then\n    fspl = (lam / (4.0d0 * 3.141592653589793d0 * R)) ** 2.0d0\n    Pr = pt * etaT * etaR * gt * gr * fspl / L\n  end if`,
    matlab: `% ${A}\nk = 2 * pi / lam\nPr = NaN\nif R >= k * rt * rr\n  fspl = (lam / (4 * pi * R)) ^ 2\n  Pr = pt * etaT * etaR * gt * gr * fspl / L\nend`,
    julia: `# ${A}\nk = 2 * π / lam\nPr = NaN\nif R >= k * rt * rr\n    fspl = (lam / (4 * π * R)) ^ 2\n    Pr = pt * etaT * etaR * gt * gr * fspl / L\nend`,
    latex: `% ${A}\n\\[P_r=P_t\\eta_T\\eta_R G_t G_r\\left(\\frac{\\lambda}{4\\pi R}\\right)^2/L,\\quad 0<\\eta_T,\\eta_R\\le1,\\quad L\\ge1,\\quad R\\ge k R_t R_r\\]`,
  },
}
