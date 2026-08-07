import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Keplerian ellipse (0 ≤ e < 1); spherical central body; speeds from vis-viva; SI units.'

export const apsidesSnippets: FormulaSnippet = {
  formulaId: 'apsides',
  assumptions: ASSUMPTIONS,
  code: {
    c: `/* Apsides: ${ASSUMPTIONS} */
const double rp = a * (1.0 - e);
const double ra = a * (1.0 + e);
const double vp = sqrt(mu * (2.0 / rp - 1.0 / a));
const double va = sqrt(mu * (2.0 / ra - 1.0 / a));`,

    cpp: `// Apsides: ${ASSUMPTIONS}
const double rp = a * (1.0 - e);
const double ra = a * (1.0 + e);
const double vp = std::sqrt(mu * (2.0 / rp - 1.0 / a));
const double va = std::sqrt(mu * (2.0 / ra - 1.0 / a));`,

    rust: `// Apsides: ${ASSUMPTIONS}
let rp = a * (1.0 - e);
let ra = a * (1.0 + e);
let vp = (mu * (2.0 / rp - 1.0 / a)).sqrt();
let va = (mu * (2.0 / ra - 1.0 / a)).sqrt();`,

    zig: `// Apsides: ${ASSUMPTIONS}
const rp = a * (1.0 - e);
const ra = a * (1.0 + e);
const vp = std.math.sqrt(mu * (2.0 / rp - 1.0 / a));
const va = std.math.sqrt(mu * (2.0 / ra - 1.0 / a));`,

    python: `# Apsides: ${ASSUMPTIONS}
import math
rp = a * (1 - e)
ra = a * (1 + e)
vp = math.sqrt(mu * (2 / rp - 1 / a))
va = math.sqrt(mu * (2 / ra - 1 / a))`,

    javascript: `// Apsides: ${ASSUMPTIONS}
const rp = a * (1 - e)
const ra = a * (1 + e)
const vp = Math.sqrt(mu * (2 / rp - 1 / a))
const va = Math.sqrt(mu * (2 / ra - 1 / a))`,

    typescript: `// Apsides: ${ASSUMPTIONS}
const rp: number = a * (1 - e)
const ra: number = a * (1 + e)
const vp: number = Math.sqrt(mu * (2 / rp - 1 / a))
const va: number = Math.sqrt(mu * (2 / ra - 1 / a))`,

    matlab: `% Apsides: ${ASSUMPTIONS}
rp = a * (1 - e);
ra = a * (1 + e);
vp = sqrt(mu * (2 / rp - 1 / a));
va = sqrt(mu * (2 / ra - 1 / a));`,

    julia: `# Apsides: ${ASSUMPTIONS}
rp = a * (1 - e)
ra = a * (1 + e)
vp = sqrt(mu * (2 / rp - 1 / a))
va = sqrt(mu * (2 / ra - 1 / a))`,

    fortran: `! Apsides: ${ASSUMPTIONS}
rp = a * (1.0d0 - e)
ra = a * (1.0d0 + e)
vp = sqrt(mu * (2.0d0 / rp - 1.0d0 / a))
va = sqrt(mu * (2.0d0 / ra - 1.0d0 / a))`,

    latex: `% Apsides
\\[
r_p = a(1-e),\\quad r_a = a(1+e),\\quad
v_{p,a} = \\sqrt{\\mu\\left(\\frac{2}{r_{p,a}}-\\frac{1}{a}\\right)}
\\]`,
  },
}
