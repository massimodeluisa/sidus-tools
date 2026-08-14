import type { FormulaSnippet } from '../types'

/**
 * Apoapsis raise from circular: burn at peri of new ellipse.
 * a = (r+ra)/2; Δv = v_p − v_c with v_p = √(μ(2/r−1/a)), v_c = √(μ/r).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches ApoRaiseTool + lib/physics/power.ts apoapsisRaiseFromCircular.
 * Free vars: R, h, ha, mu. r = R+h and ra = R+ha are orbit radii.
 */
const A =
  'Raise apo from circular r=R+h to ra=R+ha; a=(r+ra)/2; Δv = v_p − v_c at peri. SI.'

export const apoSnippets: FormulaSnippet = {
  formulaId: 'apo-raise',
  assumptions: A,
  code: {
    python: `# Apoapsis raise from circular: ${A}
import math
r = R + h
ra = R + ha
a = (r + ra) / 2
vp = math.sqrt(mu * (2 / r - 1 / a))
vc = math.sqrt(mu / r)
dv = vp - vc`,

    javascript: `// Apoapsis raise from circular: ${A}
const r = R + h
const ra = R + ha
const a = (r + ra) / 2
const vp = Math.sqrt(mu * (2 / r - 1 / a))
const vc = Math.sqrt(mu / r)
const dv = vp - vc`,

    typescript: `// Apoapsis raise from circular: ${A}
const r: number = R + h
const ra: number = R + ha
const a: number = (r + ra) / 2
const vp: number = Math.sqrt(mu * (2 / r - 1 / a))
const vc: number = Math.sqrt(mu / r)
const dv: number = vp - vc`,

    c: `/* Apoapsis raise from circular: ${A} */
const double r = R + h;
const double ra = R + ha;
const double a = (r + ra) / 2.0;
const double vp = sqrt(mu * (2.0 / r - 1.0 / a));
const double vc = sqrt(mu / r);
const double dv = vp - vc;`,

    cpp: `// Apoapsis raise from circular: ${A}
const double r = R + h;
const double ra = R + ha;
const double a = (r + ra) / 2.0;
const double vp = std::sqrt(mu * (2.0 / r - 1.0 / a));
const double vc = std::sqrt(mu / r);
const double dv = vp - vc;`,

    rust: `// Apoapsis raise from circular: ${A}
let r = R + h;
let ra = R + ha;
let a = (r + ra) / 2.0;
let vp = (mu * (2.0 / r - 1.0 / a)).sqrt();
let vc = (mu / r).sqrt();
let dv = vp - vc;`,

    zig: `// Apoapsis raise from circular: ${A}
const r = R + h;
const ra = R + ha;
const a = (r + ra) / 2.0;
const vp = std.math.sqrt(mu * (2.0 / r - 1.0 / a));
const vc = std.math.sqrt(mu / r);
const dv = vp - vc;`,

    fortran: `! Apoapsis raise from circular: ${A}
r = R + h
ra = R + ha
a = (r + ra) / 2.0d0
vp = sqrt(mu * (2.0d0 / r - 1.0d0 / a))
vc = sqrt(mu / r)
dv = vp - vc`,

    matlab: `% Apoapsis raise from circular: ${A}
r = R + h;
ra = R + ha;
a = (r + ra) / 2;
vp = sqrt(mu * (2 / r - 1 / a));
vc = sqrt(mu / r);
dv = vp - vc;`,

    julia: `# Apoapsis raise from circular: ${A}
r = R + h
ra = R + ha
a = (r + ra) / 2
vp = sqrt(mu * (2 / r - 1 / a))
vc = sqrt(mu / r)
dv = vp - vc`,

    latex: `% Apoapsis raise from circular: pure SI
\\[
  r = R + h,\\quad r_a = R + h_a,\\quad
  a = \\tfrac{1}{2}(r + r_a)
\\]
\\[
  v_p = \\sqrt{\\mu\\left(\\frac{2}{r}-\\frac{1}{a}\\right)},\\quad
  v_c = \\sqrt{\\frac{\\mu}{r}},\\quad
  \\Delta v = v_p - v_c
\\]`,
  },
}
