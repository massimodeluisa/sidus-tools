import type { FormulaSnippet } from './types'

/**
 * Sun-synchronous inclination: Ω̇_J2 = −ω_⊙ for circular LEO.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches SsoTool + lib/physics/sso.ts. Free vars: h [m above Earth].
 */
const A =
  'Circular LEO; Ω̇_J2 equals mean solar motion; Earth J2, spherical. SI; h [m].'

export const ssoSnippets: FormulaSnippet = {
  formulaId: 'sso',
  assumptions: A,
  code: {
    python: `# SSO inclination: ${A}
import math
J2, mu, R = 1.08262668e-3, 3.986004418e14, 6378137.0
omega_sun = 2 * math.pi / (365.256363004 * 86400)
a = R + h
n = math.sqrt(mu / a**3)
cos_i = -(2 / 3) * (a / R)**2 * omega_sun / (n * J2)
i = math.acos(max(-1.0, min(1.0, cos_i)))
T = 2 * math.pi * math.sqrt(a**3 / mu)`,

    javascript: `// SSO inclination: ${A}
const J2 = 1.08262668e-3, mu = 3.986004418e14, R = 6378137
const omegaSun = 2 * Math.PI / (365.256363004 * 86400)
const a = R + h
const n = Math.sqrt(mu / a ** 3)
const cosI = -(2 / 3) * (a / R) ** 2 * omegaSun / (n * J2)
const i = Math.acos(Math.max(-1, Math.min(1, cosI)))
const T = 2 * Math.PI * Math.sqrt(a ** 3 / mu)`,

    typescript: `// SSO inclination: ${A}
const J2: number = 1.08262668e-3
const mu: number = 3.986004418e14
const R: number = 6378137
const omegaSun: number = 2 * Math.PI / (365.256363004 * 86400)
const a: number = R + h
const n: number = Math.sqrt(mu / a ** 3)
const cosI: number = -(2 / 3) * (a / R) ** 2 * omegaSun / (n * J2)
const i: number = Math.acos(Math.max(-1, Math.min(1, cosI)))
const T: number = 2 * Math.PI * Math.sqrt(a ** 3 / mu)`,

    c: `/* SSO inclination: ${A} */
const double J2 = 1.08262668e-3;
const double mu = 3.986004418e14;
const double R = 6378137.0;
const double omega_sun = 2.0 * M_PI / (365.256363004 * 86400.0);
const double a = R + h;
const double n = sqrt(mu / (a * a * a));
const double cos_i = -(2.0 / 3.0) * (a / R) * (a / R) * omega_sun / (n * J2);
const double i = acos(fmax(-1.0, fmin(1.0, cos_i)));
const double T = 2.0 * M_PI * sqrt((a * a * a) / mu);`,

    cpp: `// SSO inclination: ${A}
const double J2 = 1.08262668e-3;
const double mu = 3.986004418e14;
const double R = 6378137.0;
const double omega_sun = 2.0 * M_PI / (365.256363004 * 86400.0);
const double a = R + h;
const double n = std::sqrt(mu / (a * a * a));
const double cos_i = -(2.0 / 3.0) * (a / R) * (a / R) * omega_sun / (n * J2);
const double i = std::acos(std::fmax(-1.0, std::fmin(1.0, cos_i)));
const double T = 2.0 * M_PI * std::sqrt((a * a * a) / mu);`,

    rust: `// SSO inclination: ${A}
let j2 = 1.08262668e-3_f64;
let mu = 3.986004418e14_f64;
let r_eq = 6378137.0_f64;
let omega_sun = 2.0 * std::f64::consts::PI / (365.256363004 * 86400.0);
let a = r_eq + h;
let n = (mu / (a * a * a)).sqrt();
let cos_i = -(2.0 / 3.0) * (a / r_eq).powi(2) * omega_sun / (n * j2);
let i = cos_i.clamp(-1.0, 1.0).acos();
let t = 2.0 * std::f64::consts::PI * ((a * a * a) / mu).sqrt();`,

    zig: `// SSO inclination: ${A}
const J2: f64 = 1.08262668e-3;
const mu: f64 = 3.986004418e14;
const R: f64 = 6378137.0;
const omega_sun = 2.0 * std.math.pi / (365.256363004 * 86400.0);
const a = R + h;
const n = std.math.sqrt(mu / (a * a * a));
const cos_i = -(2.0 / 3.0) * std.math.pow(f64, a / R, 2.0) * omega_sun / (n * J2);
const i = std.math.acos(@max(-1.0, @min(1.0, cos_i)));
const T = 2.0 * std.math.pi * std.math.sqrt((a * a * a) / mu);`,

    fortran: `! SSO inclination: ${A}
J2 = 1.08262668d-3
mu = 3.986004418d14
R = 6378137.0d0
omega_sun = 2.0d0 * 3.141592653589793d0 / (365.256363004d0 * 86400.0d0)
a = R + h
n = sqrt(mu / a**3)
cos_i = -(2.0d0 / 3.0d0) * (a / R)**2 * omega_sun / (n * J2)
i = acos(max(-1.0d0, min(1.0d0, cos_i)))
T = 2.0d0 * 3.141592653589793d0 * sqrt(a**3 / mu)`,

    matlab: `% SSO inclination: ${A}
J2 = 1.08262668e-3;
mu = 3.986004418e14;
R = 6378137;
omega_sun = 2 * pi / (365.256363004 * 86400);
a = R + h;
n = sqrt(mu / a^3);
cos_i = -(2/3) * (a / R)^2 * omega_sun / (n * J2);
i = acos(max(-1, min(1, cos_i)));
T = 2 * pi * sqrt(a^3 / mu);`,

    julia: `# SSO inclination: ${A}
J2, mu, R = 1.08262668e-3, 3.986004418e14, 6378137.0
omega_sun = 2π / (365.256363004 * 86400)
a = R + h
n = sqrt(mu / a^3)
cos_i = -(2 / 3) * (a / R)^2 * omega_sun / (n * J2)
i = acos(clamp(cos_i, -1.0, 1.0))
T = 2π * sqrt(a^3 / mu)`,

    latex: `% SSO inclination: pure SI
\\[
  \\cos i =-\\frac{2}{3}\\left(\\frac{a}{R}\\right)^{2}
  \\frac{\\omega_{\\odot}}{n J_{2}},\\quad
  n=\\sqrt{\\mu/a^{3}},\\quad
  a=R+h
\\]`,
  },
}
