import type { FormulaSnippet } from '../types'

const A = "e ≈ -(J3/(2 J2)) (R/a) sin i; SI."

export const frozenOrbitSnippets: FormulaSnippet = {
  formulaId: 'frozen-orbit',
  assumptions: A,
  code: {
    python: "# e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\nimport math\ne = -(j3 / (2.0 * j2)) * (Rb / a) * math.sin(inc)",
    javascript: "// e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\nconst e = -(j3 / (2.0 * j2)) * (Rb / a) * Math.sin(inc)",
    typescript: "// e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\nconst e = -(j3 / (2.0 * j2)) * (Rb / a) * Math.sin(inc)",
    c: "/* e ≈ -(J3/(2 J2)) (R/a) sin i; SI. */\nconst double e = -(j3 / (2.0 * j2)) * (Rb / a) * sin(inc);",
    cpp: "// e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\nconst double e = -(j3 / (2.0 * j2)) * (Rb / a) * sin(inc);",
    rust: "// e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\nlet e = -(j3 / (2.0_f64 * j2)) * (Rb / a) * (inc).sin();",
    zig: "// e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\nconst e = -(j3 / (@as(f64, 2.0) * j2)) * (Rb / a) * @sin(inc);",
    fortran: "! e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\n  e = -(j3 / (2.0d0 * j2)) * (Rb / a) * sin(inc)",
    matlab: "% e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\ne = -(j3 / (2.0 * j2)) * (Rb / a) * sin(inc)",
    julia: "# e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\ne = -(j3 / (2.0 * j2)) * (Rb / a) * sin(inc)",
    latex: "% e ≈ -(J3/(2 J2)) (R/a) sin i; SI.\n\\[e\\approx -\\frac{J_3}{2J_2}\\frac{R}{a}\\sin i\\]",
  },
}
