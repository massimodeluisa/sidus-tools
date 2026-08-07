import type { FormulaSnippet } from '../types'

const A = "theta ≈ 1.22 lambda/D; SI."

export const diffractionLimitSnippets: FormulaSnippet = {
  formulaId: 'diffraction-limit',
  assumptions: A,
  code: {
    python: "# theta ≈ 1.22 lambda/D; SI.\ntheta = 1.22 * lam / D",
    javascript: "// theta ≈ 1.22 lambda/D; SI.\nconst theta = 1.22 * lam / D",
    typescript: "// theta ≈ 1.22 lambda/D; SI.\nconst theta = 1.22 * lam / D",
    c: "/* theta ≈ 1.22 lambda/D; SI. */\nconst double theta = 1.22 * lam / D;",
    cpp: "// theta ≈ 1.22 lambda/D; SI.\nconst double theta = 1.22 * lam / D;",
    rust: "// theta ≈ 1.22 lambda/D; SI.\nlet theta = 1.22_f64 * lam / D;",
    zig: "// theta ≈ 1.22 lambda/D; SI.\nconst theta = @as(f64, 1.22) * lam / D;",
    fortran: "! theta ≈ 1.22 lambda/D; SI.\n  theta = 1.22 * lam / D",
    matlab: "% theta ≈ 1.22 lambda/D; SI.\ntheta = 1.22 * lam / D",
    julia: "# theta ≈ 1.22 lambda/D; SI.\ntheta = 1.22 * lam / D",
    latex: "% theta ≈ 1.22 lambda/D; SI.\n\\[\\theta\\approx 1.22\\lambda/D\\]",
  },
}
