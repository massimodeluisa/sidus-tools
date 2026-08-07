import type { FormulaSnippet } from '../types'

const A = "Rocket equation finite burn; SI."

export const finiteBurnDvSnippets: FormulaSnippet = {
  formulaId: 'finite-burn-dv',
  assumptions: A,
  code: {
    python: "# Rocket equation finite burn; SI.\nimport math\nmf = m0 - mdot * tb\ndv = ve * math.log(m0 / mf)",
    javascript: "// Rocket equation finite burn; SI.\nconst mf = m0 - mdot * tb\nconst dv = ve * Math.log(m0 / mf)",
    typescript: "// Rocket equation finite burn; SI.\nconst mf = m0 - mdot * tb\nconst dv = ve * Math.log(m0 / mf)",
    c: "/* Rocket equation finite burn; SI. */\nconst double mf = m0 - mdot * tb;\nconst double dv = ve * log(m0 / mf);",
    cpp: "// Rocket equation finite burn; SI.\nconst double mf = m0 - mdot * tb;\nconst double dv = ve * log(m0 / mf);",
    rust: "// Rocket equation finite burn; SI.\nlet mf = m0 - mdot * tb;\nlet dv = ve * (m0 / mf).ln();",
    zig: "// Rocket equation finite burn; SI.\nconst mf = m0 - mdot * tb;\nconst dv = ve * @log(m0 / mf);",
    fortran: "! Rocket equation finite burn; SI.\n  mf = m0 - mdot * tb\n  dv = ve * log(m0 / mf)",
    matlab: "% Rocket equation finite burn; SI.\nmf = m0 - mdot * tb\ndv = ve * log(m0 / mf)",
    julia: "# Rocket equation finite burn; SI.\nmf = m0 - mdot * tb\ndv = ve * log(m0 / mf)",
    latex: "% Rocket equation finite burn; SI.\n\\[\\Delta v=v_e\\ln(m_0/m_f)\\]",
  },
}
