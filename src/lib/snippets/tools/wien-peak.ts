import type { FormulaSnippet } from '../types'

const A = "lambda_max = b/T; SI."

export const wienPeakSnippets: FormulaSnippet = {
  formulaId: 'wien-peak',
  assumptions: A,
  code: {
    python: "# lambda_max = b/T; SI.\nb = 2.897771955e-3\nlam = b / T",
    javascript: "// lambda_max = b/T; SI.\nconst b = 2.897771955e-3\nconst lam = b / T",
    typescript: "// lambda_max = b/T; SI.\nconst b = 2.897771955e-3\nconst lam = b / T",
    c: "/* lambda_max = b/T; SI. */\nconst double b = 2.897771955e-3;\nconst double lam = b / T;",
    cpp: "// lambda_max = b/T; SI.\nconst double b = 2.897771955e-3;\nconst double lam = b / T;",
    rust: "// lambda_max = b/T; SI.\nlet b = 2.897771955e-3_f64;\nlet lam = b / T;",
    zig: "// lambda_max = b/T; SI.\nconst b = @as(f64, 2.897771955e-3);\nconst lam = b / T;",
    fortran: "! lambda_max = b/T; SI.\n  b = 2.897771955d-3\n  lam = b / T",
    matlab: "% lambda_max = b/T; SI.\nb = 2.897771955e-3\nlam = b / T",
    julia: "# lambda_max = b/T; SI.\nb = 2.897771955e-3\nlam = b / T",
    latex: "% lambda_max = b/T; SI.\n\\[\\lambda_{\\max}=b/T\\]",
  },
}
