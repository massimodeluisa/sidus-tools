import type { FormulaSnippet } from '../types'

const A = "V = R * T * eta bits."

export const dataVolumeSnippets: FormulaSnippet = {
  formulaId: 'data-volume',
  assumptions: A,
  code: {
    python: "# V = R * T * eta bits.\nV = R * T * eta",
    javascript: "// V = R * T * eta bits.\nconst V = R * T * eta",
    typescript: "// V = R * T * eta bits.\nconst V = R * T * eta",
    c: "/* V = R * T * eta bits. */\nconst double V = R * T * eta;",
    cpp: "// V = R * T * eta bits.\nconst double V = R * T * eta;",
    rust: "// V = R * T * eta bits.\nlet V = R * T * eta;",
    zig: "// V = R * T * eta bits.\nconst V = R * T * eta;",
    fortran: "! V = R * T * eta bits.\n  V = R * T * eta",
    matlab: "% V = R * T * eta bits.\nV = R * T * eta",
    julia: "# V = R * T * eta bits.\nV = R * T * eta",
    latex: "% V = R * T * eta bits.\n\\[V=R\\,T\\,\\eta\\]",
  },
}
