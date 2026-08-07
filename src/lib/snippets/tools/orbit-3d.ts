import type { FormulaSnippet } from '../types'

/**
 * Orbit 3D: two circular rings about catalog body (educational viz core).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches Orbit3dTool circular radii / speeds / periods.
 * Free vars: R, h1, h2, mu.
 */
const A =
  'Two-body circular rings about catalog body; optional Hohmann ellipse visualization only. Pure SI.'

export const orbit3dSnippets: FormulaSnippet = {
  formulaId: 'orbit-3d',
  assumptions: A,
  code: {
    python: `# Orbit 3D: ${A}
import math
r1 = R + h1
r2 = R + h2
v1 = math.sqrt(mu / r1)
T1 = 2 * math.pi * math.sqrt(r1**3 / mu)
v2 = math.sqrt(mu / r2)
T2 = 2 * math.pi * math.sqrt(r2**3 / mu)`,

    javascript: `// Orbit 3D: ${A}
const r1 = R + h1
const r2 = R + h2
const v1 = Math.sqrt(mu / r1)
const T1 = 2 * Math.PI * Math.sqrt(r1 ** 3 / mu)
const v2 = Math.sqrt(mu / r2)
const T2 = 2 * Math.PI * Math.sqrt(r2 ** 3 / mu)`,

    typescript: `// Orbit 3D: ${A}
const r1: number = R + h1
const r2: number = R + h2
const v1: number = Math.sqrt(mu / r1)
const T1: number = 2 * Math.PI * Math.sqrt(r1 ** 3 / mu)
const v2: number = Math.sqrt(mu / r2)
const T2: number = 2 * Math.PI * Math.sqrt(r2 ** 3 / mu)`,

    c: `/* Orbit 3D: ${A} */
const double r1 = R + h1;
const double r2 = R + h2;
const double v1 = sqrt(mu / r1);
const double T1 = 2.0 * M_PI * sqrt((r1 * r1 * r1) / mu);
const double v2 = sqrt(mu / r2);
const double T2 = 2.0 * M_PI * sqrt((r2 * r2 * r2) / mu);`,

    cpp: `// Orbit 3D: ${A}
const double r1 = R + h1;
const double r2 = R + h2;
const double v1 = std::sqrt(mu / r1);
const double T1 = 2.0 * M_PI * std::sqrt((r1 * r1 * r1) / mu);
const double v2 = std::sqrt(mu / r2);
const double T2 = 2.0 * M_PI * std::sqrt((r2 * r2 * r2) / mu);`,

    rust: `// Orbit 3D: ${A}
let r1 = R + h1;
let r2 = R + h2;
let v1 = (mu / r1).sqrt();
let t1 = 2.0 * std::f64::consts::PI * ((r1 * r1 * r1) / mu).sqrt();
let v2 = (mu / r2).sqrt();
let t2 = 2.0 * std::f64::consts::PI * ((r2 * r2 * r2) / mu).sqrt();`,

    zig: `// Orbit 3D: ${A}
const r1 = R + h1;
const r2 = R + h2;
const v1 = std.math.sqrt(mu / r1);
const T1 = 2.0 * std.math.pi * std.math.sqrt((r1 * r1 * r1) / mu);
const v2 = std.math.sqrt(mu / r2);
const T2 = 2.0 * std.math.pi * std.math.sqrt((r2 * r2 * r2) / mu);`,

    fortran: `! Orbit 3D: ${A}
r1 = R + h1
r2 = R + h2
v1 = sqrt(mu / r1)
T1 = 2.0d0 * 3.141592653589793d0 * sqrt((r1 * r1 * r1) / mu)
v2 = sqrt(mu / r2)
T2 = 2.0d0 * 3.141592653589793d0 * sqrt((r2 * r2 * r2) / mu)`,

    matlab: `% Orbit 3D: ${A}
r1 = R + h1;
r2 = R + h2;
v1 = sqrt(mu / r1);
T1 = 2 * pi * sqrt(r1^3 / mu);
v2 = sqrt(mu / r2);
T2 = 2 * pi * sqrt(r2^3 / mu);`,

    julia: `# Orbit 3D: ${A}
r1 = R + h1
r2 = R + h2
v1 = sqrt(mu / r1)
T1 = 2 * π * sqrt(r1^3 / mu)
v2 = sqrt(mu / r2)
T2 = 2 * π * sqrt(r2^3 / mu)`,

    latex: `% Orbit 3D: pure SI
\\[
  r = R + h,\\quad
  v = \\sqrt{\\frac{\\mu}{r}},\\quad
  T = 2\\pi\\sqrt{\\frac{r^{3}}{\\mu}}
\\]`,
  },
}
