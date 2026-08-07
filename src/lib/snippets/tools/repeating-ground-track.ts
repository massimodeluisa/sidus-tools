import type { FormulaSnippet } from '../types'

const A = "T = days*86400/k; SI."

export const repeatingGroundTrackSnippets: FormulaSnippet = {
  formulaId: 'repeating-ground-track',
  assumptions: A,
  code: {
    python: "# T = days*86400/k; SI.\nT = days * 86400 / k",
    javascript: "// T = days*86400/k; SI.\nconst T = days * 86400 / k",
    typescript: "// T = days*86400/k; SI.\nconst T = days * 86400 / k",
    c: "/* T = days*86400/k; SI. */\nconst double T = days * 86400 / k;",
    cpp: "// T = days*86400/k; SI.\nconst double T = days * 86400 / k;",
    rust: "// T = days*86400/k; SI.\nlet T = days * 86400.0_f64 / k;",
    zig: "// T = days*86400/k; SI.\nconst T = days * @as(f64, 86400.0) / k;",
    fortran: "! T = days*86400/k; SI.\n  T = days * 86400.0d0 / k",
    matlab: "% T = days*86400/k; SI.\nT = days * 86400 / k",
    julia: "# T = days*86400/k; SI.\nT = days * 86400 / k",
    latex: "% T = days*86400/k; SI.\n\\[T=\\frac{n_{\\mathrm{days}}\\cdot 86400}{k}\\]",
  },
}
