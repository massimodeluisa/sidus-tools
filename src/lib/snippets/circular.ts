import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body problem; spherical central body; circular orbit; SI units (m, s).'

export const circularSnippets: FormulaSnippet = {
  formulaId: 'circular-orbit',
  assumptions: ASSUMPTIONS,
  code: {
    c: `/* Circular orbit: ${ASSUMPTIONS} */
const double v = sqrt(mu / r);
const double T = 2.0 * M_PI * sqrt(r * r * r / mu);
const double g = mu / (r * r);`,

    cpp: `// Circular orbit: ${ASSUMPTIONS}
const double v = std::sqrt(mu / r);
const double T = 2.0 * M_PI * std::sqrt(r * r * r / mu);
const double g = mu / (r * r);`,

    rust: `// Circular orbit: ${ASSUMPTIONS}
let v = (mu / r).sqrt();
let t = 2.0 * std::f64::consts::PI * (r * r * r / mu).sqrt();
let g = mu / (r * r);`,

    zig: `// Circular orbit: ${ASSUMPTIONS}
const v = std.math.sqrt(mu / r);
const T = 2.0 * std.math.pi * std.math.sqrt(r * r * r / mu);
const g = mu / (r * r);`,

    python: `# Circular orbit: ${ASSUMPTIONS}
import math
v = math.sqrt(mu / r)
T = 2 * math.pi * math.sqrt(r**3 / mu)
g = mu / r**2`,

    javascript: `// Circular orbit: ${ASSUMPTIONS}
const v = Math.sqrt(mu / r)
const T = 2 * Math.PI * Math.sqrt((r ** 3) / mu)
const g = mu / (r * r)`,

    typescript: `// Circular orbit: ${ASSUMPTIONS}
const v: number = Math.sqrt(mu / r)
const T: number = 2 * Math.PI * Math.sqrt((r ** 3) / mu)
const g: number = mu / (r * r)`,

    matlab: `% Circular orbit: ${ASSUMPTIONS}
v = sqrt(mu / r);
T = 2 * pi * sqrt(r^3 / mu);
g = mu / r^2;`,

    julia: `# Circular orbit: ${ASSUMPTIONS}
v = sqrt(mu / r)
T = 2 * π * sqrt(r^3 / mu)
g = mu / r^2`,

    fortran: `! Circular orbit: ${ASSUMPTIONS}
v = sqrt(mu / r)
T = 2.0d0 * acos(-1.0d0) * sqrt(r**3 / mu)
g = mu / (r * r)`,

    latex: `% Assumptions: two-body, circular, SI
\\[
v = \\sqrt{\\frac{\\mu}{r}},\\quad
T = 2\\pi\\sqrt{\\frac{r^3}{\\mu}},\\quad
g = \\frac{\\mu}{r^2}
\\]`,
  },
}
