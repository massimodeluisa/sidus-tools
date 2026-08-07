import type { FormulaSnippet } from '../types'

/**
 * Eclipse duration: cylindrical shadow, Sun at infinity, coplanar circular.
 * β = acos(√(1 − (R/a)²)); t_ecl = T · β / π.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches EclipseDurationTool + lib/physics/mission.ts circularEclipseDuration.
 * Free vars: R, a, T (period injected; physics also computes T from μ,a).
 */
const A =
  'Cylindrical shadow, Sun at infinity, coplanar circular (worst-case long eclipse). β = acos√(1−(R/a)²); t_ecl = T β/π. SI.'

export const eclipseSnippets: FormulaSnippet = {
  formulaId: 'eclipse-duration',
  assumptions: A,
  code: {
    python: `# Eclipse duration: ${A}
import math
beta = math.acos(math.sqrt(1 - (R / a) ** 2))
t_ecl = T * beta / math.pi`,

    javascript: `// Eclipse duration: ${A}
const beta = Math.acos(Math.sqrt(1 - (R / a) ** 2))
const t_ecl = (T * beta) / Math.PI`,

    typescript: `// Eclipse duration: ${A}
const beta: number = Math.acos(Math.sqrt(1 - (R / a) ** 2))
const t_ecl: number = (T * beta) / Math.PI`,

    c: `/* Eclipse duration: ${A} */
const double beta = acos(sqrt(1.0 - (R / a) * (R / a)));
const double t_ecl = T * beta / M_PI;`,

    cpp: `// Eclipse duration: ${A}
const double beta = std::acos(std::sqrt(1.0 - (R / a) * (R / a)));
const double t_ecl = T * beta / M_PI;`,

    rust: `// Eclipse duration: ${A}
let beta = (1.0 - (R / a).powi(2)).sqrt().acos();
let t_ecl = T * beta / std::f64::consts::PI;`,

    zig: `// Eclipse duration: ${A}
const beta = std.math.acos(std.math.sqrt(1.0 - std.math.pow(f64, (R / a), 2.0)));
const t_ecl = T * beta / std.math.pi;`,

    fortran: `! Eclipse duration: ${A}
beta = acos(sqrt(1.0d0 - (R / a)**2))
t_ecl = T * beta / 3.141592653589793d0`,

    matlab: `% Eclipse duration: ${A}
beta = acos(sqrt(1 - (R / a)^2));
t_ecl = T * beta / pi;`,

    julia: `# Eclipse duration: ${A}
beta = acos(sqrt(1 - (R / a)^2))
t_ecl = T * beta / π`,

    latex: `% Eclipse duration: pure SI
\\[
  \\beta = \\arccos\\sqrt{1-(R/a)^{2}},\\quad
  t_{\\mathrm{ecl}} = T\\,\\beta/\\pi
\\]`,
  },
}
