import type { FormulaSnippet } from '../types'

/**
 * Specific orbital energy: ε = −μ/(2a) for ellipse.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches EnergyTool + lib/physics specificEnergy.
 * Free vars: a, mu.
 */
const A = 'Two-body specific energy ε = −μ/(2a) for bound ellipse. SI (J/kg).'

export const energySnippets: FormulaSnippet = {
  formulaId: 'orbital-energy',
  assumptions: A,
  code: {
    python: `# Specific orbital energy: ${A}
eps = -mu / (2 * a)`,

    javascript: `// Specific orbital energy: ${A}
const eps = -mu / (2 * a)`,

    typescript: `// Specific orbital energy: ${A}
const eps: number = -mu / (2 * a)`,

    c: `/* Specific orbital energy: ${A} */
const double eps = -mu / (2.0 * a);`,

    cpp: `// Specific orbital energy: ${A}
const double eps = -mu / (2.0 * a);`,

    rust: `// Specific orbital energy: ${A}
let eps = -mu / (2.0 * a);`,

    zig: `// Specific orbital energy: ${A}
const eps = -mu / (2.0 * a);`,

    fortran: `! Specific orbital energy: ${A}
eps = -mu / (2.0d0 * a)`,

    matlab: `% Specific orbital energy: ${A}
eps = -mu / (2 * a);`,

    julia: `# Specific orbital energy: ${A}
eps = -mu / (2 * a)`,

    latex: `% Specific orbital energy: pure SI
\\[
  \\varepsilon = -\\frac{\\mu}{2a}
\\]`,
  },
}
