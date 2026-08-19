import type { FormulaSnippet } from '../types'

const A = "Rough revisit from period and swath; SI."

export const revisitTimeSimpleSnippets: FormulaSnippet = {
  formulaId: 'revisit-time-simple',
  assumptions: A,
  code: {
    python: "# Rough revisit from period and swath; SI.\nimport math\nstrips = 2 * math.pi * 6378137 / swath\nt_rev = T * max(1.0, strips)",
    javascript: "// Rough revisit from period and swath; SI.\nconst strips = 2 * Math.PI * 6378137 / swath\nconst t_rev = T * Math.max(1.0, strips)",
    typescript: "// Rough revisit from period and swath; SI.\nconst strips = 2 * Math.PI * 6378137 / swath\nconst t_rev = T * Math.max(1.0, strips)",
    c: "/* Rough revisit from period and swath; SI. */\nconst double strips = 2 * M_PI * 6378137 / swath;\nconst double t_rev = T * fmax(1.0, strips);",
    cpp: "// Rough revisit from period and swath; SI.\nconst double strips = 2 * M_PI * 6378137 / swath;\nconst double t_rev = T * fmax(1.0, strips);",
    rust: "// Rough revisit from period and swath; SI.\nlet strips = 2.0_f64 * std::f64::consts::PI * 6378137.0_f64 / swath;\nlet t_rev = T * (1.0_f64).max(strips);",
    zig: "// Rough revisit from period and swath; SI.\nconst strips = @as(f64, 2.0) * std.math.pi * @as(f64, 6378137.0) / swath;\nconst t_rev = T * @max(@as(f64, 1.0), strips);",
    fortran: "! Rough revisit from period and swath; SI.\n  strips = 2.0d0 * 3.141592653589793d0 * 6378137.0d0 / swath\n  t_rev = T * max(1.0d0, strips)",
    matlab: "% Rough revisit from period and swath; SI.\nstrips = 2 * pi * 6378137 / swath\nt_rev = T * max(1.0, strips)",
    julia: "# Rough revisit from period and swath; SI.\nstrips = 2 * π * 6378137 / swath\nt_rev = T * max(1.0, strips)",
    latex: "% Rough revisit from period and swath; SI.\n\\[t_{\\mathrm{rev}}\\sim T_{\\mathrm{orb}}\\cdot N_{\\mathrm{strips}}\\]",
  },
}
