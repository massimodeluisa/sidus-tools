import type { FormulaSnippet } from '../types'

const A = "J2 argument of perigee rate; SI."

export const argPerigeeDriftJ2Snippets: FormulaSnippet = {
  formulaId: 'arg-perigee-drift-j2',
  assumptions: A,
  code: {
    python: "# J2 argument of perigee rate; SI.\nimport math\nwdot = 0.75 * n * j2 * (R / sma_p)**2 * (5 * math.cos(i)**2 - 1)",
    javascript: "// J2 argument of perigee rate; SI.\nconst wdot = 0.75 * n * j2 * (R / sma_p)**2 * (5 * Math.cos(i)**2 - 1)",
    typescript: "// J2 argument of perigee rate; SI.\nconst wdot = 0.75 * n * j2 * (R / sma_p)**2 * (5 * Math.cos(i)**2 - 1)",
    c: "/* J2 argument of perigee rate; SI. */\nconst double wdot = 0.75 * n * j2 * pow((R / sma_p), 2) * (5 * pow(cos(i), 2) - 1);",
    cpp: "// J2 argument of perigee rate; SI.\nconst double wdot = 0.75 * n * j2 * pow((R / sma_p), 2) * (5 * pow(cos(i), 2) - 1);",
    rust: "// J2 argument of perigee rate; SI.\nlet wdot = 0.75_f64 * n * j2 * ((R / sma_p)).powi(2) * (5.0_f64 * ((i).cos()).powi(2) - 1.0_f64);",
    zig: "// J2 argument of perigee rate; SI.\nconst wdot = @as(f64, 0.75) * n * j2 * std.math.pow(f64, (R / sma_p), @as(f64, 2.0)) * (@as(f64, 5.0) * std.math.pow(f64, std.math.cos(i), @as(f64, 2.0)) - @as(f64, 1.0));",
    fortran: "! J2 argument of perigee rate; SI.\n  wdot = 0.75 * n * j2 * (R / sma_p)**2.0d0 * (5.0d0 * cos(i)**2.0d0 - 1.0d0)",
    matlab: "% J2 argument of perigee rate; SI.\nwdot = 0.75 * n * j2 * (R / sma_p)^2 * (5 * cos(i)^2 - 1)",
    julia: "# J2 argument of perigee rate; SI.\nwdot = 0.75 * n * j2 * (R / sma_p)^2 * (5 * cos(i)^2 - 1)",
    latex: "% J2 argument of perigee rate; SI.\n\\[\\dot\\omega=\\frac34 n J_2(R/p)^2(5\\cos^2 i-1)\\]",
  },
}
