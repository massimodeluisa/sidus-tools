import type { FormulaSnippet } from '../types'

const A = 'Nadir FOV swath: λ = asin((r/R) sin α) − α; w = 2 R λ; SI.'

export const coverageSwathSnippets: FormulaSnippet = {
  formulaId: 'coverage-swath',
  assumptions: A,
  code: {
    python: `# ${A}
import math
R = 6378137.0
r = R + h
alpha = fov / 2
lam = math.asin((r / R) * math.sin(alpha)) - alpha
swath = 2 * R * lam`,
    javascript: `// ${A}
const R = 6378137.0
const r = R + h
const alpha = fov / 2
const lam = Math.asin((r / R) * Math.sin(alpha)) - alpha
const swath = 2 * R * lam`,
    typescript: `// ${A}
const R = 6378137.0
const r = R + h
const alpha = fov / 2
const lam = Math.asin((r / R) * Math.sin(alpha)) - alpha
const swath = 2 * R * lam`,
    c: `/* ${A} */
const double R = 6378137.0;
const double r = R + h;
const double alpha = fov / 2.0;
const double lam = asin((r / R) * sin(alpha)) - alpha;
const double swath = 2.0 * R * lam;`,
    cpp: `// ${A}
const double R = 6378137.0;
const double r = R + h;
const double alpha = fov / 2.0;
const double lam = std::asin((r / R) * std::sin(alpha)) - alpha;
const double swath = 2.0 * R * lam;`,
    rust: `// ${A}
let R = 6378137.0_f64;
let r = R + h;
let alpha = fov / 2.0_f64;
let lam = ((r / R) * alpha.sin()).asin() - alpha;
let swath = 2.0_f64 * R * lam;`,
    zig: `// ${A}
const R: f64 = 6378137.0;
const r = R + h;
const alpha = fov / 2.0;
const lam = std.math.asin((r / R) * std.math.sin(alpha)) - alpha;
const swath = 2.0 * R * lam;`,
    fortran: `! ${A}
  R = 6378137.0d0
  r = R + h
  alpha = fov / 2.0d0
  lam = asin((r / R) * sin(alpha)) - alpha
  swath = 2.0d0 * R * lam`,
    matlab: `% ${A}
R = 6378137.0;
r = R + h;
alpha = fov / 2;
lam = asin((r / R) * sin(alpha)) - alpha;
swath = 2 * R * lam;`,
    julia: `# ${A}
R = 6378137.0
r = R + h
alpha = fov / 2
lam = asin((r / R) * sin(alpha)) - alpha
swath = 2 * R * lam`,
    latex: `% nadir FOV swath
\\[\\lambda=\\arcsin\\!\\left(\\frac{r}{R}\\sin\\alpha\\right)-\\alpha,\\quad w=2R\\lambda\\]`,
  },
}
