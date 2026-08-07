import type { FormulaSnippet } from '../types'

const A = "e = 1 + rp vinf^2 / mu; SI."

export const hyperbolicEccentricitySnippets: FormulaSnippet = {
  formulaId: 'hyperbolic-eccentricity',
  assumptions: A,
  code: {
    python: "# e = 1 + rp vinf^2 / mu; SI.\ne = 1 + rp * vinf**2 / mu",
    javascript: "// e = 1 + rp vinf^2 / mu; SI.\nconst e = 1 + rp * vinf**2 / mu",
    typescript: "// e = 1 + rp vinf^2 / mu; SI.\nconst e = 1 + rp * vinf**2 / mu",
    c: "/* e = 1 + rp vinf^2 / mu; SI. */\nconst double e = 1 + rp * pow(vinf, 2) / mu;",
    cpp: "// e = 1 + rp vinf^2 / mu; SI.\nconst double e = 1 + rp * pow(vinf, 2) / mu;",
    rust: "// e = 1 + rp vinf^2 / mu; SI.\nlet e = 1.0_f64 + rp * (vinf).powi(2) / mu;",
    zig: "// e = 1 + rp vinf^2 / mu; SI.\nconst e = @as(f64, 1.0) + rp * std.math.pow(f64, vinf, @as(f64, 2.0)) / mu;",
    fortran: "! e = 1 + rp vinf^2 / mu; SI.\n  e = 1.0d0 + rp * vinf**2.0d0 / mu",
    matlab: "% e = 1 + rp vinf^2 / mu; SI.\ne = 1 + rp * vinf^2 / mu",
    julia: "# e = 1 + rp vinf^2 / mu; SI.\ne = 1 + rp * vinf**2 / mu",
    latex: "% e = 1 + rp vinf^2 / mu; SI.\n\\[e=1+\\frac{r_p v_\\infty^2}{\\mu}\\]",
  },
}
