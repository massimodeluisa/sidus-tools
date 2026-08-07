import type { FormulaSnippet } from '../types'

const A = "tau = m B sin theta; SI."

export const magneticTorqueSnippets: FormulaSnippet = {
  formulaId: 'magnetic-torque',
  assumptions: A,
  code: {
    python: "# tau = m B sin theta; SI.\nimport math\ntau = m * B * math.sin(ang)",
    javascript: "// tau = m B sin theta; SI.\nconst tau = m * B * Math.sin(ang)",
    typescript: "// tau = m B sin theta; SI.\nconst tau = m * B * Math.sin(ang)",
    c: "/* tau = m B sin theta; SI. */\nconst double tau = m * B * sin(ang);",
    cpp: "// tau = m B sin theta; SI.\nconst double tau = m * B * sin(ang);",
    rust: "// tau = m B sin theta; SI.\nlet tau = m * B * (ang).sin();",
    zig: "// tau = m B sin theta; SI.\nconst tau = m * B * std.math.sin(ang);",
    fortran: "! tau = m B sin theta; SI.\n  tau = m * B * sin(ang)",
    matlab: "% tau = m B sin theta; SI.\ntau = m * B * sin(ang)",
    julia: "# tau = m B sin theta; SI.\ntau = m * B * sin(ang)",
    latex: "% tau = m B sin theta; SI.\n\\[\\tau=mB\\sin\\theta\\]",
  },
}
