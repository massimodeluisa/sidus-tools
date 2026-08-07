import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body, coplanar circular orbits, three impulsive burns via intermediate apoapsis rb; SI units. No plane change, drag, or J2.'

export const biellipticSnippets: FormulaSnippet = {
  formulaId: 'bielliptic',
  assumptions: ASSUMPTIONS,
  code: {
    c: `/* Bielliptic: ${ASSUMPTIONS} */
const double a1 = (r1 + rb) / 2.0;
const double a2 = (r2 + rb) / 2.0;
const double dv1 = fabs(sqrt(mu * (2.0 / r1 - 1.0 / a1)) - sqrt(mu / r1));
const double dv2 = fabs(sqrt(mu * (2.0 / rb - 1.0 / a2)) - sqrt(mu * (2.0 / rb - 1.0 / a1)));
const double dv3 = fabs(sqrt(mu / r2) - sqrt(mu * (2.0 / r2 - 1.0 / a2)));
const double dv = dv1 + dv2 + dv3;
const double tof = M_PI * sqrt(a1 * a1 * a1 / mu) + M_PI * sqrt(a2 * a2 * a2 / mu);`,

    cpp: `// Bielliptic: ${ASSUMPTIONS}
const double a1 = (r1 + rb) / 2.0;
const double a2 = (r2 + rb) / 2.0;
const double dv1 = std::fabs(std::sqrt(mu * (2.0 / r1 - 1.0 / a1)) - std::sqrt(mu / r1));
const double dv2 = std::fabs(std::sqrt(mu * (2.0 / rb - 1.0 / a2)) - std::sqrt(mu * (2.0 / rb - 1.0 / a1)));
const double dv3 = std::fabs(std::sqrt(mu / r2) - std::sqrt(mu * (2.0 / r2 - 1.0 / a2)));
const double dv = dv1 + dv2 + dv3;
const double tof = M_PI * std::sqrt(a1 * a1 * a1 / mu) + M_PI * std::sqrt(a2 * a2 * a2 / mu);`,

    rust: `// Bielliptic: ${ASSUMPTIONS}
let a1 = (r1 + rb) / 2.0;
let a2 = (r2 + rb) / 2.0;
let dv1 = ((mu * (2.0 / r1 - 1.0 / a1)).sqrt() - (mu / r1).sqrt()).abs();
let dv2 = ((mu * (2.0 / rb - 1.0 / a2)).sqrt() - (mu * (2.0 / rb - 1.0 / a1)).sqrt()).abs();
let dv3 = ((mu / r2).sqrt() - (mu * (2.0 / r2 - 1.0 / a2)).sqrt()).abs();
let dv = dv1 + dv2 + dv3;
let tof = std::f64::consts::PI * (a1.powi(3) / mu).sqrt()
        + std::f64::consts::PI * (a2.powi(3) / mu).sqrt();`,

    zig: `// Bielliptic: ${ASSUMPTIONS}
const a1 = (r1 + rb) / 2.0;
const a2 = (r2 + rb) / 2.0;
const dv1 = @abs(std.math.sqrt(mu * (2.0 / r1 - 1.0 / a1)) - std.math.sqrt(mu / r1));
const dv2 = @abs(std.math.sqrt(mu * (2.0 / rb - 1.0 / a2)) - std.math.sqrt(mu * (2.0 / rb - 1.0 / a1)));
const dv3 = @abs(std.math.sqrt(mu / r2) - std.math.sqrt(mu * (2.0 / r2 - 1.0 / a2)));
const dv = dv1 + dv2 + dv3;
const tof = std.math.pi * std.math.sqrt(a1 * a1 * a1 / mu)
         + std.math.pi * std.math.sqrt(a2 * a2 * a2 / mu);`,

    python: `# Bielliptic transfer: ${ASSUMPTIONS}
import math
a1 = (r1 + rb) / 2
a2 = (r2 + rb) / 2
v1 = math.sqrt(mu / r1)
v2 = math.sqrt(mu / r2)
v1p = math.sqrt(mu * (2 / r1 - 1 / a1))   # peri of ellipse 1
v1b = math.sqrt(mu * (2 / rb - 1 / a1))   # apo of ellipse 1
v2b = math.sqrt(mu * (2 / rb - 1 / a2))   # apo of ellipse 2
v2p = math.sqrt(mu * (2 / r2 - 1 / a2))   # peri of ellipse 2
dv1 = abs(v1p - v1)
dv2 = abs(v2b - v1b)
dv3 = abs(v2 - v2p)
dv = dv1 + dv2 + dv3
tof = (math.pi * math.sqrt(a1**3 / mu)
     + math.pi * math.sqrt(a2**3 / mu))`,

    javascript: `// Bielliptic transfer: ${ASSUMPTIONS}
const a1 = (r1 + rb) / 2, a2 = (r2 + rb) / 2
const v1 = Math.sqrt(mu / r1), v2 = Math.sqrt(mu / r2)
const v1p = Math.sqrt(mu * (2 / r1 - 1 / a1))
const v1b = Math.sqrt(mu * (2 / rb - 1 / a1))
const v2b = Math.sqrt(mu * (2 / rb - 1 / a2))
const v2p = Math.sqrt(mu * (2 / r2 - 1 / a2))
const dv1 = Math.abs(v1p - v1)
const dv2 = Math.abs(v2b - v1b)
const dv3 = Math.abs(v2 - v2p)
const dv = dv1 + dv2 + dv3
const tof = Math.PI * Math.sqrt(a1 ** 3 / mu) + Math.PI * Math.sqrt(a2 ** 3 / mu)`,

    typescript: `// Bielliptic: ${ASSUMPTIONS}
const a1: number = (r1 + rb) / 2, a2: number = (r2 + rb) / 2
const v1: number = Math.sqrt(mu / r1), v2: number = Math.sqrt(mu / r2)
const v1p: number = Math.sqrt(mu * (2 / r1 - 1 / a1))
const v1b: number = Math.sqrt(mu * (2 / rb - 1 / a1))
const v2b: number = Math.sqrt(mu * (2 / rb - 1 / a2))
const v2p: number = Math.sqrt(mu * (2 / r2 - 1 / a2))
const dv1: number = Math.abs(v1p - v1)
const dv2: number = Math.abs(v2b - v1b)
const dv3: number = Math.abs(v2 - v2p)
const dv: number = dv1 + dv2 + dv3
const tof: number = Math.PI * Math.sqrt(a1 ** 3 / mu) + Math.PI * Math.sqrt(a2 ** 3 / mu)`,

    matlab: `% Bielliptic: ${ASSUMPTIONS}
a1 = (r1+rb)/2; a2 = (r2+rb)/2;
dv1 = abs(sqrt(mu*(2/r1-1/a1)) - sqrt(mu/r1));
dv2 = abs(sqrt(mu*(2/rb-1/a2)) - sqrt(mu*(2/rb-1/a1)));
dv3 = abs(sqrt(mu/r2) - sqrt(mu*(2/r2-1/a2)));
dv = dv1+dv2+dv3;
tof = pi*sqrt(a1^3/mu) + pi*sqrt(a2^3/mu);`,

    julia: `# Bielliptic: ${ASSUMPTIONS}
a1 = (r1 + rb) / 2
a2 = (r2 + rb) / 2
dv1 = abs(sqrt(mu * (2 / r1 - 1 / a1)) - sqrt(mu / r1))
dv2 = abs(sqrt(mu * (2 / rb - 1 / a2)) - sqrt(mu * (2 / rb - 1 / a1)))
dv3 = abs(sqrt(mu / r2) - sqrt(mu * (2 / r2 - 1 / a2)))
dv = dv1 + dv2 + dv3
tof = π * sqrt(a1^3 / mu) + π * sqrt(a2^3 / mu)`,

    fortran: `! Bielliptic: ${ASSUMPTIONS}
a1 = (r1 + rb) / 2.0d0
a2 = (r2 + rb) / 2.0d0
dv1 = abs(sqrt(mu * (2.0d0 / r1 - 1.0d0 / a1)) - sqrt(mu / r1))
dv2 = abs(sqrt(mu * (2.0d0 / rb - 1.0d0 / a2)) - sqrt(mu * (2.0d0 / rb - 1.0d0 / a1)))
dv3 = abs(sqrt(mu / r2) - sqrt(mu * (2.0d0 / r2 - 1.0d0 / a2)))
dv = dv1 + dv2 + dv3
tof = acos(-1.0d0) * sqrt(a1**3 / mu) + acos(-1.0d0) * sqrt(a2**3 / mu)`,

    latex: `% Bielliptic three-burn
\\[
a_1=\\frac{r_1+r_b}{2},\\quad a_2=\\frac{r_2+r_b}{2}
\\]
\\[
\\Delta v_1=\\left|v_{1p}-v_{c1}\\right|,\\
\\Delta v_2=\\left|v_{2b}-v_{1b}\\right|,\\
\\Delta v_3=\\left|v_{c2}-v_{2p}\\right|
\\]`,
  },
}
