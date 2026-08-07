import type { FormulaSnippet } from '../types'

/**
 * Oberth: specific energy change for impulsive Δv at circular speed v = √(μ/a).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches OberthTool educational form + lib/physics/ops.ts oberthEnergyGain.
 * Free vars: mu, a, dv.
 */
const A =
  'Specific energy change for impulsive Δv at circular speed v=√(μ/a); Δε = v Δv + ½ Δv². SI.'

export const oberthSnippets: FormulaSnippet = {
  formulaId: 'oberth',
  assumptions: A,
  code: {
    python: `# Oberth: ${A}
import math
v = math.sqrt(mu / a)
dE = v * dv + 0.5 * dv**2`,

    javascript: `// Oberth: ${A}
const v = Math.sqrt(mu / a)
const dE = v * dv + 0.5 * dv ** 2`,

    typescript: `// Oberth: ${A}
const v: number = Math.sqrt(mu / a)
const dE: number = v * dv + 0.5 * dv ** 2`,

    c: `/* Oberth: ${A} */
const double v = sqrt(mu / a);
const double dE = v * dv + 0.5 * dv * dv;`,

    cpp: `// Oberth: ${A}
const double v = std::sqrt(mu / a);
const double dE = v * dv + 0.5 * dv * dv;`,

    rust: `// Oberth: ${A}
let v = (mu / a).sqrt();
let dE = v * dv + 0.5 * dv * dv;`,

    zig: `// Oberth: ${A}
const v = std.math.sqrt(mu / a);
const dE = v * dv + 0.5 * dv * dv;`,

    fortran: `! Oberth: ${A}
v = sqrt(mu / a)
dE = v * dv + 0.5d0 * dv * dv`,

    matlab: `% Oberth: ${A}
v = sqrt(mu / a);
dE = v * dv + 0.5 * dv^2;`,

    julia: `# Oberth: ${A}
v = sqrt(mu / a)
dE = v * dv + 0.5 * dv^2`,

    latex: `% Oberth: pure SI
\\[
  v = \\sqrt{\\frac{\\mu}{a}},\\quad
  \\Delta\\varepsilon = v\\Delta v + \\tfrac{1}{2}\\Delta v^{2}
\\]`,
  },
}
