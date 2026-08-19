import type { FormulaSnippet } from '../types'

const A = "Walker T/P spacing; SI rad."

export const constellationWalkerSnippets: FormulaSnippet = {
  formulaId: 'constellation-walker',
  assumptions: A,
  code: {
    python: "# Walker T/P spacing; SI rad.\nimport math\nspp = T / P\nd_in = 2 * math.pi / spp\nd_pl = 2 * math.pi / P",
    javascript: "// Walker T/P spacing; SI rad.\nconst spp = T / P\nconst d_in = 2 * Math.PI / spp\nconst d_pl = 2 * Math.PI / P",
    typescript: "// Walker T/P spacing; SI rad.\nconst spp = T / P\nconst d_in = 2 * Math.PI / spp\nconst d_pl = 2 * Math.PI / P",
    c: "/* Walker T/P spacing; SI rad. */\nconst double spp = T / P;\nconst double d_in = 2 * M_PI / spp;\nconst double d_pl = 2 * M_PI / P;",
    cpp: "// Walker T/P spacing; SI rad.\nconst double spp = T / P;\nconst double d_in = 2 * M_PI / spp;\nconst double d_pl = 2 * M_PI / P;",
    rust: "// Walker T/P spacing; SI rad.\nlet spp = T / P;\nlet d_in = 2.0_f64 * std::f64::consts::PI / spp;\nlet d_pl = 2.0_f64 * std::f64::consts::PI / P;",
    zig: "// Walker T/P spacing; SI rad.\nconst spp = T / P;\nconst d_in = @as(f64, 2.0) * std.math.pi / spp;\nconst d_pl = @as(f64, 2.0) * std.math.pi / P;",
    fortran: "! Walker T/P spacing; SI rad.\n  spp = T / P\n  d_in = 2.0d0 * 3.141592653589793d0 / spp\n  d_pl = 2.0d0 * 3.141592653589793d0 / P",
    matlab: "% Walker T/P spacing; SI rad.\nspp = T / P\nd_in = 2 * pi / spp\nd_pl = 2 * pi / P",
    julia: "# Walker T/P spacing; SI rad.\nspp = T / P\nd_in = 2 * π / spp\nd_pl = 2 * π / P",
    latex: "% Walker T/P spacing; SI rad.\n\\[\\Delta L=2\\pi/P,\\quad \\Delta u=2\\pi/(T/P)\\]",
  },
}
