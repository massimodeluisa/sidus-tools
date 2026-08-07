import type { FormulaSnippet } from '../types'

/**
 * LOS range and range-rate from relative x, vx (1-D teaching form).
 * ρ = |x|,  ρ̇ = vx
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches LosRangeRateTool (1-D educational slice) + lib/physics/ops.ts losRangeRate.
 */
const A =
  '1-D LOS teaching form: ρ = |x|, ρ̇ = v_x (radial line-of-sight). Pure SI.'

export const losSnippets: FormulaSnippet = {
  formulaId: 'los-range-rate',
  assumptions: A,
  code: {
    python: `# LOS range & range-rate (1-D): ${A}
rho = abs(x)
rhodot = vx`,

    javascript: `// LOS range & range-rate (1-D): ${A}
const rho = Math.abs(x)
const rhodot = vx`,

    typescript: `// LOS range & range-rate (1-D): ${A}
const rho: number = Math.abs(x)
const rhodot: number = vx`,

    c: `/* LOS range & range-rate (1-D): ${A} */
const double rho = fabs(x);
const double rhodot = vx;`,

    cpp: `// LOS range & range-rate (1-D): ${A}
const double rho = std::fabs(x);
const double rhodot = vx;`,

    rust: `// LOS range & range-rate (1-D): ${A}
let rho = x.abs();
let rhodot = vx;`,

    zig: `// LOS range & range-rate (1-D): ${A}
const rho = @abs(x);
const rhodot = vx;`,

    fortran: `! LOS range & range-rate (1-D): ${A}
rho = abs(x)
rhodot = vx`,

    matlab: `% LOS range & range-rate (1-D): ${A}
rho = abs(x);
rhodot = vx;`,

    julia: `# LOS range & range-rate (1-D): ${A}
rho = abs(x)
rhodot = vx`,

    latex: `% LOS range & range-rate (1-D teaching form): pure SI
\\[
  \\rho = |x|,\\quad \\dot{\\rho} = v_x
\\]`,
  },
}
