import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body, spherical central body, impulsive radial leave; SI units (m, s). No atmosphere or rotation.'

export const escapeSnippets: FormulaSnippet = {
  formulaId: 'escape',
  assumptions: ASSUMPTIONS,
  code: {
    python: `# Escape velocity: ${ASSUMPTIONS}
import math
v_esc = math.sqrt(2 * mu / r)
v_c = math.sqrt(mu / r)
ratio = v_esc / v_c  # sqrt(2)`,

    javascript: `// Escape velocity: ${ASSUMPTIONS}
const vEsc = Math.sqrt((2 * mu) / r)
const vC = Math.sqrt(mu / r)
const ratio = vEsc / vC // √2`,

    typescript: `// Escape velocity: ${ASSUMPTIONS}
const vEsc: number = Math.sqrt((2 * mu) / r)
const vC: number = Math.sqrt(mu / r)
const ratio: number = vEsc / vC // √2`,

    c: `/* Escape velocity: ${ASSUMPTIONS} */
const double v_esc = sqrt(2.0 * mu / r);
const double v_c = sqrt(mu / r);
const double ratio = v_esc / v_c; /* sqrt(2) */`,

    cpp: `// Escape velocity: ${ASSUMPTIONS}
const double v_esc = std::sqrt(2.0 * mu / r);
const double v_c = std::sqrt(mu / r);
const double ratio = v_esc / v_c; // sqrt(2)`,

    rust: `// Escape velocity: ${ASSUMPTIONS}
let v_esc = (2.0 * mu / r).sqrt();
let v_c = (mu / r).sqrt();
let ratio = v_esc / v_c; // sqrt(2)`,

    zig: `// Escape velocity: ${ASSUMPTIONS}
const v_esc = std.math.sqrt(2.0 * mu / r);
const v_c = std.math.sqrt(mu / r);
const ratio = v_esc / v_c; // sqrt(2)`,

    fortran: `! Escape velocity: ${ASSUMPTIONS}
v_esc = sqrt(2.0d0 * mu / r)
v_c = sqrt(mu / r)
ratio = v_esc / v_c`,

    matlab: `% Escape velocity: ${ASSUMPTIONS}
v_esc = sqrt(2 * mu / r);
v_c = sqrt(mu / r);
ratio = v_esc / v_c;`,

    julia: `# Escape velocity: ${ASSUMPTIONS}
v_esc = sqrt(2 * mu / r)
v_c = sqrt(mu / r)
ratio = v_esc / v_c`,

    latex: `% Escape velocity: pure SI
\\[
  v_{\\mathrm{esc}} = \\sqrt{\\frac{2\\mu}{r}} = \\sqrt{2}\\,v_c,\\quad
  v_c = \\sqrt{\\frac{\\mu}{r}}
\\]`,
  },
}
