import type { FormulaSnippet } from '../types'

/**
 * Ground-track longitude shift per orbit (Earth rotation only, no J2).
 * a = R+h; T = 2π √(a³/μ); ΔL ≈ −ω_E · T.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches GroundTrackTool + lib/physics/power.ts groundTrackShiftPerOrbit.
 * Free vars: h, mu, R (SI).
 */
const A =
  'Circular LEO teaching form: a=R+h; T=2π√(a³/μ); ΔL ≈ −ω_E T (Earth rot. only, no J2). SI.'

export const gtSnippets: FormulaSnippet = {
  formulaId: 'ground-track',
  assumptions: A,
  code: {
    python: `# Ground-track shift / rev: ${A}
import math
omega_earth = 7.292115e-5  # rad/s
a = R + h
T = 2 * math.pi * math.sqrt(a**3 / mu)
dL = -omega_earth * T`,

    javascript: `// Ground-track shift / rev: ${A}
const omega_earth = 7.292115e-5 // rad/s
const a = R + h
const T = 2 * Math.PI * Math.sqrt((a ** 3) / mu)
const dL = -omega_earth * T`,

    typescript: `// Ground-track shift / rev: ${A}
const omega_earth: number = 7.292115e-5 // rad/s
const a: number = R + h
const T: number = 2 * Math.PI * Math.sqrt((a ** 3) / mu)
const dL: number = -omega_earth * T`,

    c: `/* Ground-track shift / rev: ${A} */
const double omega_earth = 7.292115e-5; /* rad/s */
const double a = R + h;
const double T = 2.0 * M_PI * sqrt((a * a * a) / mu);
const double dL = -omega_earth * T;`,

    cpp: `// Ground-track shift / rev: ${A}
const double omega_earth = 7.292115e-5; // rad/s
const double a = R + h;
const double T = 2.0 * M_PI * std::sqrt((a * a * a) / mu);
const double dL = -omega_earth * T;`,

    rust: `// Ground-track shift / rev: ${A}
let omega_earth = 7.292115e-5_f64; // rad/s
let a = R + h;
let t = 2.0 * std::f64::consts::PI * ((a * a * a) / mu).sqrt();
let d_l = -omega_earth * t;`,

    zig: `// Ground-track shift / rev: ${A}
const omega_earth: f64 = 7.292115e-5; // rad/s
const a = R + h;
const T = 2.0 * std.math.pi * std.math.sqrt((a * a * a) / mu);
const dL = -omega_earth * T;`,

    fortran: `! Ground-track shift / rev: ${A}
omega_earth = 7.292115d-5
a = R + h
T = 2.0d0 * 3.141592653589793d0 * sqrt((a * a * a) / mu)
dL = -omega_earth * T`,

    matlab: `% Ground-track shift / rev: ${A}
omega_earth = 7.292115e-5; % rad/s
a = R + h;
T = 2 * pi * sqrt(a^3 / mu);
dL = -omega_earth * T;`,

    julia: `# Ground-track shift / rev: ${A}
omega_earth = 7.292115e-5  # rad/s
a = R + h
T = 2 * π * sqrt(a^3 / mu)
dL = -omega_earth * T`,

    latex: `% Ground-track shift / rev: pure SI
\\[
  a = R + h,\\quad
  T = 2\\pi\\sqrt{a^{3}/\\mu},\\quad
  \\Delta L \\approx -\\omega_{E} T
\\]`,
  },
}
