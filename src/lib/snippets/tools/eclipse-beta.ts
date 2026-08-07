import type { FormulaSnippet } from '../types'

/**
 * Eclipse duration vs β-angle (circular, cylindrical shadow).
 * a = R+h; T = 2π √(a³/μ);
 * f ≈ (1/π) acos( √(1−(R/a)²) / cos β ); t_ecl = f · T.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches EclipseBetaTool + lib/physics/power.ts eclipseWithBeta.
 * Free vars: h, betaRad, mu, R (SI; betaRad rad).
 */
const A =
  'Circular cylindrical shadow: f ≈ (1/π) acos(√(1−(R/a)²)/cos β); t_ecl = f T; a=R+h. SI.'

export const ebSnippets: FormulaSnippet = {
  formulaId: 'eclipse-beta',
  assumptions: A,
  code: {
    python: `# Eclipse vs β-angle: ${A}
import math
a = R + h
T = 2 * math.pi * math.sqrt(a**3 / mu)
arg = math.sqrt(1 - (R / a) ** 2) / math.cos(betaRad)
frac = math.acos(arg) / math.pi
t_ecl = frac * T`,

    javascript: `// Eclipse vs β-angle: ${A}
const a = R + h
const T = 2 * Math.PI * Math.sqrt((a ** 3) / mu)
const arg = Math.sqrt(1 - (R / a) ** 2) / Math.cos(betaRad)
const frac = Math.acos(arg) / Math.PI
const t_ecl = frac * T`,

    typescript: `// Eclipse vs β-angle: ${A}
const a: number = R + h
const T: number = 2 * Math.PI * Math.sqrt((a ** 3) / mu)
const arg: number = Math.sqrt(1 - (R / a) ** 2) / Math.cos(betaRad)
const frac: number = Math.acos(arg) / Math.PI
const t_ecl: number = frac * T`,

    c: `/* Eclipse vs β-angle: ${A} */
const double a = R + h;
const double T = 2.0 * M_PI * sqrt((a * a * a) / mu);
const double arg = sqrt(1.0 - (R / a) * (R / a)) / cos(betaRad);
const double frac = acos(arg) / M_PI;
const double t_ecl = frac * T;`,

    cpp: `// Eclipse vs β-angle: ${A}
const double a = R + h;
const double T = 2.0 * M_PI * std::sqrt((a * a * a) / mu);
const double arg = std::sqrt(1.0 - (R / a) * (R / a)) / std::cos(betaRad);
const double frac = std::acos(arg) / M_PI;
const double t_ecl = frac * T;`,

    rust: `// Eclipse vs β-angle: ${A}
let a = R + h;
let t = 2.0 * std::f64::consts::PI * ((a * a * a) / mu).sqrt();
let arg = (1.0 - (R / a).powi(2)).sqrt() / betaRad.cos();
let frac = arg.acos() / std::f64::consts::PI;
let t_ecl = frac * t;`,

    zig: `// Eclipse vs β-angle: ${A}
const a = R + h;
const T = 2.0 * std.math.pi * std.math.sqrt((a * a * a) / mu);
const arg = std.math.sqrt(1.0 - (R / a) * (R / a)) / std.math.cos(betaRad);
const frac = std.math.acos(arg) / std.math.pi;
const t_ecl = frac * T;`,

    fortran: `! Eclipse vs β-angle: ${A}
a = R + h
T = 2.0d0 * 3.141592653589793d0 * sqrt((a * a * a) / mu)
arg = sqrt(1.0d0 - (R / a)**2) / cos(betaRad)
frac = acos(arg) / 3.141592653589793d0
t_ecl = frac * T`,

    matlab: `% Eclipse vs β-angle: ${A}
a = R + h;
T = 2 * pi * sqrt(a^3 / mu);
arg = sqrt(1 - (R / a)^2) / cos(betaRad);
frac = acos(arg) / pi;
t_ecl = frac * T;`,

    julia: `# Eclipse vs β-angle: ${A}
a = R + h
T = 2 * π * sqrt(a^3 / mu)
arg = sqrt(1 - (R / a)^2) / cos(betaRad)
frac = acos(arg) / π
t_ecl = frac * T`,

    latex: `% Eclipse vs β-angle: pure SI
\\[
  a = R + h,\\quad
  T = 2\\pi\\sqrt{a^{3}/\\mu}
\\]
\\[
  f \\approx \\frac{1}{\\pi}\\arccos\\!\\left(\\frac{\\sqrt{1-(R/a)^{2}}}{\\cos\\beta}\\right),\\quad
  t_{\\mathrm{ecl}} = f\\,T
\\]`,
  },
}
