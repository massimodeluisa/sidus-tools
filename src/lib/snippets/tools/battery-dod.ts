import type { FormulaSnippet } from '../types'

const A = "DoD = E_used / E_cap; SI."

export const batteryDodSnippets: FormulaSnippet = {
  formulaId: 'battery-dod',
  assumptions: A,
  code: {
    python: "# DoD = E_used / E_cap; SI.\nDoD = eUsed / eCap",
    javascript: "// DoD = E_used / E_cap; SI.\nconst DoD = eUsed / eCap",
    typescript: "// DoD = E_used / E_cap; SI.\nconst DoD = eUsed / eCap",
    c: "/* DoD = E_used / E_cap; SI. */\nconst double DoD = eUsed / eCap;",
    cpp: "// DoD = E_used / E_cap; SI.\nconst double DoD = eUsed / eCap;",
    rust: "// DoD = E_used / E_cap; SI.\nlet DoD = eUsed / eCap;",
    zig: "// DoD = E_used / E_cap; SI.\nconst DoD = eUsed / eCap;",
    fortran: "! DoD = E_used / E_cap; SI.\n  DoD = eUsed / eCap",
    matlab: "% DoD = E_used / E_cap; SI.\nDoD = eUsed / eCap",
    julia: "# DoD = E_used / E_cap; SI.\nDoD = eUsed / eCap",
    latex: "% DoD = E_used / E_cap; SI.\n\\[\\mathrm{DoD}=E_{\\mathrm{used}}/E_{\\mathrm{cap}}\\]",
  },
}
