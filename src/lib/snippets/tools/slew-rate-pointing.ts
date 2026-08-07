import type { FormulaSnippet } from '../types'

const A = "Rest-to-rest slew with w_max, a_max; SI rad."

export const slewRatePointingSnippets: FormulaSnippet = {
  formulaId: 'slew-rate-pointing',
  assumptions: A,
  code: {
    python: "# Rest-to-rest slew with w_max, a_max; SI rad.\nimport math\nth_sw = wmax**2 / amax\nt_acc = 2 * math.sqrt(dth / amax)\nt_coast = dth / wmax + wmax / amax\n# use t_acc when dth <= th_sw else t_coast (educational)\nt = t_acc",
    javascript: "// Rest-to-rest slew with w_max, a_max; SI rad.\nconst th_sw = wmax**2 / amax\nconst t_acc = 2 * Math.sqrt(dth / amax)\nconst t_coast = dth / wmax + wmax / amax\nconst t = t_acc",
    typescript: "// Rest-to-rest slew with w_max, a_max; SI rad.\nconst th_sw = wmax**2 / amax\nconst t_acc = 2 * Math.sqrt(dth / amax)\nconst t_coast = dth / wmax + wmax / amax\nconst t = t_acc",
    c: "/* Rest-to-rest slew with w_max, a_max; SI rad. */\nconst double th_sw = pow(wmax, 2) / amax;\nconst double t_acc = 2 * sqrt(dth / amax);\nconst double t_coast = dth / wmax + wmax / amax;\nconst double t = t_acc;",
    cpp: "// Rest-to-rest slew with w_max, a_max; SI rad.\nconst double th_sw = pow(wmax, 2) / amax;\nconst double t_acc = 2 * sqrt(dth / amax);\nconst double t_coast = dth / wmax + wmax / amax;\nconst double t = t_acc;",
    rust: "// Rest-to-rest slew with w_max, a_max; SI rad.\nlet th_sw = (wmax).powi(2) / amax;\nlet t_acc = 2.0_f64 * (dth / amax).sqrt();\nlet t_coast = dth / wmax + wmax / amax;\nlet t = t_acc;",
    zig: "// Rest-to-rest slew with w_max, a_max; SI rad.\nconst th_sw = std.math.pow(f64, wmax, @as(f64, 2.0)) / amax;\nconst t_acc = @as(f64, 2.0) * std.math.sqrt(dth / amax);\nconst t_coast = dth / wmax + wmax / amax;\nconst t = t_acc;",
    fortran: "! Rest-to-rest slew with w_max, a_max; SI rad.\n  th_sw = wmax**2.0d0 / amax\n  t_acc = 2.0d0 * sqrt(dth / amax)\n  t_coast = dth / wmax + wmax / amax\n  t = t_acc",
    matlab: "% Rest-to-rest slew with w_max, a_max; SI rad.\nth_sw = wmax^2 / amax\nt_acc = 2 * sqrt(dth / amax)\nt_coast = dth / wmax + wmax / amax\n% use t_acc when dth <= th_sw else t_coast (educational)\nt = t_acc",
    julia: "# Rest-to-rest slew with w_max, a_max; SI rad.\nth_sw = wmax**2 / amax\nt_acc = 2 * sqrt(dth / amax)\nt_coast = dth / wmax + wmax / amax\n# use t_acc when dth <= th_sw else t_coast (educational)\nt = t_acc",
    latex: "% Rest-to-rest slew with w_max, a_max; SI rad.\n\\[t_{\\mathrm{slew}}=f(\\Delta\\theta,\\omega_{\\max},\\alpha_{\\max})\\]",
  },
}
