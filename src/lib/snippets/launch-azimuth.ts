import type { FormulaSnippet } from './types'

/**
 * Launch azimuth: cos i = cos φ · sin β ⇒ β = arcsin(cos i / cos φ).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches LaunchAzimuthTool + lib/physics/launch.ts.
 * Free vars: lat, i [rad], h [m]; R Earth equatorial for rotation boost.
 */
const A =
  'Spherical Earth, non-rotating for azimuth geometry; |φ| ≤ |i|. Azimuth from north toward east. SI + rad.'

export const launchAzimuthSnippets: FormulaSnippet = {
  formulaId: 'launch-azimuth',
  assumptions: A,
  code: {
    python: `# Launch azimuth: ${A}
import math
c = math.cos(i) / math.cos(lat)
beta = math.asin(max(-1.0, min(1.0, c)))
az1 = beta
az2 = math.pi - beta
R = 6378137.0
omega_e = 7.292115e-5
v_boost = omega_e * (R + h) * math.cos(lat)`,

    javascript: `// Launch azimuth: ${A}
const c = Math.cos(i) / Math.cos(lat)
const beta = Math.asin(Math.max(-1, Math.min(1, c)))
const az1 = beta
const az2 = Math.PI - beta
const R = 6378137
const omega_e = 7.292115e-5
const v_boost = omega_e * (R + h) * Math.cos(lat)`,

    typescript: `// Launch azimuth: ${A}
const c: number = Math.cos(i) / Math.cos(lat)
const beta: number = Math.asin(Math.max(-1, Math.min(1, c)))
const az1: number = beta
const az2: number = Math.PI - beta
const R: number = 6378137
const omega_e: number = 7.292115e-5
const v_boost: number = omega_e * (R + h) * Math.cos(lat)`,

    c: `/* Launch azimuth: ${A} */
const double c = cos(i) / cos(lat);
const double beta = asin(fmax(-1.0, fmin(1.0, c)));
const double az1 = beta;
const double az2 = M_PI - beta;
const double R = 6378137.0;
const double omega_e = 7.292115e-5;
const double v_boost = omega_e * (R + h) * cos(lat);`,

    cpp: `// Launch azimuth: ${A}
const double c = std::cos(i) / std::cos(lat);
const double beta = std::asin(std::fmax(-1.0, std::fmin(1.0, c)));
const double az1 = beta;
const double az2 = M_PI - beta;
const double R = 6378137.0;
const double omega_e = 7.292115e-5;
const double v_boost = omega_e * (R + h) * std::cos(lat);`,

    rust: `// Launch azimuth: ${A}
let c = i.cos() / lat.cos();
let beta = c.clamp(-1.0, 1.0).asin();
let az1 = beta;
let az2 = std::f64::consts::PI - beta;
let r_eq = 6378137.0_f64;
let omega_e = 7.292115e-5_f64;
let v_boost = omega_e * (r_eq + h) * lat.cos();`,

    zig: `// Launch azimuth: ${A}
const c = std.math.cos(i) / std.math.cos(lat);
const beta = std.math.asin(@max(-1.0, @min(1.0, c)));
const az1 = beta;
const az2 = std.math.pi - beta;
const R: f64 = 6378137.0;
const omega_e: f64 = 7.292115e-5;
const v_boost = omega_e * (R + h) * std.math.cos(lat);`,

    fortran: `! Launch azimuth: ${A}
c = cos(i) / cos(lat)
beta = asin(max(-1.0d0, min(1.0d0, c)))
az1 = beta
az2 = 3.141592653589793d0 - beta
R = 6378137.0d0
omega_e = 7.292115d-5
v_boost = omega_e * (R + h) * cos(lat)`,

    matlab: `% Launch azimuth: ${A}
c = cos(i) / cos(lat);
beta = asin(max(-1, min(1, c)));
az1 = beta;
az2 = pi - beta;
R = 6378137;
omega_e = 7.292115e-5;
v_boost = omega_e * (R + h) * cos(lat);`,

    julia: `# Launch azimuth: ${A}
c = cos(i) / cos(lat)
beta = asin(clamp(c, -1.0, 1.0))
az1 = beta
az2 = π - beta
R = 6378137.0
omega_e = 7.292115e-5
v_boost = omega_e * (R + h) * cos(lat)`,

    latex: `% Launch azimuth: pure SI + rad
\\[
  \\cos i = \\cos\\phi\\,\\sin\\beta,\\quad
  \\beta = \\arcsin\\!\\left(\\frac{\\cos i}{\\cos\\phi}\\right),\\quad
  v_{\\mathrm{boost}} = \\omega_{e}(R+h)\\cos\\phi
\\]`,
  },
}
