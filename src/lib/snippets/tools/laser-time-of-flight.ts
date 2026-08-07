import type { FormulaSnippet } from '../types'

const A = "Range from RTT or one-way light time; SI."

export const laserTimeOfFlightSnippets: FormulaSnippet = {
  formulaId: 'laser-time-of-flight',
  assumptions: A,
  code: {
    python: "# Range from RTT or one-way light time; SI.\nc = 299792458.0\nR_rtt = c * t / 2\nR_one = c * t",
    javascript: "// Range from RTT or one-way light time; SI.\nconst c = 299792458.0\nconst R_rtt = c * t / 2\nconst R_one = c * t",
    typescript: "// Range from RTT or one-way light time; SI.\nconst c = 299792458.0\nconst R_rtt = c * t / 2\nconst R_one = c * t",
    c: "/* Range from RTT or one-way light time; SI. */\nconst double c = 299792458.0;\nconst double R_rtt = c * t / 2;\nconst double R_one = c * t;",
    cpp: "// Range from RTT or one-way light time; SI.\nconst double c = 299792458.0;\nconst double R_rtt = c * t / 2;\nconst double R_one = c * t;",
    rust: "// Range from RTT or one-way light time; SI.\nlet c = 299792458.0_f64;\nlet R_rtt = c * t / 2.0_f64;\nlet R_one = c * t;",
    zig: "// Range from RTT or one-way light time; SI.\nconst c = @as(f64, 299792458.0);\nconst R_rtt = c * t / @as(f64, 2.0);\nconst R_one = c * t;",
    fortran: "! Range from RTT or one-way light time; SI.\n  c = 299792458.0d0\n  R_rtt = c * t / 2.0d0\n  R_one = c * t",
    matlab: "% Range from RTT or one-way light time; SI.\nc = 299792458.0\nR_rtt = c * t / 2\nR_one = c * t",
    julia: "# Range from RTT or one-way light time; SI.\nc = 299792458.0\nR_rtt = c * t / 2\nR_one = c * t",
    latex: "% Range from RTT or one-way light time; SI.\n\\[R=c\\,\\Delta t/2\\quad(\\mathrm{RTT})\\]",
  },
}
