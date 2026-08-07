import type { FormulaSnippet } from '../types'

/**
 * Δa from tangential burn: first-order Gauss on a circular orbit.
 * da ≈ 2 a dv / v with v = √(μ/a).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches DeltaABurnTool + lib/physics/maneuvers.ts deltaAFromTangentialDv.
 */
const A =
  'Circular, tangential, first-order Gauss: da ≈ 2 a dv / v with v=√(μ/a). SI.'

export const deltaASnippets: FormulaSnippet = {
  formulaId: 'delta-a-burn',
  assumptions: A,
  code: {
    python: `# Δa from tangential burn: ${A}
import math
v = math.sqrt(mu / a)
da = 2 * a * dv / v`,

    javascript: `// Δa from tangential burn: ${A}
const v = Math.sqrt(mu / a)
const da = (2 * a * dv) / v`,

    typescript: `// Δa from tangential burn: ${A}
const v: number = Math.sqrt(mu / a)
const da: number = (2 * a * dv) / v`,

    c: `/* Δa from tangential burn: ${A} */
const double v = sqrt(mu / a);
const double da = 2.0 * a * dv / v;`,

    cpp: `// Δa from tangential burn: ${A}
const double v = std::sqrt(mu / a);
const double da = 2.0 * a * dv / v;`,

    rust: `// Δa from tangential burn: ${A}
let v = (mu / a).sqrt();
let da = 2.0 * a * dv / v;`,

    zig: `// Δa from tangential burn: ${A}
const v = std.math.sqrt(mu / a);
const da = 2.0 * a * dv / v;`,

    fortran: `! Δa from tangential burn: ${A}
v = sqrt(mu / a)
da = 2.0d0 * a * dv / v`,

    matlab: `% Δa from tangential burn: ${A}
v = sqrt(mu / a);
da = 2 * a * dv / v;`,

    julia: `# Δa from tangential burn: ${A}
v = sqrt(mu / a)
da = 2 * a * dv / v`,

    latex: `% Δa from tangential burn: pure SI
\\[
  v = \\sqrt{\\frac{\\mu}{a}},\\quad
  \\Delta a \\approx \\frac{2 a\\,\\Delta v}{v}
\\]`,
  },
}
