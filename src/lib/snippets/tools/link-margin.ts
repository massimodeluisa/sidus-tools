import type { FormulaSnippet } from '../types'

const A = "Margin = CN0 - required; dB-Hz."

export const linkMarginSnippets: FormulaSnippet = {
  formulaId: 'link-margin',
  assumptions: A,
  code: {
    python: "# Margin = CN0 - required; dB-Hz.\nmargin = cn0 - req",
    javascript: "// Margin = CN0 - required; dB-Hz.\nconst margin = cn0 - req",
    typescript: "// Margin = CN0 - required; dB-Hz.\nconst margin = cn0 - req",
    c: "/* Margin = CN0 - required; dB-Hz. */\nconst double margin = cn0 - req;",
    cpp: "// Margin = CN0 - required; dB-Hz.\nconst double margin = cn0 - req;",
    rust: "// Margin = CN0 - required; dB-Hz.\nlet margin = cn0 - req;",
    zig: "// Margin = CN0 - required; dB-Hz.\nconst margin = cn0 - req;",
    fortran: "! Margin = CN0 - required; dB-Hz.\n  margin = cn0 - req",
    matlab: "% Margin = CN0 - required; dB-Hz.\nmargin = cn0 - req",
    julia: "# Margin = CN0 - required; dB-Hz.\nmargin = cn0 - req",
    latex: "% Margin = CN0 - required; dB-Hz.\n\\[M=\\mathrm{CN0}-\\mathrm{CN0}_{req}\\]",
  },
}
