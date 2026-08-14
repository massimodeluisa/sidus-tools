import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body problem; spherical central body; coplanar circular orbits; impulsive Δv; r1, r2 = circular-orbit radii (R + altitude), not the body radius; SI units (m, s).'

/**
 * Hohmann Δv and TOF.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HohmannTool: UI altitudes + body radius → r1 = R+h1, r2 = R+h2.
 * Free vars: R, h1, h2, mu.
 */
export const hohmannSnippets: FormulaSnippet = {
  formulaId: 'hohmann',
  assumptions: ASSUMPTIONS,
  code: {
    c: `/* Hohmann: ${ASSUMPTIONS} */
const double r1 = R + h1;
const double r2 = R + h2;
const double dv1 = sqrt(mu / r1) * (sqrt(2.0 * r2 / (r1 + r2)) - 1.0);
const double dv2 = sqrt(mu / r2) * (1.0 - sqrt(2.0 * r1 / (r1 + r2)));
const double a = 0.5 * (r1 + r2);
const double tof = M_PI * sqrt(a * a * a / mu);`,

    cpp: `// Hohmann: ${ASSUMPTIONS}
const double r1 = R + h1;
const double r2 = R + h2;
const double dv1 = std::sqrt(mu / r1) * (std::sqrt(2.0 * r2 / (r1 + r2)) - 1.0);
const double dv2 = std::sqrt(mu / r2) * (1.0 - std::sqrt(2.0 * r1 / (r1 + r2)));
const double a = 0.5 * (r1 + r2);
const double tof = M_PI * std::sqrt(a * a * a / mu);`,

    rust: `// Hohmann: ${ASSUMPTIONS}
let r1 = R + h1;
let r2 = R + h2;
let dv1 = (mu / r1).sqrt() * ((2.0 * r2 / (r1 + r2)).sqrt() - 1.0);
let dv2 = (mu / r2).sqrt() * (1.0 - (2.0 * r1 / (r1 + r2)).sqrt());
let a = 0.5 * (r1 + r2);
let tof = std::f64::consts::PI * (a * a * a / mu).sqrt();`,

    zig: `// Hohmann: ${ASSUMPTIONS}
const r1 = R + h1;
const r2 = R + h2;
const dv1 = std.math.sqrt(mu / r1) * (std.math.sqrt(2.0 * r2 / (r1 + r2)) - 1.0);
const dv2 = std.math.sqrt(mu / r2) * (1.0 - std.math.sqrt(2.0 * r1 / (r1 + r2)));
const a = 0.5 * (r1 + r2);
const tof = std.math.pi * std.math.sqrt(a * a * a / mu);`,

    python: `# Hohmann: ${ASSUMPTIONS}
import math
r1 = R + h1
r2 = R + h2
dv1 = math.sqrt(mu / r1) * (math.sqrt(2 * r2 / (r1 + r2)) - 1)
dv2 = math.sqrt(mu / r2) * (1 - math.sqrt(2 * r1 / (r1 + r2)))
a = 0.5 * (r1 + r2)
tof = math.pi * math.sqrt(a**3 / mu)`,

    javascript: `// Hohmann: ${ASSUMPTIONS}
const r1 = R + h1
const r2 = R + h2
const dv1 = Math.sqrt(mu / r1) * (Math.sqrt(2 * r2 / (r1 + r2)) - 1)
const dv2 = Math.sqrt(mu / r2) * (1 - Math.sqrt(2 * r1 / (r1 + r2)))
const a = 0.5 * (r1 + r2)
const tof = Math.PI * Math.sqrt(a ** 3 / mu)`,

    typescript: `// Hohmann: ${ASSUMPTIONS}
const r1: number = R + h1
const r2: number = R + h2
const dv1: number = Math.sqrt(mu / r1) * (Math.sqrt(2 * r2 / (r1 + r2)) - 1)
const dv2: number = Math.sqrt(mu / r2) * (1 - Math.sqrt(2 * r1 / (r1 + r2)))
const a: number = 0.5 * (r1 + r2)
const tof: number = Math.PI * Math.sqrt(a ** 3 / mu)`,

    matlab: `% Hohmann: ${ASSUMPTIONS}
r1 = R + h1;
r2 = R + h2;
dv1 = sqrt(mu/r1)*(sqrt(2*r2/(r1+r2))-1);
dv2 = sqrt(mu/r2)*(1-sqrt(2*r1/(r1+r2)));
a = 0.5*(r1+r2);
tof = pi*sqrt(a^3/mu);`,

    julia: `# Hohmann: ${ASSUMPTIONS}
r1 = R + h1
r2 = R + h2
dv1 = sqrt(mu / r1) * (sqrt(2 * r2 / (r1 + r2)) - 1)
dv2 = sqrt(mu / r2) * (1 - sqrt(2 * r1 / (r1 + r2)))
a = 0.5 * (r1 + r2)
tof = π * sqrt(a^3 / mu)`,

    fortran: `! Hohmann: ${ASSUMPTIONS}
r1 = R + h1
r2 = R + h2
dv1 = sqrt(mu / r1) * (sqrt(2.0d0 * r2 / (r1 + r2)) - 1.0d0)
dv2 = sqrt(mu / r2) * (1.0d0 - sqrt(2.0d0 * r1 / (r1 + r2)))
a = 0.5d0 * (r1 + r2)
tof = acos(-1.0d0) * sqrt(a**3 / mu)`,

    latex: `% two-body, Keplerian, impulsive; r_1, r_2 are orbit radii
\\[
r_1 = R + h_1,\\quad r_2 = R + h_2
\\]
\\[
\\Delta v_1 = \\sqrt{\\frac{\\mu}{r_1}}\\!\\left(\\sqrt{\\frac{2r_2}{r_1+r_2}}-1\\right)
\\]
\\[
\\Delta v_2 = \\sqrt{\\frac{\\mu}{r_2}}\\!\\left(1-\\sqrt{\\frac{2r_1}{r_1+r_2}}\\right)
\\]`,
  },
}
