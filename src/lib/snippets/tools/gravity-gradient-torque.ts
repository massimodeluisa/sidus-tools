import type { FormulaSnippet } from '../types'

const A = "Educational GG torque magnitude; SI."

export const gravityGradientTorqueSnippets: FormulaSnippet = {
  formulaId: 'gravity-gradient-torque',
  assumptions: A,
  code: {
    python: "# Educational GG torque magnitude; SI.\nimport math\ntau = (3 * mu / r**3) * (dI / 2) * abs(math.sin(2 * delta))",
    javascript: "// Educational GG torque magnitude; SI.\nconst tau = (3 * mu / r**3) * (dI / 2) * abs(Math.sin(2 * delta))",
    typescript: "// Educational GG torque magnitude; SI.\nconst tau = (3 * mu / r**3) * (dI / 2) * abs(Math.sin(2 * delta))",
    c: "/* Educational GG torque magnitude; SI. */\nconst double tau = (3 * mu / pow(r, 3)) * (dI / 2) * fabs(sin(2 * delta));",
    cpp: "// Educational GG torque magnitude; SI.\nconst double tau = (3 * mu / pow(r, 3)) * (dI / 2) * fabs(sin(2 * delta));",
    rust: "// Educational GG torque magnitude; SI.\nlet tau = (3.0_f64 * mu / (r).powi(3)) * (dI / 2.0_f64) * ((2.0_f64 * delta).sin()).abs();",
    zig: "// Educational GG torque magnitude; SI.\nconst tau = (@as(f64, 3.0) * mu / std.math.pow(f64, r, @as(f64, 3.0))) * (dI / @as(f64, 2.0)) * @abs(std.math.sin(@as(f64, 2.0) * delta));",
    fortran: "! Educational GG torque magnitude; SI.\n  tau = (3.0d0 * mu / r**3.0d0) * (dI / 2.0d0) * abs(sin(2.0d0 * delta))",
    matlab: "% Educational GG torque magnitude; SI.\ntau = (3 * mu / r^3) * (dI / 2) * abs(sin(2 * delta))",
    julia: "# Educational GG torque magnitude; SI.\ntau = (3 * mu / r**3) * (dI / 2) * abs(sin(2 * delta))",
    latex: "% Educational GG torque magnitude; SI.\n\\[\\tau\\approx\\frac{3\\mu}{r^3}\\frac{\\Delta I}{2}|\\sin 2\\delta|\\]",
  },
}
