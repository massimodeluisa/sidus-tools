import type { FormulaSnippet } from '../types'

const A = "F = Cf pc At; SI."

export const rocketThrustChamberSnippets: FormulaSnippet = {
  formulaId: 'rocket-thrust-chamber',
  assumptions: A,
  code: {
    python: "# F = Cf pc At; SI.\nF = Cf * pc * At",
    javascript: "// F = Cf pc At; SI.\nconst F = Cf * pc * At",
    typescript: "// F = Cf pc At; SI.\nconst F = Cf * pc * At",
    c: "/* F = Cf pc At; SI. */\nconst double F = Cf * pc * At;",
    cpp: "// F = Cf pc At; SI.\nconst double F = Cf * pc * At;",
    rust: "// F = Cf pc At; SI.\nlet F = Cf * pc * At;",
    zig: "// F = Cf pc At; SI.\nconst F = Cf * pc * At;",
    fortran: "! F = Cf pc At; SI.\n  F = Cf * pc * At",
    matlab: "% F = Cf pc At; SI.\nF = Cf * pc * At",
    julia: "# F = Cf pc At; SI.\nF = Cf * pc * At",
    latex: "% F = Cf pc At; SI.\n\\[F=C_f p_c A_t\\]",
  },
}
