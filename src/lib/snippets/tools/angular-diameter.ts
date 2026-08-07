import type { FormulaSnippet } from '../types'

/**
 * Angular diameter: α = 2 atan(R / d).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches AngularDiameterTool + lib/physics/power.ts angularDiameter.
 * Free vars: R, d (SI m).
 */
const A =
  'α = 2 arctan(R/d) for a sphere of radius R at distance d (d > R). Result in rad. SI.'

export const angDiamSnippets: FormulaSnippet = {
  formulaId: 'angular-diameter',
  assumptions: A,
  code: {
    python: `# Angular diameter: ${A}
import math
alpha = 2 * math.atan(R / d)`,

    javascript: `// Angular diameter: ${A}
const alpha = 2 * Math.atan(R / d)`,

    typescript: `// Angular diameter: ${A}
const alpha: number = 2 * Math.atan(R / d)`,

    c: `/* Angular diameter: ${A} */
const double alpha = 2.0 * atan(R / d);`,

    cpp: `// Angular diameter: ${A}
const double alpha = 2.0 * std::atan(R / d);`,

    rust: `// Angular diameter: ${A}
let alpha = 2.0 * (R / d).atan();`,

    zig: `// Angular diameter: ${A}
const alpha = 2.0 * std.math.atan(R / d);`,

    fortran: `! Angular diameter: ${A}
alpha = 2.0d0 * atan(R / d)`,

    matlab: `% Angular diameter: ${A}
alpha = 2 * atan(R / d);`,

    julia: `# Angular diameter: ${A}
alpha = 2 * atan(R / d)`,

    latex: `% Angular diameter: pure SI
\\[
  \\alpha = 2\\arctan(R/d)
\\]`,
  },
}
