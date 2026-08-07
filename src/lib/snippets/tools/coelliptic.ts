import type { FormulaSnippet } from '../types'

/**
 * Coelliptic relative mean motion (circular, first-order).
 * n = √(μ/a³);  n_rel ≈ −(3/2) n (Δa / a)
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches CoellipticTool + lib/physics/ops.ts coellipticDrift.
 */
const A =
  'Circular, first-order coelliptic: n_rel ≈ −(3/2) n (Δa/a). Pure SI (rad/s).'

export const coellipticSnippets: FormulaSnippet = {
  formulaId: 'coelliptic',
  assumptions: A,
  code: {
    python: `# Coelliptic relative mean motion: ${A}
import math
n = math.sqrt(mu / a**3)
n_rel = -1.5 * n * (da / a)`,

    javascript: `// Coelliptic relative mean motion: ${A}
const n = Math.sqrt(mu / a ** 3)
const nRel = -1.5 * n * (da / a)`,

    typescript: `// Coelliptic relative mean motion: ${A}
const n: number = Math.sqrt(mu / a ** 3)
const nRel: number = -1.5 * n * (da / a)`,

    c: `/* Coelliptic relative mean motion: ${A} */
const double n = sqrt(mu / (a * a * a));
const double n_rel = -1.5 * n * (da / a);`,

    cpp: `// Coelliptic relative mean motion: ${A}
const double n = std::sqrt(mu / (a * a * a));
const double n_rel = -1.5 * n * (da / a);`,

    rust: `// Coelliptic relative mean motion: ${A}
let n = (mu / a.powi(3)).sqrt();
let n_rel = -1.5 * n * (da / a);`,

    zig: `// Coelliptic relative mean motion: ${A}
const n = std.math.sqrt(mu / (a * a * a));
const n_rel = -1.5 * n * (da / a);`,

    fortran: `! Coelliptic relative mean motion: ${A}
n = sqrt(mu / a**3)
n_rel = -1.5d0 * n * (da / a)`,

    matlab: `% Coelliptic relative mean motion: ${A}
n = sqrt(mu / a^3);
n_rel = -1.5 * n * (da / a);`,

    julia: `# Coelliptic relative mean motion: ${A}
n = sqrt(mu / a^3)
n_rel = -1.5 * n * (da / a)`,

    latex: `% Coelliptic relative mean motion: pure SI
\\[
  n = \\sqrt{\\frac{\\mu}{a^{3}}},\\quad
  n_{\\mathrm{rel}} \\approx -\\frac{3}{2}n\\frac{\\Delta a}{a}
\\]`,
  },
}
