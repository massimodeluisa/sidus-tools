import type { FormulaSnippet } from '../types'

/**
 * Critical inclination: frozen argument of perigee when 5 cos² i − 1 = 0.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches CriticalInclinationTool (i = acos √(1/5)).
 */
const A = 'Frozen ω when 5 cos² i − 1 = 0 ⇒ cos² i = 1/5. Pure SI (i in rad).'

export const critIncSnippets: FormulaSnippet = {
  formulaId: 'critical-inclination',
  assumptions: A,
  code: {
    python: `# Critical inclination: ${A}
import math
i = math.acos(math.sqrt(0.2))`,

    javascript: `// Critical inclination: ${A}
const i = Math.acos(Math.sqrt(0.2))`,

    typescript: `// Critical inclination: ${A}
const i: number = Math.acos(Math.sqrt(0.2))`,

    c: `/* Critical inclination: ${A} */
const double i = acos(sqrt(0.2));`,

    cpp: `// Critical inclination: ${A}
const double i = std::acos(std::sqrt(0.2));`,

    rust: `// Critical inclination: ${A}
let i = (0.2_f64).sqrt().acos();`,

    zig: `// Critical inclination: ${A}
const i = std.math.acos(std.math.sqrt(@as(f64, 0.2)));`,

    fortran: `! Critical inclination: ${A}
i = acos(sqrt(0.2d0))`,

    matlab: `% Critical inclination: ${A}
i = acos(sqrt(0.2));`,

    julia: `# Critical inclination: ${A}
i = acos(sqrt(0.2))`,

    latex: `% Critical inclination: pure SI
\\[
  \\cos^{2} i = \\tfrac{1}{5},\\quad
  i = \\arccos\\sqrt{\\tfrac{1}{5}}
\\]`,
  },
}
