import type { FormulaSnippet } from '../types'

const A = "Isothermal or isentropic blowdown; SI."

export const blowdownTankSnippets: FormulaSnippet = {
  formulaId: 'blowdown-tank',
  assumptions: A,
  code: {
    python: "# Isothermal or isentropic blowdown; SI.\np2_iso = p1 * (V1 / V2)\np2_isen = p1 * (V1 / V2) ** gamma",
    javascript: "// Isothermal or isentropic blowdown; SI.\nconst p2_iso = p1 * (V1 / V2)\nconst p2_isen = p1 * (V1 / V2) ** gamma",
    typescript: "// Isothermal or isentropic blowdown; SI.\nconst p2_iso = p1 * (V1 / V2)\nconst p2_isen = p1 * (V1 / V2) ** gamma",
    c: "/* Isothermal or isentropic blowdown; SI. */\nconst double p2_iso = p1 * (V1 / V2);\nconst double p2_isen = p1 * pow((V1 / V2), gamma);",
    cpp: "// Isothermal or isentropic blowdown; SI.\nconst double p2_iso = p1 * (V1 / V2);\nconst double p2_isen = p1 * pow((V1 / V2), gamma);",
    rust: "// Isothermal or isentropic blowdown; SI.\nlet p2_iso = p1 * (V1 / V2);\nlet p2_isen = p1 * ((V1 / V2)).powf(gamma);",
    zig: "// Isothermal or isentropic blowdown; SI.\nconst p2_iso = p1 * (V1 / V2);\nconst p2_isen = p1 * std.math.pow(f64, (V1 / V2), gamma);",
    fortran: "! Isothermal or isentropic blowdown; SI.\n  p2_iso = p1 * (V1 / V2)\n  p2_isen = p1 * (V1 / V2) ** gamma",
    matlab: "% Isothermal or isentropic blowdown; SI.\np2_iso = p1 * (V1 / V2)\np2_isen = p1 * (V1 / V2) ^ gamma",
    julia: "# Isothermal or isentropic blowdown; SI.\np2_iso = p1 * (V1 / V2)\np2_isen = p1 * (V1 / V2) ^ gamma",
    latex: "% Isothermal or isentropic blowdown; SI.\n\\[p_2=p_1\\frac{V_1}{V_2}\\quad(\\mathrm{iso}),\\quad p_2=p_1\\left(\\frac{V_1}{V_2}\\right)^\\gamma\\quad(\\mathrm{isen})\\]",
  },
}
