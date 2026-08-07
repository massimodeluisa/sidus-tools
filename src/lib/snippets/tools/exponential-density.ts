import type { FormulaSnippet } from '../types'

const A = "rho = rho0 exp(-h/H); SI."

export const exponentialDensitySnippets: FormulaSnippet = {
  formulaId: 'exponential-density',
  assumptions: A,
  code: {
    python: "# rho = rho0 exp(-h/H); SI.\nimport math\nrho = rho0 * math.exp(-h / H)",
    javascript: "// rho = rho0 exp(-h/H); SI.\nconst rho = rho0 * Math.exp(-h / H)",
    typescript: "// rho = rho0 exp(-h/H); SI.\nconst rho = rho0 * Math.exp(-h / H)",
    c: "/* rho = rho0 exp(-h/H); SI. */\nconst double rho = rho0 * exp(-h / H);",
    cpp: "// rho = rho0 exp(-h/H); SI.\nconst double rho = rho0 * exp(-h / H);",
    rust: "// rho = rho0 exp(-h/H); SI.\nlet rho = rho0 * (-h / H).exp();",
    zig: "// rho = rho0 exp(-h/H); SI.\nconst rho = rho0 * std.math.exp(-h / H);",
    fortran: "! rho = rho0 exp(-h/H); SI.\n  rho = rho0 * exp(-h / H)",
    matlab: "% rho = rho0 exp(-h/H); SI.\nrho = rho0 * exp(-h / H)",
    julia: "# rho = rho0 exp(-h/H); SI.\nrho = rho0 * exp(-h / H)",
    latex: "% rho = rho0 exp(-h/H); SI.\n\\[\\rho=\\rho_0 e^{-h/H}\\]",
  },
}
