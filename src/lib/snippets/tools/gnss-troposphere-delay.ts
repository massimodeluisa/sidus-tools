import type { FormulaSnippet } from '../types'

const A = "Saastamoinen-class tropo delay sketch; SI."

export const gnssTroposphereDelaySnippets: FormulaSnippet = {
  formulaId: 'gnss-troposphere-delay',
  assumptions: A,
  code: {
    python: "# Saastamoinen-class tropo delay sketch; SI.\nimport math\nz = math.pi / 2 - elev\nd = 0.002277 / math.cos(z) * (1013.25 + (1255 / 288.15 + 0.05) * 11)",
    javascript: "// Saastamoinen-class tropo delay sketch; SI.\nconst z = Math.PI / 2 - elev\nconst d = 0.002277 / Math.cos(z) * (1013.25 + (1255 / 288.15 + 0.05) * 11)",
    typescript: "// Saastamoinen-class tropo delay sketch; SI.\nconst z = Math.PI / 2 - elev\nconst d = 0.002277 / Math.cos(z) * (1013.25 + (1255 / 288.15 + 0.05) * 11)",
    c: "/* Saastamoinen-class tropo delay sketch; SI. */\nconst double z = M_PI / 2 - elev;\nconst double d = 0.002277 / cos(z) * (1013.25 + (1255 / 288.15 + 0.05) * 11);",
    cpp: "// Saastamoinen-class tropo delay sketch; SI.\nconst double z = M_PI / 2 - elev;\nconst double d = 0.002277 / cos(z) * (1013.25 + (1255 / 288.15 + 0.05) * 11);",
    rust: "// Saastamoinen-class tropo delay sketch; SI.\nlet z = std::f64::consts::PI / 2.0_f64 - elev;\nlet d = 0.002277_f64 / (z).cos() * (1013.25_f64 + (1255.0_f64 / 288.15_f64 + 0.05_f64) * 11.0_f64);",
    zig: "// Saastamoinen-class tropo delay sketch; SI.\nconst z = std.math.pi / @as(f64, 2.0) - elev;\nconst d = @as(f64, 0.002277) / std.math.cos(z) * (@as(f64, 1013.25) + (@as(f64, 1255.0) / @as(f64, 288.15) + @as(f64, 0.05)) * @as(f64, 11.0));",
    fortran: "! Saastamoinen-class tropo delay sketch; SI.\n  z = 3.141592653589793d0 / 2.0d0 - elev\n  d = 0.002277 / cos(z) * (1013.25 + (1255.0d0 / 288.15 + 0.05) * 11.0d0)",
    matlab: "% Saastamoinen-class tropo delay sketch; SI.\nz = pi / 2 - elev\nd = 0.002277 / cos(z) * (1013.25 + (1255 / 288.15 + 0.05) * 11)",
    julia: "# Saastamoinen-class tropo delay sketch; SI.\nz = π / 2 - elev\nd = 0.002277 / cos(z) * (1013.25 + (1255 / 288.15 + 0.05) * 11)",
    latex: "% Saastamoinen-class tropo delay sketch; SI.\n\\[d_{\\mathrm{trop}}\\approx\\frac{0.002277}{\\cos z}\\cdots\\]",
  },
}
