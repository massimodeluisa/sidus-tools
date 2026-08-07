import type { FormulaSnippet } from '../types'

const A = "M = E - e sin E; SI rad."

export const meanAnomalyFromESnippets: FormulaSnippet = {
  formulaId: 'mean-anomaly-from-e',
  assumptions: A,
  code: {
    python: "# M = E - e sin E; SI rad.\nimport math\nM = E - e * math.sin(E)",
    javascript: "// M = E - e sin E; SI rad.\nconst M = E - e * Math.sin(E)",
    typescript: "// M = E - e sin E; SI rad.\nconst M = E - e * Math.sin(E)",
    c: "/* M = E - e sin E; SI rad. */\nconst double M = E - e * sin(E);",
    cpp: "// M = E - e sin E; SI rad.\nconst double M = E - e * sin(E);",
    rust: "// M = E - e sin E; SI rad.\nlet M = E - e * (E).sin();",
    zig: "// M = E - e sin E; SI rad.\nconst M = E - e * std.math.sin(E);",
    fortran: "! M = E - e sin E; SI rad.\n  M = E - e * sin(E)",
    matlab: "% M = E - e sin E; SI rad.\nM = E - e * sin(E)",
    julia: "# M = E - e sin E; SI rad.\nM = E - e * sin(E)",
    latex: "% M = E - e sin E; SI rad.\n\\[M=E-e\\sin E\\]",
  },
}
