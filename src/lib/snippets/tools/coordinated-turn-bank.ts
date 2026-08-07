import type { FormulaSnippet } from '../types'

const A = "tan phi = v^2/(g R); SI."

export const coordinatedTurnBankSnippets: FormulaSnippet = {
  formulaId: 'coordinated-turn-bank',
  assumptions: A,
  code: {
    python: "# tan phi = v^2/(g R); SI.\nimport math\nphi = math.atan(v**2 / (g * R))",
    javascript: "// tan phi = v^2/(g R); SI.\nconst phi = Math.atan(v**2 / (g * R))",
    typescript: "// tan phi = v^2/(g R); SI.\nconst phi = Math.atan(v**2 / (g * R))",
    c: "/* tan phi = v^2/(g R); SI. */\nconst double phi = atan(pow(v, 2) / (g * R));",
    cpp: "// tan phi = v^2/(g R); SI.\nconst double phi = atan(pow(v, 2) / (g * R));",
    rust: "// tan phi = v^2/(g R); SI.\nlet phi = ((v).powi(2) / (g * R)).atan();",
    zig: "// tan phi = v^2/(g R); SI.\nconst phi = std.math.atan(std.math.pow(f64, v, @as(f64, 2.0)) / (g * R));",
    fortran: "! tan phi = v^2/(g R); SI.\n  phi = atan(v**2.0d0 / (g * R))",
    matlab: "% tan phi = v^2/(g R); SI.\nphi = atan(v^2 / (g * R))",
    julia: "# tan phi = v^2/(g R); SI.\nphi = atan(v**2 / (g * R))",
    latex: "% tan phi = v^2/(g R); SI.\n\\[\\tan\\phi=\\frac{v^2}{gR}\\]",
  },
}
