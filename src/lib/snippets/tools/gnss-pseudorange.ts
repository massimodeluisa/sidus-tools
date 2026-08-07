import type { FormulaSnippet } from '../types'

const A = "rho = c (tRx - tTx) + c bias; SI."

export const gnssPseudorangeSnippets: FormulaSnippet = {
  formulaId: 'gnss-pseudorange',
  assumptions: A,
  code: {
    python: "# rho = c (tRx - tTx) + c bias; SI.\nc = 299792458.0\nrho = c * (tRx - tTx) + c * bias",
    javascript: "// rho = c (tRx - tTx) + c bias; SI.\nconst c = 299792458.0\nconst rho = c * (tRx - tTx) + c * bias",
    typescript: "// rho = c (tRx - tTx) + c bias; SI.\nconst c = 299792458.0\nconst rho = c * (tRx - tTx) + c * bias",
    c: "/* rho = c (tRx - tTx) + c bias; SI. */\nconst double c = 299792458.0;\nconst double rho = c * (tRx - tTx) + c * bias;",
    cpp: "// rho = c (tRx - tTx) + c bias; SI.\nconst double c = 299792458.0;\nconst double rho = c * (tRx - tTx) + c * bias;",
    rust: "// rho = c (tRx - tTx) + c bias; SI.\nlet c = 299792458.0_f64;\nlet rho = c * (tRx - tTx) + c * bias;",
    zig: "// rho = c (tRx - tTx) + c bias; SI.\nconst c = @as(f64, 299792458.0);\nconst rho = c * (tRx - tTx) + c * bias;",
    fortran: "! rho = c (tRx - tTx) + c bias; SI.\n  c = 299792458.0d0\n  rho = c * (tRx - tTx) + c * bias",
    matlab: "% rho = c (tRx - tTx) + c bias; SI.\nc = 299792458.0\nrho = c * (tRx - tTx) + c * bias",
    julia: "# rho = c (tRx - tTx) + c bias; SI.\nc = 299792458.0\nrho = c * (tRx - tTx) + c * bias",
    latex: "% rho = c (tRx - tTx) + c bias; SI.\n\\[\\rho=c(t_{rx}-t_{tx})+c\\,\\delta t\\]",
  },
}
