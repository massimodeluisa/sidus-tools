import type { FormulaSnippet } from '../types'

const A = "EIRP = P G; G/T = G / Tsys; SI linear."

export const eirpGtSnippets: FormulaSnippet = {
  formulaId: 'eirp-gt',
  assumptions: A,
  code: {
    python: "# EIRP = P G; G/T = G / Tsys; SI linear.\nimport math\neirp = P * G\ngt = G / Tsys\neirp_dbw = 10.0 * math.log10(eirp)\ngt_db = 10.0 * math.log10(gt)",
    javascript: "// EIRP = P G; G/T = G / Tsys; SI linear.\nconst eirp = P * G\nconst gt = G / Tsys\nconst eirp_dbw = 10.0 * Math.log10(eirp)\nconst gt_db = 10.0 * Math.log10(gt)",
    typescript: "// EIRP = P G; G/T = G / Tsys; SI linear.\nconst eirp = P * G\nconst gt = G / Tsys\nconst eirp_dbw = 10.0 * Math.log10(eirp)\nconst gt_db = 10.0 * Math.log10(gt)",
    c: "/* EIRP = P G; G/T = G / Tsys; SI linear. */\nconst double eirp = P * G;\nconst double gt = G / Tsys;\nconst double eirp_dbw = 10.0 * log10(eirp);\nconst double gt_db = 10.0 * log10(gt);",
    cpp: "// EIRP = P G; G/T = G / Tsys; SI linear.\nconst double eirp = P * G;\nconst double gt = G / Tsys;\nconst double eirp_dbw = 10.0 * log10(eirp);\nconst double gt_db = 10.0 * log10(gt);",
    rust: "// EIRP = P G; G/T = G / Tsys; SI linear.\nlet eirp = P * G;\nlet gt = G / Tsys;\nlet eirp_dbw = 10.0_f64 * eirp.log10();\nlet gt_db = 10.0_f64 * gt.log10();",
    zig: "// EIRP = P G; G/T = G / Tsys; SI linear.\nconst eirp = P * G;\nconst gt = G / Tsys;\nconst eirp_dbw = @as(f64, 10.0) * std.math.log10(eirp);\nconst gt_db = @as(f64, 10.0) * std.math.log10(gt);",
    fortran: "! EIRP = P G; G/T = G / Tsys; SI linear.\n  eirp = P * G\n  gt = G / Tsys\n  eirp_dbw = 10.0d0 * log10(eirp)\n  gt_db = 10.0d0 * log10(gt)",
    matlab: "% EIRP = P G; G/T = G / Tsys; SI linear.\neirp = P * G\ngt = G / Tsys\neirp_dbw = 10.0 * log10(eirp)\ngt_db = 10.0 * log10(gt)",
    julia: "# EIRP = P G; G/T = G / Tsys; SI linear.\neirp = P * G\ngt = G / Tsys\neirp_dbw = 10.0 * log10(eirp)\ngt_db = 10.0 * log10(gt)",
    latex: "% EIRP = P G; G/T = G / Tsys; SI linear.\n\\[\\mathrm{EIRP}=PG,\\quad G/T=G/T_{\\mathrm{sys}}\\]",
  },
}
