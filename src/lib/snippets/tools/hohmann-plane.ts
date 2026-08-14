import type { FormulaSnippet } from '../types'

/**
 * Hohmann + plane change: Δv1 pure Hohmann departure; Δv2 combined
 * circularize + full plane change at apoapsis.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HohmannPlaneTool + hohmannWithPlaneChange (lib/physics/maneuvers.ts).
 * Free vars: R, h1, h2, mu, di (rad, SI).
 * r1 = R+h1 and r2 = R+h2 are circular-orbit radii, not the body radius.
 */
const A =
  'Hohmann Δv1 then combined circularize+plane change at apo; two-body impulsive; r1, r2 = circular-orbit radii (R + altitude). SI; di in rad.'

export const hohmannPlaneSnippets: FormulaSnippet = {
  formulaId: 'hohmann-plane',
  assumptions: A,
  code: {
    python: `# Hohmann + plane change: ${A}
import math
r1 = R + h1
r2 = R + h2
a_t = 0.5 * (r1 + r2)
v1 = math.sqrt(mu / r1)
v2 = math.sqrt(mu / r2)
vp = math.sqrt(mu * (2 / r1 - 1 / a_t))
va = math.sqrt(mu * (2 / r2 - 1 / a_t))
dv1 = vp - v1
dv2 = math.sqrt(va**2 + v2**2 - 2 * va * v2 * math.cos(di))
dv = dv1 + dv2`,

    javascript: `// Hohmann + plane change: ${A}
const r1 = R + h1
const r2 = R + h2
const aT = 0.5 * (r1 + r2)
const v1 = Math.sqrt(mu / r1)
const v2 = Math.sqrt(mu / r2)
const vp = Math.sqrt(mu * (2 / r1 - 1 / aT))
const va = Math.sqrt(mu * (2 / r2 - 1 / aT))
const dv1 = vp - v1
const dv2 = Math.sqrt(va ** 2 + v2 ** 2 - 2 * va * v2 * Math.cos(di))
const dv = dv1 + dv2`,

    typescript: `// Hohmann + plane change: ${A}
const r1: number = R + h1
const r2: number = R + h2
const aT: number = 0.5 * (r1 + r2)
const v1: number = Math.sqrt(mu / r1)
const v2: number = Math.sqrt(mu / r2)
const vp: number = Math.sqrt(mu * (2 / r1 - 1 / aT))
const va: number = Math.sqrt(mu * (2 / r2 - 1 / aT))
const dv1: number = vp - v1
const dv2: number = Math.sqrt(va ** 2 + v2 ** 2 - 2 * va * v2 * Math.cos(di))
const dv: number = dv1 + dv2`,

    c: `/* Hohmann + plane change: ${A} */
const double r1 = R + h1;
const double r2 = R + h2;
const double a_t = 0.5 * (r1 + r2);
const double v1 = sqrt(mu / r1);
const double v2 = sqrt(mu / r2);
const double vp = sqrt(mu * (2.0 / r1 - 1.0 / a_t));
const double va = sqrt(mu * (2.0 / r2 - 1.0 / a_t));
const double dv1 = vp - v1;
const double dv2 = sqrt(va * va + v2 * v2 - 2.0 * va * v2 * cos(di));
const double dv = dv1 + dv2;`,

    cpp: `// Hohmann + plane change: ${A}
const double r1 = R + h1;
const double r2 = R + h2;
const double a_t = 0.5 * (r1 + r2);
const double v1 = std::sqrt(mu / r1);
const double v2 = std::sqrt(mu / r2);
const double vp = std::sqrt(mu * (2.0 / r1 - 1.0 / a_t));
const double va = std::sqrt(mu * (2.0 / r2 - 1.0 / a_t));
const double dv1 = vp - v1;
const double dv2 = std::sqrt(va * va + v2 * v2 - 2.0 * va * v2 * std::cos(di));
const double dv = dv1 + dv2;`,

    rust: `// Hohmann + plane change: ${A}
let r1 = R + h1;
let r2 = R + h2;
let a_t = 0.5 * (r1 + r2);
let v1 = (mu / r1).sqrt();
let v2 = (mu / r2).sqrt();
let vp = (mu * (2.0 / r1 - 1.0 / a_t)).sqrt();
let va = (mu * (2.0 / r2 - 1.0 / a_t)).sqrt();
let dv1 = vp - v1;
let dv2 = (va * va + v2 * v2 - 2.0 * va * v2 * di.cos()).sqrt();
let dv = dv1 + dv2;`,

    zig: `// Hohmann + plane change: ${A}
const r1 = R + h1;
const r2 = R + h2;
const a_t = 0.5 * (r1 + r2);
const v1 = std.math.sqrt(mu / r1);
const v2 = std.math.sqrt(mu / r2);
const vp = std.math.sqrt(mu * (2.0 / r1 - 1.0 / a_t));
const va = std.math.sqrt(mu * (2.0 / r2 - 1.0 / a_t));
const dv1 = vp - v1;
const dv2 = std.math.sqrt(va * va + v2 * v2 - 2.0 * va * v2 * std.math.cos(di));
const dv = dv1 + dv2;`,

    fortran: `! Hohmann + plane change: ${A}
r1 = R + h1
r2 = R + h2
a_t = 0.5d0 * (r1 + r2)
v1 = sqrt(mu / r1)
v2 = sqrt(mu / r2)
vp = sqrt(mu * (2.0d0 / r1 - 1.0d0 / a_t))
va = sqrt(mu * (2.0d0 / r2 - 1.0d0 / a_t))
dv1 = vp - v1
dv2 = sqrt(va**2 + v2**2 - 2.0d0 * va * v2 * cos(di))
dv = dv1 + dv2`,

    matlab: `% Hohmann + plane change: ${A}
r1 = R + h1;
r2 = R + h2;
a_t = 0.5 * (r1 + r2);
v1 = sqrt(mu / r1);
v2 = sqrt(mu / r2);
vp = sqrt(mu * (2 / r1 - 1 / a_t));
va = sqrt(mu * (2 / r2 - 1 / a_t));
dv1 = vp - v1;
dv2 = sqrt(va^2 + v2^2 - 2 * va * v2 * cos(di));
dv = dv1 + dv2;`,

    julia: `# Hohmann + plane change: ${A}
r1 = R + h1
r2 = R + h2
a_t = 0.5 * (r1 + r2)
v1 = sqrt(mu / r1)
v2 = sqrt(mu / r2)
vp = sqrt(mu * (2 / r1 - 1 / a_t))
va = sqrt(mu * (2 / r2 - 1 / a_t))
dv1 = vp - v1
dv2 = sqrt(va^2 + v2^2 - 2 * va * v2 * cos(di))
dv = dv1 + dv2`,

    latex: `% Hohmann + plane change: pure SI; \\Delta i in rad; r_1, r_2 are orbit radii
\\[
  r_1 = R + h_1,\\quad r_2 = R + h_2,\\quad
  a_t = \\tfrac{1}{2}(r_1+r_2),\\quad
  v_1=\\sqrt{\\frac{\\mu}{r_1}},\\quad
  v_2=\\sqrt{\\frac{\\mu}{r_2}},\\quad
  v_p=\\sqrt{\\mu\\bigl(\\tfrac{2}{r_1}-\\tfrac{1}{a_t}\\bigr)},\\quad
  v_a=\\sqrt{\\mu\\bigl(\\tfrac{2}{r_2}-\\tfrac{1}{a_t}\\bigr)}
\\]
\\[
  \\Delta v_1 = v_p - v_1,\\quad
  \\Delta v_2 = \\sqrt{v_a^{2}+v_2^{2}-2 v_a v_2\\cos\\Delta i},\\quad
  \\Delta v = \\Delta v_1 + \\Delta v_2
\\]`,
  },
}
