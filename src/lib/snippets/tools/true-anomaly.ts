import type { FormulaSnippet } from '../types'

/**
 * Radius at true anomaly: polar equation of the conic.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches TrueAnomalyTool r(ν) on ellipse.
 * Free vars: a, e, nu (rad).
 */
const A = 'Ellipse polar equation r(ν); free vars a, e, ν [rad]. SI.'

export const trueAnomSnippets: FormulaSnippet = {
  formulaId: 'true-anomaly',
  assumptions: A,
  code: {
    python: `# True anomaly radius: ${A}
import math
r = a * (1 - e * e) / (1 + e * math.cos(nu))`,

    javascript: `// True anomaly radius: ${A}
const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu))`,

    typescript: `// True anomaly radius: ${A}
const r: number = (a * (1 - e * e)) / (1 + e * Math.cos(nu))`,

    c: `/* True anomaly radius: ${A} */
const double r = a * (1.0 - e * e) / (1.0 + e * cos(nu));`,

    cpp: `// True anomaly radius: ${A}
const double r = a * (1.0 - e * e) / (1.0 + e * std::cos(nu));`,

    rust: `// True anomaly radius: ${A}
let r = a * (1.0 - e * e) / (1.0 + e * nu.cos());`,

    zig: `// True anomaly radius: ${A}
const r = a * (1.0 - e * e) / (1.0 + e * std.math.cos(nu));`,

    fortran: `! True anomaly radius: ${A}
r = a * (1.0d0 - e * e) / (1.0d0 + e * cos(nu))`,

    matlab: `% True anomaly radius: ${A}
r = a * (1 - e * e) / (1 + e * cos(nu));`,

    julia: `# True anomaly radius: ${A}
r = a * (1 - e * e) / (1 + e * cos(nu))`,

    latex: `% True anomaly radius: pure SI
\\[
  r = a\\frac{1-e^{2}}{1+e\\cos\\nu}
\\]`,
  },
}
