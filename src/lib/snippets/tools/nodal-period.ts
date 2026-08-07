import type { FormulaSnippet } from '../types'

/**
 * Nodal period from secular J2 RAAN rate.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches NodalPeriodTool + j2RaanRate / raanPeriodS (Earth-like J2 educational).
 * Free vars: mu, a, e, i, R.
 */
const A =
  'J2 secular Ω̇ then nodal period T = 2π/|Ω̇| (Earth-like J2 educational). SI; i [rad].'

export const nodalSnippets: FormulaSnippet = {
  formulaId: 'nodal-period',
  assumptions: A,
  code: {
    python: `# Nodal period: ${A}
import math
J2 = 1.08262668e-3
n = math.sqrt(mu / a**3)
p = a * (1 - e * e)
raan_rate = -1.5 * n * J2 * (R / p)**2 * math.cos(i)
T = 2 * math.pi / abs(raan_rate)`,

    javascript: `// Nodal period: ${A}
const J2 = 1.08262668e-3
const n = Math.sqrt(mu / a ** 3)
const p = a * (1 - e * e)
const raan_rate = -1.5 * n * J2 * (R / p) ** 2 * Math.cos(i)
const T = (2 * Math.PI) / Math.abs(raan_rate)`,

    typescript: `// Nodal period: ${A}
const J2: number = 1.08262668e-3
const n: number = Math.sqrt(mu / a ** 3)
const p: number = a * (1 - e * e)
const raan_rate: number = -1.5 * n * J2 * (R / p) ** 2 * Math.cos(i)
const T: number = (2 * Math.PI) / Math.abs(raan_rate)`,

    c: `/* Nodal period: ${A} */
const double J2 = 1.08262668e-3;
const double n = sqrt(mu / (a * a * a));
const double p = a * (1.0 - e * e);
const double raan_rate = -1.5 * n * J2 * (R / p) * (R / p) * cos(i);
const double T = 2.0 * M_PI / fabs(raan_rate);`,

    cpp: `// Nodal period: ${A}
const double J2 = 1.08262668e-3;
const double n = std::sqrt(mu / (a * a * a));
const double p = a * (1.0 - e * e);
const double raan_rate = -1.5 * n * J2 * (R / p) * (R / p) * std::cos(i);
const double T = 2.0 * M_PI / std::fabs(raan_rate);`,

    rust: `// Nodal period: ${A}
let j2 = 1.08262668e-3_f64;
let n = (mu / (a * a * a)).sqrt();
let p = a * (1.0 - e * e);
let raan_rate = -1.5 * n * j2 * (R / p).powi(2) * i.cos();
let t = 2.0 * std::f64::consts::PI / raan_rate.abs();`,

    zig: `// Nodal period: ${A}
const J2: f64 = 1.08262668e-3;
const n = std.math.sqrt(mu / (a * a * a));
const p = a * (1.0 - e * e);
const raan_rate = -1.5 * n * J2 * (R / p) * (R / p) * std.math.cos(i);
const T = 2.0 * std.math.pi / @abs(raan_rate);`,

    fortran: `! Nodal period: ${A}
J2 = 1.08262668d-3
n = sqrt(mu / (a * a * a))
p = a * (1.0d0 - e * e)
raan_rate = -1.5d0 * n * J2 * (R / p)**2 * cos(i)
T = 2.0d0 * 3.141592653589793d0 / abs(raan_rate)`,

    matlab: `% Nodal period: ${A}
J2 = 1.08262668e-3;
n = sqrt(mu / a^3);
p = a * (1 - e * e);
raan_rate = -1.5 * n * J2 * (R / p)^2 * cos(i);
T = 2 * pi / abs(raan_rate);`,

    julia: `# Nodal period: ${A}
J2 = 1.08262668e-3
n = sqrt(mu / a^3)
p = a * (1 - e * e)
raan_rate = -1.5 * n * J2 * (R / p)^2 * cos(i)
T = 2 * π / abs(raan_rate)`,

    latex: `% Nodal period: pure SI
\\[
  n=\\sqrt{\\mu/a^{3}},\\quad
  p=a(1-e^{2}),\\quad
  \\dot{\\Omega}=-\\tfrac{3}{2}n J_{2}(R/p)^{2}\\cos i,\\quad
  T_{\\Omega}=2\\pi/|\\dot{\\Omega}|
\\]`,
  },
}
