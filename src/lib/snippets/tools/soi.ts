import type { FormulaSnippet } from '../types'

/**
 * Sphere of influence (Laplace): r_SOI ≈ a (m/M)^{2/5}.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches SoiTool + lib/physics/mission.ts sphereOfInfluence.
 * Free vars: a, m, M (Fortran case of m/M disambiguated by wrapFortran).
 */
const A =
  'Laplace sphere of influence (patched conic teaching); r_SOI ≈ a (m/M)^{2/5}. SI.'

export const soiSnippets: FormulaSnippet = {
  formulaId: 'soi',
  assumptions: A,
  code: {
    python: `# Sphere of influence: ${A}
r_soi = a * (m / M) ** 0.4`,

    javascript: `// Sphere of influence: ${A}
const rSoi = a * (m / M) ** 0.4`,

    typescript: `// Sphere of influence: ${A}
const rSoi: number = a * (m / M) ** 0.4`,

    c: `/* Sphere of influence: ${A} */
const double r_soi = a * pow(m / M, 0.4);`,

    cpp: `// Sphere of influence: ${A}
const double r_soi = a * std::pow(m / M, 0.4);`,

    rust: `// Sphere of influence: ${A}
let r_soi = a * (m / M).powf(0.4);`,

    zig: `// Sphere of influence: ${A}
const r_soi = a * std.math.pow(f64, m / M, 0.4);`,

    fortran: `! Sphere of influence: ${A}
r_soi = a * (m / M)**0.4d0`,

    matlab: `% Sphere of influence: ${A}
r_soi = a * (m / M)^0.4;`,

    julia: `# Sphere of influence: ${A}
r_soi = a * (m / M)^0.4`,

    latex: `% Sphere of influence: Laplace / patched conic, pure SI
\\[
  r_{\\mathrm{SOI}} \\approx a\\left(\\frac{m}{M}\\right)^{2/5}
\\]`,
  },
}
