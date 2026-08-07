import type { FormulaSnippet } from '../types'

const A = "P = eps sigma A T^4; SI."

export const stefanBoltzmannSnippets: FormulaSnippet = {
  formulaId: 'stefan-boltzmann',
  assumptions: A,
  code: {
    python: "# P = eps sigma A T^4; SI.\nsigma = 5.670374419e-8\nP = eps * sigma * A * T**4",
    javascript: "// P = eps sigma A T^4; SI.\nconst sigma = 5.670374419e-8\nconst P = eps * sigma * A * T**4",
    typescript: "// P = eps sigma A T^4; SI.\nconst sigma = 5.670374419e-8\nconst P = eps * sigma * A * T**4",
    c: "/* P = eps sigma A T^4; SI. */\nconst double sigma = 5.670374419e-8;\nconst double P = eps * sigma * A * pow(T, 4);",
    cpp: "// P = eps sigma A T^4; SI.\nconst double sigma = 5.670374419e-8;\nconst double P = eps * sigma * A * pow(T, 4);",
    rust: "// P = eps sigma A T^4; SI.\nlet sigma = 5.670374419e-8_f64;\nlet P = eps * sigma * A * (T).powf(4.0_f64);",
    zig: "// P = eps sigma A T^4; SI.\nconst sigma = @as(f64, 5.670374419e-8);\nconst P = eps * sigma * A * std.math.pow(f64, T, @as(f64, 4.0));",
    fortran: "! P = eps sigma A T^4; SI.\n  sigma = 5.670374419e-8\n  P = eps * sigma * A * T**4.0d0",
    matlab: "% P = eps sigma A T^4; SI.\nsigma = 5.670374419e-8\nP = eps * sigma * A * T^4",
    julia: "# P = eps sigma A T^4; SI.\nsigma = 5.670374419e-8\nP = eps * sigma * A * T**4",
    latex: "% P = eps sigma A T^4; SI.\n\\[P=\\varepsilon\\sigma A T^4\\]",
  },
}
