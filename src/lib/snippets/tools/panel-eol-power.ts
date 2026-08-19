import type { FormulaSnippet } from '../types'

const A = "P = P0 (1-d)^years; SI."

export const panelEolPowerSnippets: FormulaSnippet = {
  formulaId: 'panel-eol-power',
  assumptions: A,
  code: {
    python: "# P = P0 (1-d)^years; SI.\nP = p0 * (1 - d) ** years",
    javascript: "// P = P0 (1-d)^years; SI.\nconst P = p0 * (1 - d) ** years",
    typescript: "// P = P0 (1-d)^years; SI.\nconst P = p0 * (1 - d) ** years",
    c: "/* P = P0 (1-d)^years; SI. */\nconst double P = p0 * pow((1 - d), years);",
    cpp: "// P = P0 (1-d)^years; SI.\nconst double P = p0 * pow((1 - d), years);",
    rust: "// P = P0 (1-d)^years; SI.\nlet P = p0 * ((1.0_f64 - d)).powf(years);",
    zig: "// P = P0 (1-d)^years; SI.\nconst P = p0 * std.math.pow(f64, (@as(f64, 1.0) - d), years);",
    fortran: "! P = P0 (1-d)^years; SI.\n  P = p0 * (1.0d0 - d) ** years",
    matlab: "% P = P0 (1-d)^years; SI.\nP = p0 * (1 - d) ^ years",
    julia: "# P = P0 (1-d)^years; SI.\nP = p0 * (1 - d) ^ years",
    latex: "% P = P0 (1-d)^years; SI.\n\\[P=P_0(1-d)^y\\]",
  },
}
