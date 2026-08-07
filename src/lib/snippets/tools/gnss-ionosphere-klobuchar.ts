import type { FormulaSnippet } from '../types'

const A = "Klobuchar-class slant iono delay; SI."

export const gnssIonosphereKlobucharSnippets: FormulaSnippet = {
  formulaId: 'gnss-ionosphere-klobuchar',
  assumptions: A,
  code: {
    python: "# Klobuchar-class slant iono delay; SI.\nimport math\nmf = 1 / math.sin(elev)\nd = (40.3 * tecu * 1e16) / (f**2) * mf",
    javascript: "// Klobuchar-class slant iono delay; SI.\nconst mf = 1 / Math.sin(elev)\nconst d = (40.3 * tecu * 1e16) / (f**2) * mf",
    typescript: "// Klobuchar-class slant iono delay; SI.\nconst mf = 1 / Math.sin(elev)\nconst d = (40.3 * tecu * 1e16) / (f**2) * mf",
    c: "/* Klobuchar-class slant iono delay; SI. */\nconst double mf = 1 / sin(elev);\nconst double d = (40.3 * tecu * 1e16) / (pow(f, 2)) * mf;",
    cpp: "// Klobuchar-class slant iono delay; SI.\nconst double mf = 1 / sin(elev);\nconst double d = (40.3 * tecu * 1e16) / (pow(f, 2)) * mf;",
    rust: "// Klobuchar-class slant iono delay; SI.\nlet mf = 1.0_f64 / (elev).sin();\nlet d = (40.3_f64 * tecu * 1e16_f64) / ((f).powi(2)) * mf;",
    zig: "// Klobuchar-class slant iono delay; SI.\nconst mf = @as(f64, 1.0) / std.math.sin(elev);\nconst d = (@as(f64, 40.3) * tecu * 1e16) / (std.math.pow(f64, f, @as(f64, 2.0))) * mf;",
    fortran: "! Klobuchar-class slant iono delay; SI.\n  mf = 1.0d0 / sin(elev)\n  d = (40.3 * tecu * 1e16) / (f**2.0d0) * mf",
    matlab: "% Klobuchar-class slant iono delay; SI.\nmf = 1 / sin(elev)\nd = (40.3 * tecu * 1e16) / (f^2) * mf",
    julia: "# Klobuchar-class slant iono delay; SI.\nmf = 1 / sin(elev)\nd = (40.3 * tecu * 1e16) / (f**2) * mf",
    latex: "% Klobuchar-class slant iono delay; SI.\n\\[d_{\\mathrm{iono}}\\propto\\mathrm{TEC}/f^2\\cdot m(el)\\]",
  },
}
