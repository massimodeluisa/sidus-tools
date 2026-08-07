import type { FormulaSnippet } from '../types'

const A = "Flat vacuum ballistic range; SI."

export const ballisticRangeSnippets: FormulaSnippet = {
  formulaId: 'ballistic-range',
  assumptions: A,
  code: {
    python: "# Flat vacuum ballistic range; SI.\nimport math\nrange_m = v0**2 * math.sin(2 * elev) / g\ntof = 2 * v0 * math.sin(elev) / g\nhmax = (v0 * math.sin(elev))**2 / (2 * g)",
    javascript: "// Flat vacuum ballistic range; SI.\nconst range_m = v0**2 * Math.sin(2 * elev) / g\nconst tof = 2 * v0 * Math.sin(elev) / g\nconst hmax = (v0 * Math.sin(elev))**2 / (2 * g)",
    typescript: "// Flat vacuum ballistic range; SI.\nconst range_m = v0**2 * Math.sin(2 * elev) / g\nconst tof = 2 * v0 * Math.sin(elev) / g\nconst hmax = (v0 * Math.sin(elev))**2 / (2 * g)",
    c: "/* Flat vacuum ballistic range; SI. */\nconst double range_m = pow(v0, 2) * sin(2 * elev) / g;\nconst double tof = 2 * v0 * sin(elev) / g;\nconst double hmax = pow((v0 * sin(elev)), 2) / (2 * g);",
    cpp: "// Flat vacuum ballistic range; SI.\nconst double range_m = pow(v0, 2) * sin(2 * elev) / g;\nconst double tof = 2 * v0 * sin(elev) / g;\nconst double hmax = pow((v0 * sin(elev)), 2) / (2 * g);",
    rust: "// Flat vacuum ballistic range; SI.\nlet range_m = (v0).powi(2) * (2.0_f64 * elev).sin() / g;\nlet tof = 2.0_f64 * v0 * (elev).sin() / g;\nlet hmax = ((v0 * (elev).sin())).powi(2) / (2.0_f64 * g);",
    zig: "// Flat vacuum ballistic range; SI.\nconst range_m = std.math.pow(f64, v0, @as(f64, 2.0)) * std.math.sin(@as(f64, 2.0) * elev) / g;\nconst tof = @as(f64, 2.0) * v0 * std.math.sin(elev) / g;\nconst hmax = std.math.pow(f64, (v0 * std.math.sin(elev)), @as(f64, 2.0)) / (@as(f64, 2.0) * g);",
    fortran: "! Flat vacuum ballistic range; SI.\n  range_m = v0**2.0d0 * sin(2.0d0 * elev) / g\n  tof = 2.0d0 * v0 * sin(elev) / g\n  hmax = (v0 * sin(elev))**2.0d0 / (2.0d0 * g)",
    matlab: "% Flat vacuum ballistic range; SI.\nrange_m = v0^2 * sin(2 * elev) / g\ntof = 2 * v0 * sin(elev) / g\nhmax = (v0 * sin(elev))^2 / (2 * g)",
    julia: "# Flat vacuum ballistic range; SI.\nrange_m = v0**2 * sin(2 * elev) / g\ntof = 2 * v0 * sin(elev) / g\nhmax = (v0 * sin(elev))**2 / (2 * g)",
    latex: "% Flat vacuum ballistic range; SI.\n\\[R=\\frac{v_0^2\\sin 2\\gamma}{g}\\]",
  },
}
