import type { FormulaSnippet } from '../types'

/**
 * Flyby periapsis speed from hyperbolic excess.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches FlybySpeedTool: v_p = √(v_∞² + 2μ/r).
 * Free vars: vinf, mu, r.
 */
const A = 'Hyperbolic periapsis speed from v_∞; two-body. SI.'

export const flybySnippets: FormulaSnippet = {
  formulaId: 'flyby-speed',
  assumptions: A,
  code: {
    python: `# Flyby periapsis speed: ${A}
import math
r = R + h
vp = math.sqrt(vinf**2 + 2 * mu / r)`,

    javascript: `// Flyby periapsis speed: ${A}
const r = R + h
const vp = Math.sqrt(vinf ** 2 + (2 * mu) / r)`,

    typescript: `// Flyby periapsis speed: ${A}
const r: number = R + h
const vp: number = Math.sqrt(vinf ** 2 + (2 * mu) / r)`,

    c: `/* Flyby periapsis speed: ${A} */
const double r = R + h;
const double vp = sqrt(vinf * vinf + 2.0 * mu / r);`,

    cpp: `// Flyby periapsis speed: ${A}
const double r = R + h;
const double vp = std::sqrt(vinf * vinf + 2.0 * mu / r);`,

    rust: `// Flyby periapsis speed: ${A}
let r = R + h;
let vp = (vinf * vinf + 2.0 * mu / r).sqrt();`,

    zig: `// Flyby periapsis speed: ${A}
const r = R + h;
const vp = std.math.sqrt(vinf * vinf + 2.0 * mu / r);`,

    fortran: `! Flyby periapsis speed: ${A}
r = R + h
vp = sqrt(vinf * vinf + 2.0d0 * mu / r)`,

    matlab: `% Flyby periapsis speed: ${A}
r = R + h;
vp = sqrt(vinf^2 + 2 * mu / r);`,

    julia: `# Flyby periapsis speed: ${A}
r = R + h
vp = sqrt(vinf^2 + 2 * mu / r)`,

    latex: `% Flyby periapsis speed: pure SI
\\[
  v_{p} = \\sqrt{v_{\\infty}^{2} + \\frac{2\\mu}{r}}
\\]`,
  },
}
