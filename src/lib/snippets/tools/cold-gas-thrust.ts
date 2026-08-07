import type { FormulaSnippet } from '../types'

const A = "F = mdot ve; SI."

export const coldGasThrustSnippets: FormulaSnippet = {
  formulaId: 'cold-gas-thrust',
  assumptions: A,
  code: {
    python: "# F = mdot ve; SI.\nF = mdot * ve",
    javascript: "// F = mdot ve; SI.\nconst F = mdot * ve",
    typescript: "// F = mdot ve; SI.\nconst F = mdot * ve",
    c: "/* F = mdot ve; SI. */\nconst double F = mdot * ve;",
    cpp: "// F = mdot ve; SI.\nconst double F = mdot * ve;",
    rust: "// F = mdot ve; SI.\nlet F = mdot * ve;",
    zig: "// F = mdot ve; SI.\nconst F = mdot * ve;",
    fortran: "! F = mdot ve; SI.\n  F = mdot * ve",
    matlab: "% F = mdot ve; SI.\nF = mdot * ve",
    julia: "# F = mdot ve; SI.\nF = mdot * ve",
    latex: "% F = mdot ve; SI.\n\\[F=\\dot m\\,v_e\\]",
  },
}
