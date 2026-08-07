import type { FormulaSnippet } from '../types'

const A = "mdot = Q / h_fg; SI."

export const boiloffRateSnippets: FormulaSnippet = {
  formulaId: 'boiloff-rate',
  assumptions: A,
  code: {
    python: "# mdot = Q / h_fg; SI.\nmdot = Q / hfg",
    javascript: "// mdot = Q / h_fg; SI.\nconst mdot = Q / hfg",
    typescript: "// mdot = Q / h_fg; SI.\nconst mdot = Q / hfg",
    c: "/* mdot = Q / h_fg; SI. */\nconst double mdot = Q / hfg;",
    cpp: "// mdot = Q / h_fg; SI.\nconst double mdot = Q / hfg;",
    rust: "// mdot = Q / h_fg; SI.\nlet mdot = Q / hfg;",
    zig: "// mdot = Q / h_fg; SI.\nconst mdot = Q / hfg;",
    fortran: "! mdot = Q / h_fg; SI.\n  mdot = Q / hfg",
    matlab: "% mdot = Q / h_fg; SI.\nmdot = Q / hfg",
    julia: "# mdot = Q / h_fg; SI.\nmdot = Q / hfg",
    latex: "% mdot = Q / h_fg; SI.\n\\[\\dot m=\\dot Q/h_{fg}\\]",
  },
}
