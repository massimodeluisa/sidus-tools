import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Secular J2 only (Vallado); mean a,e,i; SI (m, s, rad). Earth J2 ≈ 1.08262668e-3.'

export const j2Snippets: FormulaSnippet = {
  formulaId: 'j2-drift',
  assumptions: ASSUMPTIONS,
  code: {
    python: `# J2 secular rates: ${ASSUMPTIONS}
import math

J2 = 1.08262668e-3
# mu [m³/s²], a [m], e [-], i [rad], R [m]

def j2_rates(mu, a, e, i, R=6378137.0, J2=J2):
    p = a * (1 - e*e)
    n = math.sqrt(mu / a**3)          # mean motion [rad/s]
    k = (R / p)**2
    dOmega = -1.5 * n * J2 * k * math.cos(i)                 # Ω̇
    domega =  0.75 * n * J2 * k * (5*math.cos(i)**2 - 1)     # ω̇
    dOmega_deg_day = math.degrees(dOmega) * 86400
    domega_deg_day = math.degrees(domega) * 86400
    T_raan_s = 2*math.pi / abs(dOmega) if abs(dOmega) > 1e-18 else None
    return dOmega, domega, dOmega_deg_day, domega_deg_day, T_raan_s

# Free-var form (SI):
# p = a * (1 - e*e); n = math.sqrt(mu / a**3); k = (R / p)**2
# dOmega = -1.5 * n * J2 * k * math.cos(i)
# domega = 0.75 * n * J2 * k * (5*math.cos(i)**2 - 1)`,

    javascript: `// J2 secular rates: ${ASSUMPTIONS}
const J2 = 1.08262668e-3
function j2Rates(mu, a, e, i, R = 6378137, j2 = J2) {
  const p = a * (1 - e*e)
  const n = Math.sqrt(mu / (a**3))
  const k = (R / p) ** 2
  const dOmega = -1.5 * n * j2 * k * Math.cos(i)              // rad/s
  const domega =  0.75 * n * j2 * k * (5*Math.cos(i)**2 - 1)  // rad/s
  const dOmegaDegDay = (dOmega * 180/Math.PI) * 86400
  const domegaDegDay = (domega * 180/Math.PI) * 86400
  const T_raan = Math.abs(dOmega) > 1e-18 ? (2*Math.PI)/Math.abs(dOmega) : null
  return { dOmega, domega, dOmegaDegDay, domegaDegDay, T_raan }
}`,

    typescript: `// J2 secular rates: ${ASSUMPTIONS}
const J2 = 1.08262668e-3
function j2Rates(mu: number, a: number, e: number, i: number, R = 6378137) {
  const p = a * (1 - e*e)
  const n = Math.sqrt(mu / (a**3))
  const k = (R / p) ** 2
  const dOmega = -1.5 * n * J2 * k * Math.cos(i)
  const domega = 0.75 * n * J2 * k * (5*Math.cos(i)**2 - 1)
  return {
    dOmega,
    domega,
    dOmegaDegDay: (dOmega * 180/Math.PI) * 86400,
    domegaDegDay: (domega * 180/Math.PI) * 86400,
  }
}`,

    c: `/* J2 secular rates: ${ASSUMPTIONS} */
const double J2 = 1.08262668e-3;
const double p = a * (1.0 - e * e);
const double n = sqrt(mu / (a * a * a));
const double k = (R / p) * (R / p);
const double dOmega = -1.5 * n * J2 * k * cos(i); /* rad/s */
const double domega = 0.75 * n * J2 * k * (5.0 * cos(i) * cos(i) - 1.0);
const double dOmega_deg_day = (dOmega * 180.0 / M_PI) * 86400.0;
const double domega_deg_day = (domega * 180.0 / M_PI) * 86400.0;`,

    cpp: `// J2 secular rates: ${ASSUMPTIONS}
const double J2 = 1.08262668e-3;
const double p = a * (1.0 - e * e);
const double n = std::sqrt(mu / (a * a * a));
const double k = (R / p) * (R / p);
const double dOmega = -1.5 * n * J2 * k * std::cos(i); // rad/s
const double domega = 0.75 * n * J2 * k * (5.0 * std::cos(i) * std::cos(i) - 1.0);
const double dOmega_deg_day = (dOmega * 180.0 / M_PI) * 86400.0;
const double domega_deg_day = (domega * 180.0 / M_PI) * 86400.0;`,

    rust: `// J2 secular rates: ${ASSUMPTIONS}
let j2 = 1.08262668e-3_f64;
let p = a * (1.0 - e * e);
let n = (mu / a.powi(3)).sqrt();
let k = (R / p).powi(2);
let d_omega = -1.5 * n * j2 * k * i.cos(); // Ω̇ rad/s
let d_argp = 0.75 * n * j2 * k * (5.0 * i.cos().powi(2) - 1.0); // ω̇ rad/s
let d_omega_deg_day = (d_omega * 180.0 / std::f64::consts::PI) * 86400.0;
let d_argp_deg_day = (d_argp * 180.0 / std::f64::consts::PI) * 86400.0;`,

    zig: `// J2 secular rates: ${ASSUMPTIONS}
const J2: f64 = 1.08262668e-3;
const p = a * (1.0 - e * e);
const n = std.math.sqrt(mu / (a * a * a));
const k = (R / p) * (R / p);
const dOmega = -1.5 * n * J2 * k * std.math.cos(i); // rad/s
const domega = 0.75 * n * J2 * k * (5.0 * std.math.cos(i) * std.math.cos(i) - 1.0);
const dOmega_deg_day = (dOmega * 180.0 / std.math.pi) * 86400.0;
const domega_deg_day = (domega * 180.0 / std.math.pi) * 86400.0;`,

    fortran: `! J2 secular rates: ${ASSUMPTIONS}
J2 = 1.08262668d-3
p = a * (1.0d0 - e * e)
n = sqrt(mu / (a * a * a))
k = (R / p) * (R / p)
dOmega = -1.5d0 * n * J2 * k * cos(i)
domega = 0.75d0 * n * J2 * k * (5.0d0 * cos(i) * cos(i) - 1.0d0)
dOmega_deg_day = (dOmega * 180.0d0 / 3.141592653589793d0) * 86400.0d0
domega_deg_day = (domega * 180.0d0 / 3.141592653589793d0) * 86400.0d0`,

    matlab: `% J2 secular rates: ${ASSUMPTIONS}
J2 = 1.08262668e-3;
p = a * (1 - e^2);
n = sqrt(mu / a^3);
k = (R / p)^2;
dOmega = -1.5 * n * J2 * k * cos(i);          % rad/s
domega = 0.75 * n * J2 * k * (5 * cos(i)^2 - 1);
dOmega_deg_day = rad2deg(dOmega) * 86400;
domega_deg_day = rad2deg(domega) * 86400;`,

    julia: `# J2 secular rates: ${ASSUMPTIONS}
J2 = 1.08262668e-3
p = a * (1 - e^2)
n = sqrt(mu / a^3)
k = (R / p)^2
dOmega = -1.5 * n * J2 * k * cos(i)              # rad/s
domega = 0.75 * n * J2 * k * (5 * cos(i)^2 - 1)
dOmega_deg_day = rad2deg(dOmega) * 86400
domega_deg_day = rad2deg(domega) * 86400`,

    latex: `% Secular J2 (Vallado)
\\[
\\dot\\Omega=-\\tfrac32 n J_2\\Big(\\frac R p\\Big)^2\\cos i,\\quad
\\dot\\omega=\\tfrac34 n J_2\\Big(\\frac R p\\Big)^2(5\\cos^2 i-1)
\\]
\\[
p=a(1-e^2),\\quad n=\\sqrt{\\mu/a^3}
\\]`,
  },
}
