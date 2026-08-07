import type { FormulaSnippet } from '../types'

/**
 * Ballistic coefficient + order-of-magnitude drag Δv/rev.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches BallisticDragTool + lib/physics/mission.ts (β = m/(Cd A)).
 * Free vars: r, mu, m, Cd, A, rho0, h, H.
 */
const A =
  'β = m/(Cd A); order-of-magnitude drag Δv/rev; a≈r, v≈√(μ/r); exponential ρ = ρ0 exp(−h/H). SI.'

export const ballisticSnippets: FormulaSnippet = {
  formulaId: 'ballistic-drag',
  assumptions: A,
  code: {
    python: `# Ballistic drag: ${A}
import math
a = r
v = math.sqrt(mu / r)
beta = m / (Cd * A)
rho = rho0 * math.exp(-h / H)
dv = math.pi * rho * a * v / beta`,

    javascript: `// Ballistic drag: ${A}
const a = r
const v = Math.sqrt(mu / r)
const beta = m / (Cd * A)
const rho = rho0 * Math.exp(-h / H)
const dv = Math.PI * rho * a * v / beta`,

    typescript: `// Ballistic drag: ${A}
const a: number = r
const v: number = Math.sqrt(mu / r)
const beta: number = m / (Cd * A)
const rho: number = rho0 * Math.exp(-h / H)
const dv: number = Math.PI * rho * a * v / beta`,

    c: `/* Ballistic drag: ${A} */
const double a = r;
const double v = sqrt(mu / r);
const double beta = m / (Cd * A);
const double rho = rho0 * exp(-h / H);
const double dv = M_PI * rho * a * v / beta;`,

    cpp: `// Ballistic drag: ${A}
const double a = r;
const double v = std::sqrt(mu / r);
const double beta = m / (Cd * A);
const double rho = rho0 * std::exp(-h / H);
const double dv = M_PI * rho * a * v / beta;`,

    rust: `// Ballistic drag: ${A}
let a = r;
let v = (mu / r).sqrt();
let beta = m / (Cd * A);
let rho = rho0 * (-h / H).exp();
let dv = std::f64::consts::PI * rho * a * v / beta;`,

    zig: `// Ballistic drag: ${A}
const a = r;
const v = std.math.sqrt(mu / r);
const beta = m / (Cd * A);
const rho = rho0 * std.math.exp(-h / H);
const dv = std.math.pi * rho * a * v / beta;`,

    fortran: `! Ballistic drag: ${A}
a = r
v = sqrt(mu / r)
beta = m / (Cd * A)
rho = rho0 * exp(-h / H)
dv = 3.141592653589793d0 * rho * a * v / beta`,

    matlab: `% Ballistic drag: ${A}
a = r;
v = sqrt(mu / r);
beta = m / (Cd * A);
rho = rho0 * exp(-h / H);
dv = pi * rho * a * v / beta;`,

    julia: `# Ballistic drag: ${A}
a = r
v = sqrt(mu / r)
beta = m / (Cd * A)
rho = rho0 * exp(-h / H)
dv = π * rho * a * v / beta`,

    latex: `% Ballistic drag: pure SI
\\[
  \\beta = \\frac{m}{C_d A},\\quad
  \\rho = \\rho_0 e^{-h/H},\\quad
  v \\approx \\sqrt{\\mu/r},\\quad
  a \\approx r,\\quad
  \\Delta v/\\mathrm{rev} \\sim \\pi\\rho a v/\\beta
\\]`,
  },
}
