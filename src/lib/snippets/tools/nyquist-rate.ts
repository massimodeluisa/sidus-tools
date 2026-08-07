import type { FormulaSnippet } from '../types'

const A = "fs >= 2 f_max; SI."

export const nyquistRateSnippets: FormulaSnippet = {
  formulaId: 'nyquist-rate',
  assumptions: A,
  code: {
    python: "# fs >= 2 f_max; SI.\nfs = 2 * f_max",
    javascript: "// fs >= 2 f_max; SI.\nconst fs = 2 * f_max",
    typescript: "// fs >= 2 f_max; SI.\nconst fs = 2 * f_max",
    c: "/* fs >= 2 f_max; SI. */\nconst double fs = 2 * f_max;",
    cpp: "// fs >= 2 f_max; SI.\nconst double fs = 2 * f_max;",
    rust: "// fs >= 2 f_max; SI.\nlet fs = 2.0_f64 * f_max;",
    zig: "// fs >= 2 f_max; SI.\nconst fs = @as(f64, 2.0) * f_max;",
    fortran: "! fs >= 2 f_max; SI.\n  fs = 2.0d0 * f_max",
    matlab: "% fs >= 2 f_max; SI.\nfs = 2 * f_max",
    julia: "# fs >= 2 f_max; SI.\nfs = 2 * f_max",
    latex: "% fs >= 2 f_max; SI.\n\\[f_s\\ge 2f_{\\max}\\]",
  },
}
