import type { FormulaSnippet } from '../types'

/**
 * GEO / synchronous circular radius from period T.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches GeoOrbitTool + lib/physics/maneuvers.geoRadius.
 * Free vars: mu, T.
 */
const A =
  'Two-body Kepler III; circular sync radius a from period T; a³ = μ T²/(4π²). SI (m, s).'

export const geoSnippets: FormulaSnippet = {
  formulaId: 'geo-orbit',
  assumptions: A,
  code: {
    python: `# GEO / sync radius: ${A}
import math
a = (mu * T**2 / (4 * math.pi**2)) ** (1 / 3)`,

    javascript: `// GEO / sync radius: ${A}
const a = (mu * T ** 2 / (4 * Math.PI ** 2)) ** (1 / 3)`,

    typescript: `// GEO / sync radius: ${A}
const a: number = (mu * T ** 2 / (4 * Math.PI ** 2)) ** (1 / 3)`,

    c: `/* GEO / sync radius: ${A} */
const double a = cbrt((mu * T * T) / (4.0 * M_PI * M_PI));`,

    cpp: `// GEO / sync radius: ${A}
const double a = std::cbrt((mu * T * T) / (4.0 * M_PI * M_PI));`,

    rust: `// GEO / sync radius: ${A}
let a = ((mu * T * T) / (4.0 * std::f64::consts::PI * std::f64::consts::PI)).cbrt();`,

    zig: `// GEO / sync radius: ${A}
const a = std.math.cbrt((mu * T * T) / (4.0 * std.math.pi * std.math.pi));`,

    fortran: `! GEO / sync radius: ${A}
a = (mu * T**2 / (4.0d0 * 3.141592653589793d0**2))**(1.0d0/3.0d0)`,

    matlab: `% GEO / sync radius: ${A}
a = (mu * T^2 / (4 * pi^2))^(1/3);`,

    julia: `# GEO / sync radius: ${A}
a = (mu * T^2 / (4 * π^2))^(1/3)`,

    latex: `% GEO / sync radius: pure SI
\\[
  a = \\left(\\frac{\\mu T^{2}}{4\\pi^{2}}\\right)^{1/3}
\\]`,
  },
}
