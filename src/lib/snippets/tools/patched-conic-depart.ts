import type { FormulaSnippet } from '../types'

/**
 * Patched-conic departure: burn from circular parking onto escape hyperbola.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches PatchedConicDepartTool + departureBurnFromCircular / characteristicEnergy.
 * Free vars: v_inf, mu, r_park.
 */
const A =
  'Collinear patched conic; burn from circular parking onto escape hyperbola. C3 = v_∞². Pure SI.'

export const patchedConicSnippets: FormulaSnippet = {
  formulaId: 'patched-conic-depart',
  assumptions: A,
  code: {
    python: `# Patched-conic departure: ${A}
import math
r_park = R + h
C3 = v_inf**2
v_p = math.sqrt(v_inf**2 + 2 * mu / r_park)
v_c = math.sqrt(mu / r_park)
dv = v_p - v_c`,

    javascript: `// Patched-conic departure: ${A}
const r_park = R + h
const C3 = v_inf ** 2
const v_p = Math.sqrt(v_inf ** 2 + (2 * mu) / r_park)
const v_c = Math.sqrt(mu / r_park)
const dv = v_p - v_c`,

    typescript: `// Patched-conic departure: ${A}
const r_park: number = R + h
const C3: number = v_inf ** 2
const v_p: number = Math.sqrt(v_inf ** 2 + (2 * mu) / r_park)
const v_c: number = Math.sqrt(mu / r_park)
const dv: number = v_p - v_c`,

    c: `/* Patched-conic departure: ${A} */
const double r_park = R + h;
const double C3 = v_inf * v_inf;
const double v_p = sqrt(v_inf * v_inf + 2.0 * mu / r_park);
const double v_c = sqrt(mu / r_park);
const double dv = v_p - v_c;`,

    cpp: `// Patched-conic departure: ${A}
const double r_park = R + h;
const double C3 = v_inf * v_inf;
const double v_p = std::sqrt(v_inf * v_inf + 2.0 * mu / r_park);
const double v_c = std::sqrt(mu / r_park);
const double dv = v_p - v_c;`,

    rust: `// Patched-conic departure: ${A}
let r_park = R + h;
let c3 = v_inf * v_inf;
let v_p = (v_inf * v_inf + 2.0 * mu / r_park).sqrt();
let v_c = (mu / r_park).sqrt();
let dv = v_p - v_c;`,

    zig: `// Patched-conic departure: ${A}
const r_park = R + h;
const C3 = v_inf * v_inf;
const v_p = std.math.sqrt(v_inf * v_inf + 2.0 * mu / r_park);
const v_c = std.math.sqrt(mu / r_park);
const dv = v_p - v_c;`,

    fortran: `! Patched-conic departure: ${A}
r_park = R + h
C3 = v_inf * v_inf
v_p = sqrt(v_inf * v_inf + 2.0d0 * mu / r_park)
v_c = sqrt(mu / r_park)
dv = v_p - v_c`,

    matlab: `% Patched-conic departure: ${A}
r_park = R + h;
C3 = v_inf^2;
v_p = sqrt(v_inf^2 + 2 * mu / r_park);
v_c = sqrt(mu / r_park);
dv = v_p - v_c;`,

    julia: `# Patched-conic departure: ${A}
r_park = R + h
C3 = v_inf^2
v_p = sqrt(v_inf^2 + 2 * mu / r_park)
v_c = sqrt(mu / r_park)
dv = v_p - v_c`,

    latex: `% Patched-conic departure: pure SI
\\[
  C_{3} = v_{\\infty}^{2},\\quad
  v_{p} = \\sqrt{v_{\\infty}^{2} + 2\\mu/r},\\quad
  v_{c} = \\sqrt{\\mu/r},\\quad
  \\Delta v = v_{p} - v_{c}
\\]`,
  },
}
