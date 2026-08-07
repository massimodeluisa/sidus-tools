import type { FormulaSnippet } from '../types'

/**
 * Surface access: surface g, escape, parking circular & circ→esc Δv.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches SurfaceAccessTool + surfaceAccess (planetary.ts).
 * Free vars: mu, R, r_park.
 */
const A = 'Two-body surface and parking orbit; g = μ/R²; v_esc = √(2μ/R). Pure SI.'

export const surfaceAccessSnippets: FormulaSnippet = {
  formulaId: 'surface-access',
  assumptions: A,
  code: {
    python: `# Surface access: ${A}
import math
g = mu / R**2
v_esc = math.sqrt(2 * mu / R)
v_c = math.sqrt(mu / r_park)
dv_esc = math.sqrt(2 * mu / r_park) - v_c`,

    javascript: `// Surface access: ${A}
const g = mu / (R * R)
const v_esc = Math.sqrt((2 * mu) / R)
const v_c = Math.sqrt(mu / r_park)
const dv_esc = Math.sqrt((2 * mu) / r_park) - v_c`,

    typescript: `// Surface access: ${A}
const g: number = mu / (R * R)
const v_esc: number = Math.sqrt((2 * mu) / R)
const v_c: number = Math.sqrt(mu / r_park)
const dv_esc: number = Math.sqrt((2 * mu) / r_park) - v_c`,

    c: `/* Surface access: ${A} */
const double g = mu / (R * R);
const double v_esc = sqrt(2.0 * mu / R);
const double v_c = sqrt(mu / r_park);
const double dv_esc = sqrt(2.0 * mu / r_park) - v_c;`,

    cpp: `// Surface access: ${A}
const double g = mu / (R * R);
const double v_esc = std::sqrt(2.0 * mu / R);
const double v_c = std::sqrt(mu / r_park);
const double dv_esc = std::sqrt(2.0 * mu / r_park) - v_c;`,

    rust: `// Surface access: ${A}
let g = mu / (R * R);
let v_esc = (2.0 * mu / R).sqrt();
let v_c = (mu / r_park).sqrt();
let dv_esc = (2.0 * mu / r_park).sqrt() - v_c;`,

    zig: `// Surface access: ${A}
const g = mu / (R * R);
const v_esc = std.math.sqrt(2.0 * mu / R);
const v_c = std.math.sqrt(mu / r_park);
const dv_esc = std.math.sqrt(2.0 * mu / r_park) - v_c;`,

    fortran: `! Surface access: ${A}
g = mu / (R * R)
v_esc = sqrt(2.0d0 * mu / R)
v_c = sqrt(mu / r_park)
dv_esc = sqrt(2.0d0 * mu / r_park) - v_c`,

    matlab: `% Surface access: ${A}
g = mu / R^2;
v_esc = sqrt(2 * mu / R);
v_c = sqrt(mu / r_park);
dv_esc = sqrt(2 * mu / r_park) - v_c;`,

    julia: `# Surface access: ${A}
g = mu / R^2
v_esc = sqrt(2 * mu / R)
v_c = sqrt(mu / r_park)
dv_esc = sqrt(2 * mu / r_park) - v_c`,

    latex: `% Surface access: pure SI
\\[
  g = \\frac{\\mu}{R^{2}},\\quad
  v_{\\mathrm{esc}} = \\sqrt{\\frac{2\\mu}{R}},\\quad
  v_{c} = \\sqrt{\\frac{\\mu}{r_{\\mathrm{park}}}}
\\]
\\[
  \\Delta v_{\\mathrm{esc}} = \\sqrt{\\frac{2\\mu}{r_{\\mathrm{park}}}} - v_{c}
\\]`,
  },
}
