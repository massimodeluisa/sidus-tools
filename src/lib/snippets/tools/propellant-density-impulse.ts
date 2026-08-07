import type { FormulaSnippet } from '../types'

const A = "rho * Isp figure of merit; SI."

export const propellantDensityImpulseSnippets: FormulaSnippet = {
  formulaId: 'propellant-density-impulse',
  assumptions: A,
  code: {
    python: "# rho * Isp figure of merit; SI.\ndpi = rho * isp",
    javascript: "// rho * Isp figure of merit; SI.\nconst dpi = rho * isp",
    typescript: "// rho * Isp figure of merit; SI.\nconst dpi = rho * isp",
    c: "/* rho * Isp figure of merit; SI. */\nconst double dpi = rho * isp;",
    cpp: "// rho * Isp figure of merit; SI.\nconst double dpi = rho * isp;",
    rust: "// rho * Isp figure of merit; SI.\nlet dpi = rho * isp;",
    zig: "// rho * Isp figure of merit; SI.\nconst dpi = rho * isp;",
    fortran: "! rho * Isp figure of merit; SI.\n  dpi = rho * isp",
    matlab: "% rho * Isp figure of merit; SI.\ndpi = rho * isp",
    julia: "# rho * Isp figure of merit; SI.\ndpi = rho * isp",
    latex: "% rho * Isp figure of merit; SI.\n\\[\\rho I_{sp}\\]",
  },
}
