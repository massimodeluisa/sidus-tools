import type { FormulaSnippet } from '../types'

const A = "r_H ≈ a (m/(3M))^{1/3}; SI."

export const hillSphereSnippets: FormulaSnippet = {
  formulaId: 'hill-sphere',
  assumptions: A,
  code: {
    python: "# r_H ≈ a (m/(3M))^{1/3}; SI.\nrH = a * (m / (3 * M)) ** (1 / 3)",
    javascript: "// r_H ≈ a (m/(3M))^{1/3}; SI.\nconst rH = a * (m / (3 * M)) ** (1 / 3)",
    typescript: "// r_H ≈ a (m/(3M))^{1/3}; SI.\nconst rH = a * (m / (3 * M)) ** (1 / 3)",
    c: "/* r_H ≈ a (m/(3M))^{1/3}; SI. */\nconst double rH = a * pow((m / (3 * M)), (1 / 3));",
    cpp: "// r_H ≈ a (m/(3M))^{1/3}; SI.\nconst double rH = a * pow((m / (3 * M)), (1 / 3));",
    rust: "// r_H ≈ a (m/(3M))^{1/3}; SI.\nlet rH = a * ((m / (3.0_f64 * M))).powf((1.0_f64 / 3.0_f64));",
    zig: "// r_H ≈ a (m/(3M))^{1/3}; SI.\nconst rH = a * std.math.pow(f64, (m / (@as(f64, 3.0) * M)), (@as(f64, 1.0) / @as(f64, 3.0)));",
    fortran: "! r_H ≈ a (m/(3M))^{1/3}; SI.\n  rH = a * (m / (3.0d0 * M)) ** (1.0d0 / 3.0d0)",
    matlab: "% r_H ≈ a (m/(3M))^{1/3}; SI.\nrH = a * (m / (3 * M)) ^ (1 / 3)",
    julia: "# r_H ≈ a (m/(3M))^{1/3}; SI.\nrH = a * (m / (3 * M)) ^ (1 / 3)",
    latex: "% r_H ≈ a (m/(3M))^{1/3}; SI.\n\\[r_H\\approx a\\left(\\frac{m}{3M}\\right)^{1/3}\\]",
  },
}
