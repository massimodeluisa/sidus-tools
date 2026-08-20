import type { FormulaSnippet } from '../types'

/**
 * Heliocentric Hohmann: coplanar circular transfer about the Sun.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HelioHohmannTool + heliocentricHohmann / hohmannPhaseAngle.
 * Free vars: mu (μ_sun), r1, r2 (heliocentric SMA).
 */
const A =
  'Coplanar circular heliocentric Hohmann about the Sun (μ = μ_sun; r1,r2 heliocentric SMA). Pure SI.'

export const helioHohmannSnippets: FormulaSnippet = {
  formulaId: 'helio-hohmann',
  assumptions: A,
  code: {
    python: `# Heliocentric Hohmann: ${A}
import math
a = 0.5 * (r1 + r2)
dv1 = abs(math.sqrt(mu / r1) * (math.sqrt(2 * r2 / (r1 + r2)) - 1))
dv2 = abs(math.sqrt(mu / r2) * (1 - math.sqrt(2 * r1 / (r1 + r2))))
tof = math.pi * math.sqrt(a**3 / mu)
phase = math.pi * (1 - (a / r2) ** 1.5)`,

    javascript: `// Heliocentric Hohmann: ${A}
const a = 0.5 * (r1 + r2)
const dv1 = Math.abs(Math.sqrt(mu / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1))
const dv2 = Math.abs(Math.sqrt(mu / r2) * (1 - Math.sqrt((2 * r1) / (r1 + r2))))
const tof = Math.PI * Math.sqrt(a ** 3 / mu)
const phase = Math.PI * (1 - (a / r2) ** 1.5)`,

    typescript: `// Heliocentric Hohmann: ${A}
const a: number = 0.5 * (r1 + r2)
const dv1: number = Math.abs(Math.sqrt(mu / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1))
const dv2: number = Math.abs(Math.sqrt(mu / r2) * (1 - Math.sqrt((2 * r1) / (r1 + r2))))
const tof: number = Math.PI * Math.sqrt(a ** 3 / mu)
const phase: number = Math.PI * (1 - (a / r2) ** 1.5)`,

    c: `/* Heliocentric Hohmann: ${A} */
const double a = 0.5 * (r1 + r2);
const double dv1 = fabs(sqrt(mu / r1) * (sqrt(2.0 * r2 / (r1 + r2)) - 1.0));
const double dv2 = fabs(sqrt(mu / r2) * (1.0 - sqrt(2.0 * r1 / (r1 + r2))));
const double tof = M_PI * sqrt((a * a * a) / mu);
const double phase = M_PI * (1.0 - pow(a / r2, 1.5));`,

    cpp: `// Heliocentric Hohmann: ${A}
const double a = 0.5 * (r1 + r2);
const double dv1 = fabs(std::sqrt(mu / r1) * (std::sqrt(2.0 * r2 / (r1 + r2)) - 1.0));
const double dv2 = fabs(std::sqrt(mu / r2) * (1.0 - std::sqrt(2.0 * r1 / (r1 + r2))));
const double tof = M_PI * std::sqrt((a * a * a) / mu);
const double phase = M_PI * (1.0 - std::pow(a / r2, 1.5));`,

    rust: `// Heliocentric Hohmann: ${A}
let a = 0.5 * (r1 + r2);
let dv1 = ((mu / r1).sqrt() * ((2.0 * r2 / (r1 + r2)).sqrt() - 1.0)).abs();
let dv2 = ((mu / r2).sqrt() * (1.0 - (2.0 * r1 / (r1 + r2)).sqrt())).abs();
let tof = std::f64::consts::PI * ((a * a * a) / mu).sqrt();
let phase = std::f64::consts::PI * (1.0 - (a / r2).powf(1.5));`,

    zig: `// Heliocentric Hohmann: ${A}
const a = 0.5 * (r1 + r2);
const dv1 = @abs(std.math.sqrt(mu / r1) * (std.math.sqrt(2.0 * r2 / (r1 + r2)) - 1.0));
const dv2 = @abs(std.math.sqrt(mu / r2) * (1.0 - std.math.sqrt(2.0 * r1 / (r1 + r2))));
const tof = std.math.pi * std.math.sqrt((a * a * a) / mu);
const phase = std.math.pi * (1.0 - std.math.pow(f64, a / r2, 1.5));`,

    fortran: `! Heliocentric Hohmann: ${A}
a = 0.5d0 * (r1 + r2)
dv1 = abs(sqrt(mu / r1) * (sqrt(2.0d0 * r2 / (r1 + r2)) - 1.0d0))
dv2 = abs(sqrt(mu / r2) * (1.0d0 - sqrt(2.0d0 * r1 / (r1 + r2))))
tof = 3.141592653589793d0 * sqrt((a * a * a) / mu)
phase = 3.141592653589793d0 * (1.0d0 - (a / r2)**1.5d0)`,

    matlab: `% Heliocentric Hohmann: ${A}
a = 0.5 * (r1 + r2);
dv1 = abs(sqrt(mu / r1) * (sqrt(2 * r2 / (r1 + r2)) - 1));
dv2 = abs(sqrt(mu / r2) * (1 - sqrt(2 * r1 / (r1 + r2))));
tof = pi * sqrt(a^3 / mu);
phase = pi * (1 - (a / r2)^1.5);`,

    julia: `# Heliocentric Hohmann: ${A}
a = 0.5 * (r1 + r2)
dv1 = abs(sqrt(mu / r1) * (sqrt(2 * r2 / (r1 + r2)) - 1))
dv2 = abs(sqrt(mu / r2) * (1 - sqrt(2 * r1 / (r1 + r2))))
tof = π * sqrt(a^3 / mu)
phase = π * (1 - (a / r2)^1.5)`,

    latex: `% Heliocentric Hohmann: pure SI
\\[
  a_t = \\tfrac{1}{2}(r_1+r_2),\\quad
  \\Delta v_1 = \\left|\\sqrt{\\frac{\\mu}{r_1}}\\Bigl(\\sqrt{\\frac{2 r_2}{r_1+r_2}}-1\\Bigr)\\right|
\\]
\\[
  \\Delta v_2 = \\left|\\sqrt{\\frac{\\mu}{r_2}}\\Bigl(1-\\sqrt{\\frac{2 r_1}{r_1+r_2}}\\Bigr)\\right|,\\quad
  t_{\\mathrm{tof}} = \\pi\\sqrt{a_t^{3}/\\mu}
\\]
\\[
  \\phi = \\pi\\bigl(1-(a_t/r_2)^{3/2}\\bigr)
\\]`,
  },
}
