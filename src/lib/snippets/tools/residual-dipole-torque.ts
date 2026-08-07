import type { FormulaSnippet } from '../types'

const A = "tau = m_res B; SI."

export const residualDipoleTorqueSnippets: FormulaSnippet = {
  formulaId: 'residual-dipole-torque',
  assumptions: A,
  code: {
    python: "# tau = m_res B; SI.\ntau = m * B",
    javascript: "// tau = m_res B; SI.\nconst tau = m * B",
    typescript: "// tau = m_res B; SI.\nconst tau = m * B",
    c: "/* tau = m_res B; SI. */\nconst double tau = m * B;",
    cpp: "// tau = m_res B; SI.\nconst double tau = m * B;",
    rust: "// tau = m_res B; SI.\nlet tau = m * B;",
    zig: "// tau = m_res B; SI.\nconst tau = m * B;",
    fortran: "! tau = m_res B; SI.\n  tau = m * B",
    matlab: "% tau = m_res B; SI.\ntau = m * B",
    julia: "# tau = m_res B; SI.\ntau = m * B",
    latex: "% tau = m_res B; SI.\n\\[\\tau=m_{\\mathrm{res}}B\\]",
  },
}
