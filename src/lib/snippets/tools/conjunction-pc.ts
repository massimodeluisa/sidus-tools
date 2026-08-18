import type { FormulaSnippet } from '../types'

const A = "Educational 2-D Chan Pc (Foster is the disk integral in the UI). Not operational CARA. SI."

export const conjunctionPcSnippets: FormulaSnippet = {
  formulaId: 'conjunction-pc',
  assumptions: A,
  code: {
    python:
      "# Educational 2-D Chan Pc; not operational CARA. SI.\nimport math\nxi2 = miss**2 / sx**2\nu = rad**2 / (sx * sy)\npc = math.exp(-xi2 / 2.0) * (1.0 - math.exp(-u / 2.0))",
    javascript:
      "// Educational 2-D Chan Pc; not operational CARA. SI.\nconst xi2 = miss**2 / sx**2\nconst u = rad**2 / (sx * sy)\nconst pc = Math.exp(-xi2 / 2.0) * (1.0 - Math.exp(-u / 2.0))",
    typescript:
      "// Educational 2-D Chan Pc; not operational CARA. SI.\nconst xi2 = miss**2 / sx**2\nconst u = rad**2 / (sx * sy)\nconst pc = Math.exp(-xi2 / 2.0) * (1.0 - Math.exp(-u / 2.0))",
    c: "/* Educational 2-D Chan Pc; not operational CARA. SI. */\nconst double xi2 = miss * miss / (sx * sx);\nconst double u = rad * rad / (sx * sy);\nconst double pc = exp(-xi2 / 2.0) * (1.0 - exp(-u / 2.0));",
    cpp: "// Educational 2-D Chan Pc; not operational CARA. SI.\nconst double xi2 = miss * miss / (sx * sx);\nconst double u = rad * rad / (sx * sy);\nconst double pc = exp(-xi2 / 2.0) * (1.0 - exp(-u / 2.0));",
    rust: "// Educational 2-D Chan Pc; not operational CARA. SI.\nlet xi2 = miss.powi(2) / sx.powi(2);\nlet u = rad.powi(2) / (sx * sy);\nlet pc = (-xi2 / 2.0_f64).exp() * (1.0_f64 - (-u / 2.0_f64).exp());",
    zig: "// Educational 2-D Chan Pc; not operational CARA. SI.\nconst xi2 = miss * miss / (sx * sx);\nconst u = rad * rad / (sx * sy);\nconst pc = @exp(-xi2 / @as(f64, 2.0)) * (@as(f64, 1.0) - @exp(-u / @as(f64, 2.0)));",
    fortran:
      "! Educational 2-D Chan Pc; not operational CARA. SI.\n  xi2 = miss**2.0d0 / sx**2.0d0\n  u = rad**2.0d0 / (sx * sy)\n  pc = exp(-xi2 / 2.0d0) * (1.0d0 - exp(-u / 2.0d0))",
    matlab:
      "% Educational 2-D Chan Pc; not operational CARA. SI.\nxi2 = miss^2 / sx^2\nu = rad^2 / (sx * sy)\npc = exp(-xi2 / 2.0) * (1.0 - exp(-u / 2.0))",
    julia:
      "# Educational 2-D Chan Pc; not operational CARA. SI.\nxi2 = miss^2 / sx^2\nu = rad^2 / (sx * sy)\npc = exp(-xi2 / 2.0) * (1.0 - exp(-u / 2.0))",
    latex:
      "% Educational 2-D Chan Pc; not operational CARA. SI.\n\\[P_c=e^{-\\xi^2/2}\\left(1-e^{-R^2/(2\\sigma_x\\sigma_y)}\\right)\\]",
  },
}
