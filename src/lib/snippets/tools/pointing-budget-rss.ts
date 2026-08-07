import type { FormulaSnippet } from '../types'

const A = "RSS pointing stack; SI rad."

export const pointingBudgetRssSnippets: FormulaSnippet = {
  formulaId: 'pointing-budget-rss',
  assumptions: A,
  code: {
    python: "# RSS pointing stack; SI rad.\nimport math\nsigma = math.sqrt(s1**2 + s2**2 + s3**2)",
    javascript: "// RSS pointing stack; SI rad.\nconst sigma = Math.sqrt(s1**2 + s2**2 + s3**2)",
    typescript: "// RSS pointing stack; SI rad.\nconst sigma = Math.sqrt(s1**2 + s2**2 + s3**2)",
    c: "/* RSS pointing stack; SI rad. */\nconst double sigma = sqrt(pow(s1, 2) + pow(s2, 2) + pow(s3, 2));",
    cpp: "// RSS pointing stack; SI rad.\nconst double sigma = sqrt(pow(s1, 2) + pow(s2, 2) + pow(s3, 2));",
    rust: "// RSS pointing stack; SI rad.\nlet sigma = ((s1).powi(2) + (s2).powi(2) + (s3).powi(2)).sqrt();",
    zig: "// RSS pointing stack; SI rad.\nconst sigma = std.math.sqrt(std.math.pow(f64, s1, @as(f64, 2.0)) + std.math.pow(f64, s2, @as(f64, 2.0)) + std.math.pow(f64, s3, @as(f64, 2.0)));",
    fortran: "! RSS pointing stack; SI rad.\n  sigma = sqrt(s1**2.0d0 + s2**2.0d0 + s3**2.0d0)",
    matlab: "% RSS pointing stack; SI rad.\nsigma = sqrt(s1^2 + s2^2 + s3^2)",
    julia: "# RSS pointing stack; SI rad.\nsigma = sqrt(s1**2 + s2**2 + s3**2)",
    latex: "% RSS pointing stack; SI rad.\n\\[\\sigma=\\sqrt{\\sum_i\\sigma_i^2}\\]",
  },
}
