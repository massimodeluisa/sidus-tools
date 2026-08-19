import type { FormulaSnippet } from '../types'

const A = "Q ≈ sqrt(SNR) educational; SI."

export const opticalBerQSnippets: FormulaSnippet = {
  formulaId: 'optical-ber-q',
  assumptions: A,
  code: {
    python: "# Q ≈ sqrt(SNR) educational; SI.\nimport math\nQ = math.sqrt(10 ** (snrDb / 10))",
    javascript: "// Q ≈ sqrt(SNR) educational; SI.\nconst Q = Math.sqrt(10 ** (snrDb / 10))",
    typescript: "// Q ≈ sqrt(SNR) educational; SI.\nconst Q = Math.sqrt(10 ** (snrDb / 10))",
    c: "/* Q ≈ sqrt(SNR) educational; SI. */\nconst double Q = sqrt(pow(10, (snrDb / 10)));",
    cpp: "// Q ≈ sqrt(SNR) educational; SI.\nconst double Q = sqrt(pow(10, (snrDb / 10)));",
    rust: "// Q ≈ sqrt(SNR) educational; SI.\nlet Q = ((10.0_f64).powf((snrDb / 10.0_f64))).sqrt();",
    zig: "// Q ≈ sqrt(SNR) educational; SI.\nconst Q = std.math.sqrt(std.math.pow(f64, @as(f64, 10.0), (snrDb / @as(f64, 10.0))));",
    fortran: "! Q ≈ sqrt(SNR) educational; SI.\n  Q = sqrt(10.0d0 ** (snrDb / 10.0d0))",
    matlab: "% Q ≈ sqrt(SNR) educational; SI.\nQ = sqrt(10 ^ (snrDb / 10))",
    julia: "# Q ≈ sqrt(SNR) educational; SI.\nQ = sqrt(10 ^ (snrDb / 10))",
    latex: "% Q ≈ sqrt(SNR) educational; SI.\n\\[Q\\approx\\sqrt{\\mathrm{SNR}}\\]",
  },
}
