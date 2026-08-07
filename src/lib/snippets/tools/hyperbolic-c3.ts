import type { FormulaSnippet } from '../types'

/**
 * Hyperbolic excess / C3: characteristic energy, periapsis & circular speed,
 * impulsive circ→hyperbola Δv, eccentricity.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches HyperbolicC3Tool + lib/physics/hyperbolic.ts.
 */
const A =
  'Two-body hyperbola; C3 = v_∞²; impulsive departure from circular. SI.'

export const hyperbolicC3Snippets: FormulaSnippet = {
  formulaId: 'hyperbolic-c3',
  assumptions: A,
  code: {
    python: `# Hyperbolic excess / C3: ${A}
import math
C3 = v_inf**2
v_p = math.sqrt(v_inf**2 + 2 * mu / r)
v_c = math.sqrt(mu / r)
dv = v_p - v_c
e = 1 + r * v_inf**2 / mu`,

    javascript: `// Hyperbolic excess / C3: ${A}
const C3 = v_inf ** 2
const v_p = Math.sqrt(v_inf ** 2 + (2 * mu) / r)
const v_c = Math.sqrt(mu / r)
const dv = v_p - v_c
const e = 1 + (r * v_inf ** 2) / mu`,

    typescript: `// Hyperbolic excess / C3: ${A}
const C3: number = v_inf ** 2
const v_p: number = Math.sqrt(v_inf ** 2 + (2 * mu) / r)
const v_c: number = Math.sqrt(mu / r)
const dv: number = v_p - v_c
const e: number = 1 + (r * v_inf ** 2) / mu`,

    c: `/* Hyperbolic excess / C3: ${A} */
const double C3 = v_inf * v_inf;
const double v_p = sqrt(v_inf * v_inf + 2.0 * mu / r);
const double v_c = sqrt(mu / r);
const double dv = v_p - v_c;
const double e = 1.0 + r * v_inf * v_inf / mu;`,

    cpp: `// Hyperbolic excess / C3: ${A}
const double C3 = v_inf * v_inf;
const double v_p = std::sqrt(v_inf * v_inf + 2.0 * mu / r);
const double v_c = std::sqrt(mu / r);
const double dv = v_p - v_c;
const double e = 1.0 + r * v_inf * v_inf / mu;`,

    rust: `// Hyperbolic excess / C3: ${A}
let c3 = v_inf * v_inf;
let v_p = (v_inf * v_inf + 2.0 * mu / r).sqrt();
let v_c = (mu / r).sqrt();
let dv = v_p - v_c;
let e = 1.0 + r * v_inf * v_inf / mu;`,

    zig: `// Hyperbolic excess / C3: ${A}
const C3 = v_inf * v_inf;
const v_p = std.math.sqrt(v_inf * v_inf + 2.0 * mu / r);
const v_c = std.math.sqrt(mu / r);
const dv = v_p - v_c;
const e = 1.0 + r * v_inf * v_inf / mu;`,

    fortran: `! Hyperbolic excess / C3: ${A}
C3 = v_inf * v_inf
v_p = sqrt(v_inf * v_inf + 2.0d0 * mu / r)
v_c = sqrt(mu / r)
dv = v_p - v_c
e = 1.0d0 + r * v_inf * v_inf / mu`,

    matlab: `% Hyperbolic excess / C3: ${A}
C3 = v_inf^2;
v_p = sqrt(v_inf^2 + 2 * mu / r);
v_c = sqrt(mu / r);
dv = v_p - v_c;
e = 1 + r * v_inf^2 / mu;`,

    julia: `# Hyperbolic excess / C3: ${A}
C3 = v_inf^2
v_p = sqrt(v_inf^2 + 2 * mu / r)
v_c = sqrt(mu / r)
dv = v_p - v_c
e = 1 + r * v_inf^2 / mu`,

    latex: `% Hyperbolic excess / C3: pure SI
\\[
  C_{3} = v_{\\infty}^{2},\\quad
  v_{p} = \\sqrt{v_{\\infty}^{2} + \\frac{2\\mu}{r}},\\quad
  v_{c} = \\sqrt{\\frac{\\mu}{r}},\\quad
  \\Delta v = v_{p} - v_{c},\\quad
  e = 1 + \\frac{r\\,v_{\\infty}^{2}}{\\mu}
\\]`,
  },
}
