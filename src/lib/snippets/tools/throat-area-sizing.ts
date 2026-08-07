import type { FormulaSnippet } from '../types'

const A = "At = F/(Cf pc); SI."

export const throatAreaSizingSnippets: FormulaSnippet = {
  formulaId: 'throat-area-sizing',
  assumptions: A,
  code: {
    python: "# At = F/(Cf pc); SI.\nAt = F / (Cf * pc)",
    javascript: "// At = F/(Cf pc); SI.\nconst At = F / (Cf * pc)",
    typescript: "// At = F/(Cf pc); SI.\nconst At = F / (Cf * pc)",
    c: "/* At = F/(Cf pc); SI. */\nconst double At = F / (Cf * pc);",
    cpp: "// At = F/(Cf pc); SI.\nconst double At = F / (Cf * pc);",
    rust: "// At = F/(Cf pc); SI.\nlet At = F / (Cf * pc);",
    zig: "// At = F/(Cf pc); SI.\nconst At = F / (Cf * pc);",
    fortran: "! At = F/(Cf pc); SI.\n  At = F / (Cf * pc)",
    matlab: "% At = F/(Cf pc); SI.\nAt = F / (Cf * pc)",
    julia: "# At = F/(Cf pc); SI.\nAt = F / (Cf * pc)",
    latex: "% At = F/(Cf pc); SI.\n\\[A_t=\\frac{F}{C_f p_c}\\]",
  },
}
