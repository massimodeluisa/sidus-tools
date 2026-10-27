import type { FormulaSnippet } from '../types'

/**
 * Heliocentric Hohmann: coplanar circular transfer about the Sun.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HelioHohmannTool + heliocentricHohmann / hohmannPhaseAngle.
 * Free vars: mu (μ_sun), r1, r2 (heliocentric SMA).
 */
const A =
  'Coplanar circular heliocentric Hohmann about the Sun (μ = μ_sun; r1,r2 heliocentric SMA). Phase is the signed principal lead angle in [-π, π). Pure SI.'

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
phase0 = math.pi * (1 - (a / r2) ** 1.5)
phase = phase0 - 2 * math.pi * math.floor((phase0 + math.pi) / (2 * math.pi))`,

    javascript: `// Heliocentric Hohmann: ${A}
const a = 0.5 * (r1 + r2)
const dv1 = Math.abs(Math.sqrt(mu / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1))
const dv2 = Math.abs(Math.sqrt(mu / r2) * (1 - Math.sqrt((2 * r1) / (r1 + r2))))
const tof = Math.PI * Math.sqrt(a ** 3 / mu)
const phase0 = Math.PI * (1 - (a / r2) ** 1.5)
const phase = phase0 - 2 * Math.PI * Math.floor((phase0 + Math.PI) / (2 * Math.PI))`,

    typescript: `// Heliocentric Hohmann: ${A}
const a: number = 0.5 * (r1 + r2)
const dv1: number = Math.abs(Math.sqrt(mu / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1))
const dv2: number = Math.abs(Math.sqrt(mu / r2) * (1 - Math.sqrt((2 * r1) / (r1 + r2))))
const tof: number = Math.PI * Math.sqrt(a ** 3 / mu)
const phase0: number = Math.PI * (1 - (a / r2) ** 1.5)
const phase: number = phase0 - 2 * Math.PI * Math.floor((phase0 + Math.PI) / (2 * Math.PI))`,

    c: `/* Heliocentric Hohmann: ${A} */
const double a = 0.5 * (r1 + r2);
const double dv1 = fabs(sqrt(mu / r1) * (sqrt(2.0 * r2 / (r1 + r2)) - 1.0));
const double dv2 = fabs(sqrt(mu / r2) * (1.0 - sqrt(2.0 * r1 / (r1 + r2))));
const double tof = M_PI * sqrt((a * a * a) / mu);
const double phase0 = M_PI * (1.0 - pow(a / r2, 1.5));
const double phase = phase0 - 2.0 * M_PI * floor((phase0 + M_PI) / (2.0 * M_PI));`,

    cpp: `// Heliocentric Hohmann: ${A}
const double a = 0.5 * (r1 + r2);
const double dv1 = fabs(std::sqrt(mu / r1) * (std::sqrt(2.0 * r2 / (r1 + r2)) - 1.0));
const double dv2 = fabs(std::sqrt(mu / r2) * (1.0 - std::sqrt(2.0 * r1 / (r1 + r2))));
const double tof = M_PI * std::sqrt((a * a * a) / mu);
const double phase0 = M_PI * (1.0 - std::pow(a / r2, 1.5));
const double phase = phase0 - 2.0 * M_PI * std::floor((phase0 + M_PI) / (2.0 * M_PI));`,

    rust: `// Heliocentric Hohmann: ${A}
let a = 0.5 * (r1 + r2);
let dv1 = ((mu / r1).sqrt() * ((2.0 * r2 / (r1 + r2)).sqrt() - 1.0)).abs();
let dv2 = ((mu / r2).sqrt() * (1.0 - (2.0 * r1 / (r1 + r2)).sqrt())).abs();
let tof = std::f64::consts::PI * ((a * a * a) / mu).sqrt();
let phase0 = std::f64::consts::PI * (1.0 - (a / r2).powf(1.5));
let phase = phase0 - 2.0 * std::f64::consts::PI * ((phase0 + std::f64::consts::PI) / (2.0 * std::f64::consts::PI)).floor();`,

    zig: `// Heliocentric Hohmann: ${A}
const a = 0.5 * (r1 + r2);
const dv1 = @abs(std.math.sqrt(mu / r1) * (std.math.sqrt(2.0 * r2 / (r1 + r2)) - 1.0));
const dv2 = @abs(std.math.sqrt(mu / r2) * (1.0 - std.math.sqrt(2.0 * r1 / (r1 + r2))));
const tof = std.math.pi * std.math.sqrt((a * a * a) / mu);
const phase0 = std.math.pi * (1.0 - std.math.pow(f64, a / r2, 1.5));
const phase = phase0 - 2.0 * std.math.pi * @floor((phase0 + std.math.pi) / (2.0 * std.math.pi));`,

    fortran: `! Heliocentric Hohmann: ${A}
a = 0.5d0 * (r1 + r2)
dv1 = abs(sqrt(mu / r1) * (sqrt(2.0d0 * r2 / (r1 + r2)) - 1.0d0))
dv2 = abs(sqrt(mu / r2) * (1.0d0 - sqrt(2.0d0 * r1 / (r1 + r2))))
tof = 3.141592653589793d0 * sqrt((a * a * a) / mu)
phase = 3.141592653589793d0 * (1.0d0 - (a / r2)**1.5d0)
phase = phase - 2.0d0 * 3.141592653589793d0 * floor((phase + 3.141592653589793d0) / (2.0d0 * 3.141592653589793d0))`,

    matlab: `% Heliocentric Hohmann: ${A}
a = 0.5 * (r1 + r2);
dv1 = abs(sqrt(mu / r1) * (sqrt(2 * r2 / (r1 + r2)) - 1));
dv2 = abs(sqrt(mu / r2) * (1 - sqrt(2 * r1 / (r1 + r2))));
tof = pi * sqrt(a^3 / mu);
phase0 = pi * (1 - (a / r2)^1.5);
phase = phase0 - 2 * pi * floor((phase0 + pi) / (2 * pi));`,

    julia: `# Heliocentric Hohmann: ${A}
a = 0.5 * (r1 + r2)
dv1 = abs(sqrt(mu / r1) * (sqrt(2 * r2 / (r1 + r2)) - 1))
dv2 = abs(sqrt(mu / r2) * (1 - sqrt(2 * r1 / (r1 + r2))))
tof = π * sqrt(a^3 / mu)
phase0 = π * (1 - (a / r2)^1.5)
phase = phase0 - 2π * floor(Float64, (phase0 + π) / (2π))`,

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
  \\phi_0 = \\pi\\bigl(1-(a_t/r_2)^{3/2}\\bigr),\\quad
  \\phi = \\phi_0 - 2\\pi\\left\\lfloor\\frac{\\phi_0+\\pi}{2\\pi}\\right\\rfloor
  \\quad(\\phi\\in[-\\pi,\\pi))
\\]`,
  },
}
