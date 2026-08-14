import type { FormulaSnippet } from '../types'

/**
 * Relative period: period difference of two circular orbits.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches RelativePeriodTool + orbitalPeriod (T = 2π √(r³/μ)).
 * Free vars: r1, r2, mu.
 */
const A = 'Period difference of two circular orbits; T = 2π √(r³/μ). Pure SI.'

export const relPerSnippets: FormulaSnippet = {
  formulaId: 'relative-period',
  assumptions: A,
  code: {
    python: `# Relative period: ${A}
import math
r1 = R + h1
r2 = R + h2
T1 = 2 * math.pi * math.sqrt(r1**3 / mu)
T2 = 2 * math.pi * math.sqrt(r2**3 / mu)
dT = T2 - T1`,

    javascript: `// Relative period: ${A}
const r1 = R + h1
const r2 = R + h2
const T1 = 2 * Math.PI * Math.sqrt(r1 ** 3 / mu)
const T2 = 2 * Math.PI * Math.sqrt(r2 ** 3 / mu)
const dT = T2 - T1`,

    typescript: `// Relative period: ${A}
const r1: number = R + h1
const r2: number = R + h2
const T1: number = 2 * Math.PI * Math.sqrt(r1 ** 3 / mu)
const T2: number = 2 * Math.PI * Math.sqrt(r2 ** 3 / mu)
const dT: number = T2 - T1`,

    c: `/* Relative period: ${A} */
const double r1 = R + h1;
const double r2 = R + h2;
const double T1 = 2.0 * M_PI * sqrt((r1 * r1 * r1) / mu);
const double T2 = 2.0 * M_PI * sqrt((r2 * r2 * r2) / mu);
const double dT = T2 - T1;`,

    cpp: `// Relative period: ${A}
const double r1 = R + h1;
const double r2 = R + h2;
const double T1 = 2.0 * M_PI * std::sqrt((r1 * r1 * r1) / mu);
const double T2 = 2.0 * M_PI * std::sqrt((r2 * r2 * r2) / mu);
const double dT = T2 - T1;`,

    rust: `// Relative period: ${A}
let r1 = R + h1;
let r2 = R + h2;
let t1 = 2.0 * std::f64::consts::PI * ((r1 * r1 * r1) / mu).sqrt();
let t2 = 2.0 * std::f64::consts::PI * ((r2 * r2 * r2) / mu).sqrt();
let d_t = t2 - t1;`,

    zig: `// Relative period: ${A}
const r1 = R + h1;
const r2 = R + h2;
const T1 = 2.0 * std.math.pi * std.math.sqrt((r1 * r1 * r1) / mu);
const T2 = 2.0 * std.math.pi * std.math.sqrt((r2 * r2 * r2) / mu);
const dT = T2 - T1;`,

    fortran: `! Relative period: ${A}
r1 = R + h1
r2 = R + h2
T1 = 2.0d0 * 3.141592653589793d0 * sqrt((r1 * r1 * r1) / mu)
T2 = 2.0d0 * 3.141592653589793d0 * sqrt((r2 * r2 * r2) / mu)
dT = T2 - T1`,

    matlab: `% Relative period: ${A}
r1 = R + h1;
r2 = R + h2;
T1 = 2 * pi * sqrt(r1^3 / mu);
T2 = 2 * pi * sqrt(r2^3 / mu);
dT = T2 - T1;`,

    julia: `# Relative period: ${A}
r1 = R + h1
r2 = R + h2
T1 = 2 * π * sqrt(r1^3 / mu)
T2 = 2 * π * sqrt(r2^3 / mu)
dT = T2 - T1`,

    latex: `% Relative period: pure SI
\\[
  T_{i} = 2\\pi\\sqrt{\\frac{r_{i}^{3}}{\\mu}},\\quad
  \\Delta T = T_{2} - T_{1}
\\]`,
  },
}
