import type { FormulaSnippet } from '../types'

/**
 * Specific angular momentum: h = √(μ p) with p = a(1−e²).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches SpecificAngularMomentumTool. Free vars: mu, a, e.
 */
const A = 'h = √(μ a (1−e²)) with p = a(1−e²). Two-body Keplerian. Pure SI.'

export const hSnippets: FormulaSnippet = {
  formulaId: 'specific-angular-momentum',
  assumptions: A,
  code: {
    python: `# Specific angular momentum: ${A}
import math
h = math.sqrt(mu * a * (1 - e * e))`,

    javascript: `// Specific angular momentum: ${A}
const h = Math.sqrt(mu * a * (1 - e * e))`,

    typescript: `// Specific angular momentum: ${A}
const h: number = Math.sqrt(mu * a * (1 - e * e))`,

    c: `/* Specific angular momentum: ${A} */
const double h = sqrt(mu * a * (1.0 - e * e));`,

    cpp: `// Specific angular momentum: ${A}
const double h = std::sqrt(mu * a * (1.0 - e * e));`,

    rust: `// Specific angular momentum: ${A}
let h = (mu * a * (1.0 - e * e)).sqrt();`,

    zig: `// Specific angular momentum: ${A}
const h = std.math.sqrt(mu * a * (1.0 - e * e));`,

    fortran: `! Specific angular momentum: ${A}
h = sqrt(mu * a * (1.0d0 - e * e))`,

    matlab: `% Specific angular momentum: ${A}
h = sqrt(mu * a * (1 - e * e));`,

    julia: `# Specific angular momentum: ${A}
h = sqrt(mu * a * (1 - e * e))`,

    latex: `% Specific angular momentum: pure SI
\\[
  h = \\sqrt{\\mu a(1-e^{2})},\\quad
  p = a(1-e^{2})
\\]`,
  },
}
