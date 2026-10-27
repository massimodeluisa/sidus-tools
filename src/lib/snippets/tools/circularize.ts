import type { FormulaSnippet } from '../types'

/**
 * Circularize at the selected apsis: periapsis uses r = a(1-e), apoapsis uses r = a(1+e).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Free vars: a, e, mu, at ('peri' | 'apo'). Matches CircularizeTool + circularizeBurn.
 */
const A =
  'Impulsive circularize at the selected apsis: r = a(1-e) at periapsis and r = a(1+e) at apoapsis. Pure SI; free vars a, e, μ, at.'

export const circularizeSnippets: FormulaSnippet = {
  formulaId: 'circularize',
  assumptions: A,
  code: {
    python: `# Circularize: ${A}
import math
r = a * (1 - e) if at[:1] == 'p' else a * (1 + e)
v_circ = math.sqrt(mu / r)
v_ell = math.sqrt(mu * (2 / r - 1 / a))
dv = abs(v_ell - v_circ)`,

    javascript: `// Circularize: ${A}
const r = at[0] === 'p' ? a * (1 - e) : a * (1 + e)
const vCirc = Math.sqrt(mu / r)
const vEll = Math.sqrt(mu * (2 / r - 1 / a))
const dv = Math.abs(vEll - vCirc)`,

    typescript: `// Circularize: ${A}
const r: number = at[0] === 'p' ? a * (1 - e) : a * (1 + e)
const vCirc: number = Math.sqrt(mu / r)
const vEll: number = Math.sqrt(mu * (2 / r - 1 / a))
const dv: number = Math.abs(vEll - vCirc)`,

    c: `/* Circularize: ${A} */
const double r = at[0] == 'p' ? a * (1.0 - e) : a * (1.0 + e);
const double v_circ = sqrt(mu / r);
const double v_ell = sqrt(mu * (2.0 / r - 1.0 / a));
const double dv = fabs(v_ell - v_circ);`,

    cpp: `// Circularize: ${A}
const double r = at[0] == 'p' ? a * (1.0 - e) : a * (1.0 + e);
const double v_circ = std::sqrt(mu / r);
const double v_ell = std::sqrt(mu * (2.0 / r - 1.0 / a));
const double dv = std::fabs(v_ell - v_circ);`,

    rust: `// Circularize: ${A}
let r = if at.as_bytes()[0] == b'p' { a * (1.0 - e) } else { a * (1.0 + e) };
let v_circ = (mu / r).sqrt();
let v_ell = (mu * (2.0 / r - 1.0 / a)).sqrt();
let dv = (v_ell - v_circ).abs();`,

    zig: `// Circularize: ${A}
const r = if (at[0] == 'p') a * (1.0 - e) else a * (1.0 + e);
const v_circ = std.math.sqrt(mu / r);
const v_ell = std.math.sqrt(mu * (2.0 / r - 1.0 / a));
const dv = @abs(v_ell - v_circ);`,

    fortran: `! Circularize: ${A}
if (at(1:1) == 'p') then
  r = a * (1.0d0 - e)
else
  r = a * (1.0d0 + e)
endif
v_circ = sqrt(mu / r)
v_ell = sqrt(mu * (2.0d0 / r - 1.0d0 / a))
dv = abs(v_ell - v_circ)`,

    matlab: `% Circularize: ${A}
if at(1) == 'p'
  r = a * (1 - e);
else
  r = a * (1 + e);
end
v_circ = sqrt(mu / r);
v_ell = sqrt(mu * (2 / r - 1 / a));
dv = abs(v_ell - v_circ);`,

    julia: `# Circularize: ${A}
r = at[1] == 'p' ? a * (1 - e) : a * (1 + e)
v_circ = sqrt(mu / r)
v_ell = sqrt(mu * (2 / r - 1 / a))
dv = abs(v_ell - v_circ)`,

    latex: `% Circularize at the selected apsis. Pure SI.
\\[
  r =
  \\begin{cases}
    a(1-e) & \\text{periapsis}\\\\
    a(1+e) & \\text{apoapsis}
  \\end{cases}
\\]
\\[
  v_{c} = \\sqrt{\\frac{\\mu}{r}},\\quad
  v_{\\mathrm{ell}} = \\sqrt{\\mu\\left(\\frac{2}{r}-\\frac{1}{a}\\right)},\\quad
  \\Delta v = |v_{\\mathrm{ell}}-v_{c}|
\\]`,
  },
}
