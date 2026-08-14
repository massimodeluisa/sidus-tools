import type { FormulaSnippet } from '../types'

/**
 * Hohmann TOF: half-period of the transfer ellipse a = (r1+r2)/2.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HohmannTimeTool + lib/physics hohmannTransfer TOF.
 * Free vars: R, h1, h2, mu. r1 = R+h1 and r2 = R+h2 are orbital radii.
 */
const A =
  'Hohmann TOF half-period of transfer ellipse; r1, r2 = circular-orbit radii (R + altitude), not the body radius. Pure SI (m, s).'

export const hohmannTimeSnippets: FormulaSnippet = {
  formulaId: 'hohmann-time',
  assumptions: A,
  code: {
    python: `# Hohmann TOF: ${A}
import math
r1 = R + h1
r2 = R + h2
a = 0.5 * (r1 + r2)
tof = math.pi * math.sqrt(a**3 / mu)`,

    javascript: `// Hohmann TOF: ${A}
const r1 = R + h1
const r2 = R + h2
const a = 0.5 * (r1 + r2)
const tof = Math.PI * Math.sqrt(a ** 3 / mu)`,

    typescript: `// Hohmann TOF: ${A}
const r1: number = R + h1
const r2: number = R + h2
const a: number = 0.5 * (r1 + r2)
const tof: number = Math.PI * Math.sqrt(a ** 3 / mu)`,

    c: `/* Hohmann TOF: ${A} */
const double r1 = R + h1;
const double r2 = R + h2;
const double a = 0.5 * (r1 + r2);
const double tof = M_PI * sqrt(a * a * a / mu);`,

    cpp: `// Hohmann TOF: ${A}
const double r1 = R + h1;
const double r2 = R + h2;
const double a = 0.5 * (r1 + r2);
const double tof = M_PI * std::sqrt(a * a * a / mu);`,

    rust: `// Hohmann TOF: ${A}
let r1 = R + h1;
let r2 = R + h2;
let a = 0.5 * (r1 + r2);
let tof = std::f64::consts::PI * (a * a * a / mu).sqrt();`,

    zig: `// Hohmann TOF: ${A}
const r1 = R + h1;
const r2 = R + h2;
const a = 0.5 * (r1 + r2);
const tof = std.math.pi * std.math.sqrt(a * a * a / mu);`,

    fortran: `! Hohmann TOF: ${A}
r1 = R + h1
r2 = R + h2
a = 0.5d0 * (r1 + r2)
tof = 3.141592653589793d0 * sqrt(a * a * a / mu)`,

    matlab: `% Hohmann TOF: ${A}
r1 = R + h1;
r2 = R + h2;
a = 0.5 * (r1 + r2);
tof = pi * sqrt(a^3 / mu);`,

    julia: `# Hohmann TOF: ${A}
r1 = R + h1
r2 = R + h2
a = 0.5 * (r1 + r2)
tof = π * sqrt(a^3 / mu)`,

    latex: `% Hohmann TOF: pure SI; r_1, r_2 are orbit radii
\\[
  r_1 = R + h_1,\\quad r_2 = R + h_2,\\quad
  a = \\frac{r_1+r_2}{2},\\quad
  t = \\pi\\sqrt{\\frac{a^{3}}{\\mu}}
\\]`,
  },
}
