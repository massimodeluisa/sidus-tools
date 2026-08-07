import type { FormulaSnippet } from '../types'

/**
 * Horizon range: spherical geometric radio horizon (no refraction).
 * d = √(2 R h + h²) = √((R+h)² − R²).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HorizonRangeTool + lib/physics/ops.ts horizonSlantRange.
 * Free vars: R, h.
 */
const A =
  'Spherical geometric horizon slant range; no refraction; d = √(2 R h + h²). SI.'

export const horizonSnippets: FormulaSnippet = {
  formulaId: 'horizon-range',
  assumptions: A,
  code: {
    python: `# Horizon range: ${A}
import math
d = math.sqrt(2 * R * h + h**2)`,

    javascript: `// Horizon range: ${A}
const d = Math.sqrt(2 * R * h + h ** 2)`,

    typescript: `// Horizon range: ${A}
const d: number = Math.sqrt(2 * R * h + h ** 2)`,

    c: `/* Horizon range: ${A} */
const double d = sqrt(2.0 * R * h + h * h);`,

    cpp: `// Horizon range: ${A}
const double d = std::sqrt(2.0 * R * h + h * h);`,

    rust: `// Horizon range: ${A}
let d = (2.0 * R * h + h * h).sqrt();`,

    zig: `// Horizon range: ${A}
const d = std.math.sqrt(2.0 * R * h + h * h);`,

    fortran: `! Horizon range: ${A}
d = sqrt(2.0d0 * R * h + h * h)`,

    matlab: `% Horizon range: ${A}
d = sqrt(2 * R * h + h^2);`,

    julia: `# Horizon range: ${A}
d = sqrt(2 * R * h + h^2)`,

    latex: `% Horizon range: pure SI
\\[
  d = \\sqrt{2 R h + h^{2}}
\\]`,
  },
}
