import type { FormulaSnippet } from '../types'

const A = "I_bit = F * t_on; SI."

export const thrusterImpulseBitSnippets: FormulaSnippet = {
  formulaId: 'thruster-impulse-bit',
  assumptions: A,
  code: {
    python: "# I_bit = F * t_on; SI.\nIbit = F * ton",
    javascript: "// I_bit = F * t_on; SI.\nconst Ibit = F * ton",
    typescript: "// I_bit = F * t_on; SI.\nconst Ibit = F * ton",
    c: "/* I_bit = F * t_on; SI. */\nconst double Ibit = F * ton;",
    cpp: "// I_bit = F * t_on; SI.\nconst double Ibit = F * ton;",
    rust: "// I_bit = F * t_on; SI.\nlet Ibit = F * ton;",
    zig: "// I_bit = F * t_on; SI.\nconst Ibit = F * ton;",
    fortran: "! I_bit = F * t_on; SI.\n  Ibit = F * ton",
    matlab: "% I_bit = F * t_on; SI.\nIbit = F * ton",
    julia: "# I_bit = F * t_on; SI.\nIbit = F * ton",
    latex: "% I_bit = F * t_on; SI.\n\\[I_{\\mathrm{bit}}=F\\,t_{\\mathrm{on}}\\]",
  },
}
