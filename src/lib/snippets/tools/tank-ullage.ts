import type { FormulaSnippet } from '../types'

const A = "m = V fill rho; SI."

export const tankUllageSnippets: FormulaSnippet = {
  formulaId: 'tank-ullage',
  assumptions: A,
  code: {
    python: "# m = V fill rho; SI.\nm = V * fill * rho",
    javascript: "// m = V fill rho; SI.\nconst m = V * fill * rho",
    typescript: "// m = V fill rho; SI.\nconst m = V * fill * rho",
    c: "/* m = V fill rho; SI. */\nconst double m = V * fill * rho;",
    cpp: "// m = V fill rho; SI.\nconst double m = V * fill * rho;",
    rust: "// m = V fill rho; SI.\nlet m = V * fill * rho;",
    zig: "// m = V fill rho; SI.\nconst m = V * fill * rho;",
    fortran: "! m = V fill rho; SI.\n  m = V * fill * rho",
    matlab: "% m = V fill rho; SI.\nm = V * fill * rho",
    julia: "# m = V fill rho; SI.\nm = V * fill * rho",
    latex: "% m = V fill rho; SI.\n\\[m=V\\cdot f\\cdot\\rho\\]",
  },
}
