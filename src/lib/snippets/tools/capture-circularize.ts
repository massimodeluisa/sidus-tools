import type { FormulaSnippet } from '../types'

const A = "Δv = vp_hyp - v_circ; SI."

export const captureCircularizeSnippets: FormulaSnippet = {
  formulaId: 'capture-circularize',
  assumptions: A,
  code: {
    python: "# Δv = vp_hyp - v_circ; SI.\nimport math\nvp = math.sqrt(vinf**2 + 2 * mu / rp)\nvc = math.sqrt(mu / rp)\ndv = vp - vc",
    javascript: "// Δv = vp_hyp - v_circ; SI.\nconst vp = Math.sqrt(vinf**2 + 2 * mu / rp)\nconst vc = Math.sqrt(mu / rp)\nconst dv = vp - vc",
    typescript: "// Δv = vp_hyp - v_circ; SI.\nconst vp = Math.sqrt(vinf**2 + 2 * mu / rp)\nconst vc = Math.sqrt(mu / rp)\nconst dv = vp - vc",
    c: "/* Δv = vp_hyp - v_circ; SI. */\nconst double vp = sqrt(pow(vinf, 2) + 2 * mu / rp);\nconst double vc = sqrt(mu / rp);\nconst double dv = vp - vc;",
    cpp: "// Δv = vp_hyp - v_circ; SI.\nconst double vp = sqrt(pow(vinf, 2) + 2 * mu / rp);\nconst double vc = sqrt(mu / rp);\nconst double dv = vp - vc;",
    rust: "// Δv = vp_hyp - v_circ; SI.\nlet vp = ((vinf).powi(2) + 2.0_f64 * mu / rp).sqrt();\nlet vc = (mu / rp).sqrt();\nlet dv = vp - vc;",
    zig: "// Δv = vp_hyp - v_circ; SI.\nconst vp = std.math.sqrt(std.math.pow(f64, vinf, @as(f64, 2.0)) + @as(f64, 2.0) * mu / rp);\nconst vc = std.math.sqrt(mu / rp);\nconst dv = vp - vc;",
    fortran: "! Δv = vp_hyp - v_circ; SI.\n  vp = sqrt(vinf**2.0d0 + 2.0d0 * mu / rp)\n  vc = sqrt(mu / rp)\n  dv = vp - vc",
    matlab: "% Δv = vp_hyp - v_circ; SI.\nvp = sqrt(vinf^2 + 2 * mu / rp)\nvc = sqrt(mu / rp)\ndv = vp - vc",
    julia: "# Δv = vp_hyp - v_circ; SI.\nvp = sqrt(vinf^2 + 2 * mu / rp)\nvc = sqrt(mu / rp)\ndv = vp - vc",
    latex: "% Δv = vp_hyp - v_circ; SI.\n\\[\\Delta v=v_{p,\\mathrm{hyp}}-v_{\\mathrm{circ}}\\]",
  },
}
