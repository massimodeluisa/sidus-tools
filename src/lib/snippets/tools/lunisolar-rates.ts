import type { FormulaSnippet } from '../types'

const A = "Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI."

export const lunisolarRatesSnippets: FormulaSnippet = {
  formulaId: 'lunisolar-rates',
  assumptions: A,
  code: {
    python:
      "# Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\nimport math\nn = math.sqrt(mu / a**3)\nn3 = math.sqrt(mu3 / d3**3)\nse = math.sqrt(1.0 - e*e)\np2 = 0.5 * (3.0 * math.cos(i3)**2 - 1.0)\ne3fac = (1.0 - e3*e3) ** -1.5\nk = n3*n3 / n * p2 * e3fac\nraanDot = -0.75 * k / se * math.cos(inc)\nargpDot = 0.375 * k * se * (4.0 - 5.0 * math.sin(inc)**2)",
    javascript:
      "// Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\nconst n = Math.sqrt(mu / a**3)\nconst n3 = Math.sqrt(mu3 / d3**3)\nconst se = Math.sqrt(1.0 - e*e)\nconst p2 = 0.5 * (3.0 * Math.cos(i3)**2 - 1.0)\nconst e3fac = (1.0 - e3*e3) ** -1.5\nconst k = n3*n3 / n * p2 * e3fac\nconst raanDot = -0.75 * k / se * Math.cos(inc)\nconst argpDot = 0.375 * k * se * (4.0 - 5.0 * Math.sin(inc)**2)",
    typescript:
      "// Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\nconst n = Math.sqrt(mu / a**3)\nconst n3 = Math.sqrt(mu3 / d3**3)\nconst se = Math.sqrt(1.0 - e*e)\nconst p2 = 0.5 * (3.0 * Math.cos(i3)**2 - 1.0)\nconst e3fac = (1.0 - e3*e3) ** -1.5\nconst k = n3*n3 / n * p2 * e3fac\nconst raanDot = -0.75 * k / se * Math.cos(inc)\nconst argpDot = 0.375 * k * se * (4.0 - 5.0 * Math.sin(inc)**2)",
    c: "/* Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI. */\nconst double n = sqrt(mu / pow(a, 3));\nconst double n3 = sqrt(mu3 / pow(d3, 3));\nconst double se = sqrt(1.0 - e*e);\nconst double p2 = 0.5 * (3.0 * pow(cos(i3), 2) - 1.0);\nconst double e3fac = pow(1.0 - e3*e3, -1.5);\nconst double k = n3*n3 / n * p2 * e3fac;\nconst double raanDot = -0.75 * k / se * cos(inc);\nconst double argpDot = 0.375 * k * se * (4.0 - 5.0 * pow(sin(inc), 2));",
    cpp: "// Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\nconst double n = sqrt(mu / pow(a, 3));\nconst double n3 = sqrt(mu3 / pow(d3, 3));\nconst double se = sqrt(1.0 - e*e);\nconst double p2 = 0.5 * (3.0 * pow(cos(i3), 2) - 1.0);\nconst double e3fac = pow(1.0 - e3*e3, -1.5);\nconst double k = n3*n3 / n * p2 * e3fac;\nconst double raanDot = -0.75 * k / se * cos(inc);\nconst double argpDot = 0.375 * k * se * (4.0 - 5.0 * pow(sin(inc), 2));",
    rust: "// Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\nlet n = (mu / a.powi(3)).sqrt();\nlet n3 = (mu3 / d3.powi(3)).sqrt();\nlet se = (1.0_f64 - e*e).sqrt();\nlet p2 = 0.5_f64 * (3.0_f64 * (i3).cos().powi(2) - 1.0_f64);\nlet e3fac = (1.0_f64 - e3*e3).powf(-1.5_f64);\nlet k = n3*n3 / n * p2 * e3fac;\nlet raanDot = -0.75_f64 * k / se * (inc).cos();\nlet argpDot = 0.375_f64 * k * se * (4.0_f64 - 5.0_f64 * (inc).sin().powi(2));",
    zig: "// Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\nconst n = @sqrt(mu / (a * a * a));\nconst n3 = @sqrt(mu3 / (d3 * d3 * d3));\nconst se = @sqrt(@as(f64, 1.0) - e*e);\nconst p2 = @as(f64, 0.5) * (@as(f64, 3.0) * @cos(i3) * @cos(i3) - @as(f64, 1.0));\nconst e3fac = std.math.pow(f64, @as(f64, 1.0) - e3*e3, @as(f64, -1.5));\nconst k = n3*n3 / n * p2 * e3fac;\nconst raanDot = -@as(f64, 0.75) * k / se * @cos(inc);\nconst argpDot = @as(f64, 0.375) * k * se * (@as(f64, 4.0) - @as(f64, 5.0) * @sin(inc) * @sin(inc));",
    fortran:
      "! Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\n  n = sqrt(mu / a**3.0d0)\n  n3 = sqrt(mu3 / d3**3.0d0)\n  se = sqrt(1.0d0 - e*e)\n  p2 = 0.5d0 * (3.0d0 * cos(i3)**2.0d0 - 1.0d0)\n  e3fac = (1.0d0 - e3*e3) ** (-1.5d0)\n  k = n3*n3 / n * p2 * e3fac\n  raanDot = -0.75d0 * k / se * cos(inc)\n  argpDot = 0.375d0 * k * se * (4.0d0 - 5.0d0 * sin(inc)**2.0d0)",
    matlab:
      "% Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\nn = sqrt(mu / a^3)\nn3 = sqrt(mu3 / d3^3)\nse = sqrt(1.0 - e*e)\np2 = 0.5 * (3.0 * cos(i3)^2 - 1.0)\ne3fac = (1.0 - e3*e3) ^ (-1.5)\nk = n3*n3 / n * p2 * e3fac\nraanDot = -0.75 * k / se * cos(inc)\nargpDot = 0.375 * k * se * (4.0 - 5.0 * sin(inc)^2)",
    julia:
      "# Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\nn = sqrt(mu / a^3)\nn3 = sqrt(mu3 / d3^3)\nse = sqrt(1.0 - e*e)\np2 = 0.5 * (3.0 * cos(i3)^2 - 1.0)\ne3fac = (1.0 - e3*e3) ^ (-1.5)\nk = n3*n3 / n * p2 * e3fac\nraanDot = -0.75 * k / se * cos(inc)\nargpDot = 0.375 * k * se * (4.0 - 5.0 * sin(inc)^2)",
    latex:
      "% Cook Ω̇, ω̇; P2(cos i3) (1-e3^2)^{-3/2}; circular equatorial if i3=e3=0; SI.\n\\[\\dot\\Omega=-\\tfrac34(n_3^2/n)(1-e^2)^{-1/2}\\cos i\\,P_2(\\cos i_3)(1-e_3^2)^{-3/2}\\]",
  },
}
