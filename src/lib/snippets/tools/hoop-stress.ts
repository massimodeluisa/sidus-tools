import type { FormulaSnippet } from '../types'

const A = "sigma = p r / t thin wall; SI."

export const hoopStressSnippets: FormulaSnippet = {
  formulaId: 'hoop-stress',
  assumptions: A,
  code: {
    python: "# sigma = p r / t thin wall; SI.\nsigma = press * rad / thk",
    javascript: "// sigma = p r / t thin wall; SI.\nconst sigma = press * rad / thk",
    typescript: "// sigma = p r / t thin wall; SI.\nconst sigma = press * rad / thk",
    c: "/* sigma = p r / t thin wall; SI. */\nconst double sigma = press * rad / thk;",
    cpp: "// sigma = p r / t thin wall; SI.\nconst double sigma = press * rad / thk;",
    rust: "// sigma = p r / t thin wall; SI.\nlet sigma = press * rad / thk;",
    zig: "// sigma = p r / t thin wall; SI.\nconst sigma = press * rad / thk;",
    fortran: "! sigma = p r / t thin wall; SI.\n  sigma = press * rad / thk",
    matlab: "% sigma = p r / t thin wall; SI.\nsigma = press * rad / thk",
    julia: "# sigma = p r / t thin wall; SI.\nsigma = press * rad / thk",
    latex: "% sigma = p r / t thin wall; SI.\n\\[\\sigma=\\frac{pr}{t}\\]",
  },
}
