import type { FormulaSnippet } from '../types'

/**
 * Custom body: μ = G M, surface g, escape / circular at r = R+h, Laplace SOI.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches CustomBodyTool + lib/physics/mission.ts.
 */
const A =
  'Newtonian point mass; μ = G M; g = μ/R²; escape & circular speed at r; Laplace SOI ≈ a (m/M_primary)^{2/5}. SI.'

export const customBodySnippets: FormulaSnippet = {
  formulaId: 'custom-body',
  assumptions: A,
  code: {
    python: `# Custom body: ${A}
import math
G = 6.6743e-11  # m³/(kg·s²)
mu = G * M
g = mu / R**2
r = R + h
v_esc = math.sqrt(2 * mu / r)
v_circ = math.sqrt(mu / r)
r_soi = a * (m / M_primary) ** 0.4`,

    javascript: `// Custom body: ${A}
const G = 6.6743e-11 // m³/(kg·s²)
const mu = G * M
const g = mu / (R * R)
const r = R + h
const vEsc = Math.sqrt((2 * mu) / r)
const vCirc = Math.sqrt(mu / r)
const rSoi = a * (m / M_primary) ** 0.4`,

    typescript: `// Custom body: ${A}
const G: number = 6.6743e-11 // m³/(kg·s²)
const mu: number = G * M
const g: number = mu / (R * R)
const r: number = R + h
const vEsc: number = Math.sqrt((2 * mu) / r)
const vCirc: number = Math.sqrt(mu / r)
const rSoi: number = a * (m / M_primary) ** 0.4`,

    c: `/* Custom body: ${A} */
const double G = 6.6743e-11; /* m³/(kg·s²) */
const double mu = G * M;
const double g = mu / (R * R);
const double r = R + h;
const double v_esc = sqrt(2.0 * mu / r);
const double v_circ = sqrt(mu / r);
const double r_soi = a * pow(m / M_primary, 0.4);`,

    cpp: `// Custom body: ${A}
const double G = 6.6743e-11; // m³/(kg·s²)
const double mu = G * M;
const double g = mu / (R * R);
const double r = R + h;
const double v_esc = std::sqrt(2.0 * mu / r);
const double v_circ = std::sqrt(mu / r);
const double r_soi = a * std::pow(m / M_primary, 0.4);`,

    rust: `// Custom body: ${A}
let g_const = 6.6743e-11_f64; // m³/(kg·s²): avoid name clash with surface g
let mu = g_const * M;
let g = mu / (R * R);
let r = R + h;
let v_esc = (2.0 * mu / r).sqrt();
let v_circ = (mu / r).sqrt();
let r_soi = a * (m / M_primary).powf(0.4);`,

    zig: `// Custom body: ${A}
const G: f64 = 6.6743e-11; // m³/(kg·s²)
const mu = G * M;
const g = mu / (R * R);
const r = R + h;
const v_esc = std.math.sqrt(2.0 * mu / r);
const v_circ = std.math.sqrt(mu / r);
const r_soi = a * std.math.pow(f64, m / M_primary, 0.4);`,

    fortran: `! Custom body: ${A}
G = 6.6743d-11
mu = G * M
g = mu / (R * R)
r = R + h
v_esc = sqrt(2.0d0 * mu / r)
v_circ = sqrt(mu / r)
r_soi = a * (m / M_primary)**0.4d0`,

    matlab: `% Custom body: ${A}
G = 6.6743e-11; % m^3/(kg·s^2)
mu = G * M;
g = mu / R^2;
r = R + h;
v_esc = sqrt(2 * mu / r);
v_circ = sqrt(mu / r);
r_soi = a * (m / M_primary)^0.4;`,

    julia: `# Custom body: ${A}
G = 6.6743e-11  # m³/(kg·s²)
mu = G * M
g = mu / R^2
r = R + h
v_esc = sqrt(2 * mu / r)
v_circ = sqrt(mu / r)
r_soi = a * (m / M_primary)^0.4`,

    latex: `% Custom body: pure SI
\\[
  \\mu = GM,\\quad
  g = \\frac{\\mu}{R^{2}},\\quad
  v_{\\mathrm{esc}} = \\sqrt{\\frac{2\\mu}{r}},\\quad
  v_{c} = \\sqrt{\\frac{\\mu}{r}},\\quad
  r_{\\mathrm{SOI}} \\approx a\\left(\\frac{m}{M_{\\mathrm{primary}}}\\right)^{2/5}
\\]`,
  },
}
