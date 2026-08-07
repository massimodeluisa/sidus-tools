import type { FormulaSnippet } from '../types'

/**
 * Hohmann TOF: half-period of the transfer ellipse a = (r1+r2)/2.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HohmannTimeTool + lib/physics hohmannTransfer TOF.
 * Free vars: r1, r2, mu.
 */
const A = 'Hohmann TOF half-period of transfer ellipse; pure SI (m, s).'

export const hohmannTimeSnippets: FormulaSnippet = {
  formulaId: 'hohmann-time',
  assumptions: A,
  code: {
    python: `# Hohmann TOF: ${A}
import math
a = 0.5 * (r1 + r2)
tof = math.pi * math.sqrt(a**3 / mu)`,

    javascript: `// Hohmann TOF: ${A}
const a = 0.5 * (r1 + r2)
const tof = Math.PI * Math.sqrt(a ** 3 / mu)`,

    typescript: `// Hohmann TOF: ${A}
const a: number = 0.5 * (r1 + r2)
const tof: number = Math.PI * Math.sqrt(a ** 3 / mu)`,

    c: `/* Hohmann TOF: ${A} */
const double a = 0.5 * (r1 + r2);
const double tof = M_PI * sqrt(a * a * a / mu);`,

    cpp: `// Hohmann TOF: ${A}
const double a = 0.5 * (r1 + r2);
const double tof = M_PI * std::sqrt(a * a * a / mu);`,

    rust: `// Hohmann TOF: ${A}
let a = 0.5 * (r1 + r2);
let tof = std::f64::consts::PI * (a * a * a / mu).sqrt();`,

    zig: `// Hohmann TOF: ${A}
const a = 0.5 * (r1 + r2);
const tof = std.math.pi * std.math.sqrt(a * a * a / mu);`,

    fortran: `! Hohmann TOF: ${A}
a = 0.5d0 * (r1 + r2)
tof = 3.141592653589793d0 * sqrt(a * a * a / mu)`,

    matlab: `% Hohmann TOF: ${A}
a = 0.5 * (r1 + r2);
tof = pi * sqrt(a^3 / mu);`,

    julia: `# Hohmann TOF: ${A}
a = 0.5 * (r1 + r2)
tof = π * sqrt(a^3 / mu)`,

    latex: `% Hohmann TOF: pure SI
\\[
  a = \\frac{r_1+r_2}{2},\\quad
  t = \\pi\\sqrt{\\frac{a^{3}}{\\mu}}
\\]`,
  },
}
