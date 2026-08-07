import type { FormulaSnippet } from '../types'

const A = "Pavg = psun (1-fecl) eta; SI."

export const epsOrbitAverageSnippets: FormulaSnippet = {
  formulaId: 'eps-orbit-average',
  assumptions: A,
  code: {
    python: "# Pavg = psun (1-fecl) eta; SI.\nPavg = psun * (1 - fecl) * eta",
    javascript: "// Pavg = psun (1-fecl) eta; SI.\nconst Pavg = psun * (1 - fecl) * eta",
    typescript: "// Pavg = psun (1-fecl) eta; SI.\nconst Pavg = psun * (1 - fecl) * eta",
    c: "/* Pavg = psun (1-fecl) eta; SI. */\nconst double Pavg = psun * (1 - fecl) * eta;",
    cpp: "// Pavg = psun (1-fecl) eta; SI.\nconst double Pavg = psun * (1 - fecl) * eta;",
    rust: "// Pavg = psun (1-fecl) eta; SI.\nlet Pavg = psun * (1.0_f64 - fecl) * eta;",
    zig: "// Pavg = psun (1-fecl) eta; SI.\nconst Pavg = psun * (@as(f64, 1.0) - fecl) * eta;",
    fortran: "! Pavg = psun (1-fecl) eta; SI.\n  Pavg = psun * (1.0d0 - fecl) * eta",
    matlab: "% Pavg = psun (1-fecl) eta; SI.\nPavg = psun * (1 - fecl) * eta",
    julia: "# Pavg = psun (1-fecl) eta; SI.\nPavg = psun * (1 - fecl) * eta",
    latex: "% Pavg = psun (1-fecl) eta; SI.\n\\[P_{\\mathrm{avg}}=P_{\\mathrm{sun}}(1-f_{\\mathrm{ecl}})\\eta\\]",
  },
}
