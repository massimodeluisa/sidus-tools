import type { FormulaSnippet } from '../types'

const A = "TW = F / (m g0); SI."

export const thrustToWeightSnippets: FormulaSnippet = {
  formulaId: 'thrust-to-weight',
  assumptions: A,
  code: {
    python: "# TW = F / (m g0); SI.\ng0 = 9.80665\nTW = F / (m * g0)",
    javascript: "// TW = F / (m g0); SI.\nconst g0 = 9.80665\nconst TW = F / (m * g0)",
    typescript: "// TW = F / (m g0); SI.\nconst g0 = 9.80665\nconst TW = F / (m * g0)",
    c: "/* TW = F / (m g0); SI. */\nconst double g0 = 9.80665;\nconst double TW = F / (m * g0);",
    cpp: "// TW = F / (m g0); SI.\nconst double g0 = 9.80665;\nconst double TW = F / (m * g0);",
    rust: "// TW = F / (m g0); SI.\nlet g0 = 9.80665_f64;\nlet TW = F / (m * g0);",
    zig: "// TW = F / (m g0); SI.\nconst g0 = @as(f64, 9.80665);\nconst TW = F / (m * g0);",
    fortran: "! TW = F / (m g0); SI.\n  g0 = 9.80665d0\n  TW = F / (m * g0)",
    matlab: "% TW = F / (m g0); SI.\ng0 = 9.80665\nTW = F / (m * g0)",
    julia: "# TW = F / (m g0); SI.\ng0 = 9.80665\nTW = F / (m * g0)",
    latex: "% TW = F / (m g0); SI.\n\\[T/W=F/(m g_0)\\]",
  },
}
