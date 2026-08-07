import type { FormulaSnippet } from '../types'

/**
 * Equal-stage mass ratio: ideal equal stages, same Isp.
 * ratio = exp((dv/n)/(isp·g0)) with g0 = 9.80665.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches EqualStageTool + lib/physics/ops.ts equalStageMassRatio.
 * Free vars: dv, n, isp.
 */
const A =
  'Ideal equal stages, same Isp; per-stage mass ratio m0/mf = exp((Δv/n)/(Isp g0)); g0=9.80665. SI.'

export const equalStageSnippets: FormulaSnippet = {
  formulaId: 'equal-stage',
  assumptions: A,
  code: {
    python: `# Equal-stage mass ratio: ${A}
import math
g0 = 9.80665
ratio = math.exp((dv / n) / (isp * g0))`,

    javascript: `// Equal-stage mass ratio: ${A}
const g0 = 9.80665
const ratio = Math.exp((dv / n) / (isp * g0))`,

    typescript: `// Equal-stage mass ratio: ${A}
const g0: number = 9.80665
const ratio: number = Math.exp((dv / n) / (isp * g0))`,

    c: `/* Equal-stage mass ratio: ${A} */
const double g0 = 9.80665;
const double ratio = exp((dv / n) / (isp * g0));`,

    cpp: `// Equal-stage mass ratio: ${A}
const double g0 = 9.80665;
const double ratio = std::exp((dv / n) / (isp * g0));`,

    rust: `// Equal-stage mass ratio: ${A}
let g0 = 9.80665_f64;
let ratio = ((dv / n) / (isp * g0)).exp();`,

    zig: `// Equal-stage mass ratio: ${A}
const g0: f64 = 9.80665;
const ratio = std.math.exp((dv / n) / (isp * g0));`,

    fortran: `! Equal-stage mass ratio: ${A}
g0 = 9.80665d0
ratio = exp((dv / n) / (isp * g0))`,

    matlab: `% Equal-stage mass ratio: ${A}
g0 = 9.80665;
ratio = exp((dv / n) / (isp * g0));`,

    julia: `# Equal-stage mass ratio: ${A}
g0 = 9.80665
ratio = exp((dv / n) / (isp * g0))`,

    latex: `% Equal-stage mass ratio: pure SI
\\[
  g_{0} = 9.80665,\\quad
  \\frac{m_{0}}{m_{f}} = \\exp\\frac{\\Delta v/n}{I_{sp} g_{0}}
\\]`,
  },
}
