import type { FormulaSnippet } from '../types'

const A = "b = (mu/vinf^2)/tan(delta/2); SI."

export const bPlaneImpactSnippets: FormulaSnippet = {
  formulaId: 'b-plane-impact',
  assumptions: A,
  code: {
    python: "# b = (mu/vinf^2)/tan(delta/2); SI.\nimport math\nb = (mu / vinf**2) / math.tan(delta / 2)",
    javascript: "// b = (mu/vinf^2)/tan(delta/2); SI.\nconst b = (mu / vinf**2) / Math.tan(delta / 2)",
    typescript: "// b = (mu/vinf^2)/tan(delta/2); SI.\nconst b = (mu / vinf**2) / Math.tan(delta / 2)",
    c: "/* b = (mu/vinf^2)/tan(delta/2); SI. */\nconst double b = (mu / pow(vinf, 2)) / tan(delta / 2);",
    cpp: "// b = (mu/vinf^2)/tan(delta/2); SI.\nconst double b = (mu / pow(vinf, 2)) / tan(delta / 2);",
    rust: "// b = (mu/vinf^2)/tan(delta/2); SI.\nlet b = (mu / (vinf).powi(2)) / (delta / 2.0_f64).tan();",
    zig: "// b = (mu/vinf^2)/tan(delta/2); SI.\nconst b = (mu / std.math.pow(f64, vinf, @as(f64, 2.0))) / std.math.tan(delta / @as(f64, 2.0));",
    fortran: "! b = (mu/vinf^2)/tan(delta/2); SI.\n  b = (mu / vinf**2.0d0) / tan(delta / 2.0d0)",
    matlab: "% b = (mu/vinf^2)/tan(delta/2); SI.\nb = (mu / vinf^2) / tan(delta / 2)",
    julia: "# b = (mu/vinf^2)/tan(delta/2); SI.\nb = (mu / vinf**2) / tan(delta / 2)",
    latex: "% b = (mu/vinf^2)/tan(delta/2); SI.\n\\[b=\\frac{\\mu}{v_\\infty^2\\tan(\\delta/2)}\\]",
  },
}
