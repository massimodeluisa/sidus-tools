import type { FormulaSnippet } from '../types'

const A = "A = k R^alpha L educational; SI-ish."

export const rainAttenuationSimpleSnippets: FormulaSnippet = {
  formulaId: 'rain-attenuation-simple',
  assumptions: A,
  code: {
    python: "# A = k R^alpha L educational; SI-ish.\nA = k * rate**alpha * path",
    javascript: "// A = k R^alpha L educational; SI-ish.\nconst A = k * rate**alpha * path",
    typescript: "// A = k R^alpha L educational; SI-ish.\nconst A = k * rate**alpha * path",
    c: "/* A = k R^alpha L educational; SI-ish. */\nconst double A = k * pow(rate, alpha) * path;",
    cpp: "// A = k R^alpha L educational; SI-ish.\nconst double A = k * pow(rate, alpha) * path;",
    rust: "// A = k R^alpha L educational; SI-ish.\nlet A = k * (rate).powf(alpha) * path;",
    zig: "// A = k R^alpha L educational; SI-ish.\nconst A = k * std.math.pow(f64, rate, alpha) * path;",
    fortran: "! A = k R^alpha L educational; SI-ish.\n  A = k * rate**alpha * path",
    matlab: "% A = k R^alpha L educational; SI-ish.\nA = k * rate^alpha * path",
    julia: "# A = k R^alpha L educational; SI-ish.\nA = k * rate^alpha * path",
    latex: "% A = k R^alpha L educational; SI-ish.\n\\[A=k R^\\alpha L\\]",
  },
}
