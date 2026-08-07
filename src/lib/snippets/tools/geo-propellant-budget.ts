import type { FormulaSnippet } from '../types'

const A = "Rocket equation propellant for multi-year SK; SI."

export const geoPropellantBudgetSnippets: FormulaSnippet = {
  formulaId: 'geo-propellant-budget',
  assumptions: A,
  code: {
    python: "# Rocket equation propellant for multi-year SK; SI.\nimport math\ndv = dvY * life\nm0 = mdry * math.exp(dv / (isp * 9.80665))\nmp = m0 - mdry",
    javascript: "// Rocket equation propellant for multi-year SK; SI.\nconst dv = dvY * life\nconst m0 = mdry * Math.exp(dv / (isp * 9.80665))\nconst mp = m0 - mdry",
    typescript: "// Rocket equation propellant for multi-year SK; SI.\nconst dv = dvY * life\nconst m0 = mdry * Math.exp(dv / (isp * 9.80665))\nconst mp = m0 - mdry",
    c: "/* Rocket equation propellant for multi-year SK; SI. */\nconst double dv = dvY * life;\nconst double m0 = mdry * exp(dv / (isp * 9.80665));\nconst double mp = m0 - mdry;",
    cpp: "// Rocket equation propellant for multi-year SK; SI.\nconst double dv = dvY * life;\nconst double m0 = mdry * exp(dv / (isp * 9.80665));\nconst double mp = m0 - mdry;",
    rust: "// Rocket equation propellant for multi-year SK; SI.\nlet dv = dvY * life;\nlet m0 = mdry * (dv / (isp * 9.80665_f64)).exp();\nlet mp = m0 - mdry;",
    zig: "// Rocket equation propellant for multi-year SK; SI.\nconst dv = dvY * life;\nconst m0 = mdry * std.math.exp(dv / (isp * @as(f64, 9.80665)));\nconst mp = m0 - mdry;",
    fortran: "! Rocket equation propellant for multi-year SK; SI.\n  dv = dvY * life\n  m0 = mdry * exp(dv / (isp * 9.80665))\n  mp = m0 - mdry",
    matlab: "% Rocket equation propellant for multi-year SK; SI.\ndv = dvY * life\nm0 = mdry * exp(dv / (isp * 9.80665))\nmp = m0 - mdry",
    julia: "# Rocket equation propellant for multi-year SK; SI.\ndv = dvY * life\nm0 = mdry * exp(dv / (isp * 9.80665))\nmp = m0 - mdry",
    latex: "% Rocket equation propellant for multi-year SK; SI.\n\\[m_0=m_f e^{\\Delta v/(I_{sp}g_0)}\\]",
  },
}
