import type { FormulaSnippet } from '../types'

const A = "Ae = G lambda^2 / (4 pi); SI."

export const antennaGainEffectiveSnippets: FormulaSnippet = {
  formulaId: 'antenna-gain-effective',
  assumptions: A,
  code: {
    python: "# Ae = G lambda^2 / (4 pi); SI.\nimport math\nAe = G * lam**2 / (4 * math.pi)",
    javascript: "// Ae = G lambda^2 / (4 pi); SI.\nconst Ae = G * lam**2 / (4 * Math.PI)",
    typescript: "// Ae = G lambda^2 / (4 pi); SI.\nconst Ae = G * lam**2 / (4 * Math.PI)",
    c: "/* Ae = G lambda^2 / (4 pi); SI. */\nconst double Ae = G * pow(lam, 2) / (4 * M_PI);",
    cpp: "// Ae = G lambda^2 / (4 pi); SI.\nconst double Ae = G * pow(lam, 2) / (4 * M_PI);",
    rust: "// Ae = G lambda^2 / (4 pi); SI.\nlet Ae = G * (lam).powi(2) / (4.0_f64 * std::f64::consts::PI);",
    zig: "// Ae = G lambda^2 / (4 pi); SI.\nconst Ae = G * std.math.pow(f64, lam, @as(f64, 2.0)) / (@as(f64, 4.0) * std.math.pi);",
    fortran: "! Ae = G lambda^2 / (4 pi); SI.\n  Ae = G * lam**2.0d0 / (4.0d0 * 3.141592653589793d0)",
    matlab: "% Ae = G lambda^2 / (4 pi); SI.\nAe = G * lam^2 / (4 * pi)",
    julia: "# Ae = G lambda^2 / (4 pi); SI.\nAe = G * lam^2 / (4 * π)",
    latex: "% Ae = G lambda^2 / (4 pi); SI.\n\\[A_e=\\frac{G\\lambda^2}{4\\pi}\\]",
  },
}
