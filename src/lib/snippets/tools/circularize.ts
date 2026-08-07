import type { FormulaSnippet } from '../types'

/**
 * Circularize: impulsive Δv at apoapsis (r = a(1+e)); swap sign for peri.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches CircularizeTool + lib/physics/maneuvers.circularizeBurn (at = 'apo').
 */
const A =
  'Impulsive circularize at apoapsis (r = a(1+e)); swap sign for peri. Pure SI; free vars a, e, μ.'

export const circularizeSnippets: FormulaSnippet = {
  formulaId: 'circularize',
  assumptions: A,
  code: {
    python: `# Circularize: ${A}
import math
r = a * (1 + e)
v_circ = math.sqrt(mu / r)
v_ell = math.sqrt(mu * (2 / r - 1 / a))
dv = abs(v_ell - v_circ)`,

    javascript: `// Circularize: ${A}
const r = a * (1 + e)
const vCirc = Math.sqrt(mu / r)
const vEll = Math.sqrt(mu * (2 / r - 1 / a))
const dv = Math.abs(vEll - vCirc)`,

    typescript: `// Circularize: ${A}
const r: number = a * (1 + e)
const vCirc: number = Math.sqrt(mu / r)
const vEll: number = Math.sqrt(mu * (2 / r - 1 / a))
const dv: number = Math.abs(vEll - vCirc)`,

    c: `/* Circularize: ${A} */
const double r = a * (1.0 + e);
const double v_circ = sqrt(mu / r);
const double v_ell = sqrt(mu * (2.0 / r - 1.0 / a));
const double dv = fabs(v_ell - v_circ);`,

    cpp: `// Circularize: ${A}
const double r = a * (1.0 + e);
const double v_circ = std::sqrt(mu / r);
const double v_ell = std::sqrt(mu * (2.0 / r - 1.0 / a));
const double dv = std::fabs(v_ell - v_circ);`,

    rust: `// Circularize: ${A}
let r = a * (1.0 + e);
let v_circ = (mu / r).sqrt();
let v_ell = (mu * (2.0 / r - 1.0 / a)).sqrt();
let dv = (v_ell - v_circ).abs();`,

    zig: `// Circularize: ${A}
const r = a * (1.0 + e);
const v_circ = std.math.sqrt(mu / r);
const v_ell = std.math.sqrt(mu * (2.0 / r - 1.0 / a));
const dv = @abs(v_ell - v_circ);`,

    fortran: `! Circularize: ${A}
r = a * (1.0d0 + e)
v_circ = sqrt(mu / r)
v_ell = sqrt(mu * (2.0d0 / r - 1.0d0 / a))
dv = abs(v_ell - v_circ)`,

    matlab: `% Circularize: ${A}
r = a * (1 + e);
v_circ = sqrt(mu / r);
v_ell = sqrt(mu * (2 / r - 1 / a));
dv = abs(v_ell - v_circ);`,

    julia: `# Circularize: ${A}
r = a * (1 + e)
v_circ = sqrt(mu / r)
v_ell = sqrt(mu * (2 / r - 1 / a))
dv = abs(v_ell - v_circ)`,

    latex: `% Circularize: pure SI (apoapsis form)
\\[
  r = a(1+e),\\quad
  v_{c} = \\sqrt{\\frac{\\mu}{r}},\\quad
  v_{\\mathrm{ell}} = \\sqrt{\\mu\\left(\\frac{2}{r}-\\frac{1}{a}\\right)},\\quad
  \\Delta v = |v_{\\mathrm{ell}}-v_{c}|
\\]`,
  },
}
