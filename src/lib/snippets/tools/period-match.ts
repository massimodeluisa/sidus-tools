import type { FormulaSnippet } from '../types'

/**
 * Semi-major axis from period: Kepler III: a³ = μ T² / (4π²).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches PeriodMatchTool + lib/physics/power.ts semiMajorFromPeriod.
 * Free vars: mu, T (SI s).
 */
const A =
  'Two-body Kepler III: a = (μ T² / 4π²)^{1/3} for circular (or mean) period T. SI.'

export const pmSnippets: FormulaSnippet = {
  formulaId: 'period-match',
  assumptions: A,
  code: {
    python: `# Period → semi-major axis: ${A}
import math
a = (mu * T**2 / (4 * math.pi**2)) ** (1 / 3)`,

    javascript: `// Period → semi-major axis: ${A}
const a = (mu * T ** 2 / (4 * Math.PI ** 2)) ** (1 / 3)`,

    typescript: `// Period → semi-major axis: ${A}
const a: number = (mu * T ** 2 / (4 * Math.PI ** 2)) ** (1 / 3)`,

    c: `/* Period → semi-major axis: ${A} */
const double a = cbrt((mu * T * T) / (4.0 * M_PI * M_PI));`,

    cpp: `// Period → semi-major axis: ${A}
const double a = std::cbrt((mu * T * T) / (4.0 * M_PI * M_PI));`,

    rust: `// Period → semi-major axis: ${A}
let a = ((mu * T * T) / (4.0 * std::f64::consts::PI * std::f64::consts::PI)).cbrt();`,

    zig: `// Period → semi-major axis: ${A}
const a = std.math.cbrt((mu * T * T) / (4.0 * std.math.pi * std.math.pi));`,

    fortran: `! Period → semi-major axis: ${A}
a = (mu * T**2 / (4.0d0 * 3.141592653589793d0**2))**(1.0d0/3.0d0)`,

    matlab: `% Period → semi-major axis: ${A}
a = (mu * T^2 / (4 * pi^2))^(1/3);`,

    julia: `# Period → semi-major axis: ${A}
a = (mu * T^2 / (4 * π^2))^(1/3)`,

    latex: `% Period → semi-major axis: pure SI
\\[
  a = \\left(\\frac{\\mu T^{2}}{4\\pi^{2}}\\right)^{1/3}
\\]`,
  },
}
