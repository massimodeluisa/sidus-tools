import type { FormulaSnippet } from '../types'

/**
 * Mean motion: circular n = √(μ/a³) with a = R + h.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches MeanMotionTool + lib/physics/ops.ts meanMotionFromAltitude.
 * Free vars: R, h, mu.
 */
const A =
  'Circular two-body mean motion n = √(μ/a³) with a = R + h. SI (rad/s).'

export const meanMotionSnippets: FormulaSnippet = {
  formulaId: 'mean-motion',
  assumptions: A,
  code: {
    python: `# Mean motion: ${A}
import math
a = R + h
n = math.sqrt(mu / a**3)`,

    javascript: `// Mean motion: ${A}
const a = R + h
const n = Math.sqrt(mu / a ** 3)`,

    typescript: `// Mean motion: ${A}
const a: number = R + h
const n: number = Math.sqrt(mu / a ** 3)`,

    c: `/* Mean motion: ${A} */
const double a = R + h;
const double n = sqrt(mu / (a * a * a));`,

    cpp: `// Mean motion: ${A}
const double a = R + h;
const double n = std::sqrt(mu / (a * a * a));`,

    rust: `// Mean motion: ${A}
let a = R + h;
let n = (mu / (a * a * a)).sqrt();`,

    zig: `// Mean motion: ${A}
const a = R + h;
const n = std.math.sqrt(mu / (a * a * a));`,

    fortran: `! Mean motion: ${A}
a = R + h
n = sqrt(mu / a**3)`,

    matlab: `% Mean motion: ${A}
a = R + h;
n = sqrt(mu / a^3);`,

    julia: `# Mean motion: ${A}
a = R + h
n = sqrt(mu / a^3)`,

    latex: `% Mean motion: pure SI
\\[
  a = R + h,\\quad
  n = \\sqrt{\\mu/a^{3}}
\\]`,
  },
}
