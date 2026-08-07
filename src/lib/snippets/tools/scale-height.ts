import type { FormulaSnippet } from '../types'

/**
 * Exponential atmosphere density: ρ = ρ₀ exp(−h/H).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches ScaleHeightTool + exponentialDensity.
 * Free vars: rho0, h, H.
 */
const A = 'Isothermal exponential atmosphere ρ = ρ₀ e^{−h/H}. SI.'

export const scaleSnippets: FormulaSnippet = {
  formulaId: 'scale-height',
  assumptions: A,
  code: {
    python: `# Scale height atmosphere: ${A}
import math
rho = rho0 * math.exp(-h / H)`,

    javascript: `// Scale height atmosphere: ${A}
const rho = rho0 * Math.exp(-h / H)`,

    typescript: `// Scale height atmosphere: ${A}
const rho: number = rho0 * Math.exp(-h / H)`,

    c: `/* Scale height atmosphere: ${A} */
const double rho = rho0 * exp(-h / H);`,

    cpp: `// Scale height atmosphere: ${A}
const double rho = rho0 * std::exp(-h / H);`,

    rust: `// Scale height atmosphere: ${A}
let rho = rho0 * (-h / H).exp();`,

    zig: `// Scale height atmosphere: ${A}
const rho = rho0 * std.math.exp(-h / H);`,

    fortran: `! Scale height atmosphere: ${A}
rho = rho0 * exp(-h / H)`,

    matlab: `% Scale height atmosphere: ${A}
rho = rho0 * exp(-h / H);`,

    julia: `# Scale height atmosphere: ${A}
rho = rho0 * exp(-h / H)`,

    latex: `% Scale height atmosphere: pure SI
\\[
  \\rho = \\rho_{0}\\,e^{-h/H}
\\]`,
  },
}
