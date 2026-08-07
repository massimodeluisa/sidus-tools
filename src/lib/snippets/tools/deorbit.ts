import type { FormulaSnippet } from '../types'

/**
 * Deorbit: impulsive lower periapsis from circular; half-ellipse TOF.
 * a = ½(r+rp); vc = √(μ/r); va = √(μ(2/r − 1/a)); dv = vc − va; tof = π √(a³/μ).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches DeorbitTool + lib/physics/ops.ts deorbitBurn.
 * Free vars: mu, r, rp.
 */
const A =
  'Impulsive lower periapsis from circular; transfer ellipse ra=r, rp; half-period TOF. SI.'

export const deorbitSnippets: FormulaSnippet = {
  formulaId: 'deorbit',
  assumptions: A,
  code: {
    python: `# Deorbit: ${A}
import math
a = 0.5 * (r + rp)
v_c = math.sqrt(mu / r)
v_a = math.sqrt(mu * (2 / r - 1 / a))
dv = v_c - v_a
tof = math.pi * math.sqrt(a**3 / mu)`,

    javascript: `// Deorbit: ${A}
const a = 0.5 * (r + rp)
const vC = Math.sqrt(mu / r)
const vA = Math.sqrt(mu * (2 / r - 1 / a))
const dv = vC - vA
const tof = Math.PI * Math.sqrt(a ** 3 / mu)`,

    typescript: `// Deorbit: ${A}
const a: number = 0.5 * (r + rp)
const vC: number = Math.sqrt(mu / r)
const vA: number = Math.sqrt(mu * (2 / r - 1 / a))
const dv: number = vC - vA
const tof: number = Math.PI * Math.sqrt(a ** 3 / mu)`,

    c: `/* Deorbit: ${A} */
const double a = 0.5 * (r + rp);
const double v_c = sqrt(mu / r);
const double v_a = sqrt(mu * (2.0 / r - 1.0 / a));
const double dv = v_c - v_a;
const double tof = M_PI * sqrt(a * a * a / mu);`,

    cpp: `// Deorbit: ${A}
const double a = 0.5 * (r + rp);
const double v_c = std::sqrt(mu / r);
const double v_a = std::sqrt(mu * (2.0 / r - 1.0 / a));
const double dv = v_c - v_a;
const double tof = M_PI * std::sqrt(a * a * a / mu);`,

    rust: `// Deorbit: ${A}
let a = 0.5 * (r + rp);
let v_c = (mu / r).sqrt();
let v_a = (mu * (2.0 / r - 1.0 / a)).sqrt();
let dv = v_c - v_a;
let tof = std::f64::consts::PI * (a * a * a / mu).sqrt();`,

    zig: `// Deorbit: ${A}
const a = 0.5 * (r + rp);
const v_c = std.math.sqrt(mu / r);
const v_a = std.math.sqrt(mu * (2.0 / r - 1.0 / a));
const dv = v_c - v_a;
const tof = std.math.pi * std.math.sqrt(a * a * a / mu);`,

    fortran: `! Deorbit: ${A}
a = 0.5d0 * (r + rp)
v_c = sqrt(mu / r)
v_a = sqrt(mu * (2.0d0 / r - 1.0d0 / a))
dv = v_c - v_a
tof = 3.141592653589793d0 * sqrt(a**3 / mu)`,

    matlab: `% Deorbit: ${A}
a = 0.5 * (r + rp);
v_c = sqrt(mu / r);
v_a = sqrt(mu * (2 / r - 1 / a));
dv = v_c - v_a;
tof = pi * sqrt(a^3 / mu);`,

    julia: `# Deorbit: ${A}
a = 0.5 * (r + rp)
v_c = sqrt(mu / r)
v_a = sqrt(mu * (2 / r - 1 / a))
dv = v_c - v_a
tof = π * sqrt(a^3 / mu)`,

    latex: `% Deorbit: pure SI
\\[
  a = \\tfrac{1}{2}(r+r_{p}),\\quad
  v_{c}=\\sqrt{\\mu/r},\\quad
  v_{a}=\\sqrt{\\mu\\left(\\frac{2}{r}-\\frac{1}{a}\\right)},\\quad
  \\Delta v = v_{c}-v_{a},\\quad
  t_{\\mathrm{tof}}=\\pi\\sqrt{a^{3}/\\mu}
\\]`,
  },
}
