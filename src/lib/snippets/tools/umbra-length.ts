import type { FormulaSnippet } from '../types'

const A = "Geometric umbra length; SI."

export const umbraLengthSnippets: FormulaSnippet = {
  formulaId: 'umbra-length',
  assumptions: A,
  code: {
    python: "# Geometric umbra length; SI.\nL = Rb * d / (Rs - Rb)",
    javascript: "// Geometric umbra length; SI.\nconst L = Rb * d / (Rs - Rb)",
    typescript: "// Geometric umbra length; SI.\nconst L = Rb * d / (Rs - Rb)",
    c: "/* Geometric umbra length; SI. */\nconst double L = Rb * d / (Rs - Rb);",
    cpp: "// Geometric umbra length; SI.\nconst double L = Rb * d / (Rs - Rb);",
    rust: "// Geometric umbra length; SI.\nlet L = Rb * d / (Rs - Rb);",
    zig: "// Geometric umbra length; SI.\nconst L = Rb * d / (Rs - Rb);",
    fortran: "! Geometric umbra length; SI.\n  L = Rb * d / (Rs - Rb)",
    matlab: "% Geometric umbra length; SI.\nL = Rb * d / (Rs - Rb)",
    julia: "# Geometric umbra length; SI.\nL = Rb * d / (Rs - Rb)",
    latex: "% Geometric umbra length; SI.\n\\[L=\\frac{R_b d}{R_s-R_b}\\]",
  },
}
