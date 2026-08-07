import type { FormulaSnippet } from '../types'

const A = "Eb/N0 = (C/N0)/Rb; SI."

export const ttcEbnoSnippets: FormulaSnippet = {
  formulaId: 'ttc-ebno',
  assumptions: A,
  code: {
    python: "# Eb/N0 = (C/N0)/Rb; SI.\nimport math\ncn0_lin = 10 ** (cn0 / 10)\nebn0 = cn0_lin / rb\nebn0_db = 10 * math.log10(ebn0)",
    javascript: "// Eb/N0 = (C/N0)/Rb; SI.\nconst cn0_lin = 10 ** (cn0 / 10)\nconst ebn0 = cn0_lin / rb\nconst ebn0_db = 10 * Math.log10(ebn0)",
    typescript: "// Eb/N0 = (C/N0)/Rb; SI.\nconst cn0_lin = 10 ** (cn0 / 10)\nconst ebn0 = cn0_lin / rb\nconst ebn0_db = 10 * Math.log10(ebn0)",
    c: "/* Eb/N0 = (C/N0)/Rb; SI. */\nconst double cn0_lin = pow(10, (cn0 / 10));\nconst double ebn0 = cn0_lin / rb;\nconst double ebn0_db = 10 * log10(ebn0);",
    cpp: "// Eb/N0 = (C/N0)/Rb; SI.\nconst double cn0_lin = pow(10, (cn0 / 10));\nconst double ebn0 = cn0_lin / rb;\nconst double ebn0_db = 10 * log10(ebn0);",
    rust: "// Eb/N0 = (C/N0)/Rb; SI.\nlet cn0_lin = (10.0_f64).powf((cn0 / 10.0_f64));\nlet ebn0 = cn0_lin / rb;\nlet ebn0_db = 10.0_f64 * (ebn0).log10();",
    zig: "// Eb/N0 = (C/N0)/Rb; SI.\nconst cn0_lin = std.math.pow(f64, @as(f64, 10.0), (cn0 / @as(f64, 10.0)));\nconst ebn0 = cn0_lin / rb;\nconst ebn0_db = @as(f64, 10.0) * std.math.log10(ebn0);",
    fortran: "! Eb/N0 = (C/N0)/Rb; SI.\n  cn0_lin = 10.0d0 ** (cn0 / 10.0d0)\n  ebn0 = cn0_lin / rb\n  ebn0_db = 10.0d0 * log10(ebn0)",
    matlab: "% Eb/N0 = (C/N0)/Rb; SI.\ncn0_lin = 10 ^ (cn0 / 10)\nebn0 = cn0_lin / rb\nebn0_db = 10 * log10(ebn0)",
    julia: "# Eb/N0 = (C/N0)/Rb; SI.\ncn0_lin = 10 ** (cn0 / 10)\nebn0 = cn0_lin / rb\nebn0_db = 10 * log10(ebn0)",
    latex: "% Eb/N0 = (C/N0)/Rb; SI.\n\\[E_b/N_0=(C/N_0)/R_b\\]",
  },
}
