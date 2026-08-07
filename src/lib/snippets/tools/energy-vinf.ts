import type { FormulaSnippet } from '../types'

/**
 * Energy → v_∞: hyperbolic excess from positive specific energy.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HyperbolicExcessFromEnergyTool: ε = v²/2 − μ/r; v_∞ = √(2ε) when ε>0.
 * Free vars: v, mu, r.
 */
const A =
  'v_∞ from positive specific energy; ε = v²/2 − μ/r; v_∞ = √(2|ε|) teaching form. Pure SI.'

export const enVinfSnippets: FormulaSnippet = {
  formulaId: 'energy-vinf',
  assumptions: A,
  code: {
    python: `# Energy → v_∞: ${A}
import math
eps = v * v / 2 - mu / r
vinf = math.sqrt(2 * abs(eps))`,

    javascript: `// Energy → v_∞: ${A}
const eps = (v * v) / 2 - mu / r
const vinf = Math.sqrt(2 * Math.abs(eps))`,

    typescript: `// Energy → v_∞: ${A}
const eps: number = (v * v) / 2 - mu / r
const vinf: number = Math.sqrt(2 * Math.abs(eps))`,

    c: `/* Energy → v_∞: ${A} */
const double eps = v * v / 2.0 - mu / r;
const double vinf = sqrt(2.0 * fabs(eps));`,

    cpp: `// Energy → v_∞: ${A}
const double eps = v * v / 2.0 - mu / r;
const double vinf = std::sqrt(2.0 * std::fabs(eps));`,

    rust: `// Energy → v_∞: ${A}
let eps = v * v / 2.0 - mu / r;
let vinf = (2.0 * eps.abs()).sqrt();`,

    zig: `// Energy → v_∞: ${A}
const eps = v * v / 2.0 - mu / r;
const vinf = std.math.sqrt(2.0 * @abs(eps));`,

    fortran: `! Energy → v_∞: ${A}
eps = v * v / 2.0d0 - mu / r
vinf = sqrt(2.0d0 * abs(eps))`,

    matlab: `% Energy → v_∞: ${A}
eps = v * v / 2 - mu / r;
vinf = sqrt(2 * abs(eps));`,

    julia: `# Energy → v_∞: ${A}
eps = v * v / 2 - mu / r
vinf = sqrt(2 * abs(eps))`,

    latex: `% Energy → v_∞: pure SI
\\[
  \\varepsilon = \\frac{v^{2}}{2} - \\frac{\\mu}{r},\\quad
  v_{\\infty} = \\sqrt{2\\varepsilon}\\ (\\varepsilon>0)
\\]`,
  },
}
