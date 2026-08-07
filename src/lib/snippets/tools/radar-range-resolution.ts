import type { FormulaSnippet } from '../types'

const A = "delta_r = c/(2 B); SI."

export const radarRangeResolutionSnippets: FormulaSnippet = {
  formulaId: 'radar-range-resolution',
  assumptions: A,
  code: {
    python: "# delta_r = c/(2 B); SI.\nc = 299792458.0\ndr = c / (2 * B)",
    javascript: "// delta_r = c/(2 B); SI.\nconst c = 299792458.0\nconst dr = c / (2 * B)",
    typescript: "// delta_r = c/(2 B); SI.\nconst c = 299792458.0\nconst dr = c / (2 * B)",
    c: "/* delta_r = c/(2 B); SI. */\nconst double c = 299792458.0;\nconst double dr = c / (2 * B);",
    cpp: "// delta_r = c/(2 B); SI.\nconst double c = 299792458.0;\nconst double dr = c / (2 * B);",
    rust: "// delta_r = c/(2 B); SI.\nlet c = 299792458.0_f64;\nlet dr = c / (2.0_f64 * B);",
    zig: "// delta_r = c/(2 B); SI.\nconst c = @as(f64, 299792458.0);\nconst dr = c / (@as(f64, 2.0) * B);",
    fortran: "! delta_r = c/(2 B); SI.\n  c = 299792458.0d0\n  dr = c / (2.0d0 * B)",
    matlab: "% delta_r = c/(2 B); SI.\nc = 299792458.0\ndr = c / (2 * B)",
    julia: "# delta_r = c/(2 B); SI.\nc = 299792458.0\ndr = c / (2 * B)",
    latex: "% delta_r = c/(2 B); SI.\n\\[\\delta_r=c/(2B)\\]",
  },
}
