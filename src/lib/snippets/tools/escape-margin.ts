import type { FormulaSnippet } from '../types'

/**
 * Escape margin: Δv from circular to escape: (√2 − 1) v_c.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches EnergyMarginTool. Free vars: mu, r.
 */
const A =
  'Δv from circular to local escape: (√2 − 1) v_c with v_c = √(μ/r). Two-body impulsive. Pure SI.'

export const escMarginSnippets: FormulaSnippet = {
  formulaId: 'escape-margin',
  assumptions: A,
  code: {
    python: `# Escape margin: ${A}
import math
vc = math.sqrt(mu / r)
dv = (math.sqrt(2) - 1) * vc`,

    javascript: `// Escape margin: ${A}
const vc = Math.sqrt(mu / r)
const dv = (Math.sqrt(2) - 1) * vc`,

    typescript: `// Escape margin: ${A}
const vc: number = Math.sqrt(mu / r)
const dv: number = (Math.sqrt(2) - 1) * vc`,

    c: `/* Escape margin: ${A} */
const double vc = sqrt(mu / r);
const double dv = (sqrt(2.0) - 1.0) * vc;`,

    cpp: `// Escape margin: ${A}
const double vc = std::sqrt(mu / r);
const double dv = (std::sqrt(2.0) - 1.0) * vc;`,

    rust: `// Escape margin: ${A}
let vc = (mu / r).sqrt();
let dv = (2.0_f64.sqrt() - 1.0) * vc;`,

    zig: `// Escape margin: ${A}
const vc = std.math.sqrt(mu / r);
const dv = (std.math.sqrt(2.0) - 1.0) * vc;`,

    fortran: `! Escape margin: ${A}
vc = sqrt(mu / r)
dv = (sqrt(2.0d0) - 1.0d0) * vc`,

    matlab: `% Escape margin: ${A}
vc = sqrt(mu / r);
dv = (sqrt(2) - 1) * vc;`,

    julia: `# Escape margin: ${A}
vc = sqrt(mu / r)
dv = (sqrt(2) - 1) * vc`,

    latex: `% Escape margin: pure SI
\\[
  v_{c} = \\sqrt{\\frac{\\mu}{r}},\\quad
  \\Delta v = (\\sqrt{2}-1)\\,v_{c}
\\]`,
  },
}
