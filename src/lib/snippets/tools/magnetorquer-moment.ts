import type { FormulaSnippet } from '../types'

const A = "m = N I A; SI."

export const magnetorquerMomentSnippets: FormulaSnippet = {
  formulaId: 'magnetorquer-moment',
  assumptions: A,
  code: {
    python: "# m = N I A; SI.\nm = N * I * A",
    javascript: "// m = N I A; SI.\nconst m = N * I * A",
    typescript: "// m = N I A; SI.\nconst m = N * I * A",
    c: "/* m = N I A; SI. */\nconst double m = N * I * A;",
    cpp: "// m = N I A; SI.\nconst double m = N * I * A;",
    rust: "// m = N I A; SI.\nlet m = N * I * A;",
    zig: "// m = N I A; SI.\nconst m = N * I * A;",
    fortran: "! m = N I A; SI.\n  m = N * I * A",
    matlab: "% m = N I A; SI.\nm = N * I * A",
    julia: "# m = N I A; SI.\nm = N * I * A",
    latex: "% m = N I A; SI.\n\\[m=NIA\\]",
  },
}
