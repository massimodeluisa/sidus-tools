import type { FormulaSnippet } from './types'

/**
 * Isothermal choked orifice cabin leak to vacuum.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches CabinLeakTool + lib/physics/eclss.ts leakDepressTime.
 * Free vars: V [m³], A [m²], P0, P1 [Pa], T [K], Cd [-].
 */
const A =
  'Isothermal choked orifice to vacuum; ṁ ∝ P ⇒ exponential P(t). Order-of-magnitude only. SI.'

export const cabinLeakSnippets: FormulaSnippet = {
  formulaId: 'cabin-leak',
  assumptions: A,
  code: {
    python: `# Cabin leak time: ${A}
import math
g = 1.4
Rspec = 287.05  # J/(kg·K) air
factor = (2 / (g + 1)) ** ((g + 1) / (2 * (g - 1)))
K = factor * math.sqrt(g / (Rspec * T))  # ṁ = Cd A P K
tau = V / (Cd * A * K * Rspec * T)
t = tau * math.log(P0 / P1)`,

    javascript: `// Cabin leak time: ${A}
const g = 1.4
const Rspec = 287.05 // J/(kg·K) air
const factor = (2 / (g + 1)) ** ((g + 1) / (2 * (g - 1)))
const K = factor * Math.sqrt(g / (Rspec * T))
const tau = V / (Cd * A * K * Rspec * T)
const t = tau * Math.log(P0 / P1)`,

    typescript: `// Cabin leak time: ${A}
const g: number = 1.4
const Rspec: number = 287.05 // J/(kg·K) air
const factor: number = (2 / (g + 1)) ** ((g + 1) / (2 * (g - 1)))
const K: number = factor * Math.sqrt(g / (Rspec * T))
const tau: number = V / (Cd * A * K * Rspec * T)
const t: number = tau * Math.log(P0 / P1)`,

    c: `/* Cabin leak time: ${A} */
const double g = 1.4;
const double Rspec = 287.05; /* J/(kg·K) air */
const double factor = pow(2.0 / (g + 1.0), (g + 1.0) / (2.0 * (g - 1.0)));
const double K = factor * sqrt(g / (Rspec * T));
const double tau = V / (Cd * A * K * Rspec * T);
const double t = tau * log(P0 / P1);`,

    cpp: `// Cabin leak time: ${A}
const double g = 1.4;
const double Rspec = 287.05; // J/(kg·K) air
const double factor = std::pow(2.0 / (g + 1.0), (g + 1.0) / (2.0 * (g - 1.0)));
const double K = factor * std::sqrt(g / (Rspec * T));
const double tau = V / (Cd * A * K * Rspec * T);
const double t = tau * std::log(P0 / P1);`,

    rust: `// Cabin leak time: ${A}
let g = 1.4_f64;
let rspec = 287.05_f64; // J/(kg·K) air
let factor = (2.0 / (g + 1.0)).powf((g + 1.0) / (2.0 * (g - 1.0)));
let k = factor * (g / (rspec * T)).sqrt();
let tau = V / (Cd * A * k * rspec * T);
let t = tau * (P0 / P1).ln();`,

    zig: `// Cabin leak time: ${A}
const g: f64 = 1.4;
const Rspec: f64 = 287.05; // J/(kg·K) air
const factor = std.math.pow(f64, 2.0 / (g + 1.0), (g + 1.0) / (2.0 * (g - 1.0)));
const K = factor * std.math.sqrt(g / (Rspec * T));
const tau = V / (Cd * A * K * Rspec * T);
const t = tau * @log(P0 / P1);`,

    fortran: `! Cabin leak time: ${A}
g = 1.4d0
Rspec = 287.05d0
factor = (2.0d0 / (g + 1.0d0))**((g + 1.0d0) / (2.0d0 * (g - 1.0d0)))
K = factor * sqrt(g / (Rspec * T))
tau = V / (Cd * A * K * Rspec * T)
t = tau * log(P0 / P1)`,

    matlab: `% Cabin leak time: ${A}
g = 1.4;
Rspec = 287.05; % J/(kg·K) air
factor = (2/(g+1))^((g+1)/(2*(g-1)));
K = factor * sqrt(g / (Rspec * T));
tau = V / (Cd * A * K * Rspec * T);
t = tau * log(P0 / P1);`,

    julia: `# Cabin leak time: ${A}
g = 1.4
Rspec = 287.05  # J/(kg·K) air
factor = (2 / (g + 1))^((g + 1) / (2 * (g - 1)))
K = factor * sqrt(g / (Rspec * T))
tau = V / (Cd * A * K * Rspec * T)
t = tau * log(P0 / P1)`,

    latex: `% Cabin leak: pure SI
\\[
  \\dot m = C_d A P\\,K,\\quad
  K=\\Big(\\tfrac{2}{\\gamma+1}\\Big)^{(\\gamma+1)/(2(\\gamma-1))}\\sqrt{\\gamma/(R T)}
\\]
\\[
  t=\\tau\\ln(P_0/P_1),\\quad
  \\tau=V/(C_d A K R T)
\\]`,
  },
}
