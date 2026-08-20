import type { FormulaSnippet } from './types'

/**
 * Dynamic pressure + ISA troposphere (educational 0-11 km core).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches DynamicPressureTool + lib/physics/atmosphere.ts (troposphere branch).
 * Free vars: h [m], v [m/s].
 */
const A = 'ISA troposphere educational core; q = ½ ρ v²; perfect gas air. SI.'

export const dynamicPressureSnippets: FormulaSnippet = {
  formulaId: 'dynamic-pressure',
  assumptions: A,
  code: {
    python: `# Dynamic pressure + ISA troposphere: ${A}
import math
T0 = 288.15
P0 = 101325.0
L = 0.0065
g0 = 9.80665
R = 287.05287
T = T0 - L * h
p = P0 * (T / T0) ** (g0 / (L * R))
rho = p / (R * T)
a = math.sqrt(1.4 * R * T)
q = 0.5 * rho * v**2
M = v / a`,

    javascript: `// Dynamic pressure + ISA troposphere: ${A}
const T0 = 288.15, P0 = 101325, L = 0.0065, g0 = 9.80665, R = 287.05287
const T = T0 - L * h
const p = P0 * (T / T0) ** (g0 / (L * R))
const rho = p / (R * T)
const a = Math.sqrt(1.4 * R * T)
const q = 0.5 * rho * v * v
const M = v / a`,

    typescript: `// Dynamic pressure + ISA troposphere: ${A}
const T0: number = 288.15
const P0: number = 101325
const L: number = 0.0065
const g0: number = 9.80665
const Rair: number = 287.05287
const T: number = T0 - L * h
const p: number = P0 * (T / T0) ** (g0 / (L * Rair))
const rho: number = p / (Rair * T)
const a: number = Math.sqrt(1.4 * Rair * T)
const q: number = 0.5 * rho * v * v
const M: number = v / a`,

    c: `/* Dynamic pressure + ISA troposphere: ${A} */
const double T0 = 288.15;
const double P0 = 101325.0;
const double L = 0.0065;
const double g0 = 9.80665;
const double R = 287.05287;
const double T = T0 - L * h;
const double p = P0 * pow(T / T0, g0 / (L * R));
const double rho = p / (R * T);
const double a = sqrt(1.4 * R * T);
const double q = 0.5 * rho * v * v;
const double M = v / a;`,

    cpp: `// Dynamic pressure + ISA troposphere: ${A}
const double T0 = 288.15;
const double P0 = 101325.0;
const double L = 0.0065;
const double g0 = 9.80665;
const double R = 287.05287;
const double T = T0 - L * h;
const double p = P0 * std::pow(T / T0, g0 / (L * R));
const double rho = p / (R * T);
const double a = std::sqrt(1.4 * R * T);
const double q = 0.5 * rho * v * v;
const double M = v / a;`,

    rust: `// Dynamic pressure + ISA troposphere: ${A}
let t0 = 288.15_f64;
let p0 = 101325.0_f64;
let lapse = 0.0065_f64;
let g0 = 9.80665_f64;
let r_air = 287.05287_f64;
let t = t0 - lapse * h;
let p = p0 * (t / t0).powf(g0 / (lapse * r_air));
let rho = p / (r_air * t);
let a = (1.4 * r_air * t).sqrt();
let q = 0.5 * rho * v * v;
let m = v / a;`,

    zig: `// Dynamic pressure + ISA troposphere: ${A}
const T0: f64 = 288.15;
const P0: f64 = 101325.0;
const L: f64 = 0.0065;
const g0: f64 = 9.80665;
const R: f64 = 287.05287;
const T = T0 - L * h;
const p = P0 * std.math.pow(f64, T / T0, g0 / (L * R));
const rho = p / (R * T);
const a = std.math.sqrt(1.4 * R * T);
const q = 0.5 * rho * v * v;
const M = v / a;`,

    fortran: `! Dynamic pressure + ISA troposphere: ${A}
T0 = 288.15d0
P0 = 101325.0d0
L = 0.0065d0
g0 = 9.80665d0
R = 287.05287d0
T = T0 - L * h
p = P0 * (T / T0)**(g0 / (L * R))
rho = p / (R * T)
a = sqrt(1.4d0 * R * T)
q = 0.5d0 * rho * v * v
M = v / a`,

    matlab: `% Dynamic pressure + ISA troposphere: ${A}
T0 = 288.15;
P0 = 101325;
L = 0.0065;
g0 = 9.80665;
R = 287.05287;
T = T0 - L * h;
p = P0 * (T / T0)^(g0 / (L * R));
rho = p / (R * T);
a = sqrt(1.4 * R * T);
q = 0.5 * rho * v^2;
M = v / a;`,

    julia: `# Dynamic pressure + ISA troposphere: ${A}
T0 = 288.15
P0 = 101325.0
L = 0.0065
g0 = 9.80665
R = 287.05287
T = T0 - L * h
p = P0 * (T / T0)^(g0 / (L * R))
rho = p / (R * T)
a = sqrt(1.4 * R * T)
q = 0.5 * rho * v^2
M = v / a`,

    latex: `% Dynamic pressure + ISA troposphere: pure SI
\\[
  q=\\tfrac12\\rho v^{2},\\quad
  M=v/a,\\quad
  a=\\sqrt{\\gamma R T},\\quad
  T=T_{0}-L h
\\]`,
  },
}
