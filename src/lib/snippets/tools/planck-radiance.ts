import type { FormulaSnippet } from '../types'

const A = "B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI."

export const planckRadianceSnippets: FormulaSnippet = {
  formulaId: 'planck-radiance',
  assumptions: A,
  code: {
    python:
      "# B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\nimport math\nh = 6.62607015e-34\nkB = 1.380649e-23\nc = 299792458.0\nx = h * c / (lam * kB * T)\nB = (2.0 * h * c**2 / lam**5) / (math.exp(x) - 1.0)",
    javascript:
      "// B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\nconst h = 6.62607015e-34\nconst kB = 1.380649e-23\nconst c = 299792458.0\nconst x = h * c / (lam * kB * T)\nconst B = (2.0 * h * c**2 / lam**5) / (Math.exp(x) - 1.0)",
    typescript:
      "// B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\nconst h = 6.62607015e-34\nconst kB = 1.380649e-23\nconst c = 299792458.0\nconst x = h * c / (lam * kB * T)\nconst B = (2.0 * h * c**2 / lam**5) / (Math.exp(x) - 1.0)",
    c: "/* B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI. */\nconst double h = 6.62607015e-34;\nconst double kB = 1.380649e-23;\nconst double c = 299792458.0;\nconst double x = h * c / (lam * kB * T);\nconst double B = (2.0 * h * c * c / pow(lam, 5)) / (exp(x) - 1.0);",
    cpp: "// B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\nconst double h = 6.62607015e-34;\nconst double kB = 1.380649e-23;\nconst double c = 299792458.0;\nconst double x = h * c / (lam * kB * T);\nconst double B = (2.0 * h * c * c / pow(lam, 5)) / (exp(x) - 1.0);",
    rust: "// B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\nlet h = 6.62607015e-34_f64;\nlet kB = 1.380649e-23_f64;\nlet c = 299792458.0_f64;\nlet x = h * c / (lam * kB * T);\nlet B = (2.0_f64 * h * c.powi(2) / lam.powf(5.0_f64)) / (x.exp() - 1.0_f64);",
    zig: "// B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\nconst h = @as(f64, 6.62607015e-34);\nconst kB = @as(f64, 1.380649e-23);\nconst c = @as(f64, 299792458.0);\nconst x = h * c / (lam * kB * T);\nconst B = (@as(f64, 2.0) * h * c * c / std.math.pow(f64, lam, @as(f64, 5.0))) / (@exp(x) - @as(f64, 1.0));",
    fortran:
      "! B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\n  h = 6.62607015d-34\n  kB = 1.380649d-23\n  c = 299792458.0d0\n  x = h * c / (lam * kB * T)\n  B = (2.0d0 * h * c**2.0d0 / lam**5.0d0) / (exp(x) - 1.0d0)",
    matlab:
      "% B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\nh = 6.62607015e-34\nkB = 1.380649e-23\nc = 299792458.0\nx = h * c / (lam * kB * T)\nB = (2.0 * h * c^2 / lam^5) / (exp(x) - 1.0)",
    julia:
      "# B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\nh = 6.62607015e-34\nkB = 1.380649e-23\nc = 299792458.0\nx = h * c / (lam * kB * T)\nB = (2.0 * h * c^2 / lam^5) / (exp(x) - 1.0)",
    latex:
      "% B_lam = 2 h c^2 / lam^5 / (exp(h c / (lam k T)) - 1); SI.\n\\[B_\\lambda=\\frac{2hc^{2}}{\\lambda^{5}}\\frac{1}{e^{hc/(\\lambda kT)}-1}\\]",
  },
}
