import type { FormulaSnippet } from '../types'

/**
 * Circular period from LEO altitude (Earth μ, R educational defaults).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches SunSyncPeriodTool period branch. Free vars: h [m above Earth].
 */
const A =
  'Circular period from LEO altitude (Earth defaults for educational). SI; h [m].'

export const ssoPeriodSnippets: FormulaSnippet = {
  formulaId: 'sso-period',
  assumptions: A,
  code: {
    python: `# SSO / LEO circular period: ${A}
import math
mu = 3.986004418e14
R = 6378137
a = R + h
T = 2 * math.pi * math.sqrt(a**3 / mu)`,

    javascript: `// SSO / LEO circular period: ${A}
const mu = 3.986004418e14
const R = 6378137
const a = R + h
const T = 2 * Math.PI * Math.sqrt(a ** 3 / mu)`,

    typescript: `// SSO / LEO circular period: ${A}
const mu: number = 3.986004418e14
const R: number = 6378137
const a: number = R + h
const T: number = 2 * Math.PI * Math.sqrt(a ** 3 / mu)`,

    c: `/* SSO / LEO circular period: ${A} */
const double mu = 3.986004418e14;
const double R = 6378137.0;
const double a = R + h;
const double T = 2.0 * M_PI * sqrt(a * a * a / mu);`,

    cpp: `// SSO / LEO circular period: ${A}
const double mu = 3.986004418e14;
const double R = 6378137.0;
const double a = R + h;
const double T = 2.0 * M_PI * std::sqrt(a * a * a / mu);`,

    rust: `// SSO / LEO circular period: ${A}
let mu = 3.986004418e14_f64;
let r_earth = 6378137.0_f64;
let a = r_earth + h;
let t = 2.0 * std::f64::consts::PI * (a * a * a / mu).sqrt();`,

    zig: `// SSO / LEO circular period: ${A}
const mu: f64 = 3.986004418e14;
const R: f64 = 6378137.0;
const a = R + h;
const T = 2.0 * std.math.pi * std.math.sqrt(a * a * a / mu);`,

    fortran: `! SSO / LEO circular period: ${A}
mu = 3.986004418d14
R = 6378137.0d0
a = R + h
T = 2.0d0 * 3.141592653589793d0 * sqrt(a * a * a / mu)`,

    matlab: `% SSO / LEO circular period: ${A}
mu = 3.986004418e14;
R = 6378137;
a = R + h;
T = 2 * pi * sqrt(a^3 / mu);`,

    julia: `# SSO / LEO circular period: ${A}
mu = 3.986004418e14
R = 6378137
a = R + h
T = 2 * π * sqrt(a^3 / mu)`,

    latex: `% SSO / LEO circular period: pure SI
\\[
  a = R + h,\\quad
  T = 2\\pi\\sqrt{\\frac{a^{3}}{\\mu}}
\\]`,
  },
}
