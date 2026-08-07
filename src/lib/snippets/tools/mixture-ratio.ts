import type { FormulaSnippet } from '../types'

const A = "Oxidizer-to-fuel mass-flow ratio; SI."

export const mixtureRatioSnippets: FormulaSnippet = {
  formulaId: 'mixture-ratio',
  assumptions: A,
  code: {
    python: "# Oxidizer-to-fuel mass-flow ratio; SI.\nr = mox / mfuel\nmdot = mox + mfuel",
    javascript: "// Oxidizer-to-fuel mass-flow ratio; SI.\nconst r = mox / mfuel\nconst mdot = mox + mfuel",
    typescript: "// Oxidizer-to-fuel mass-flow ratio; SI.\nconst r = mox / mfuel\nconst mdot = mox + mfuel",
    c: "/* Oxidizer-to-fuel mass-flow ratio; SI. */\nconst double r = mox / mfuel;\nconst double mdot = mox + mfuel;",
    cpp: "// Oxidizer-to-fuel mass-flow ratio; SI.\nconst double r = mox / mfuel;\nconst double mdot = mox + mfuel;",
    rust: "// Oxidizer-to-fuel mass-flow ratio; SI.\nlet r = mox / mfuel;\nlet mdot = mox + mfuel;",
    zig: "// Oxidizer-to-fuel mass-flow ratio; SI.\nconst r = mox / mfuel;\nconst mdot = mox + mfuel;",
    fortran: "! Oxidizer-to-fuel mass-flow ratio; SI.\n  r = mox / mfuel\n  mdot = mox + mfuel",
    matlab: "% Oxidizer-to-fuel mass-flow ratio; SI.\nr = mox / mfuel\nmdot = mox + mfuel",
    julia: "# Oxidizer-to-fuel mass-flow ratio; SI.\nr = mox / mfuel\nmdot = mox + mfuel",
    latex: "% Oxidizer-to-fuel mass-flow ratio; SI.\n\\[r=\\dot m_{\\mathrm{ox}}/\\dot m_{\\mathrm{f}},\\quad \\dot m=\\dot m_{\\mathrm{ox}}+\\dot m_{\\mathrm{f}}\\]",
  },
}
