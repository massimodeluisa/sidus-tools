import type { FormulaSnippet } from '../types'

const A = "Earth IR flux at altitude sketch; SI."

export const earthIrFluxSnippets: FormulaSnippet = {
  formulaId: 'earth-ir-flux',
  assumptions: A,
  code: {
    python: "# Earth IR flux at altitude sketch; SI.\nsigma = 5.670374419e-8\nR = 6378137.0\nF = sigma * Te**4 * (R / (R + h)) ** 2",
    javascript: "// Earth IR flux at altitude sketch; SI.\nconst sigma = 5.670374419e-8\nconst R = 6378137.0\nconst F = sigma * Te**4 * (R / (R + h)) ** 2",
    typescript: "// Earth IR flux at altitude sketch; SI.\nconst sigma = 5.670374419e-8\nconst R = 6378137.0\nconst F = sigma * Te**4 * (R / (R + h)) ** 2",
    c: "/* Earth IR flux at altitude sketch; SI. */\nconst double sigma = 5.670374419e-8;\nconst double R = 6378137.0;\nconst double F = sigma * pow(Te, 4) * pow((R / (R + h)), 2);",
    cpp: "// Earth IR flux at altitude sketch; SI.\nconst double sigma = 5.670374419e-8;\nconst double R = 6378137.0;\nconst double F = sigma * pow(Te, 4) * pow((R / (R + h)), 2);",
    rust: "// Earth IR flux at altitude sketch; SI.\nlet sigma = 5.670374419e-8_f64;\nlet R = 6378137.0_f64;\nlet F = sigma * (Te).powf(4.0_f64) * ((R / (R + h))).powi(2);",
    zig: "// Earth IR flux at altitude sketch; SI.\nconst sigma = @as(f64, 5.670374419e-8);\nconst R = @as(f64, 6378137.0);\nconst F = sigma * std.math.pow(f64, Te, @as(f64, 4.0)) * std.math.pow(f64, (R / (R + h)), @as(f64, 2.0));",
    fortran: "! Earth IR flux at altitude sketch; SI.\n  sigma = 5.670374419e-8\n  R = 6378137.0d0\n  F = sigma * Te**4.0d0 * (R / (R + h)) ** 2.0d0",
    matlab: "% Earth IR flux at altitude sketch; SI.\nsigma = 5.670374419e-8\nR = 6378137.0\nF = sigma * Te^4 * (R / (R + h)) ^ 2",
    julia: "# Earth IR flux at altitude sketch; SI.\nsigma = 5.670374419e-8\nR = 6378137.0\nF = sigma * Te^4 * (R / (R + h)) ^ 2",
    latex: "% Earth IR flux at altitude sketch; SI.\n\\[F\\approx\\sigma T_e^4\\left(\\frac{R}{R+h}\\right)^2\\]",
  },
}
