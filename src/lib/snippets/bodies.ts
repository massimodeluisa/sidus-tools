import type { FormulaSnippet } from './types'

/**
 * Body catalog helpers: circular / escape / surface g at mean radius.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches BodiesTool + lib/physics (localGravity, escapeVelocity).
 * Free vars: mu [m³/s²], R [m].
 */
const A =
  'Point-mass μ catalog; circular orbit / escape / surface g at mean radius. SI.'

export const bodiesSnippets: FormulaSnippet = {
  formulaId: 'bodies',
  assumptions: A,
  code: {
    python: `# Body helpers: ${A}
import math
v_circ = math.sqrt(mu / R)
v_esc = math.sqrt(2 * mu / R)
g_surf = mu / R**2`,

    javascript: `// Body helpers: ${A}
const vCirc = Math.sqrt(mu / R)
const vEsc = Math.sqrt(2 * mu / R)
const gSurf = mu / (R * R)`,

    typescript: `// Body helpers: ${A}
const vCirc: number = Math.sqrt(mu / R)
const vEsc: number = Math.sqrt(2 * mu / R)
const gSurf: number = mu / (R * R)`,

    c: `/* Body helpers: ${A} */
const double v_circ = sqrt(mu / R);
const double v_esc = sqrt(2.0 * mu / R);
const double g_surf = mu / (R * R);`,

    cpp: `// Body helpers: ${A}
const double v_circ = std::sqrt(mu / R);
const double v_esc = std::sqrt(2.0 * mu / R);
const double g_surf = mu / (R * R);`,

    rust: `// Body helpers: ${A}
let v_circ = (mu / R).sqrt();
let v_esc = (2.0 * mu / R).sqrt();
let g_surf = mu / (R * R);`,

    zig: `// Body helpers: ${A}
const v_circ = std.math.sqrt(mu / R);
const v_esc = std.math.sqrt(2.0 * mu / R);
const g_surf = mu / (R * R);`,

    fortran: `! Body helpers: ${A}
v_circ = sqrt(mu / R)
v_esc = sqrt(2.0d0 * mu / R)
g_surf = mu / (R * R)`,

    matlab: `% Body helpers: ${A}
v_circ = sqrt(mu / R);
v_esc = sqrt(2 * mu / R);
g_surf = mu / R^2;`,

    julia: `# Body helpers: ${A}
v_circ = sqrt(mu / R)
v_esc = sqrt(2 * mu / R)
g_surf = mu / R^2`,

    latex: `% Body helpers: pure SI
\\[
  v_{c}=\\sqrt{\\mu/R},\\quad
  v_{\\mathrm{esc}}=\\sqrt{2\\mu/R},\\quad
  g=\\mu/R^{2}
\\]`,
  },
}
