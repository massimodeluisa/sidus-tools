import type { FormulaSnippet } from '../types'

const A = "Δf/f ≈ ΔΦ/c² − v²/(2c²); SI."

export const relativityClockRateSnippets: FormulaSnippet = {
  formulaId: 'relativity-clock-rate',
  assumptions: A,
  code: {
    python: "# Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\nc = 299792458.0\ndf_f = dPhi / c**2 - v**2 / (2 * c**2)",
    javascript: "// Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\nconst c = 299792458.0\nconst df_f = dPhi / c**2 - v**2 / (2 * c**2)",
    typescript: "// Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\nconst c = 299792458.0\nconst df_f = dPhi / c**2 - v**2 / (2 * c**2)",
    c: "/* Δf/f ≈ ΔΦ/c² − v²/(2c²); SI. */\nconst double c = 299792458.0;\nconst double df_f = dPhi / pow(c, 2) - pow(v, 2) / (2 * pow(c, 2));",
    cpp: "// Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\nconst double c = 299792458.0;\nconst double df_f = dPhi / pow(c, 2) - pow(v, 2) / (2 * pow(c, 2));",
    rust: "// Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\nlet c = 299792458.0_f64;\nlet df_f = dPhi / (c).powi(2) - (v).powi(2) / (2.0_f64 * (c).powi(2));",
    zig: "// Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\nconst c = @as(f64, 299792458.0);\nconst df_f = dPhi / std.math.pow(f64, c, @as(f64, 2.0)) - std.math.pow(f64, v, @as(f64, 2.0)) / (@as(f64, 2.0) * std.math.pow(f64, c, @as(f64, 2.0)));",
    fortran: "! Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\n  c = 299792458.0d0\n  df_f = dPhi / c**2.0d0 - v**2.0d0 / (2.0d0 * c**2.0d0)",
    matlab: "% Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\nc = 299792458.0\ndf_f = dPhi / c^2 - v^2 / (2 * c^2)",
    julia: "# Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\nc = 299792458.0\ndf_f = dPhi / c**2 - v**2 / (2 * c**2)",
    latex: "% Δf/f ≈ ΔΦ/c² − v²/(2c²); SI.\n\\[\\frac{\\Delta f}{f}\\approx\\frac{\\Delta\\Phi}{c^2}-\\frac{v^2}{2c^2}\\]",
  },
}
