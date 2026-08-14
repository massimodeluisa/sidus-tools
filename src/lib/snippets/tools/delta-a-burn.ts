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
a = R + h
v = math.sqrt(mu / a)
da = 2 * a * dv / v`,

    javascript: `// Δa from tangential burn: ${A}
const a = R + h
const v = Math.sqrt(mu / a)
const da = (2 * a * dv) / v`,

    typescript: `// Δa from tangential burn: ${A}
const a: number = R + h
const v: number = Math.sqrt(mu / a)
const da: number = (2 * a * dv) / v`,

    c: `/* Δa from tangential burn: ${A} */
const double a = R + h;
const double v = sqrt(mu / a);
const double da = 2.0 * a * dv / v;`,

    cpp: `// Δa from tangential burn: ${A}
const double a = R + h;
const double v = std::sqrt(mu / a);
const double da = 2.0 * a * dv / v;`,

    rust: `// Δa from tangential burn: ${A}
let a = R + h;
let v = (mu / a).sqrt();
let da = 2.0 * a * dv / v;`,

    zig: `// Δa from tangential burn: ${A}
const a = R + h;
const v = std.math.sqrt(mu / a);
const da = 2.0 * a * dv / v;`,

    fortran: `! Δa from tangential burn: ${A}
a = R + h
v = sqrt(mu / a)
da = 2.0d0 * a * dv / v`,

    matlab: `% Δa from tangential burn: ${A}
a = R + h;
v = sqrt(mu / a);
da = 2 * a * dv / v;`,

    julia: `# Δa from tangential burn: ${A}
a = R + h
v = sqrt(mu / a)
da = 2 * a * dv / v`,

    latex: `% Δa from tangential burn: pure SI
\\[
  v = \\sqrt{\\frac{\\mu}{a}},\\quad
  \\Delta a \\approx \\frac{2 a\\,\\Delta v}{v}
\\]`,
  },
}
