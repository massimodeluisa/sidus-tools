import type { FormulaSnippet } from '../types'

const A = "h = I w; SI."

export const rwMomentumCapacitySnippets: FormulaSnippet = {
  formulaId: 'rw-momentum-capacity',
  assumptions: A,
  code: {
    python: "# h = I w; SI.\nh = I * w",
    javascript: "// h = I w; SI.\nconst h = I * w",
    typescript: "// h = I w; SI.\nconst h = I * w",
    c: "/* h = I w; SI. */\nconst double h = I * w;",
    cpp: "// h = I w; SI.\nconst double h = I * w;",
    rust: "// h = I w; SI.\nlet h = I * w;",
    zig: "// h = I w; SI.\nconst h = I * w;",
    fortran: "! h = I w; SI.\n  h = I * w",
    matlab: "% h = I w; SI.\nh = I * w",
    julia: "# h = I w; SI.\nh = I * w",
    latex: "% h = I w; SI.\n\\[h=I\\omega\\]",
  },
}
