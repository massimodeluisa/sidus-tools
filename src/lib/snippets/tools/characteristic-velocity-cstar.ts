import type { FormulaSnippet } from '../types'

const A = "c* definition and ideal frozen c*; SI."

export const characteristicVelocityCstarSnippets: FormulaSnippet = {
  formulaId: 'characteristic-velocity-cstar',
  assumptions: A,
  code: {
    python: "# c* definition and ideal frozen c*; SI.\nimport math\ncstar_m = pc * At / mdot\ncstar_i = math.sqrt(Rgas * Tc / gamma) * ((gamma + 1) / 2) ** ((gamma + 1) / (2 * (gamma - 1)))\neta = cstar_m / cstar_i",
    javascript: "// c* definition and ideal frozen c*; SI.\nconst cstar_m = pc * At / mdot\nconst cstar_i = Math.sqrt(Rgas * Tc / gamma) * ((gamma + 1) / 2) ** ((gamma + 1) / (2 * (gamma - 1)))\nconst eta = cstar_m / cstar_i",
    typescript: "// c* definition and ideal frozen c*; SI.\nconst cstar_m = pc * At / mdot\nconst cstar_i = Math.sqrt(Rgas * Tc / gamma) * ((gamma + 1) / 2) ** ((gamma + 1) / (2 * (gamma - 1)))\nconst eta = cstar_m / cstar_i",
    c: "/* c* definition and ideal frozen c*; SI. */\nconst double cstar_m = pc * At / mdot;\nconst double cstar_i = sqrt(Rgas * Tc / gamma) * pow(((gamma + 1) / 2), ((gamma + 1) / (2 * (gamma - 1))));\nconst double eta = cstar_m / cstar_i;",
    cpp: "// c* definition and ideal frozen c*; SI.\nconst double cstar_m = pc * At / mdot;\nconst double cstar_i = std::sqrt(Rgas * Tc / gamma) * std::pow(((gamma + 1) / 2), ((gamma + 1) / (2 * (gamma - 1))));\nconst double eta = cstar_m / cstar_i;",
    rust: "// c* definition and ideal frozen c*; SI.\nlet cstar_m = pc * At / mdot;\nlet cstar_i = (Rgas * Tc / gamma).sqrt() * (((gamma + 1.0_f64) / 2.0_f64)).powf(((gamma + 1.0_f64) / (2.0_f64 * (gamma - 1.0_f64))));\nlet eta = cstar_m / cstar_i;",
    zig: "// c* definition and ideal frozen c*; SI.\nconst cstar_m = pc * At / mdot;\nconst cstar_i = std.math.sqrt(Rgas * Tc / gamma) * std.math.pow(f64, ((gamma + @as(f64, 1.0)) / @as(f64, 2.0)), ((gamma + @as(f64, 1.0)) / (@as(f64, 2.0) * (gamma - @as(f64, 1.0)))));\nconst eta = cstar_m / cstar_i;",
    fortran: "! c* definition and ideal frozen c*; SI.\n  cstar_m = pc * At / mdot\n  cstar_i = sqrt(Rgas * Tc / gamma) * ((gamma + 1.0d0) / 2.0d0) ** ((gamma + 1.0d0) / (2.0d0 * (gamma - 1.0d0)))\n  eta = cstar_m / cstar_i",
    matlab: "% c* definition and ideal frozen c*; SI.\ncstar_m = pc * At / mdot\ncstar_i = sqrt(Rgas * Tc / gamma) * ((gamma + 1) / 2) ^ ((gamma + 1) / (2 * (gamma - 1)))\neta = cstar_m / cstar_i",
    julia: "# c* definition and ideal frozen c*; SI.\ncstar_m = pc * At / mdot\ncstar_i = sqrt(Rgas * Tc / gamma) * ((gamma + 1) / 2) ** ((gamma + 1) / (2 * (gamma - 1)))\neta = cstar_m / cstar_i",
    latex: "% c* definition and ideal frozen c*; SI.\n\\[c^*=\\frac{p_c A_t}{\\dot m},\\quad c^*_{\\mathrm{id}}=\\frac{\\sqrt{\\gamma R T_c}}{\\gamma\\,((\\gamma+1)/2)^{(\\gamma+1)/(2(\\gamma-1))}}\\]",
  },
}
