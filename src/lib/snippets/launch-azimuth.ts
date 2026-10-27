import type { FormulaSnippet } from './types'

/**
 * Launch azimuth: cos i = cos φ · sin β ⇒ β = arcsin(cos i / cos φ).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches LaunchAzimuthTool + lib/physics/launch.ts.
 * Free vars: lat, i [rad], h [m] pad altitude above the body; R Earth equatorial radius.
 */
const A =
  'Spherical Earth, non-rotating azimuth geometry; geocentric latitude |φ| < 90°, i in [0, π]; real only when |cos i / cos φ| ≤ 1. Azimuth from north toward east. SI + rad.'

export const launchAzimuthSnippets: FormulaSnippet = {
  formulaId: 'launch-azimuth',
  assumptions: A,
  code: {
    python: `# Launch azimuth: ${A}
import math
c = math.cos(i) / math.cos(lat)
ok = (math.isfinite(lat) and math.isfinite(i)
      and abs(lat) < 0.5 * math.pi and 0.0 <= i <= math.pi
      and abs(c) <= 1.0 + 1e-12)
beta = math.asin(max(-1.0, min(1.0, c))) if ok else float("nan")
az1 = beta
az2 = math.pi - beta
R = 6378137.0
omega_e = 7.292115e-5
v_boost = omega_e * (R + h) * math.cos(lat)`,

    javascript: `// Launch azimuth: ${A}
const c = Math.cos(i) / Math.cos(lat)
const ok =
  Number.isFinite(lat) && Number.isFinite(i) &&
  Math.abs(lat) < Math.PI / 2 && i >= 0 && i <= Math.PI &&
  Math.abs(c) <= 1 + 1e-12
const beta = ok ? Math.asin(Math.max(-1, Math.min(1, c))) : Number.NaN
const az1 = beta
const az2 = Math.PI - beta
const R = 6378137
const omega_e = 7.292115e-5
const v_boost = omega_e * (R + h) * Math.cos(lat)`,

    typescript: `// Launch azimuth: ${A}
const c: number = Math.cos(i) / Math.cos(lat)
const ok: boolean =
  Number.isFinite(lat) && Number.isFinite(i) &&
  Math.abs(lat) < Math.PI / 2 && i >= 0 && i <= Math.PI &&
  Math.abs(c) <= 1 + 1e-12
const beta: number = ok ? Math.asin(Math.max(-1, Math.min(1, c))) : Number.NaN
const az1: number = beta
const az2: number = Math.PI - beta
const R: number = 6378137
const omega_e: number = 7.292115e-5
const v_boost: number = omega_e * (R + h) * Math.cos(lat)`,

    c: `/* Launch azimuth: ${A} */
const double c = cos(i) / cos(lat);
const double beta =
    (isfinite(lat) && isfinite(i) && fabs(lat) < M_PI / 2.0 &&
     i >= 0.0 && i <= M_PI && fabs(c) <= 1.0 + 1e-12)
        ? asin(fmax(-1.0, fmin(1.0, c)))
        : nan("");
const double az1 = beta;
const double az2 = M_PI - beta;
const double R = 6378137.0;
const double omega_e = 7.292115e-5;
const double v_boost = omega_e * (R + h) * cos(lat);`,

    cpp: `// Launch azimuth: ${A}
const double c = std::cos(i) / std::cos(lat);
const double beta =
    (std::isfinite(lat) && std::isfinite(i) && std::fabs(lat) < M_PI / 2.0 &&
     i >= 0.0 && i <= M_PI && std::fabs(c) <= 1.0 + 1e-12)
        ? std::asin(std::fmax(-1.0, std::fmin(1.0, c)))
        : std::nan("");
const double az1 = beta;
const double az2 = M_PI - beta;
const double R = 6378137.0;
const double omega_e = 7.292115e-5;
const double v_boost = omega_e * (R + h) * std::cos(lat);`,

    rust: `// Launch azimuth: ${A}
let c = i.cos() / lat.cos();
let beta = if lat.is_finite()
    && i.is_finite()
    && lat.abs() < std::f64::consts::FRAC_PI_2
    && i >= 0.0
    && i <= std::f64::consts::PI
    && c.abs() <= 1.0 + 1e-12
{
    c.clamp(-1.0, 1.0).asin()
} else {
    f64::NAN
};
let az1 = beta;
let az2 = std::f64::consts::PI - beta;
let r_eq = 6378137.0_f64;
let omega_e = 7.292115e-5_f64;
let v_boost = omega_e * (r_eq + h) * lat.cos();`,

    zig: `// Launch azimuth: ${A}
const c = std.math.cos(i) / std.math.cos(lat);
const beta = if (std.math.isFinite(lat) and std.math.isFinite(i) and
    @abs(lat) < std.math.pi / 2.0 and i >= 0.0 and i <= std.math.pi and
    @abs(c) <= 1.0 + 1e-12)
    std.math.asin(@max(-1.0, @min(1.0, c)))
else
    std.math.nan(f64);
const az1 = beta;
const az2 = std.math.pi - beta;
const R: f64 = 6378137.0;
const omega_e: f64 = 7.292115e-5;
const v_boost = omega_e * (R + h) * std.math.cos(lat);`,

    fortran: `! Launch azimuth: ${A}
c = cos(i) / cos(lat)
beta = 0.0d0
beta = beta / beta
if (abs(lat) < 0.5d0 * 3.141592653589793d0 .and. i >= 0.0d0 .and. &
    i <= 3.141592653589793d0 .and. abs(c) <= 1.0d0 + 1.0d-12) then
  beta = asin(max(-1.0d0, min(1.0d0, c)))
end if
az1 = beta
az2 = 3.141592653589793d0 - beta
R = 6378137.0d0
omega_e = 7.292115d-5
v_boost = omega_e * (R + h) * cos(lat)`,

    matlab: `% Launch azimuth: ${A}
c = cos(i) / cos(lat);
beta = NaN;
if isfinite(lat) && isfinite(i) && abs(lat) < pi/2 && i >= 0 && i <= pi && abs(c) <= 1 + 1e-12
  beta = asin(max(-1, min(1, c)));
end
az1 = beta;
az2 = pi - beta;
R = 6378137;
omega_e = 7.292115e-5;
v_boost = omega_e * (R + h) * cos(lat);`,

    julia: `# Launch azimuth: ${A}
c = cos(i) / cos(lat)
beta = NaN
if isfinite(lat) && isfinite(i) && abs(lat) < π / 2 && 0.0 <= i <= π && abs(c) <= 1.0 + 1e-12
    beta = asin(clamp(c, -1.0, 1.0))
end
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
\\]
\\[
  \\text{defined for } |\\phi| < 90^\\circ,\\; 0^\\circ \\le i \\le 180^\\circ,\\;
  \\left|\\frac{\\cos i}{\\cos\\phi}\\right| \\le 1
\\]`,
  },
}
