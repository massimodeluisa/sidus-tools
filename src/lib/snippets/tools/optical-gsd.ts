import type { FormulaSnippet } from '../types'

const A = "GSD ≈ h * IFOV; SI."

export const opticalGsdSnippets: FormulaSnippet = {
  formulaId: 'optical-gsd',
  assumptions: A,
  code: {
    python: "# GSD ≈ h * IFOV; SI.\nGSD = h * ifov",
    javascript: "// GSD ≈ h * IFOV; SI.\nconst GSD = h * ifov",
    typescript: "// GSD ≈ h * IFOV; SI.\nconst GSD = h * ifov",
    c: "/* GSD ≈ h * IFOV; SI. */\nconst double GSD = h * ifov;",
    cpp: "// GSD ≈ h * IFOV; SI.\nconst double GSD = h * ifov;",
    rust: "// GSD ≈ h * IFOV; SI.\nlet GSD = h * ifov;",
    zig: "// GSD ≈ h * IFOV; SI.\nconst GSD = h * ifov;",
    fortran: "! GSD ≈ h * IFOV; SI.\n  GSD = h * ifov",
    matlab: "% GSD ≈ h * IFOV; SI.\nGSD = h * ifov",
    julia: "# GSD ≈ h * IFOV; SI.\nGSD = h * ifov",
    latex: "% GSD ≈ h * IFOV; SI.\n\\[\\mathrm{GSD}\\approx h\\cdot\\mathrm{IFOV}\\]",
  },
}
