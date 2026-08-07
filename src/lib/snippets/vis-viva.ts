import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body Keplerian orbit; spherical central body; SI units. Energy ε = −μ/(2a) for ellipse (a > 0).'

export const visVivaSnippets: FormulaSnippet = {
  formulaId: 'vis-viva',
  assumptions: ASSUMPTIONS,
  code: {
    c: `/* Vis-viva: ${ASSUMPTIONS} */
const double v = sqrt(mu * (2.0 / r - 1.0 / a));
const double energy = -mu / (2.0 * a);`,

    cpp: `// Vis-viva: ${ASSUMPTIONS}
const double v = std::sqrt(mu * (2.0 / r - 1.0 / a));
const double energy = -mu / (2.0 * a);`,

    rust: `// Vis-viva: ${ASSUMPTIONS}
let v = (mu * (2.0 / r - 1.0 / a)).sqrt();
let energy = -mu / (2.0 * a);`,

    zig: `// Vis-viva: ${ASSUMPTIONS}
const v = std.math.sqrt(mu * (2.0 / r - 1.0 / a));
const energy = -mu / (2.0 * a);`,

    python: `# Vis-viva: ${ASSUMPTIONS}
import math
v = math.sqrt(mu * (2 / r - 1 / a))
energy = -mu / (2 * a)`,

    javascript: `// Vis-viva: ${ASSUMPTIONS}
const v = Math.sqrt(mu * (2 / r - 1 / a))
const energy = -mu / (2 * a)`,

    typescript: `// Vis-viva: ${ASSUMPTIONS}
const v: number = Math.sqrt(mu * (2 / r - 1 / a))
const energy: number = -mu / (2 * a)`,

    matlab: `% Vis-viva: ${ASSUMPTIONS}
v = sqrt(mu * (2 / r - 1 / a));
energy = -mu / (2 * a);`,

    julia: `# Vis-viva: ${ASSUMPTIONS}
v = sqrt(mu * (2 / r - 1 / a))
energy = -mu / (2 * a)`,

    fortran: `! Vis-viva: ${ASSUMPTIONS}
v = sqrt(mu * (2.0d0 / r - 1.0d0 / a))
energy = -mu / (2.0d0 * a)`,

    latex: `% Vis-viva
\\[
v = \\sqrt{\\mu\\left(\\frac{2}{r}-\\frac{1}{a}\\right)},\\quad
\\varepsilon = -\\frac{\\mu}{2a}
\\]`,
  },
}
