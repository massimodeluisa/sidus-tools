import type { FormulaSnippet } from '../types'

/**
 * Natural period-difference catch-up revolutions.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches RendezvousPhasingSimpleTool.
 * Free vars: r1, r2, mu, phi [rad] (phaseRad aliased as phi; r → r1).
 */
const A = 'Natural period difference catch-up revolutions; coplanar circular. SI.'

export const catchupSnippets: FormulaSnippet = {
  formulaId: 'rendezvous-catchup',
  assumptions: A,
  code: {
    python: `# Rendezvous catch-up: ${A}
import math
r1 = R + h1
r2 = R + h2
T1 = 2 * math.pi * math.sqrt(r1**3 / mu)
T2 = 2 * math.pi * math.sqrt(r2**3 / mu)
N = (phi / (2 * math.pi)) * T1 / abs(T2 - T1)`,

    javascript: `// Rendezvous catch-up: ${A}
const r1 = R + h1
const r2 = R + h2
const T1 = 2 * Math.PI * Math.sqrt(r1 ** 3 / mu)
const T2 = 2 * Math.PI * Math.sqrt(r2 ** 3 / mu)
const N = (phi / (2 * Math.PI)) * T1 / Math.abs(T2 - T1)`,

    typescript: `// Rendezvous catch-up: ${A}
const r1: number = R + h1
const r2: number = R + h2
const T1: number = 2 * Math.PI * Math.sqrt(r1 ** 3 / mu)
const T2: number = 2 * Math.PI * Math.sqrt(r2 ** 3 / mu)
const N: number = (phi / (2 * Math.PI)) * T1 / Math.abs(T2 - T1)`,

    c: `/* Rendezvous catch-up: ${A} */
const double r1 = R + h1;
const double r2 = R + h2;
const double T1 = 2.0 * M_PI * sqrt(r1 * r1 * r1 / mu);
const double T2 = 2.0 * M_PI * sqrt(r2 * r2 * r2 / mu);
const double N = (phi / (2.0 * M_PI)) * T1 / fabs(T2 - T1);`,

    cpp: `// Rendezvous catch-up: ${A}
const double r1 = R + h1;
const double r2 = R + h2;
const double T1 = 2.0 * M_PI * std::sqrt(r1 * r1 * r1 / mu);
const double T2 = 2.0 * M_PI * std::sqrt(r2 * r2 * r2 / mu);
const double N = (phi / (2.0 * M_PI)) * T1 / std::fabs(T2 - T1);`,

    rust: `// Rendezvous catch-up: ${A}
let r1 = R + h1;
let r2 = R + h2;
let t1 = 2.0 * std::f64::consts::PI * (r1 * r1 * r1 / mu).sqrt();
let t2 = 2.0 * std::f64::consts::PI * (r2 * r2 * r2 / mu).sqrt();
let n = (phi / (2.0 * std::f64::consts::PI)) * t1 / (t2 - t1).abs();`,

    zig: `// Rendezvous catch-up: ${A}
const r1 = R + h1;
const r2 = R + h2;
const T1 = 2.0 * std.math.pi * std.math.sqrt(r1 * r1 * r1 / mu);
const T2 = 2.0 * std.math.pi * std.math.sqrt(r2 * r2 * r2 / mu);
const N = (phi / (2.0 * std.math.pi)) * T1 / @abs(T2 - T1);`,

    fortran: `! Rendezvous catch-up: ${A}
r1 = R + h1
r2 = R + h2
T1 = 2.0d0 * 3.141592653589793d0 * sqrt(r1 * r1 * r1 / mu)
T2 = 2.0d0 * 3.141592653589793d0 * sqrt(r2 * r2 * r2 / mu)
N = (phi / (2.0d0 * 3.141592653589793d0)) * T1 / abs(T2 - T1)`,

    matlab: `% Rendezvous catch-up: ${A}
r1 = R + h1;
r2 = R + h2;
T1 = 2 * pi * sqrt(r1^3 / mu);
T2 = 2 * pi * sqrt(r2^3 / mu);
N = (phi / (2 * pi)) * T1 / abs(T2 - T1);`,

    julia: `# Rendezvous catch-up: ${A}
r1 = R + h1
r2 = R + h2
T1 = 2 * π * sqrt(r1^3 / mu)
T2 = 2 * π * sqrt(r2^3 / mu)
N = (phi / (2 * π)) * T1 / abs(T2 - T1)`,

    latex: `% Rendezvous catch-up: pure SI
\\[
  T=2\\pi\\sqrt{r^{3}/\\mu},\\quad
  N \\approx \\frac{\\phi}{2\\pi}\\frac{T_{1}}{|T_{2}-T_{1}|}
\\]`,
  },
}
