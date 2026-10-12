import type { FormulaSnippet } from '../types'

const A = "fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI."

export const dopplerShiftLeoSnippets: FormulaSnippet = {
  formulaId: 'doppler-shift-leo',
  assumptions: A,
  code: {
    python: "# fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\nc = 299792458.0\nfd = f0 * vr / c",
    javascript: "// fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\nconst c = 299792458.0\nconst fd = f0 * vr / c",
    typescript: "// fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\nconst c = 299792458.0\nconst fd = f0 * vr / c",
    c: "/* fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI. */\nconst double c = 299792458.0;\nconst double fd = f0 * vr / c;",
    cpp: "// fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\nconst double c = 299792458.0;\nconst double fd = f0 * vr / c;",
    rust: "// fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\nlet c = 299792458.0_f64;\nlet fd = f0 * vr / c;",
    zig: "// fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\nconst c = @as(f64, 299792458.0);\nconst fd = f0 * vr / c;",
    fortran: "! fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\n  c = 299792458.0d0\n  fd = f0 * vr / c",
    matlab: "% fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\nc = 299792458.0\nfd = f0 * vr / c",
    julia: "# fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\nc = 299792458.0\nfd = f0 * vr / c",
    latex: "% fd = f0 * vr / c; vr > 0 when the source approaches (one-way). SI.\n\\[f_d=f_0 v_r/c\\]",
  },
}
