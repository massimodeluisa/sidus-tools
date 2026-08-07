import type { FormulaSnippet } from '../types'

const A = "a = 2 eta P A /(c m); SI."

export const solarSailAccelSnippets: FormulaSnippet = {
  formulaId: 'solar-sail-accel',
  assumptions: A,
  code: {
    python: "# a = 2 eta P A /(c m); SI.\nc = 299792458.0\na = 2 * eta * flux * A / (c * m)",
    javascript: "// a = 2 eta P A /(c m); SI.\nconst c = 299792458.0\nconst a = 2 * eta * flux * A / (c * m)",
    typescript: "// a = 2 eta P A /(c m); SI.\nconst c = 299792458.0\nconst a = 2 * eta * flux * A / (c * m)",
    c: "/* a = 2 eta P A /(c m); SI. */\nconst double c = 299792458.0;\nconst double a = 2 * eta * flux * A / (c * m);",
    cpp: "// a = 2 eta P A /(c m); SI.\nconst double c = 299792458.0;\nconst double a = 2 * eta * flux * A / (c * m);",
    rust: "// a = 2 eta P A /(c m); SI.\nlet c = 299792458.0_f64;\nlet a = 2.0_f64 * eta * flux * A / (c * m);",
    zig: "// a = 2 eta P A /(c m); SI.\nconst c = @as(f64, 299792458.0);\nconst a = @as(f64, 2.0) * eta * flux * A / (c * m);",
    fortran: "! a = 2 eta P A /(c m); SI.\n  c = 299792458.0d0\n  a = 2.0d0 * eta * flux * A / (c * m)",
    matlab: "% a = 2 eta P A /(c m); SI.\nc = 299792458.0\na = 2 * eta * flux * A / (c * m)",
    julia: "# a = 2 eta P A /(c m); SI.\nc = 299792458.0\na = 2 * eta * flux * A / (c * m)",
    latex: "% a = 2 eta P A /(c m); SI.\n\\[a=\\frac{2\\eta P A}{c m}\\]",
  },
}
